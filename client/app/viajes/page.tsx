"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Plus,
  ChartBar,
  ChartBarOff,
  Truck,
  Clock,
  CalendarClock,
  CheckSquare,
  AlertTriangle,
  Search,
  Calendar,
  Filter,
  X,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Activity,
  CheckCircle,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
import { ViajesTable } from "@/components/tables/viajes-table";
import { ViajeForm } from "@/components/forms/viaje-form";
import { useViajes, type Viaje } from "@/hooks/use-viajes";
import { useVehiculos } from "@/hooks/use-vehiculos";
import { useRepartidores } from "@/hooks/use-repartidores";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function ViajesPage() {
  const { viajes, createViaje, updateViaje, deleteViaje, isLoading, error } =
    useViajes();
  const { fetchVehiculos } = useVehiculos();
  const { fetchRepartidores } = useRepartidores();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingViaje, setEditingViaje] = useState<Viaje | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viajeToDelete, setViajeToDelete] = useState<Viaje | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [showStats, setShowStats] = useState(false);

  // Estados de paginación
  const [pagina, setPagina] = useState(1);
  const [tamanoPagina, setTamanoPagina] = useState(10);

  // Normalizar fecha siempre en zona local
  const normalizeDate = (dateString: string) => {
    if (!dateString) return "";
    // Asegura que la fecha se tome como local y solo año-mes-día
    const d = new Date(dateString + "T00:00:00");
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Filtrar viajes según búsqueda y fecha
  const filteredViajes = viajes.filter((viaje) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      searchQuery === "" ||
      viaje.nro_viaje?.toString().toLowerCase().includes(searchLower) ||
      viaje.vehiculo_placa?.toLowerCase().includes(searchLower) ||
      viaje.vehiculo_marca?.toLowerCase().includes(searchLower) ||
      viaje.vehiculo_modelo?.toLowerCase().includes(searchLower) ||
      viaje.repartidor_nombre?.toLowerCase().includes(searchLower);

    const matchesDate =
      dateFilter === "" ||
      normalizeDate(viaje.fecha) === normalizeDate(dateFilter);

    return matchesSearch && matchesDate;
  });

  // Paginación (no se calcula viajesPaginados aquí, se pasa el array completo al componente de tabla)
  const totalPaginas = Math.ceil(filteredViajes.length / tamanoPagina);

  const handleSubmit = async (viajeData: Omit<Viaje, "id">) => {
    try {
      let result;
      if (editingViaje && (editingViaje.id || editingViaje.id_viaje)) {
        const id = editingViaje.id || editingViaje.id_viaje!;
        result = await updateViaje(id, viajeData);
      } else {
        result = await createViaje(viajeData);
      }

      if (result.success) {
        toast({
          title: editingViaje ? "Viaje actualizado" : "Viaje creado",
          description: editingViaje
            ? `Se actualizó el viaje del ${viajeData.fecha}`
            : `Se registró exitosamente el viaje #${viajeData.nro_viaje}`,
        });
        setIsDialogOpen(false);
        setEditingViaje(null);
        setPagina(1);
      } else {
        toast({
          title: "Error al guardar",
          description:
            result.error ||
            "No se pudo guardar el viaje. Inténtelo nuevamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error al guardar viaje:", error);
      toast({
        title: "Error de conexión",
        description:
          "No se pudo conectar con el servidor. Verifique su conexión a internet.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (viaje: Viaje) => {
    try {
      setEditingViaje(viaje);
      await Promise.all([fetchVehiculos(), fetchRepartidores()]);
      setIsDialogOpen(true);
    } catch {
      toast({
        title: "Error al cargar datos",
        description:
          "No se pudieron cargar los datos necesarios. Inténtelo nuevamente.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (viaje: Viaje) => {
    setViajeToDelete(viaje);
    setDeleteError(null);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!viajeToDelete) return;
    const id = viajeToDelete.id || viajeToDelete.id_viaje;
    if (!id) return;

    try {
      const result = await deleteViaje(id);

      if (result.success) {
        toast({
          title: "Viaje eliminado",
          description: `Se eliminó exitosamente el viaje #${viajeToDelete.nro_viaje}`,
        });
        setDeleteDialogOpen(false);
        setViajeToDelete(null);
        setDeleteError(null);
        setPagina(1);
      } else {
        setDeleteError(result.error || "Error al eliminar el viaje");
      }
    } catch {
      setDeleteError("Error de conexión al eliminar el viaje");
    }
  };

  const handleCancel = () => {
    setEditingViaje(null);
    setIsDialogOpen(false);
  };

  const handleNewViaje = async () => {
    try {
      setEditingViaje(null);
      await Promise.all([fetchVehiculos(), fetchRepartidores()]);
      setIsDialogOpen(true);
    } catch {
      toast({
        title: "Error al cargar datos",
        description:
          "No se pudieron cargar los datos necesarios. Inténtelo nuevamente.",
        variant: "destructive",
      });
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPagina(1);
  };

  const handleDateFilter = (date: string) => {
    setDateFilter(date);
    setPagina(1);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setDateFilter("");
    setPagina(1);
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
            <h1 className="text-xl font-bold">Viajes</h1>
            <p className="text-muted-foreground">
              Gestión de viajes y rutas de transporte
            </p>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewViaje}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Viaje
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingViaje ? "Editar Viaje" : "Crear Nuevo Viaje"}
              </DialogTitle>
              <DialogDescription>
                {editingViaje
                  ? "Modifique los campos necesarios para actualizar el viaje."
                  : "Complete los campos para crear un nuevo viaje."}
              </DialogDescription>
            </DialogHeader>
            <ViajeForm
              viaje={editingViaje}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isEditing={!!editingViaje}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Viajes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <Input
              placeholder="Buscar por vehículo o repartidor ..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1"
            />
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => handleDateFilter(e.target.value)}
                className="pl-10 w-auto"
                placeholder="Filtrar por fecha"
              />
            </div>
            {(searchQuery || dateFilter) && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="flex items-center gap-2"
              >
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

      {/* 📊 Estadísticas colapsables de Viajes */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in slide-in-from-top-2 duration-200">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{viajes.length}</p>
                  <p className="text-sm text-muted-foreground">Total de Viajes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {viajes.filter((v) => v.estado === "completado").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Completados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {viajes.filter((v) => v.estado === "pendiente").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Pendientes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <X className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {viajes.filter((v) => v.estado === "cancelado").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Cancelados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Mostrar error */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Tabla */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Viajes</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">Cargando viajes...</div>
              ) : filteredViajes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Send className="w-16 h-16 mb-4 text-gray-400 dark:text-gray-500" />
                  <p className="text-lg font-semibold text-muted-foreground">
                    No hay viajes registrados
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Usa el botón <strong>"Nuevo Viaje"</strong> para crear uno.
                  </p>
                </div>
              ) : (
                <ViajesTable
                  viajes={filteredViajes}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                  page={pagina}
                  pageSize={tamanoPagina}
                  totalCount={filteredViajes.length}
                  onPageChange={setPagina}
                  onPageSizeChange={setTamanoPagina}
                />
              )}
            </CardContent>
          </Card>

      {/* Confirmación Eliminar */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar viaje?</AlertDialogTitle>
            <AlertDialogDescription>
              {viajeToDelete && (
                <div className="space-y-2">
                  <p>Está a punto de eliminar el siguiente viaje:</p>
                  <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                    <div className="font-medium">
                      Fecha: {normalizeDate(viajeToDelete.fecha)}
                    </div>
                    <div>
                      Vehículo: {viajeToDelete.vehiculo_placa || "Sin placa"}
                      {viajeToDelete.vehiculo_marca &&
                        ` - ${viajeToDelete.vehiculo_marca} ${viajeToDelete.vehiculo_modelo}`}
                    </div>
                    <div>
                      Repartidor: {viajeToDelete.repartidor_nombre || "Sin asignar"}
                    </div>
                    <div>Viaje N°: {viajeToDelete.nro_viaje}</div>
                  </div>
                  {deleteError && (
                    <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                      <p className="text-sm text-amber-800">
                        <strong>Error:</strong> {deleteError}
                      </p>
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Esta acción no se puede deshacer.
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDeleteError(null);
                setDeleteDialogOpen(false);
                setViajeToDelete(null);
              }}
            >
              Cancelar
            </AlertDialogCancel>
            {!deleteError && (
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-red-600 hover:bg-red-700"
              >
                Eliminar
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}