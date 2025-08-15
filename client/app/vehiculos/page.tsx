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
import { Plus, ArrowLeft, Truck } from "lucide-react";
import Link from "next/link";
import { DataTable, type Column } from "@/components/ui/data-table";
import { VehiculoFormSimple } from "@/components/forms/vehiculo-form-simple";
import { useVehiculos, type Vehiculo } from "@/hooks/use-vehiculos";
import { ThemeToggle } from "@/components/ui/theme-toggle";
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

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVehiculo, setEditingVehiculo] = useState<Vehiculo | null>(null);

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

  const handleDelete = async (vehiculo: Vehiculo) => {
    if (!vehiculo.id_vehiculo) return;

    // Simple confirmation dialog first
    if (
      confirm(
        `¿Está seguro de eliminar el vehículo ${vehiculo.placa}?\n\nEsta acción no se puede deshacer.`,
      )
    ) {
      try {
        const result = await deleteVehiculo(vehiculo.id_vehiculo);
        if (result.success) {
        } else {
          alert(
            `Error al eliminar el vehículo: ${result.error || "Error desconocido"}`,
          );
        }
      } catch (error) {
        alert(
          `Error inesperado al eliminar el vehículo: ${error instanceof Error ? error.message : "Error desconocido"}`,
        );
      }
    }
  };

  const handleCancel = () => {
    setEditingVehiculo(null);
    setIsDialogOpen(false);
  };

  const handleNewVehiculo = () => {
    setEditingVehiculo(null);
    setIsDialogOpen(true);
  };

  const columns: Column<Vehiculo>[] = [
    {
      key: "id_vehiculo",
      header: "ID",
      sortable: true,
      render: (vehiculo) => (
        <span className="font-medium">{vehiculo.id_vehiculo}</span>
      ),
    },
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
        const isActive = vehiculo.activo === true;
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
            <ThemeToggle />
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
              <DataTable
                data={vehiculos}
                columns={columns}
                searchPlaceholder="Buscar por placa, marca, modelo..."
                onEdit={handleEdit}
                onDelete={handleDelete}
                showDateFilter={true}
                dateFilterKey="created_at"
                searchKeys={["placa", "marca", "modelo"]}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
