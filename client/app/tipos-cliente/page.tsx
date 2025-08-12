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
import { Plus, ArrowLeft, UserCheck } from "lucide-react"
import Link from "next/link"
import { DataTable, type Column } from "@/components/ui/data-table"
import { TipoClienteForm } from "@/components/forms/tipo-cliente-form"
import { useTiposCliente, type TipoCliente } from "@/hooks/use-tipos-cliente"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export default function TiposClientePage() {
  const {
    tiposCliente,
    editingTipoCliente,
    addTipoCliente,
    updateTipoCliente,
    deleteTipoCliente,
    startEdit,
    cancelEdit,
  } = useTiposCliente()

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleSubmit = (tipoClienteData: Omit<TipoCliente, "id">) => {
    if (editingTipoCliente) {
      updateTipoCliente(editingTipoCliente.id, tipoClienteData)
    } else {
      addTipoCliente(tipoClienteData)
    }
    setIsDialogOpen(false)
  }

  const handleEdit = (tipoCliente: TipoCliente) => {
    startEdit(tipoCliente)
    setIsDialogOpen(true)
  }

  const handleDelete = (tipoCliente: TipoCliente) => {
    if (confirm(`¿Está seguro de eliminar el tipo de cliente ${tipoCliente.nombre}?`)) {
      deleteTipoCliente(tipoCliente.id)
    }
  }

  const handleCancel = () => {
    cancelEdit()
    setIsDialogOpen(false)
  }

  const columns: Column<TipoCliente>[] = [
    {
      key: "id",
      header: "ID",
      sortable: true,
      render: (tipo) => <span className="font-medium">{tipo.id}</span>,
    },
    {
      key: "nombre",
      header: "Nombre",
      sortable: true,
      render: (tipo) => <span className="font-semibold">{tipo.nombre}</span>,
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
              <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Tipos de Cliente</h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                  Configura los tipos de cliente del sistema
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
                  Nuevo Tipo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md mx-4 sm:mx-auto dark:bg-gray-800 dark:border-gray-700">
                <DialogHeader>
                  <DialogTitle className="dark:text-gray-100">
                    {editingTipoCliente ? "Editar Tipo de Cliente" : "Crear Nuevo Tipo de Cliente"}
                  </DialogTitle>
                  <DialogDescription className="dark:text-gray-300">
                    {editingTipoCliente
                      ? "Modifique el nombre del tipo de cliente."
                      : "Ingrese el nombre del nuevo tipo de cliente."}
                  </DialogDescription>
                </DialogHeader>
                <TipoClienteForm
                  tipoCliente={editingTipoCliente}
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                  isEditing={!!editingTipoCliente}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-gray-100">Lista de Tipos de Cliente</CardTitle>
            <CardDescription className="dark:text-gray-300">
              Gestiona todos los tipos de cliente con funciones de búsqueda, filtrado y ordenamiento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={tiposCliente}
              columns={columns}
              searchPlaceholder="Buscar por nombre..."
              onEdit={handleEdit}
              onDelete={handleDelete}
              searchKeys={["nombre"]}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
