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
import { Plus, ArrowLeft, Calendar } from "lucide-react"
import Link from "next/link"
import { DataTable, type Column } from "@/components/ui/data-table"
import { ViajeForm } from "@/components/forms/viaje-form"
import { useViajes, type Viaje } from "@/hooks/use-viajes"

export default function ViajesPage() {
  const { viajes, editingViaje, addViaje, updateViaje, deleteViaje, startEdit, cancelEdit } = useViajes()

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleSubmit = (viajeData: Omit<Viaje, "id" | "ruta_nombre" | "vehiculo_placa">) => {
    if (editingViaje) {
      updateViaje(editingViaje.id, viajeData)
    } else {
      addViaje(viajeData)
    }
    setIsDialogOpen(false)
  }

  const handleEdit = (viaje: Viaje) => {
    startEdit(viaje)
    setIsDialogOpen(true)
  }

  const handleDelete = (viaje: Viaje) => {
    if (confirm(`¿Está seguro de eliminar el viaje del ${new Date(viaje.fecha).toLocaleDateString()}?`)) {
      deleteViaje(viaje.id)
    }
  }

  const handleCancel = () => {
    cancelEdit()
    setIsDialogOpen(false)
  }

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
          <div className="text-gray-500">{viaje.ruta_nombre}</div>
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
          <div className="text-gray-500 font-semibold">{viaje.vehiculo_placa}</div>
        </div>
      ),
    },
    {
      key: "fecha",
      header: "Fecha",
      sortable: true,
      render: (viaje) => new Date(viaje.fecha).toLocaleDateString(),
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestión de Viajes</h1>
                <p className="text-sm sm:text-base text-gray-600">Programa y gestiona los viajes de transporte</p>
              </div>
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => cancelEdit()} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Viaje
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md mx-4 sm:mx-auto">
              <DialogHeader>
                <DialogTitle>{editingViaje ? "Editar Viaje" : "Programar Nuevo Viaje"}</DialogTitle>
                <DialogDescription>
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

        <Card>
          <CardHeader>
            <CardTitle>Lista de Viajes</CardTitle>
            <CardDescription>
              Gestiona todos los viajes con funciones de búsqueda, filtrado y ordenamiento
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
              searchKeys={["ruta_nombre", "vehiculo_placa"]}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
