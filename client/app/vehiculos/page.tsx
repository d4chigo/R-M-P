"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, ArrowLeft, Truck } from "lucide-react"
import Link from "next/link"
import { DataTable, type Column } from "@/components/ui/data-table"
import { VehiculoForm } from "@/components/forms/vehiculo-form"
import { useVehiculos, type Vehiculo } from "@/hooks/use-vehiculos"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export default function VehiculosPage() {
  const { vehiculos, editingVehiculo, addVehiculo, updateVehiculo, deleteVehiculo, startEdit, cancelEdit } =
    useVehiculos()

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleSubmit = (vehiculoData: Omit<Vehiculo, "id">) => {
    if (editingVehiculo) {
      updateVehiculo(editingVehiculo.id, vehiculoData)
    } else {
      addVehiculo(vehiculoData)
    }
    setIsDialogOpen(false)
  }

  const handleEdit = (vehiculo: Vehiculo) => {
    startEdit(vehiculo)
    setIsDialogOpen(true)
  }

  const handleDelete = (vehiculo: Vehiculo) => {
    if (confirm(`¿Está seguro de eliminar el vehículo ${vehiculo.placa}?`)) {
      deleteVehiculo(vehiculo.id)
    }
  }

  const handleCancel = () => {
    cancelEdit()
    setIsDialogOpen(false)
  }

  // Columnas de la tabla de vehículos
  const columns: Column<Vehiculo>[] = [
    {
      key: "id",
      header: "ID",
      sortable: true,
      render: (vehiculo) => <span className="font-medium">{vehiculo.id}</span>,
    },
    {
      key: "placa",
      header: "Placa",
      sortable: true,
      render: (vehiculo) => <span className="font-semibold">{vehiculo.placa}</span>,
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
    },
    {
      key: "tipo",
      header: "Tipo",
      sortable: true,
    },
    {
      key: "capacidad_carga_kg",
      header: "Capacidad (kg)",
      sortable: true,
      render: (vehiculo) => vehiculo.capacidad_carga_kg.toLocaleString(),
    },
    {
      key: "tipo_carga",
      header: "Tipo Carga",
      sortable: true,
    },
    {
      key: "estado",
      header: "Estado",
      sortable: true,
      render: (vehiculo) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            vehiculo.estado === "Activo"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
              : vehiculo.estado === "Mantenimiento"
                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                : vehiculo.estado === "Inactivo"
                  ? "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
          }`}
        >
          {vehiculo.estado}
        </span>
      ),
    },
    {
      key: "fecha_adquisicion",
      header: "Fecha Adquisición",
      sortable: true,
      render: (vehiculo) =>
        new Date(vehiculo.fecha_adquisicion).toLocaleDateString("es-PE", { timeZone: "America/Lima" }),
    },
    {
      key: "vin",
      header: "VIN",
      render: (vehiculo) => <span className="font-mono text-xs">{vehiculo.vin}</span>,
    },
  ]

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
                <p className="text-gray-600 dark:text-gray-300">Administra la flota de vehículos de transporte</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => cancelEdit()} className="mobile-button">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Vehículo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto dark:bg-gray-800 dark:border-gray-700">
                <DialogHeader>
                  <DialogTitle className="dark:text-gray-100">
                    {editingVehiculo ? "Editar Vehículo" : "Registrar Nuevo Vehículo"}
                  </DialogTitle>
                  <DialogDescription className="dark:text-gray-300">
                    {editingVehiculo
                      ? "Modifique los campos necesarios para actualizar el vehículo."
                      : "Complete todos los campos para registrar un nuevo vehículo en el sistema."}
                  </DialogDescription>
                </DialogHeader>
                <VehiculoForm
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
            <CardTitle className="dark:text-gray-100">Lista de Vehículos</CardTitle>
            <CardDescription className="dark:text-gray-300">
              Gestiona todos los vehículos de la flota con funciones de búsqueda, filtrado, ordenamiento y filtro por fecha.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={vehiculos}
              columns={columns}
              searchPlaceholder="Buscar por placa, marca, modelo..."
              onEdit={handleEdit}
              onDelete={handleDelete}
              showDateFilter={true}
              dateFilterKey="fecha_adquisicion"
              searchKeys={["placa", "marca", "modelo", "tipo", "estado"]}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}