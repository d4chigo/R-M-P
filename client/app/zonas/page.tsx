"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
  const { zonas, createZona, updateZona, deleteZona, isLoading, error } = useZonas();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingZona, setEditingZona] = useState<Zona | null>(null);
  const [selectedZona, setSelectedZona] = useState<Zona | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [showStats, setShowStats] = useState(false);
  const [filteredZonas, setFilteredZonas] = useState<Zona[]>([]);

  // PAGINACIÓN
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Efecto para filtrar zonas cuando cambian los filtros o las zonas
  useEffect(() => {
    const filterZonas = () => {
      let filtered = [...zonas];

      // Filtro por búsqueda
      if (searchTerm.trim()) {
        filtered = filtered.filter((zona) =>
          (zona.codigo || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (zona.descripcion || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (zona.ubicacion || "").toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Filtro por fecha - CORREGIDO para manejar zona horaria
      if (dateFilter) {
        console.log('=== FILTRO POR FECHA ===');
        console.log('Fecha seleccionada en input:', dateFilter);
        
        // Convertir la fecha seleccionada a objeto Date
        const selectedDate = new Date(dateFilter);
        
        // Obtener componentes de la fecha seleccionada (en zona horaria local)
        const selectedYear = selectedDate.getFullYear();
        const selectedMonth = selectedDate.getMonth();
        const selectedDay = selectedDate.getDate();
        
        console.log('Fecha seleccionada (local):', selectedDate.toLocaleDateString());
        console.log('Año/Mes/Día:', selectedYear, selectedMonth + 1, selectedDay);

        filtered = filtered.filter((zona) => {
          if (!zona.fecha_creacion) {
            console.log('Zona sin fecha_creacion:', zona.codigo);
            return false;
          }
          
          try {
            const zonaDate = new Date(zona.fecha_creacion);
            
            // Obtener componentes de la fecha de la zona (en zona horaria local)
            const zonaYear = zonaDate.getFullYear();
            const zonaMonth = zonaDate.getMonth();
            const zonaDay = zonaDate.getDate();
            
            console.log('Zona:', zona.codigo);
            console.log('Fecha zona (BD):', zona.fecha_creacion);
            console.log('Fecha zona (local):', zonaDate.toLocaleDateString());
            console.log('Año/Mes/Día zona:', zonaYear, zonaMonth + 1, zonaDay);
            
            // Comparar año, mes y día individualmente
            const matches = selectedYear === zonaYear && 
                           selectedMonth === zonaMonth && 
                           selectedDay === zonaDay;
            
            console.log('Coincide:', matches);
            console.log('---');
            
            return matches;
          } catch (error) {
            console.error('Error parsing date:', zona.fecha_creacion, error);
            return false;
          }
        });

        console.log('Zonas después de filtrar:', filtered.length);
      }

      setFilteredZonas(filtered);
      setCurrentPage(1);
    };

    filterZonas();
  }, [searchTerm, dateFilter, zonas]);

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const zonasPaginated = filteredZonas.slice(startIndex, endIndex);

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
          variant: "default",
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
            description: `El código "${zonaData.codigo}" ya está en uso. Por favor, utilice un código diferente.`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error al guardar",
            description:
              result.error ||
              "No se pudo guardar la zona. Inténtelo nuevamente.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error al guardar zona:", error);
      toast({
        title: "Error de conexión",
        description:
          "No se pudo conectar con el servidor. Verifique su conexión a internet.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (zona: Zona) => {
    setEditingZona(zona);
    setIsDialogOpen(true);
  };

  const handleDelete = async (zona: Zona) => {
    const descripcionCorta =
      zona.descripcion && zona.descripcion.length > 50
        ? zona.descripcion.substring(0, 50) + "..."
        : zona.descripcion || "";
    
    if (
      confirm(
        `¿Está seguro de eliminar la zona ${zona.codigo}?\n\n${descripcionCorta}`,
      )
    ) {
      if (zona.id_zona) {
        try {
          const result = await deleteZona(zona.id_zona);
          if (result.success) {
            toast({
              title: "Zona eliminada",
              description: `Se eliminó exitosamente la zona ${zona.codigo}`,
              variant: "default",
            });
          } else {
            toast({
              title: "Error al eliminar",
              description: result.error || "No se pudo eliminar la zona",
              variant: "destructive",
            });
          }
        } catch (error) {
          toast({
            title: "Error de conexión",
            description:
              "No se pudo conectar con el servidor. Inténtelo nuevamente.",
            variant: "destructive",
          });
        }
      }
    }
  };

  const handleCancel = () => {
    setEditingZona(null);
    setIsDialogOpen(false);
  };

  const handleNewZona = () => {
    setEditingZona(null);
    setIsDialogOpen(true);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setDateFilter("");
  };

  const handleDateFilterChange = (date: string) => {
    console.log('Cambiando filtro de fecha a:', date);
    setDateFilter(date);
  };

  const hasActiveFilters = searchTerm || dateFilter;

  // Función para debugging - mostrar información de fechas
  const mostrarInfoFechas = () => {
    console.log('=== DEBUG: INFORMACIÓN COMPLETA DE FECHAS ===');
    console.log('Fecha seleccionada para filtro:', dateFilter);
    console.log('Total de zonas:', zonas.length);
    
    if (zonas.length > 0) {
      console.log('Primeras 5 zonas con sus fechas:');
      zonas.slice(0, 5).forEach((zona, index) => {
        console.log(`Zona ${index + 1}:`);
        console.log('  Código:', zona.codigo);
        console.log('  fecha_creacion (BD):', zona.fecha_creacion);
        if (zona.fecha_creacion) {
          try {
            const fecha = new Date(zona.fecha_creacion);
            console.log('  Fecha parseada (ISO):', fecha.toISOString());
            console.log('  Fecha local:', fecha.toLocaleDateString());
            console.log('  Hora local:', fecha.toLocaleTimeString());
            console.log('  Timestamp:', fecha.getTime());
          } catch (error) {
            console.log('  Error parsing date:', error);
          }
        }
        console.log('---');
      });
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
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
            <p className="text-muted-foreground">
              Gestión de zonas geográficas
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={mostrarInfoFechas}
            title="Debug: Mostrar información de fechas"
          >
            <Info className="h-4 w-4" />
          </Button>
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
                    : "Complete los campos para crear una nueva zona geográfica."}
                </DialogDescription>
              </DialogHeader>
              <ZonaForm
                zona={editingZona}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isEditing={!!editingZona}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

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

        <TabsContent value="lista" className="mt-0">
          {/* Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Buscar Zonas
              </CardTitle>
              <CardDescription>
                {hasActiveFilters && `Mostrando ${filteredZonas.length} de ${zonas.length} zonas`}
                {dateFilter && ` • Filtrado por: ${new Date(dateFilter).toLocaleDateString()}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 items-center flex-wrap">
                <Input
                  placeholder="Buscar por código, descripción o ubicación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 min-w-[200px]"
                />
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => handleDateFilterChange(e.target.value)}
                    className="pl-10 min-w-[150px]"
                    placeholder="Filtrar por fecha"
                  />
                </div>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={handleClearFilters}
                    className="flex items-center gap-2"
                  >
                    Limpiar Filtros
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

          {/* Stats - Collapsible */}
          {showStats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in slide-in-from-top-2 duration-200">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold">{filteredZonas.length}</p>
                      <p className="text-sm text-muted-foreground">
                        Zonas Filtradas
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold">
                        {filteredZonas.filter((z) => z.latitud && z.longitud).length}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Con Coordenadas
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Users className="h-8 w-8 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold">
                        {filteredZonas.filter((z) => z.codigo && z.codigo.length > 0).length}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Con Código
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Info className="h-8 w-8 text-orange-600" />
                    <div>
                      <p className="text-2xl font-bold">
                        {filteredZonas.filter((z) => z.descripcion && z.descripcion.length > 0).length}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Con Descripción
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Table */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Zonas</CardTitle>
              <CardDescription>
                {hasActiveFilters && `${filteredZonas.length} resultados encontrados`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">Cargando zonas...</div>
              ) : zonas.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No hay zonas registradas
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Comienza creando tu primera zona geográfica
                  </p>
                  <Button onClick={handleNewZona}>
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Primera Zona
                  </Button>
                </div>
              ) : filteredZonas.length === 0 ? (
                <div className="text-center py-8">
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No se encontraron zonas
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {hasActiveFilters 
                      ? 'Intenta con otros criterios de búsqueda o limpia los filtros'
                      : 'No hay zonas que coincidan con los criterios'
                    }
                  </p>
                  {hasActiveFilters && (
                    <Button variant="outline" onClick={handleClearFilters}>
                      Limpiar Filtros
                    </Button>
                  )}
                </div>
              ) : (
                <ZonasTable
                  zonas={zonasPaginated}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  initialPageSize={rowsPerPage}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="estadisticas" className="mt-6">
          <ZonaEstadisticas />
        </TabsContent>

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
