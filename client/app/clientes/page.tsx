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
import {
  Plus,
  ArrowLeft,
  Users,
  Info,
  Search,
  BarChart3,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { ClientesTable } from "@/components/tables/clientes-table";
import { ClienteForm } from "@/components/forms/cliente-form";
import { useClientes, type Cliente } from "@/hooks/use-clientes";

import { useZonas } from "@/hooks/use-zonas";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { formatDateForDisplay } from "@/lib/utils/date";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [showStats, setShowStats] = useState(false);

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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Aquí puedes implementar la lógica de búsqueda
  };

  const clearFilters = () => {
    setSearchQuery("");
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.history.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Regresar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Clientes</h1>
            <p className="text-muted-foreground">
              Gestión de clientes y direcciones
            </p>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewCliente}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCliente ? "Editar Cliente" : "Registrar Nuevo Cliente"}
              </DialogTitle>
              <DialogDescription>
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

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Clientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <Input
              placeholder="Buscar por código, nombre o dirección..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1"
            />
            {searchQuery && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="flex items-center gap-2"
              >
                Limpiar
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setShowStats(!showStats)}
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Estadísticas
              {showStats ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats - Collapsible */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in slide-in-from-top-2 duration-200">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{clientes.length}</p>
                  <p className="text-sm text-muted-foreground">
                    Total Clientes
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <UserCheck className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {clientes.filter((c) => c.activo).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Activos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Activity className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {clientes.filter((c) => !c.activo).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Inactivos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Info className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {clientes.filter((c) => c.id_zona).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Con Zona</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Cargando clientes...</div>
          ) : (
            <ClientesTable
              clientes={clientes}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleActivo={handleToggleActivo}
              initialPageSize={10}
            />
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-2">
                <p>
                  Está a punto de eliminar el cliente{" "}
                  <strong>{clienteToDelete?.nombre}</strong>.
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                  <p className="text-sm text-amber-800">
                    <strong>Importante:</strong> Si este cliente tiene visitas
                    registradas en el sistema, será desactivado en lugar de
                    eliminado para preservar la integridad de los datos
                    históricos.
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Solo se eliminará completamente si no tiene registros
                  asociados.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
