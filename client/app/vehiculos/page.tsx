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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  ArrowLeft,
  Truck,
  AlertTriangle,
  Info,
  Search,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Calendar,
  Package,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { VehiculosTable } from "@/components/tables/vehiculos-table";
import { VehiculoFormSimple } from "@/components/forms/vehiculo-form-simple";
import {
  useVehiculos,
  type Vehiculo,
  normalizeBoolean,
} from "@/hooks/use-vehiculos";
import { formatDateForDisplay } from "@/lib/utils/date";
import { useAuth } from "@/contexts/AuthContext";

export default function VehiculosPage() {
  const { token } = useAuth();
  const {
    vehiculos,
    createVehiculo,
    updateVehiculo,
    deleteVehiculo,
    searchVehiculos,
    fetchVehiculos,
    isLoading,
    error,
  } = useVehiculos();

  // Estados de diálogo y edición
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVehiculo, setEditingVehiculo] = useState<Vehiculo | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vehiculoToDelete, setVehiculoToDelete] = useState<Vehiculo | null>(null);
  const [lastDeleteResult, setLastDeleteResult] = useState<{
    type: "deleted" | "deactivated";
    message: string;
    details?: string;
    relatedCount?: number;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [showStats, setShowStats] = useState(false);

  // Estados de paginación
  const [pagina, setPagina] = useState(1);
  const [tamanoPagina, setTamanoPagina] = useState(10);
  const [filteredVehiculos, setFilteredVehiculos] = useState<Vehiculo[]>([]);

  useEffect(() => {
    // Filtrar vehículos por fecha y búsqueda
    const filterVehiculos = () => {
      let filtered = [...vehiculos];

      // Primero aplicar filtro de búsqueda
      if (searchQuery.trim()) {
        filtered = filtered.filter((vehiculo) =>
          vehiculo.placa?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          vehiculo.marca?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          vehiculo.modelo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (vehiculo.anio && vehiculo.anio.toString().includes(searchQuery))
        );
      }

      // Luego aplicar filtro por fecha si existe
      if (dateFilter) {
        console.log('Filtrando por fecha:', dateFilter);
        
        // Crear fecha en UTC para evitar problemas de zona horaria
        const selectedDateUTC = new Date(dateFilter + 'T00:00:00Z');
        console.log('Fecha seleccionada (UTC):', selectedDateUTC.toISOString());
        
        filtered = filtered.filter((vehiculo) => {
          // Verificar diferentes propiedades de fecha que podrían existir
          const vehiculoDateStr = vehiculo.fecha_creacion || vehiculo.created_at || vehiculo.fecha_registro || vehiculo.fecha;
          
          if (!vehiculoDateStr) {
            console.log('Vehículo sin fecha:', vehiculo.placa);
            return false;
          }
          
          try {
            // Convertir la fecha del vehículo a UTC
            const vehiculoDate = new Date(vehiculoDateStr);
            const vehiculoDateUTC = new Date(Date.UTC(
              vehiculoDate.getUTCFullYear(),
              vehiculoDate.getUTCMonth(),
              vehiculoDate.getUTCDate()
            ));
            
            console.log('Fecha vehículo:', vehiculoDateStr, '-> UTC:', vehiculoDateUTC.toISOString());
            console.log('Comparación:', selectedDateUTC.toISOString(), 'vs', vehiculoDateUTC.toISOString());
            
            // Comparar solo año, mes y día en UTC
            return selectedDateUTC.getTime() === vehiculoDateUTC.getTime();
          } catch (error) {
            console.error('Error parsing date:', vehiculoDateStr, error);
            return false;
          }
        });

        console.log('Vehículos después de filtrar por fecha:', filtered.length);
      }

      setFilteredVehiculos(filtered);
    };

    filterVehiculos();
  }, [searchQuery, dateFilter, vehiculos]);

  const totalPaginas = Math.ceil(filteredVehiculos.length / tamanoPagina);
  const vehiculosPaginados = filteredVehiculos.slice(
    (pagina - 1) * tamanoPagina,
    pagina * tamanoPagina
  );

  // Manejo de creación/actualización
  const handleSubmit = async (vehiculoData: Omit<Vehiculo, "id_vehiculo">) => {
    let result;
    if (editingVehiculo && editingVehiculo.id_vehiculo) {
      result = await updateVehiculo(editingVehiculo.id_vehiculo, vehiculoData);
    } else {
      result = await createVehiculo(vehiculoData);
    }

    if (result.success) {
      setIsDialogOpen(false);
      setEditingVehiculo(null);
    }
    // Los errores se manejan automáticamente en los hooks con toasts
  };

  const handleEdit = (vehiculo: Vehiculo) => {
    setEditingVehiculo(vehiculo);
    setIsDialogOpen(true);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
  };

  const handleDateFilter = (date: string) => {
    setDateFilter(date);
    setPagina(1); // Resetear a la primera página al aplicar filtro
  };

  const clearFilters = () => {
    setSearchQuery("");
    setDateFilter("");
    setPagina(1);
  };

  const handleDelete = (vehiculo: Vehiculo) => {
    setVehiculoToDelete(vehiculo);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!vehiculoToDelete?.id_vehiculo) return;
    try {
      const result = await deleteVehiculo(vehiculoToDelete.id_vehiculo);
      if (result.success) {
        setLastDeleteResult({
          type: (result as any).type || "deleted",
          message: result.message || "Operación completada",
          details: (result as any).details,
          relatedCount: (result as any).relatedCount,
        });
      } else {
        setLastDeleteResult({
          type: "deleted",
          message: `Error al eliminar el vehículo: ${result.error || "Error desconocido"}`,
        });
      }
    } catch (error) {
      setLastDeleteResult({
        type: "deleted",
        message: `Error inesperado: ${error instanceof Error ? error.message : "Error desconocido"}`,
      });
    } finally {
      setDeleteDialogOpen(false);
      setVehiculoToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setVehiculoToDelete(null);
  };

  const handleCancel = () => {
    setEditingVehiculo(null);
    setIsDialogOpen(false);
  };

  const handleNewVehiculo = () => {
    setEditingVehiculo(null);
    setIsDialogOpen(true);
  };

  // Función para debugging - mostrar propiedades de fecha disponibles
  const mostrarPropiedadesFecha = () => {
    if (vehiculos.length > 0) {
      console.log('=== DEBUG: PROPIEDADES DE FECHA ===');
      console.log('Propiedades disponibles en el primer vehículo:', Object.keys(vehiculos[0]));
      
      vehiculos.slice(0, 3).forEach((vehiculo, index) => {
        console.log(`\nVehículo ${index + 1} (${vehiculo.placa}):`);
        console.log('fecha:', vehiculo.fecha);
        console.log('fecha_creacion:', vehiculo.fecha_creacion);
        console.log('created_at:', vehiculo.created_at);
        console.log('fecha_registro:', vehiculo.fecha_registro);
        
        if (vehiculo.fecha_creacion) {
          const date = new Date(vehiculo.fecha_creacion);
          console.log('fecha_creacion parsed:', date.toISOString(), 'Local:', date.toLocaleDateString());
        }
      });
    }
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
            <h1 className="text-3xl font-bold">Vehículos</h1>
            <p className="text-muted-foreground">
              Gestión de vehículos de transporte
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={mostrarPropiedadesFecha}
            title="Debug: Mostrar propiedades de fecha"
          >
            <Info className="h-4 w-4" />
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleNewVehiculo}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Vehículo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingVehiculo
                    ? "Editar Vehículo"
                    : "Registrar Nuevo Vehículo"}
                </DialogTitle>
                <DialogDescription>
                  {editingVehiculo
                    ? "Modifique los campos necesarios para actualizar el vehículo."
                    : "Complete los campos requeridos para registrar un nuevo vehículo en el sistema."}
                </DialogDescription>
              </DialogHeader>
              <VehiculoFormSimple
                vehiculo={editingVehiculo}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isEditing={!!editingVehiculo}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Vehículos
          </CardTitle>
          <CardDescription>
            {dateFilter && `Filtrado por fecha: ${formatDateForDisplay(dateFilter)}`}
            {searchQuery && dateFilter && ' • '}
            {searchQuery && `Búsqueda: "${searchQuery}"`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center flex-wrap">
            <Input
              placeholder="Buscar por placa, marca, modelo o año..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1 min-w-[200px]"
            />
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => handleDateFilter(e.target.value)}
                className="pl-10 min-w-[150px]"
                placeholder="Filtrar por fecha"
              />
            </div>
            {(searchQuery || dateFilter) && (
              <Button
                variant="outline"
                onClick={clearFilters}
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
          
          {/* Información del filtrado */}
          {(searchQuery || dateFilter) && (
            <div className="mt-4 text-sm text-muted-foreground">
              <p>Mostrando {filteredVehiculos.length} de {vehiculos.length} vehículos</p>
              {dateFilter && (
                <p className="text-xs">
                  Fecha seleccionada: {dateFilter} (se muestra en UTC para evitar problemas de zona horaria)
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats - Collapsible */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in slide-in-from-top-2 duration-200">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Truck className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{filteredVehiculos.length}</p>
                  <p className="text-sm text-muted-foreground">
                    Vehículos Filtrados
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
                    {filteredVehiculos.filter((v) => v.activo).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Activos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Package className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {
                      filteredVehiculos.filter(
                        (v) => v.capacidad_cajas && v.capacidad_cajas > 0,
                      ).length
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Con Capacidad Cajas
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {filteredVehiculos.length - filteredVehiculos.filter((v) => v.activo).length}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Inactivos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Lista de Vehículos</CardTitle>
            <CardDescription>
              {pagina} de {totalPaginas} páginas • {filteredVehiculos.length} registros
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagina <= 1}
              onClick={() => setPagina(pagina - 1)}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagina >= totalPaginas}
              onClick={() => setPagina(pagina + 1)}
            >
              Siguiente
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Cargando vehículos...</p>
            </div>
          ) : filteredVehiculos.length === 0 ? (
            <div className="text-center py-8">
              <Truck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery || dateFilter ? 'No se encontraron vehículos' : 'No hay vehículos registrados'}
              </h3>
              <p className="text-muted-foreground">
                {searchQuery || dateFilter 
                  ? 'Intenta con otros criterios de búsqueda o limpia los filtros'
                  : 'Comienza registrando tu primer vehículo'
                }
              </p>
            </div>
          ) : (
            <VehiculosTable
              vehiculos={vehiculosPaginados}
              onEdit={handleEdit}
              onDelete={handleDelete}
              initialPageSize={tamanoPagina}
            />
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar vehículo?</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-2">
                <p>
                  Está a punto de eliminar el vehículo{" "}
                  <strong>{vehiculoToDelete?.placa}</strong>.
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                  <p className="text-sm text-amber-800">
                    <strong>Importante:</strong> Si este vehículo tiene viajes
                    registrados en el sistema, será desactivado en lugar de
                    eliminado para preservar la integridad de los datos
                    históricos.
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Solo se eliminará completamente si no tiene registros
                  asociados.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
