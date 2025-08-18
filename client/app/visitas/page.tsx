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
  Plus,
  ArrowLeft,
  FileText,
  Search,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Package,
  Users,
  Calendar,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { VisitasTable } from "@/components/tables/visitas-table";
import { VisitaForm } from "@/components/forms/visita-form";
import { useVisitas, type Visita } from "@/hooks/use-visitas";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function VisitasPage() {
  const {
    visitas,
    createVisita,
    updateVisita,
    deleteVisita,
    isLoading,
    error,
  } = useVisitas();

  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVisita, setEditingVisita] = useState<Visita | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showStats, setShowStats] = useState(false);

  // PAGINACIÓN
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const visitasPaginated = visitas.slice(startIndex, endIndex);

  const handleSubmit = async (visitaData: Omit<Visita, "id_visita">) => {
    try {
      let result;

      if (editingVisita && editingVisita.id_visita) {
        result = await updateVisita(editingVisita.id_visita, visitaData);
      } else {
        result = await createVisita(visitaData);
      }

      if (result && result.success) {
        toast({
          title: editingVisita ? "Visita actualizada" : "Visita creada",
          description: editingVisita
            ? "Se actualizó la información de la visita"
            : "Se registró exitosamente la nueva visita",
          variant: "default",
        });
        setIsDialogOpen(false);
        setEditingVisita(null);
      } else {
        toast({
          title: "Error al guardar",
          description:
            result?.error ||
            "No se pudo guardar la visita. Inténtelo nuevamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error al guardar visita:", error);
      toast({
        title: "Error de conexión",
        description:
          "No se pudo conectar con el servidor. Verifique su conexión a internet.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (visita: Visita) => {
    setEditingVisita(visita);
    setIsDialogOpen(true);
  };

  const handleDelete = async (visita: Visita) => {
    const clienteInfo = visita.cliente_nombre || "sin nombre";
    const viajeInfo = `Viaje #${visita.viaje_nro || visita.id_viaje}`;
    const fechaInfo = visita.viaje_fecha || "sin fecha";

    const confirmMessage = `🗑️ ELIMINAR VISITA

📋 Información del registro:
• Cliente: ${clienteInfo}
• ${viajeInfo} (${fechaInfo})
• Pedidos: ${visita.pedidos || 0}
• Entrega CF: ${visita.entrega_cf || 0}
• Recojo CF: ${visita.recojo_cf || 0}

⚠️ ADVERTENCIA:
Esta acción es IRREVERSIBLE. La visita será eliminada permanentemente del sistema.

¿Está seguro de continuar con la eliminación?`;

    if (confirm(confirmMessage)) {
      try {
        if (visita.id_visita) {
          const result = await deleteVisita(visita.id_visita);
          if (result.success) {
            toast({
              title: "Visita eliminada",
              description: `Se eliminó la visita del cliente "${clienteInfo}" del ${viajeInfo}`,
              variant: "default",
            });
          } else {
            toast({
              title: "Error al eliminar",
              description: result.error || "No se pudo eliminar la visita",
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        console.error("Error al eliminar visita:", error);
        toast({
          title: "Error de conexión",
          description:
            "No se pudo conectar con el servidor. Inténtelo nuevamente.",
          variant: "destructive",
        });
      }
    }
  };

  const handleCancel = () => {
    setEditingVisita(null);
    setIsDialogOpen(false);
  };

  const handleNewVisita = () => {
    setEditingVisita(null);
    setIsDialogOpen(true);
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
            <h1 className="text-3xl font-bold">Visitas</h1>
            <p className="text-muted-foreground">
              Gestión de visitas a clientes
            </p>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewVisita}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Visita
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingVisita ? "Editar Visita" : "Crear Nueva Visita"}
              </DialogTitle>
              <DialogDescription>
                {editingVisita
                  ? "Modifique los campos necesarios para actualizar la visita."
                  : "Complete los campos para crear una nueva visita."}
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

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Visitas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <Input
              placeholder="Buscar por cliente, viaje o número de pedidos..."
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
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{visitas.length}</p>
                  <p className="text-sm text-muted-foreground">Total Visitas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Package className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {visitas.reduce((sum, v) => sum + (v.pedidos || 0), 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Pedidos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {new Set(visitas.map((v) => v.id_cliente)).size}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Clientes Únicos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Calendar className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {new Set(visitas.map((v) => v.id_viaje)).size}
                  </p>
                  <p className="text-sm text-muted-foreground">Viajes Únicos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Visitas</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Cargando visitas...</div>
          ) : (
            <VisitasTable
              visitas={visitas}
              onEdit={handleEdit}
              onDelete={handleDelete}
              initialPageSize={10}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
