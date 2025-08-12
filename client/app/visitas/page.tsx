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
import { Plus, ArrowLeft, FileText } from "lucide-react"
import Link from "next/link"
import { DataTable, type Column } from "@/components/ui/data-table"
import { VisitaForm } from "@/components/forms/visita-form"
import { useVisitas, type Visita } from "@/hooks/use-visitas"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export default function VisitasPage() {
  const { visitas, editingVisita, addVisita, updateVisita, deleteVisita, startEdit, cancelEdit } = useVisitas()

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleSubmit = (visitaData: Omit<Visita, "id" | "cliente_nombre" | "viaje_info">) => {
    if (editingVisita) {
      updateVisita(editingVisita.id, visitaData)
    } else {
      addVisita(visitaData)
    }
    setIsDialogOpen(false)
  }

  const handleEdit = (visita: Visita) => {
    startEdit(visita)
    setIsDialogOpen(true)
  }

  const handleDelete = (visita: Visita) => {
    if (confirm(`¿Está seguro de eliminar la visita al cliente ${visita.cliente_nombre}?`)) {
      deleteVisita(visita.id)
    }
  }

  const handleCancel = () => {
    cancelEdit()
    setIsDialogOpen(false)
  }

  const columns: Column<Visita>[] = [
    {
      key: "id",
      header: "ID",
      sortable: true,
      render: (visita) => <span className="font-medium">{visita.id}</span>,
    },
    {
      key: "id_viaje",
      header: "Viaje",
      sortable: true,
      render: (visita) => (
        <div className="text-sm">
          <div className="font-medium">ID: {visita.id_viaje}</div>
          <div className="text-gray-500 dark:text-gray-400">{visita.viaje_info}</div>
        </div>
      ),
    },
    {
      key: "id_cliente",
      header: "Cliente",
      sortable: true,
      render: (visita) => (
        <div className="text-sm">
          <div className="font-medium">ID: {visita.id_cliente}</div>
          <div className="text-gray-500 dark:text-gray-400">{visita.cliente_nombre}</div>
        </div>
      ),
    },
    {
      key: "entrega",
      header: "Entrega",
      sortable: true,
      render: (visita) => (
        <span className="text-green-600 dark:text-green-400 font-medium">{visita.entrega.toLocaleString()}</span>
      ),
    },
    {
      key: "recojo",
      header: "Recojo",
      sortable: true,
      render: (visita) => (
        <span className="text-blue-600 dark:text-blue-400 font-medium">{visita.recojo.toLocaleString()}</span>
      ),
    },
    {
      key: "llega",
      header: "Llegada",
      sortable: true,
    },
    {
      key: "sale",
      header: "Salida",
      sortable: true,
    },
    {
      key: "sec1",
      header: "Sec1",
      render: (visita) => <span className="font-mono text-xs">{visita.sec1}</span>,
    },
    {
      key: "sec2",
      header: "Sec2",
      render: (visita) => <span className="font-mono text-xs">{visita.sec2}</span>,
    },
    {
      key: "distancia_km",
      header: "Distancia",
      render: (visita) => visita.distancia_km || "-",
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
              <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Gestión de Visitas</h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                  Registra las visitas a clientes durante los viajes
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
                  Nueva Visita
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto dark:bg-gray-800 dark:border-gray-700">
                <DialogHeader>
                  <DialogTitle className="dark:text-gray-100">
                    {editingVisita ? "Editar Visita" : "Registrar Nueva Visita"}
                  </DialogTitle>
                  <DialogDescription className="dark:text-gray-300">
                    {editingVisita
                      ? "Modifique los campos necesarios para actualizar la visita."
                      : "Complete los campos para registrar una visita a cliente."}
                  </DialogDescription>
                </DialogHeader>
                <VisitaForm
                  visita={editingVisita}
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                  isEditing={!!editingVisita}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-gray-100">Lista de Visitas</CardTitle>
            <CardDescription className="dark:text-gray-300">
              Gestiona todas las visitas con funciones de búsqueda, filtrado y ordenamiento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={visitas}
              columns={columns}
              searchPlaceholder="Buscar por cliente, viaje, secuencia..."
              onEdit={handleEdit}
              onDelete={handleDelete}
              searchKeys={["cliente_nombre", "viaje_info", "sec1", "sec2"]}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
