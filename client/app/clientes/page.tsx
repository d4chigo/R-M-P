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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, ArrowLeft, Users, Info } from "lucide-react";
import Link from "next/link";
import { ClientesTable } from "@/components/tables/clientes-table";
import { ClienteForm } from "@/components/forms/cliente-form";
import { useClientes, type Cliente } from "@/hooks/use-clientes";

import { useZonas } from "@/hooks/use-zonas";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { formatDateForDisplay } from "@/lib/utils/date";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState<Cliente | null>(null);

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

  const handleDelete = (id: number) => {
    const cliente = clientes.find((c) => c.id_cliente === id);
    if (cliente) {
      setClienteToDelete(cliente);
      setDeleteDialogOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (clienteToDelete && clienteToDelete.id_cliente) {
      try {
        const result = await deleteCliente(clienteToDelete.id_cliente);

        if (result.success) {
          if (result.isDeactivated) {
            toast({
              title: "Cliente desactivado",
              description: `${clienteToDelete.nombre} tenía visitas registradas, por lo que se desactivó en lugar de eliminarse. Los datos históricos se han preservado.`,
              variant: "default",
            });
          } else if (result.isDeleted) {
            toast({
              title: "Cliente eliminado",
              description: `${clienteToDelete.nombre} se eliminó completamente del sistema al no tener visitas registradas.`,
              variant: "default",
            });
          } else {
            toast({
              title: "Operación completada",
              description: result.message || "Cliente procesado exitosamente",
              variant: "default",
            });
          }
        } else {
          toast({
            title: "Error al eliminar",
            description:
              result.error || "No se pudo procesar la eliminación del cliente",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error de conexión",
          description: "No se pudo conectar con el servidor",
          variant: "destructive",
        });
      }

      setDeleteDialogOpen(false);
      setClienteToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setClienteToDelete(null);
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

  const handleToggleActivo = async (id: number, currentActivo: boolean) => {
    try {
      await updateCliente(id, { activo: !currentActivo });
    } catch (error) {
      console.error("Error al cambiar estado del cliente:", error);
    }
  };

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

        {/* Alert Dialog para confirmar eliminación */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="dark:bg-gray-800 dark:border-gray-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 dark:text-gray-100">
                <Info className="w-5 h-5 text-blue-500" />
                Eliminar Cliente
              </AlertDialogTitle>
              <AlertDialogDescription className="dark:text-gray-300">
                <div className="space-y-3">
                  <p>
                    ¿Está seguro de que desea eliminar el cliente{" "}
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {clienteToDelete?.nombre}
                    </span>
                    ?
                  </p>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800 dark:text-blue-300">
                        <p className="font-medium mb-1">
                          Información importante:
                        </p>
                        <ul className="space-y-1 text-xs">
                          <li>
                            • Si el cliente tiene visitas registradas,{" "}
                            <strong>NO se eliminará</strong> físicamente
                          </li>
                          <li>
                            • En su lugar, el cliente pasará a estado{" "}
                            <strong>"Inactivo"</strong>
                          </li>
                          <li>
                            • Si no tiene visitas, se eliminará completamente
                            del sistema
                          </li>
                          <li>
                            • Esta acción preserva la integridad de los datos
                            históricos
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={cancelDelete}
                className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Confirmar Eliminación
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

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
            <ClientesTable
              clientes={clientes}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleActivo={handleToggleActivo}
              initialPageSize={10}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
