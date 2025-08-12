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
import { Plus, ArrowLeft, MapPin } from "lucide-react"
import Link from "next/link"
import { DataTable, type Column } from "@/components/ui/data-table"
import { ZonaForm } from "@/components/forms/zona-form"
import { useZonas, type Zona } from "@/hooks/use-zonas"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export default function ZonasPage() {
  const { zonas, editingZona, addZona, updateZona, deleteZona, startEdit, cancelEdit } = useZonas()

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleSubmit = (zonaData: Omit<Zona, "id">) => {
    if (editingZona) {
      updateZona(editingZona.id, zonaData)
    } else {
      addZona(zonaData)
    }
    setIsDialogOpen(false)
  }

  const handleEdit = (zona: Zona) => {
    startEdit(zona)
    setIsDialogOpen(true)
  }

  const handleDelete = (zona: Zona) => {
    if (confirm(`¿Está seguro de eliminar la zona ${zona.nombre}?`)) {
      deleteZona(zona.id)
    }
  }

  const handleCancel = () => {
    cancelEdit()
    setIsDialogOpen(false)
  }

  const columns: Column<Zona>[] = [
    {
      key: "id",
      header: "ID",
      sortable: true,
      render: (zona) => <span className="font-medium">{zona.id}</span>,
    },
    {
      key: "nombre",
      header: "Nombre",
      sortable: true,
      render: (zona) => <span className="font-semibold">{zona.nombre}</span>,
    },
    {
      key: "descripcion",
      header: "Descripción",
      render: (zona) => (
        <div className="max-w-md">
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{zona.descripcion}</p>
        </div>
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
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Gestión de Zonas</h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                  Administra las zonas geográficas de operación
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
                  Nueva Zona
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md mx-4 sm:mx-auto dark:bg-gray-800 dark:border-gray-700">
                <DialogHeader>
                  <DialogTitle className="dark:text-gray-100">
                    {editingZona ? "Editar Zona" : "Crear Nueva Zona"}
                  </DialogTitle>
                  <DialogDescription className="dark:text-gray-300">
                    {editingZona
                      ? "Modifique los campos necesarios para actualizar la zona."
                      : "Complete los campos para crear una nueva zona geográfica."}
                  </DialogDescription>
                </DialogHeader>
                <ZonaForm
                  zona={editingZona}
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                  isEditing={!!editingZona}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-gray-100">Lista de Zonas</CardTitle>
            <CardDescription className="dark:text-gray-300">
              Gestiona todas las zonas geográficas con funciones de búsqueda, filtrado y ordenamiento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={zonas}
              columns={columns}
              searchPlaceholder="Buscar por nombre, descripción..."
              onEdit={handleEdit}
              onDelete={handleDelete}
              searchKeys={["nombre", "descripcion"]}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
