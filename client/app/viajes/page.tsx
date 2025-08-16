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
} from "lucide-react";
import Link from "next/link";
import { DataTable, type Column } from "@/components/ui/data-table";
import { ViajeForm } from "@/components/forms/viaje-form";
import { useViajes, type Viaje } from "@/hooks/use-viajes";
import { useVehiculos } from "@/hooks/use-vehiculos";
import { useRepartidores } from "@/hooks/use-repartidores";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Badge } from "@/components/ui/badge";

export default function ViajesPage() {
  const { viajes, createViaje, updateViaje, deleteViaje, isLoading, error } =
    useViajes();
  const { fetchVehiculos } = useVehiculos();
  const { fetchRepartidores } = useRepartidores();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingViaje, setEditingViaje] = useState<Viaje | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viajeToDelete, setViajeToDelete] = useState<Viaje | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleSubmit = async (viajeData: Omit<Viaje, "id">) => {
    try {
      if (editingViaje && (editingViaje.id || editingViaje.id_viaje)) {
        const id = editingViaje.id || editingViaje.id_viaje!;
        await updateViaje(id, viajeData);
      } else {
        await createViaje(viajeData);
      }
      setIsDialogOpen(false);
      setEditingViaje(null);
    } catch (error) {
      console.error("Error al guardar viaje:", error);
    }
  };

  const handleEdit = async (viaje: Viaje) => {
    setEditingViaje(viaje);
    // Recargar datos antes de abrir el diálogo de edición
    await Promise.all([fetchVehiculos(), fetchRepartidores()]);
    setIsDialogOpen(true);
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
        setDeleteDialogOpen(false);
        setViajeToDelete(null);
        setDeleteError(null);
      } else {
        // Mostrar error específico si hay referencias
        if (result.hasReferences) {
          setDeleteError(
            "No se puede eliminar este viaje porque tiene visitas asociadas. " +
              "Para eliminar el viaje, primero debe eliminar todas las visitas relacionadas " +
              "o transferirlas a otro viaje.",
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
    setEditingViaje(null);
    // Recargar datos antes de abrir el diálogo
    await Promise.all([fetchVehiculos(), fetchRepartidores()]);
    setIsDialogOpen(true);
  };

  const formatDateTime = (dateTime: string | undefined) => {
    if (!dateTime) return "No definido";
    try {
      return new Date(dateTime).toLocaleString("es-PE", {
        timeZone: "America/Lima",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
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

  const columns: Column<Viaje>[] = [
    // {
    //   key: "id_viaje",
    //   header: "ID",
    //   sortable: true,
    //   render: (viaje) => (
    //     <span className="font-mono text-sm">#{viaje.id_viaje || viaje.id}</span>
    //   ),
    // },
    {
      key: "fecha",
      header: "Fecha",
      sortable: true,
      render: (viaje) => {
        const { estado, variant } = getEstadoViaje(viaje.fecha);
        return (
          <div className="space-y-1">
            <div className="font-medium">
              {new Date(viaje.fecha).toLocaleDateString("es-PE", {
                timeZone: "America/Lima",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </div>
            <Badge variant={variant} className="text-xs">
              {estado}
            </Badge>
          </div>
        );
      },
    },
    {
      key: "nro_viaje",
      header: "N° Viaje",
      sortable: true,
      render: (viaje) => (
        <Badge variant="outline" className="font-mono">
          Viaje {viaje.nro_viaje}
        </Badge>
      ),
    },
    {
      key: "vehiculo",
      header: "Vehículo",
      sortable: true,
      render: (viaje) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-blue-500" />
            <span className="font-medium text-blue-700 dark:text-blue-300">
              {viaje.vehiculo_placa || "Sin placa"}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            {viaje.vehiculo_marca} {viaje.vehiculo_modelo}
          </div>
          {(viaje.vehiculo_capacidad_kg || viaje.vehiculo_capacidad_cajas) && (
            <div className="text-xs text-gray-400">
              {viaje.vehiculo_capacidad_kg &&
                `${viaje.vehiculo_capacidad_kg}kg`}
              {viaje.vehiculo_capacidad_cajas &&
                ` • ${viaje.vehiculo_capacidad_cajas} cajas`}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "repartidor",
      header: "Repartidor",
      sortable: true,
      render: (viaje) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-green-500" />
            <span className="font-medium">
              {viaje.repartidor_nombre || "Sin asignar"}
            </span>
          </div>
          {viaje.repartidor_codigo && (
            <div className="text-xs text-gray-500">
              Código: {viaje.repartidor_codigo}
            </div>
          )}
          {viaje.repartidor_telefono && (
            <div className="text-xs text-gray-400">
              Tel: {viaje.repartidor_telefono}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "horarios",
      header: "Horarios",
      render: (viaje) => (
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-green-600" />
            <span className="text-green-600">
              Salida:{" "}
              {viaje.salida_cd
                ? new Date(viaje.salida_cd).toLocaleTimeString("es-PE", {
                    timeZone: "America/Lima",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "No definida"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-red-600" />
            <span className="text-red-600">
              Llegada:{" "}
              {viaje.llegada_cd
                ? new Date(viaje.llegada_cd).toLocaleTimeString("es-PE", {
                    timeZone: "America/Lima",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "No definida"}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "detalles",
      header: "Detalles",
      render: (viaje) => (
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-blue-500" />
            <span>
              {viaje.distancia_km ? `${viaje.distancia_km} km` : "Sin definir"}
            </span>
          </div>
          {viaje.tipo_viaje && (
            <Badge variant="secondary" className="text-xs">
              {viaje.tipo_viaje}
            </Badge>
          )}
          <div className="grid grid-cols-2 gap-1 mt-1">
            {viaje.tiempo_manejo_min && (
              <div className="text-gray-500">
                Manejo: {formatTime(viaje.tiempo_manejo_min)}
              </div>
            )}
            {viaje.tiempo_servicio_min && (
              <div className="text-gray-500">
                Servicio: {formatTime(viaje.tiempo_servicio_min)}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "tiempos_extra",
      header: "Tiempos Extra",
      render: (viaje) => (
        <div className="space-y-1 text-xs text-gray-500">
          {viaje.recarga_min && (
            <div>Recarga: {formatTime(viaje.recarga_min)}</div>
          )}
          {viaje.refrigerio_min && (
            <div>Refrigerio: {formatTime(viaje.refrigerio_min)}</div>
          )}
          {!viaje.recarga_min && !viaje.refrigerio_min && (
            <span className="text-gray-400">Sin tiempos extra</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button
                variant="outline"
                size="sm"
                className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 bg-transparent"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Gestión de Viajes
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                  Administra los viajes de vehículos y repartidores
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={handleNewViaje}
                  className="w-full sm:w-auto mobile-button"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Viaje
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl mx-4 sm:mx-auto dark:bg-gray-800 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="dark:text-gray-100">
                    {editingViaje ? "Editar Viaje" : "Crear Nuevo Viaje"}
                  </DialogTitle>
                  <DialogDescription className="dark:text-gray-300">
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
        </div>

        {/* Mostrar error general si existe */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-gray-100 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Lista de Viajes
            </CardTitle>
            <CardDescription className="dark:text-gray-300">
              Gestiona todos los viajes con información detallada de vehículos,
              repartidores y horarios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={viajes}
              columns={columns}
              searchPlaceholder="Buscar por placa, repartidor, tipo..."
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              showDateFilter={true}
              dateFilterKey="fecha"
              searchKeys={[
                "vehiculo_placa",
                "vehiculo_marca",
                "vehiculo_modelo",
                "repartidor_nombre",
                "repartidor_codigo",
                "tipo_viaje",
                "nro_viaje",
              ]}
            />
          </CardContent>
        </Card>

        {/* Dialog de confirmación de eliminación */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="dark:bg-gray-800 dark:border-gray-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <Trash2 className="w-5 h-5" />
                Confirmar Eliminación
              </AlertDialogTitle>
              <AlertDialogDescription className="dark:text-gray-300">
                {viajeToDelete && (
                  <div className="space-y-2">
                    <p>
                      ¿Está seguro de que desea eliminar el siguiente viaje?
                    </p>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg space-y-1">
                      <div className="font-medium">
                        Fecha:{" "}
                        {new Date(viajeToDelete.fecha).toLocaleDateString(
                          "es-PE",
                        )}
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Esta acción no se puede deshacer.
                    </p>
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>

            {/* Mostrar error de eliminación si existe */}
            {deleteError && (
              <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <AlertDescription className="text-red-800 dark:text-red-200">
                  <div className="space-y-2">
                    <div className="font-medium">
                      No se puede eliminar el viaje
                    </div>
                    <div>{deleteError}</div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <AlertDialogFooter>
              <AlertDialogCancel
                className="dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
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
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Eliminar Viaje
                </AlertDialogAction>
              )}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
