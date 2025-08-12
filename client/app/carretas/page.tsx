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
import { Plus, ArrowLeft, Package } from "lucide-react"
import Link from "next/link"
import { DataTable, type Column } from "@/components/ui/data-table"
import { CarretaForm } from "@/components/forms/carreta-form"
import { useCarretas, type Carreta } from "@/hooks/use-carretas"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export default function CarretasPage() {
  const { carretas, editingCarreta, addCarreta, updateCarreta, deleteCarreta, startEdit, cancelEdit } = useCarretas()

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleSubmit = (carretaData: Omit<Carreta, "id">) => {
    if (editingCarreta) {
      updateCarreta(editingCarreta.id, carretaData)
    } else {
      addCarreta(carretaData)
    }
    setIsDialogOpen(false)
  }

  const handleEdit = (carreta: Carreta) => {
    startEdit(carreta)
    setIsDialogOpen(true)
  }

  const handleDelete = (carreta: Carreta) => {
    if (confirm(`¿Está seguro de eliminar la carreta ${carreta.placa}?`)) {
      deleteCarreta(carreta.id)
    }
  }

  const handleCancel = () => {
    cancelEdit()
    setIsDialogOpen(false)
  }

  const columns: Column<Carreta>[] = [
    {
      key: "id",
      header: "ID",
      sortable: true,
      render: (carreta) => <span className="font-medium">{carreta.id}</span>,
    },
    {
      key: "placa",
      header: "Placa",
      sortable: true,
      render: (carreta) => <span className="font-semibold">{carreta.placa}</span>,
    },
    {
      key: "tipo",
      header: "Tipo",
      sortable: true,
    },
    {
      key: "capacidad_kg",
      header: "Capacidad (kg)",
      sortable: true,
      render: (carreta) => carreta.capacidad_kg.toLocaleString(),
    },
    {
      key: "estado",
      header: "Estado",
      sortable: true,
      render: (carreta) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            carreta.estado === "Activo"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
              : carreta.estado === "Mantenimiento"
                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                : carreta.estado === "Inactivo"
                  ? "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
          }`}
        >
          {carreta.estado}
        </span>
      ),
    },
  ]

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
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Gestión de Carretas</h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                  Administra las carretas y remolques
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => cancelEdit()} className="w-full sm:w-auto mobile-button">
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Carreta
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md mx-4 sm:mx-auto dark:bg-gray-800 dark:border-gray-700">
                <DialogHeader>
                  <DialogTitle className="dark:text-gray-100">
                    {editingCarreta ? "Editar Carreta" : "Registrar Nueva Carreta"}
                  </DialogTitle>
                  <DialogDescription className="dark:text-gray-300">
                    {editingCarreta
                      ? "Modifique los campos necesarios para actualizar la carreta."
                      : "Complete los campos para registrar una nueva carreta."}
                  </DialogDescription>
                </DialogHeader>
                <CarretaForm
                  carreta={editingCarreta}
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                  isEditing={!!editingCarreta}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-gray-100">Lista de Carretas</CardTitle>
            <CardDescription className="dark:text-gray-300">
              Gestiona todas las carretas con funciones de búsqueda, filtrado y ordenamiento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={carretas}
              columns={columns}
              searchPlaceholder="Buscar por placa, tipo, estado..."
              onEdit={handleEdit}
              onDelete={handleDelete}
              searchKeys={["placa", "tipo", "estado"]}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
