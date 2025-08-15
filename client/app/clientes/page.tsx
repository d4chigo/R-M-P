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
import { Plus, ArrowLeft, Users } from "lucide-react";
import Link from "next/link";
import { DataTable, type Column } from "@/components/ui/data-table";
import { ClienteForm } from "@/components/forms/cliente-form";
import { useClientes, type Cliente } from "@/hooks/use-clientes";

import { useZonas } from "@/hooks/use-zonas";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { formatDateForDisplay } from "@/lib/utils/date";

export default function ClientesPage() {
  const {
    clientes,
    createCliente,
    updateCliente,
    deleteCliente,
    isLoading,
    error,
  } = useClientes();

  const { fetchZonas } = useZonas();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);

  const handleSubmit = async (clienteData: {
    codigo: string;
    nombre: string;
    direccion?: string;
    id_zona?: number;
    activo: boolean;
  }) => {
    try {
      if (editingCliente && editingCliente.id_cliente) {
        await updateCliente(editingCliente.id_cliente, clienteData);
      } else {
        await createCliente(clienteData);
      }
      setIsDialogOpen(false);
      setEditingCliente(null);
    } catch (error) {
      console.error("Error al guardar cliente:", error);
    }
  };

  const handleEdit = async (cliente: Cliente) => {
    setEditingCliente(cliente);
    // Recargar zonas antes de abrir el diálogo de edición
    await fetchZonas();
    setIsDialogOpen(true);
  };

  const handleDelete = async (cliente: Cliente) => {
    if (confirm(`¿Está seguro de eliminar el cliente ${cliente.nombre}?`)) {
      if (cliente.id_cliente) {
        await deleteCliente(cliente.id_cliente);
      }
    }
  };

  const handleCancel = () => {
    setEditingCliente(null);
    setIsDialogOpen(false);
  };

  const handleNewCliente = async () => {
    setEditingCliente(null);
    // Recargar zonas antes de abrir el diálogo
    await fetchZonas();
    setIsDialogOpen(true);
  };

  const columns: Column<Cliente>[] = [
    {
      key: "id_cliente",
      header: "ID",
      sortable: true,
      render: (cliente) => (
        <span className="font-medium">{cliente.id_cliente}</span>
      ),
    },
    {
      key: "codigo",
      header: "Código",
      sortable: true,
      render: (cliente) => (
        <span className="font-semibold">{cliente.codigo}</span>
      ),
    },
    {
      key: "nombre",
      header: "Nombre",
      sortable: true,
    },
    {
      key: "direccion",
      header: "Dirección",
      sortable: true,
      render: (cliente) => (
        <span
          className="max-w-[200px] truncate block"
          title={cliente.direccion || "Sin dirección"}
        >
          {cliente.direccion || (
            <span className="text-gray-400 italic">Sin dirección</span>
          )}
        </span>
      ),
    },
    {
      key: "zona_nombre",
      header: "Zona",
      sortable: true,
      render: (cliente) => (
        <div className="space-y-1">
          {cliente.zona_nombre ? (
            <>
              <div className="text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded">
                {cliente.zona_nombre}
              </div>
              {cliente.zona_codigo && (
                <div className="text-xs text-gray-500 font-mono">
                  {cliente.zona_codigo}
                </div>
              )}
            </>
          ) : (
            <span className="text-gray-400 italic">Sin zona</span>
          )}
        </div>
      ),
    },
    {
      key: "activo",
      header: "Estado",
      sortable: true,
      render: (cliente) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            cliente.activo
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
          }`}
        >
          {cliente.activo ? "Activo" : "Inactivo"}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Fecha Registro",
      sortable: true,
      render: (cliente) => formatDateForDisplay(cliente.created_at || ""),
    },
  ];

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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Gestión de Clientes
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Administra la base de datos de clientes
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleNewCliente}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Cliente
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto dark:bg-gray-800 dark:border-gray-700">
                <DialogHeader>
                  <DialogTitle className="dark:text-gray-100">
                    {editingCliente
                      ? "Editar Cliente"
                      : "Registrar Nuevo Cliente"}
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
            <CardTitle className="dark:text-gray-100">
              Lista de Clientes
            </CardTitle>
            <CardDescription className="dark:text-gray-300">
              Gestiona todos los clientes con funciones de búsqueda, filtrado y
              ordenamiento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={clientes}
              columns={columns}
              searchPlaceholder="Buscar por nombre, código, dirección, zona..."
              onEdit={handleEdit}
              onDelete={handleDelete}
              showDateFilter={true}
              dateFilterKey="created_at"
              searchKeys={[
                "nombre",
                "codigo",
                "direccion",
                "zona_nombre",
                "zona_codigo",
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
