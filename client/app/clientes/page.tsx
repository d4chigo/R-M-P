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
import { Plus, ArrowLeft, Users } from "lucide-react"
import Link from "next/link"
import { DataTable, type Column } from "@/components/ui/data-table"
import { ClienteForm } from "@/components/forms/cliente-form"
import { useClientes, type Cliente } from "@/hooks/use-clientes"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export default function ClientesPage() {
  const { clientes, editingCliente, addCliente, updateCliente, deleteCliente, startEdit, cancelEdit } = useClientes()

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleSubmit = (clienteData: Omit<Cliente, "id" | "fecha_registro">) => {
    if (editingCliente) {
      updateCliente(editingCliente.id, clienteData)
    } else {
      addCliente(clienteData)
    }
    setIsDialogOpen(false)
  }

  const handleEdit = (cliente: Cliente) => {
    startEdit(cliente)
    setIsDialogOpen(true)
  }

  const handleDelete = (cliente: Cliente) => {
    if (confirm(`¿Está seguro de eliminar el cliente ${cliente.nombre}?`)) {
      deleteCliente(cliente.id)
    }
  }

  const handleCancel = () => {
    cancelEdit()
    setIsDialogOpen(false)
  }

  const columns: Column<Cliente>[] = [
    {
      key: "id",
      header: "ID",
      sortable: true,
      render: (cliente) => <span className="font-medium">{cliente.id}</span>,
    },
    {
      key: "codigo",
      header: "Código",
      sortable: true,
      render: (cliente) => <span className="font-semibold">{cliente.codigo}</span>,
    },
    {
      key: "nombre",
      header: "Nombre",
      sortable: true,
    },
    {
      key: "ruc",
      header: "RUC",
      sortable: true,
    },
    {
      key: "ciudad",
      header: "Ciudad",
      sortable: true,
      render: (cliente) => `${cliente.ciudad}, ${cliente.departamento}`,
    },
    {
      key: "telefono",
      header: "Teléfono",
      sortable: true,
    },
    {
      key: "email",
      header: "Email",
      sortable: true,
    },
    {
      key: "contacto_nombre",
      header: "Contacto",
      render: (cliente) => (
        <div className="text-sm">
          <div className="font-medium">{cliente.contacto_nombre}</div>
          <div className="text-gray-500 dark:text-gray-400">{cliente.contacto_telefono}</div>
        </div>
      ),
    },
    {
      key: "abre",
      header: "Horario",
      render: (cliente) => `${cliente.abre} - ${cliente.cierra}`,
    },
    {
      key: "estado",
      header: "Estado",
      sortable: true,
      render: (cliente) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            cliente.estado === "Activo"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
              : cliente.estado === "Suspendido"
                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
          }`}
        >
          {cliente.estado}
        </span>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
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
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Gestión de Clientes</h1>
                <p className="text-gray-600 dark:text-gray-300">Administra la base de datos de clientes</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => cancelEdit()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Cliente
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto dark:bg-gray-800 dark:border-gray-700">
                <DialogHeader>
                  <DialogTitle className="dark:text-gray-100">
                    {editingCliente ? "Editar Cliente" : "Registrar Nuevo Cliente"}
                  </DialogTitle>
                  <DialogDescription className="dark:text-gray-300">
                    {editingCliente
                      ? "Modifique los campos necesarios para actualizar el cliente."
                      : "Complete todos los campos para registrar un nuevo cliente en el sistema."}
                  </DialogDescription>
                </DialogHeader>
                <ClienteForm
                  cliente={editingCliente}
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                  isEditing={!!editingCliente}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-gray-100">Lista de Clientes</CardTitle>
            <CardDescription className="dark:text-gray-300">
              Gestiona todos los clientes con funciones de búsqueda, filtrado y ordenamiento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={clientes}
              columns={columns}
              searchPlaceholder="Buscar por nombre, código, RUC, ciudad..."
              onEdit={handleEdit}
              onDelete={handleDelete}
              showDateFilter={true}
              dateFilterKey="fecha_registro"
              searchKeys={["nombre", "codigo", "ruc", "ciudad", "email", "contacto_nombre"]}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
