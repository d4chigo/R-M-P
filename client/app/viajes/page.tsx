"use client";

import { useState } from "react";
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
import {
  Plus,
  ArrowLeft,
  Calendar,
  AlertTriangle,
  Trash2,
  Clock,
  MapPin,
  User,
  Truck,
  Search,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Activity,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { ViajesTable } from "@/components/tables/viajes-table";
import { ViajeForm } from "@/components/forms/viaje-form";
import { useViajes, type Viaje } from "@/hooks/use-viajes";
import { useVehiculos } from "@/hooks/use-vehiculos";
import { useRepartidores } from "@/hooks/use-repartidores";
import { Badge } from "@/components/ui/badge";
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
  const totalPaginas = Math.ceil(viajes.length / tamanoPagina);
  const viajesPaginados = viajes.slice(
    (pagina - 1) * tamanoPagina,
    pagina * tamanoPagina
  );

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
          variant: "default",
        });
        setIsDialogOpen(false);
        setEditingViaje(null);
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
      // Recargar datos antes de abrir el diálogo de edición
      await Promise.all([fetchVehiculos(), fetchRepartidores()]);
      setIsDialogOpen(true);
    } catch (error) {
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
          variant: "default",
        });
        setDeleteDialogOpen(false);
        setViajeToDelete(null);
        setDeleteError(null);
      } else {
        if (result.hasReferences) {
          setDeleteError(
            "No se puede eliminar este viaje porque tiene visitas asociadas. " +
              "Para eliminar el viaje, primero debe eliminar todas las visitas relacionadas " +
              "o transferirlas a otro viaje."
          );
        } else {
          setDeleteError(result.error || "Error al eliminar el viaje");
        }
      }
    } catch (error) {
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
      // Recargar datos antes de abrir el diálogo
      await Promise.all([fetchVehiculos(), fetchRepartidores()]);
      setIsDialogOpen(true);
    } catch (error) {
      toast({
        title: "Error al cargar datos",
        description:
          "No se pudieron cargar los datos necesarios. Inténtelo nuevamente.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "No definido";

    // Backend now consistently sends dates in YYYY-MM-DD format
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split("-");
      return `${day}/${month}/${year}`;
    }

    // Fallback for any other format (shouldn't happen with current backend)
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "Fecha inválida";
    }
  };

  const formatTime = (minutes: number | undefined) => {
    if (!minutes) return "-";
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getEstadoViaje = (fecha: string) => {
    const hoy = new Date().toISOString().split("T")[0];
    const fechaViaje = fecha;

    if (fechaViaje > hoy) {
      return { estado: "Programado", variant: "secondary" as const };
    } else if (fechaViaje === hoy) {
      return { estado: "En Curso", variant: "default" as const };
    } else {
      return { estado: "Completado", variant: "outline" as const };
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Aquí puedes implementar la lógica de búsqueda
  };

  const handleDateFilter = (date: string) => {
    setDateFilter(date);
    // Aquí puedes implementar filtrado por fecha si es necesario
  };

  const clearFilters = () => {
    setSearchQuery("");
    setDateFilter("");
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
            <h1 className="text-3xl font-bold">Viajes</h1>
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
              placeholder="Buscar por vehículo, repartidor o número de viaje..."
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

      {/* Stats - Collapsible */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in slide-in-from-top-2 duration-200">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Calendar className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{viajes.length}</p>
                  <p className="text-sm text-muted-foreground">Total Viajes</p>
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
                    {
                      viajes.filter((v) => {
                        const hoy = new Date().toISOString().split("T")[0];
                        return v.fecha === hoy;
                      }).length
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">Hoy</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {
                      viajes.filter((v) => {
                        const hoy = new Date().toISOString().split("T")[0];
                        return v.fecha < hoy;
                      }).length
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">Completados</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {
                      viajes.filter((v) => {
                        const hoy = new Date().toISOString().split("T")[0];
                        return v.fecha > hoy;
                      }).length
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">Programados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Mostrar error general si existe */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Viajes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Cargando viajes...</div>
          ) : (
            <ViajesTable
              viajes={viajes}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              initialPageSize={10}
            />
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
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
                      Fecha: {formatDate(viajeToDelete.fecha)}
                    </div>
                    <div>
                      Vehículo: {viajeToDelete.vehiculo_placa || "Sin placa"}
                      {viajeToDelete.vehiculo_marca &&
                        ` - ${viajeToDelete.vehiculo_marca} ${viajeToDelete.vehiculo_modelo}`}
                    </div>
                    <div>
                      Repartidor:{" "}
                      {viajeToDelete.repartidor_nombre || "Sin asignar"}
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
