"use client";

import { useEffect, useState } from "react";
import { TesoreriaTable } from "@/components/tables/tesoreria-table";
import { TesoreriaForm } from "@/components/forms/tesoreria-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowLeft,
  Search as SearchIcon,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Filter,
  RefreshCcw,
  Plus,
} from "lucide-react";
import { useTesoreria } from "@/hooks/use-tesoreria";

export default function TesoreriaPage() {
  const { tesoreria, loading, createTesoreria, searchTesoreria } = useTesoreria();

  // UI state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategoria, setFilterCategoria] = useState<string>("");

  const [stats, setStats] = useState({
    totalIngresos: 0,
    totalEgresos: 0,
    balance: 0,
    totalRegistros: 0,
  });

  useEffect(() => {
    // Métricas simples con el esquema actual
    const totalMonto = tesoreria.reduce((sum, item) => sum + (item.monto || 0), 0);
    setStats({
      totalIngresos: 0,
      totalEgresos: 0,
      balance: totalMonto,
      totalRegistros: tesoreria.length,
    });
  }, [tesoreria]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
    }).format(amount);
  };

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

  const handleSearch = async () => {
    const params: any = {};
    if (searchTerm) params.q = searchTerm;
    if (filterCategoria) params.categoria = filterCategoria;
    await searchTesoreria(params);
  };

  const clearFilters = async () => {
    setSearchTerm("");
    setFilterCategoria("");
    await searchTesoreria({});
  };

  const handleCreate = async (data: any) => {
    const success = await createTesoreria(data);
    if (success) {
      setIsCreateDialogOpen(false);
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

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SearchIcon className="h-5 w-5" />
            Buscar Registros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Select
              value={filterCategoria || "all"}
              onValueChange={(val) => setFilterCategoria(val === "all" ? "" : val)}
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
            <div className="flex gap-2">
              <Button onClick={handleSearch} className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtrar
              </Button>
              <Button variant="outline" onClick={clearFilters} className="flex items-center gap-2">
                <RefreshCcw className="h-4 w-4" />
                Limpiar
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowStats(!showStats)}
                className="ml-auto flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Estadísticas
                {showStats ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats - Collapsible */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in slide-in-from-top-2 duration-200">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Total Registros</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="mt-2 text-2xl font-bold">{stats.totalRegistros}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Total Ingresos</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div className="mt-2 text-2xl font-bold text-green-600">{formatCurrency(stats.totalIngresos)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Total Egresos</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </div>
              <div className="mt-2 text-2xl font-bold text-red-600">{formatCurrency(stats.totalEgresos)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Balance</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className={`mt-2 text-2xl font-bold ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(stats.balance)}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Registros</CardTitle>
        </CardHeader>
        <CardContent>
          <TesoreriaTable variant="simple" />
        </CardContent>
      </Card>
    </div>
  );
}
 