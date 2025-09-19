"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { TesoreriaTable } from "@/components/tables/tesoreria-table";
import { TesoreriaForm } from "@/components/forms/tesoreria-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Search as SearchIcon,
  Filter,
  RefreshCcw,
  Plus,
} from "lucide-react";
import { useTesoreria } from "@/hooks/use-tesoreria";
import { useToast } from "@/hooks/use-toast";
import { SaldoCard } from "@/components/tesoreria/SaldoCard";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { getTodayLimaYMD, formatDateForPeru } from "@/lib/utils/date-lima";

export default function TesoreriaPage() {
  const { tesoreria, loading, createTesoreria, searchTesoreria } = useTesoreria();
  const { toast } = useToast();

  // UI state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategoria, setFilterCategoria] = useState<string>("");
  const [fecha, setFecha] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"active" | "history" | "trash">("active");
  const [openFecha, setOpenFecha] = useState(false);

  // Convertir Date a YYYY-MM-DD usando la nueva utilidad de Lima
  const toYMD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  
  // Usar la nueva utilidad para formatear fechas para Perú
  const formatDatePeru = (value?: string) => {
    return formatDateForPeru(value);
  };

  // Conteo simple para tarjeta fija
  const totalRegistros = tesoreria.length;

  const categorias = [
    "Combustible",
    "Mantenimiento",
    "Salarios",
    "Peajes",
    "Seguros",
    "Licencias",
    "Impuestos",
    "Servicios",
    "Ventas",
    "Comisiones",
    "Otros",
  ];

  const buildParams = useMemo(() => {
    return () => {
      const params: any = {};
      if (searchTerm) params.q = searchTerm;
      if (filterCategoria) params.categoria = filterCategoria;
      if (fecha) {
        params.fecha = fecha;
        // por compatibilidad, mantenemos también rango de 1 día
        params.fecha_inicio = fecha;
        params.fecha_fin = fecha;
      }
      params.scope = activeTab;
      return params;
    };
  }, [searchTerm, filterCategoria, fecha, activeTab]);

  // Debounced auto-search when fields change (avoid loops by not depending on function identity)
  const prevParamsRef = useRef("");
  useEffect(() => {
    const handler = setTimeout(async () => {
      const params = buildParams();
      const paramsStr = JSON.stringify(params);
      if (prevParamsRef.current !== paramsStr) {
        prevParamsRef.current = paramsStr;
        await searchTesoreria(params);
        // Notify table simple variant to stay in sync
        window.dispatchEvent(new CustomEvent("tesoreria:search", { detail: params }));
      }
    }, 350);
    return () => clearTimeout(handler);
  }, [buildParams]);

  // Sincronizar cambio de pestaña con tablas hijas
  useEffect(() => {
    const params = buildParams();
    window.dispatchEvent(new CustomEvent("tesoreria:search", { detail: params }));
  // Evitar refrescar sin filtros, para no sobreescribir la búsqueda seleccionada
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const clearFilters = async () => {
    setSearchTerm("");
    setFilterCategoria("");
    setFecha("");
    await searchTesoreria({});
    window.dispatchEvent(new CustomEvent("tesoreria:search", { detail: {} }));
  };

  const handleCreate = async (data: any) => {
    const success = await createTesoreria(data);
    if (success) {
      toast({ title: "Éxito", description: "Registro creado correctamente" });
      setIsCreateDialogOpen(false);
      // Ensure table refreshes even if it uses a separate hook instance
      window.dispatchEvent(new Event("tesoreria:refresh"));
    } else {
      toast({ title: "Error", description: "No se pudo crear el registro", variant: "destructive" });
    }
    return success;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.history.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Regresar
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tesorería</h1>
            <p className="text-muted-foreground">Gestión de ingresos y egresos financieros</p>
          </div>
        </div>



        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Registro
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nuevo Registro de Tesorería</DialogTitle>
              <DialogDescription>Complete los datos para crear un nuevo registro de tesorería.</DialogDescription>
            </DialogHeader>
            <TesoreriaForm onSubmit={handleCreate} onCancel={() => setIsCreateDialogOpen(false)} loading={loading} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search + Saldo: layout side-by-side on md+ screens */}
      <div className="flex flex-col md:flex-row md:items-start gap-4">
        <div className="md:basis-[70%] md:flex-grow">
          {/* Search (común) moved out to the left column */}
          <Card className="mt-4 min-h-[140px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SearchIcon className="h-5 w-5" />
                Buscar Registros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[220px]">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por placa, nombre y cargo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="w-[200px]">
                  <Select
                    value={filterCategoria || "all"}
                    onValueChange={(val: string) => setFilterCategoria(val === "all" ? "" : val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {categorias.map((categoria) => (
                        <SelectItem key={categoria} value={categoria}>
                          {categoria}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtro por fecha específica (dd/mm/aaaa) */}
                <Popover open={openFecha} onOpenChange={setOpenFecha}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[200px] justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {fecha ? formatDatePeru(fecha) : <span className="text-gray-500">dd/mm/aaaa</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={fecha ? new Date(`${fecha}T00:00:00`) : undefined}
                      onSelect={(d: Date | undefined) => {
                        if (!d) { setFecha(""); return; }
                        const ymd = toYMD(d);
                        setFecha(ymd);
                        setOpenFecha(false);
                      }}
                      initialFocus
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>

                <Button variant="outline" onClick={clearFilters} className="flex items-center gap-2">
                  <RefreshCcw className="h-4 w-4" />
                  
                </Button>

                {/* Se elimina botón de estadísticas */}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:basis-[30%] md:sticky md:top-24">
          <SaldoCard />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="active">Hoy</TabsTrigger>
          <TabsTrigger value="history">Historial Completo</TabsTrigger>
          <TabsTrigger value="trash">Papelera</TabsTrigger>
        </TabsList>

        

        {/* Tab: Hoy */}
        <TabsContent value="active" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {fecha ? `Lista de Registros (Fecha: ${formatDatePeru(fecha)})` : 'Lista de Registros (Hoy)'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TesoreriaTable variant="simple" mode="active" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Historial */}
        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {fecha ? `Historial (Fecha: ${formatDatePeru(fecha)})` : 'Historial de Registros'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TesoreriaTable variant="simple" mode="history" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Papelera */}
        <TabsContent value="trash" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Papelera</CardTitle>
            </CardHeader>
            <CardContent>
              <TesoreriaTable variant="simple" mode="trash" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
 