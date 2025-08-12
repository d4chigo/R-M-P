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
import { Plus, ArrowLeft, Route } from "lucide-react"
import Link from "next/link"
import { DataTable, type Column } from "@/components/ui/data-table"
import { RutaForm } from "@/components/forms/ruta-form"
import { useRutas, type Ruta } from "@/hooks/use-rutas"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export default function RutasPage() {
  const { rutas, editingRuta, addRuta, updateRuta, deleteRuta, startEdit, cancelEdit } = useRutas()

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleSubmit = (rutaData: Omit<Ruta, "id" | "fecha_creacion" | "ultima_actualizacion">) => {
    if (editingRuta) {
      updateRuta(editingRuta.id, rutaData)
    } else {
      addRuta(rutaData)
    }
    setIsDialogOpen(false)
  }

  const handleEdit = (ruta: Ruta) => {
    startEdit(ruta)
    setIsDialogOpen(true)
  }

  const handleDelete = (ruta: Ruta) => {
    if (confirm(`¿Está seguro de eliminar la ruta ${ruta.nombre}?`)) {
      deleteRuta(ruta.id)
    }
  }

  const handleCancel = () => {
    cancelEdit()
    setIsDialogOpen(false)
  }

  const columns: Column<Ruta>[] = [
    {
      key: "id",
      header: "ID",
      sortable: true,
      render: (ruta) => <span className="font-medium">{ruta.id}</span>,
    },
    {
      key: "codigo",
      header: "Código",
      sortable: true,
      render: (ruta) => <span className="font-semibold">{ruta.codigo}</span>,
    },
    {
      key: "nombre",
      header: "Nombre",
      sortable: true,
    },
    {
      key: "origen",
      header: "Origen",
      sortable: true,
    },
    {
      key: "destino",
      header: "Destino",
      sortable: true,
    },
    {
      key: "distancia_km",
      header: "Distancia (km)",
      sortable: true,
      render: (ruta) => ruta.distancia_km.toLocaleString(),
    },
    {
      key: "duracion_aproximada",
      header: "Duración",
      sortable: true,
    },
    {
      key: "tipo_ruta",
      header: "Tipo",
      sortable: true,
    },
    {
      key: "estado",
      header: "Estado",
      sortable: true,
      render: (ruta) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            ruta.estado === "Activo"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
              : ruta.estado === "En Mantenimiento"
                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                : ruta.estado === "Suspendido"
                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
          }`}
        >
          {ruta.estado}
        </span>
      ),
    },
    {
      key: "fecha_creacion",
      header: "Fecha Creación",
      sortable: true,
      render: (ruta) => new Date(ruta.fecha_creacion).toLocaleDateString("es-PE", { timeZone: "America/Lima" }),
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
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                <Route className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Gestión de Rutas</h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                  Administra las rutas de transporte
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
                  Nueva Ruta
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto dark:bg-gray-800 dark:border-gray-700">
                <DialogHeader>
                  <DialogTitle className="dark:text-gray-100">
                    {editingRuta ? "Editar Ruta" : "Registrar Nueva Ruta"}
                  </DialogTitle>
                  <DialogDescription className="dark:text-gray-300">
                    {editingRuta
                      ? "Modifique los campos necesarios para actualizar la ruta."
                      : "Complete los campos para registrar una nueva ruta de transporte."}
                  </DialogDescription>
                </DialogHeader>
                <RutaForm
                  ruta={editingRuta}
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                  isEditing={!!editingRuta}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-gray-100">Lista de Rutas</CardTitle>
            <CardDescription className="dark:text-gray-300">
              Gestiona todas las rutas con funciones de búsqueda, filtrado y ordenamiento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={rutas}
              columns={columns}
              searchPlaceholder="Buscar por código, nombre, origen, destino..."
              onEdit={handleEdit}
              onDelete={handleDelete}
              showDateFilter={true}
              dateFilterKey="fecha_creacion"
              searchKeys={["codigo", "nombre", "origen", "destino", "tipo_ruta", "estado"]}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
