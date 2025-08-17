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
    setEditingViaje(null);
    await Promise.all([fetchVehiculos(), fetchRepartidores()]);
    setIsDialogOpen(true);
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
      render: (viaje) => (
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-blue-500" />
            <span className="font-medium text-blue-700 dark:text-blue-300">
              {viaje.vehiculo_placa || "Sin placa"}
            </span>
          </div>
          <div className="text-gray-500">
            {viaje.vehiculo_marca} {viaje.vehiculo_modelo}
          </div>
        </div>
      ),
    },
    {
      key: "repartidor",
      header: "Repartidor",
      render: (viaje) => (
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-green-500" />
            <span className="font-medium">{viaje.repartidor_nombre || "Sin asignar"}</span>
          </div>
        </div>
      ),
    },
    // Puedes agregar más columnas igual que tu código original...
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Header con botón Nuevo Viaje */}
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
                <Button onClick={handleNewViaje}>
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
              Gestiona todos los viajes con información detallada de vehículos, repartidores y horarios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={viajesPaginados}
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

            {/* Controles de Paginación */}
            <div className="flex flex-col md:flex-row items-center justify-between mt-4 gap-2">
              <div>
                Mostrando página {pagina} de {totalPaginas} ({viajes.length} viajes)
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="px-2 py-1 border rounded disabled:opacity-50"
                  onClick={() => setPagina(p => Math.max(1, p - 1))}
                  disabled={pagina === 1}
                >
                  Anterior
                </button>
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(num => (
                  <button
                    key={num}
                    className={`px-2 py-1 border rounded ${pagina === num ? 'bg-blue-600 text-white' : ''}`}
                    onClick={() => setPagina(num)}
                  >
                    {num}
                  </button>
                ))}
                <button
                  className="px-2 py-1 border rounded disabled:opacity-50"
                  onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                  disabled={pagina === totalPaginas}
                >
                  Siguiente
                </button>
                <select
                  className="ml-2 border rounded px-2 py-1"
                  value={tamanoPagina}
                  onChange={e => { setTamanoPagina(Number(e.target.value)); setPagina(1); }}
                >
                  {[5, 10, 20, 50].map(size => (
                    <option key={size} value={size}>{size} por página</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AlertDialog de eliminación */}
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
                    <p>¿Está seguro de que desea eliminar este viaje?</p>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg space-y-1">
                      <div className="font-medium">
                        Fecha: {new Date(viajeToDelete.fecha).toLocaleDateString("es-PE")}
                      </div>
                      <div>
                        Vehículo: {viajeToDelete.vehiculo_placa || "Sin placa"}
                      </div>
                      <div>Repartidor: {viajeToDelete.repartidor_nombre || "Sin asignar"}</div>
                      <div>Viaje N°: {viajeToDelete.nro_viaje}</div>
                    </div>
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            {deleteError && (
              <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <AlertDescription className="text-red-800 dark:text-red-200">
                  {deleteError}
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
