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
import { Plus, ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";
import { DataTable, type Column } from "@/components/ui/data-table";
import { ViajeForm } from "@/components/forms/viaje-form";
import { useViajes, type Viaje } from "@/hooks/use-viajes";
import { useRutas } from "@/hooks/use-rutas";
import { useVehiculos } from "@/hooks/use-vehiculos";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function ViajesPage() {
  const { viajes, createViaje, updateViaje, deleteViaje, isLoading, error } =
    useViajes();
  const { fetchRutas } = useRutas();
  const { fetchVehiculos } = useVehiculos();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingViaje, setEditingViaje] = useState<Viaje | null>(null);

  const handleSubmit = async (viajeData: Omit<Viaje, "id">) => {
    try {
      if (editingViaje && editingViaje.id) {
        await updateViaje(editingViaje.id, viajeData);
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
    // Recargar rutas y vehículos antes de abrir el diálogo de edición
    await Promise.all([fetchRutas(), fetchVehiculos()]);
    setIsDialogOpen(true);
  };

  const handleDelete = async (viaje: Viaje) => {
    if (
      confirm(
        `¿Está seguro de eliminar el viaje del ${new Date(viaje.fecha).toLocaleDateString()}?`,
      )
    ) {
      if (viaje.id) {
        await deleteViaje(viaje.id);
      }
    }
  };

  const handleCancel = () => {
    setEditingViaje(null);
    setIsDialogOpen(false);
  };

  const handleNewViaje = async () => {
    setEditingViaje(null);
    // Recargar rutas y vehículos antes de abrir el diálogo
    await Promise.all([fetchRutas(), fetchVehiculos()]);
    setIsDialogOpen(true);
  };

  const columns: Column<Viaje>[] = [
    {
      key: "id",
      header: "ID",
      sortable: true,
      render: (viaje) => <span className="font-medium">{viaje.id}</span>,
    },
    {
      key: "id_ruta",
      header: "Ruta",
      sortable: true,
      render: (viaje) => (
        <div className="text-sm">
          <div className="font-medium">ID: {viaje.id_ruta}</div>
          <div className="text-gray-500 dark:text-gray-400">
            {viaje.ruta_nombre || viaje.ruta}
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400">
            {viaje.origen} → {viaje.destino}
          </div>
        </div>
      ),
    },
    {
      key: "id_vehiculo",
      header: "Vehículo",
      sortable: true,
      render: (viaje) => (
        <div className="text-sm">
          <div className="font-medium">ID: {viaje.id_vehiculo}</div>
          <div className="text-gray-500 dark:text-gray-400 font-semibold">
            {viaje.vehiculo_placa || viaje.vehiculo}
          </div>
          <div className="text-xs text-gray-400">
            {viaje.vehiculo_marca} {viaje.vehiculo_modelo}
          </div>
        </div>
      ),
    },
    {
      key: "fecha",
      header: "Fecha",
      sortable: true,
      render: (viaje) =>
        new Date(viaje.fecha).toLocaleDateString("es-PE", {
          timeZone: "America/Lima",
        }),
    },
    {
      key: "repartidor",
      header: "Repartidor",
      sortable: true,
      render: (viaje) => (
        <span className="text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-2 py-1 rounded">
          {viaje.repartidor}
        </span>
      ),
    },
    {
      key: "estado",
      header: "Estado",
      sortable: true,
      render: (viaje) => {
        const hoy = new Date().toISOString().split("T")[0];
        const fechaViaje = viaje.fecha;
        let estado = "";
        let colorClass = "";

        if (fechaViaje > hoy) {
          estado = "Programado";
          colorClass =
            "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
        } else if (fechaViaje === hoy) {
          estado = "En Curso";
          colorClass =
            "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
        } else {
          estado = "Completado";
          colorClass =
            "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
        }

        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}
          >
            {estado}
          </span>
        );
      },
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
                  Programa y gestiona los viajes de transporte
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
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
              <DialogContent className="max-w-md mx-4 sm:mx-auto dark:bg-gray-800 dark:border-gray-700">
                <DialogHeader>
                  <DialogTitle className="dark:text-gray-100">
                    {editingViaje ? "Editar Viaje" : "Programar Nuevo Viaje"}
                  </DialogTitle>
                  <DialogDescription className="dark:text-gray-300">
                    {editingViaje
                      ? "Modifique los campos necesarios para actualizar el viaje."
                      : "Complete los campos para programar un nuevo viaje."}
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

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-gray-100">
              Lista de Viajes
            </CardTitle>
            <CardDescription className="dark:text-gray-300">
              Gestiona todos los viajes con funciones de búsqueda, filtrado y
              ordenamiento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={viajes}
              columns={columns}
              searchPlaceholder="Buscar por ruta, vehículo..."
              onEdit={handleEdit}
              onDelete={handleDelete}
              showDateFilter={true}
              dateFilterKey="fecha"
              searchKeys={[
                "ruta_nombre",
                "ruta",
                "vehiculo_placa",
                "vehiculo",
                "repartidor",
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
