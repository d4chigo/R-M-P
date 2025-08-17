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
import { Plus, ArrowLeft, Truck, AlertTriangle, Info } from "lucide-react";
import Link from "next/link";
import { DataTable, type Column } from "@/components/ui/data-table";
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
    isLoading,
    error,
  } = useVehiculos();

  // Estados de diálogo y edición
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVehiculo, setEditingVehiculo] = useState<Vehiculo | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vehiculoToDelete, setVehiculoToDelete] = useState<Vehiculo | null>(
    null,
  );
  const [lastDeleteResult, setLastDeleteResult] = useState<{
    type: "deleted" | "deactivated";
    message: string;
    details?: string;
    relatedCount?: number;
  } | null>(null);

  // Estados de paginación
  const [pagina, setPagina] = useState(1);
  const [tamanoPagina, setTamanoPagina] = useState(10);
  const totalPaginas = Math.ceil(vehiculos.length / tamanoPagina);
  const vehiculosPaginados = vehiculos.slice(
    (pagina - 1) * tamanoPagina,
    pagina * tamanoPagina
  );

  // Manejo de creación/actualización
  const handleSubmit = async (vehiculoData: Omit<Vehiculo, "id_vehiculo">) => {
    try {
      if (editingVehiculo && editingVehiculo.id_vehiculo) {
        await updateVehiculo(editingVehiculo.id_vehiculo, vehiculoData);
      } else {
        await createVehiculo(vehiculoData);
      }
      setIsDialogOpen(false);
      setEditingVehiculo(null);
    } catch (error) {
      console.error("Error al guardar vehículo:", error);
    }
  };

  const handleEdit = (vehiculo: Vehiculo) => {
    setEditingVehiculo(vehiculo);
    setIsDialogOpen(true);
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

  // Columnas de la tabla
  const columns: Column<Vehiculo>[] = [
    {
      key: "placa",
      header: "Placa",
      sortable: true,
      render: (vehiculo) => (
        <span className="font-semibold">{vehiculo.placa}</span>
      ),
    },
    {
      key: "marca",
      header: "Marca/Modelo",
      sortable: true,
      render: (vehiculo) => `${vehiculo.marca} ${vehiculo.modelo}`,
    },
    {
      key: "anio",
      header: "Año",
      sortable: true,
      render: (vehiculo) => vehiculo.anio || "N/A",
    },
    {
      key: "capacidad_kg",
      header: "Capacidad (kg)",
      sortable: true,
      render: (vehiculo) => {
        const capacidad = vehiculo.capacidad_kg;
        if (capacidad == null || capacidad === "") return "N/A";
        const numero =
          typeof capacidad === "string" ? parseFloat(capacidad) : capacidad;
        return isNaN(numero) ? "N/A" : numero.toLocaleString();
      },
    },
    {
      key: "capacidad_cajas",
      header: "Capacidad Cajas",
      sortable: true,
      render: (vehiculo) => {
        const cajas = vehiculo.capacidad_cajas;
        return cajas != null ? cajas.toLocaleString() : "N/A";
      },
    },
    {
      key: "activo",
      header: "Estado",
      sortable: true,
      render: (vehiculo) => {
        const isActive = normalizeBoolean(vehiculo.activo);
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              isActive
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
            }`}
          >
            {isActive ? "Activo" : "Inactivo"}
          </span>
        );
      },
    },
    {
      key: "created_at",
      header: "Fecha Registro",
      sortable: true,
      render: (vehiculo) => formatDateForDisplay(vehiculo.created_at),
    },
  ];

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              {error}
            </p>
            <Button onClick={() => window.location.reload()} className="w-full">
              Recargar página
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Alerta de resultado de eliminación */}
        {lastDeleteResult && (
          <Alert
            className={`mb-6 ${
              lastDeleteResult.type === "deactivated"
                ? "border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950"
                : lastDeleteResult.message.includes("Error")
                  ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950"
                  : "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
            }`}
          >
            <div className="flex items-start gap-3">
              {lastDeleteResult.type === "deactivated" ? (
                <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
              ) : lastDeleteResult.message.includes("Error") ? (
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
              ) : (
                <Info className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
              )}
              <div className="flex-1">
                <AlertDescription className="text-sm font-medium mb-1">
                  {lastDeleteResult.message}
                </AlertDescription>
                {lastDeleteResult.details && (
                  <AlertDescription className="text-xs opacity-80">
                    {lastDeleteResult.details}
                  </AlertDescription>
                )}
                {lastDeleteResult.type === "deactivated" && (
                  <AlertDescription className="text-xs mt-2 opacity-80">
                    💡 El vehículo permanece en el sistema para preservar el
                    historial de viajes.
                  </AlertDescription>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLastDeleteResult(null)}
                className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
              >
                ×
              </Button>
            </div>
          </Alert>
        )}

        <div className="flex items-center justify-between mb-8">
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
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Gestión de Vehículos
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Administra la flota de vehículos de transporte
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleNewVehiculo} className="mobile-button">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Vehículo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto dark:bg-gray-800 dark:border-gray-700">
                <DialogHeader>
                  <DialogTitle className="dark:text-gray-100">
                    {editingVehiculo
                      ? "Editar Vehículo"
                      : "Registrar Nuevo Vehículo"}
                  </DialogTitle>
                  <DialogDescription className="dark:text-gray-300">
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

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-gray-100">
              Lista de Vehículos
            </CardTitle>
            <CardDescription className="dark:text-gray-300">
              Gestiona todos los vehículos de la flota con funciones de
              búsqueda, filtrado y ordenamiento
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-300">
                    Cargando vehículos...
                  </p>
                </div>
              </div>
            ) : (
              <>
                <DataTable
                  data={vehiculosPaginados}
                  columns={columns}
                  searchPlaceholder="Buscar por placa, marca, modelo..."
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  showDateFilter={true}
                  dateFilterKey="created_at"
                  searchKeys={["placa", "marca", "modelo"]}
                />

                {/* Controles de Paginación */}
                <div className="flex flex-col md:flex-row items-center justify-between mt-4 gap-2">
                  <div>
                    Mostrando página {pagina} de {totalPaginas} ({vehiculos.length} vehículos)
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
              </>
            )}
          </CardContent>
        </Card>

        {/* Dialog de confirmación de eliminación */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Confirmar Eliminación
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-3">
                <p>
                  ¿Está seguro de que desea eliminar el vehículo{" "}
                  <span className="font-semibold">
                    {vehiculoToDelete?.placa}
                  </span>
                  ?
                </p>
                <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <Info className="h-4 w-4 inline mr-1" />
                    <strong>Importante:</strong> Si este vehículo tiene viajes
                    registrados, será <strong>desactivado</strong> en lugar de
                    eliminado para preservar el historial de datos.
                  </p>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Esta acción no se puede deshacer fácilmente.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={cancelDelete}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Sí, eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
