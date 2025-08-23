"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Plus,
  ArrowLeft,
  MapPin,
  BarChart3,
  Search,
  Calendar,
  ChevronDown,
  ChevronUp,
  Activity,
  Users,
  Info,
} from "lucide-react";
import { ZonasTable } from "@/components/tables/zonas-table";
import { ZonaForm } from "@/components/forms/zona-form";
import { useZonas, type Zona } from "@/hooks/use-zonas";
import { ZonaEstadisticas } from "@/components/zona-estadisticas";
import { ZonaMapa } from "@/components/zona-mapa";
import { useToast } from "@/hooks/use-toast";

export default function ZonasPage() {
  const { zonas, createZona, updateZona, deleteZona, isLoading, error } =
    useZonas();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingZona, setEditingZona] = useState<Zona | null>(null);
  const [selectedZona, setSelectedZona] = useState<Zona | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [showStats, setShowStats] = useState(false);

  // 🔧 Normalizar fecha a YYYY-MM-DD
  const toLocalYMD = (dateString: string | Date | null | undefined): string => {
    if (!dateString) return "";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
  };

  // 🔍 Filtrado (búsqueda y fecha)
  const filteredZonas = zonas.filter((z) => {
    const matchesSearch =
      z.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      z.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      z.ubicacion?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate = dateFilter
      ? toLocalYMD(z.fecha_creacion) === dateFilter
      : true;

    return matchesSearch && matchesDate;
  });

  const handleSubmit = async (zonaData: Omit<Zona, "id_zona">) => {
    try {
      let result;
      if (editingZona && editingZona.id_zona) {
        result = await updateZona(editingZona.id_zona, zonaData);
      } else {
        result = await createZona(zonaData);
      }

      if (result.success) {
        toast({
          title: editingZona ? "Zona actualizada" : "Zona creada",
          description: editingZona
            ? `Se actualizó la zona ${zonaData.codigo}`
            : `Se registró exitosamente la zona ${zonaData.codigo}`,
        });
        setIsDialogOpen(false);
        setEditingZona(null);
      } else {
        if (
          result.error?.includes("código") ||
          result.error?.includes("duplicado") ||
          result.error?.includes("existe")
        ) {
          toast({
            title: "Código duplicado",
            description: `El código "${zonaData.codigo}" ya está en uso.`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error al guardar",
            description: result.error || "No se pudo guardar la zona.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (zona: Zona) => {
    setEditingZona(zona);
    setIsDialogOpen(true);
  };

  const handleDelete = async (zona: Zona) => {
    if (
      confirm(`¿Está seguro de eliminar la zona ${zona.codigo}?`)
    ) {
      if (zona.id_zona) {
        const result = await deleteZona(zona.id_zona);
        if (result.success) {
          toast({
            title: "Zona eliminada",
            description: `Se eliminó exitosamente la zona ${zona.codigo}`,
          });
        } else {
          toast({
            title: "Error al eliminar",
            description: result.error || "No se pudo eliminar la zona",
            variant: "destructive",
          });
        }
      }
    }
  };

  const handleNewZona = () => {
    setEditingZona(null);
    setIsDialogOpen(true);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setDateFilter("");
  };

  const hasActiveFilters = searchTerm || dateFilter;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="w-full">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold">Zonas</h1>
            <p className="text-muted-foreground">Gestión de zonas geográficas</p>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewZona}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Zona
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md mx-4 sm:mx-auto">
            <DialogHeader>
              <DialogTitle>
                {editingZona ? "Editar Zona" : "Crear Nueva Zona"}
              </DialogTitle>
              <DialogDescription>
                {editingZona
                  ? "Modifique los campos necesarios para actualizar la zona."
                  : "Complete los campos para crear una nueva zona."}
              </DialogDescription>
            </DialogHeader>
            <ZonaForm
              zona={editingZona}
              onSubmit={handleSubmit}
              onCancel={() => setIsDialogOpen(false)}
              isEditing={!!editingZona}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="lista" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="lista" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Lista de Zonas
          </TabsTrigger>
          <TabsTrigger value="estadisticas" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Estadísticas
          </TabsTrigger>
          <TabsTrigger value="mapa" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Mapa
          </TabsTrigger>
        </TabsList>

        {/* TAB LISTA */}
        <TabsContent value="lista">
          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Buscar Zonas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 items-center">
                <Input
                  placeholder="Buscar por código, descripción o ubicación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={handleClearFilters}>
                    Limpiar
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setShowStats(!showStats)}
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Estadísticas
                  {showStats ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Estadísticas */}
          {showStats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-4">
              <Card>
                <CardContent className="pt-6 flex items-center space-x-2">
                  <MapPin className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{zonas.length}</p>
                    <p className="text-sm text-muted-foreground">Total Zonas</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 flex items-center space-x-2">
                  <Activity className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {zonas.filter((z) => z.latitud && z.longitud).length}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Con Coordenadas
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 flex items-center space-x-2">
                  <Users className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {zonas.filter((z) => z.codigo).length}
                    </p>
                    <p className="text-sm text-muted-foreground">Con Código</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 flex items-center space-x-2">
                  <Info className="h-8 w-8 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {zonas.filter((z) => z.descripcion).length}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Con Descripción
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tabla */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Lista de Zonas</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">Cargando zonas...</div>
              ) : filteredZonas.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No hay zonas registradas</h3>
                  <p className="text-gray-600 mb-4">
                    Comienza creando tu primera zona geográfica
                  </p>
                  <Button onClick={handleNewZona}>
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Primera Zona
                  </Button>
                </div>
              ) : (
                <ZonasTable
                  zonas={filteredZonas}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onViewMap={setSelectedZona}
                  initialPageSize={10}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB ESTADÍSTICAS */}
        <TabsContent value="estadisticas" className="mt-6">
          <ZonaEstadisticas />
        </TabsContent>

        {/* TAB MAPA */}
        <TabsContent value="mapa" className="mt-6">
          <ZonaMapa
            zonas={zonas}
            selectedZona={selectedZona}
            onZonaSelect={setSelectedZona}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
