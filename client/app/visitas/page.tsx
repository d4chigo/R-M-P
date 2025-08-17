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
import { Plus, ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import { DataTable, type Column } from "@/components/ui/data-table";
import { VisitaForm } from "@/components/forms/visita-form";
import { useVisitas, type Visita } from "@/hooks/use-visitas";

export default function VisitasPage() {
  const {
    visitas,
    createVisita,
    updateVisita,
    deleteVisita,
    isLoading,
    error,
  } = useVisitas();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVisita, setEditingVisita] = useState<Visita | null>(null);

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
        setIsDialogOpen(false);
        setEditingVisita(null);
      } else {
        alert(
          `Error al guardar visita: ${result?.error || "Error desconocido"}`,
        );
      }
    } catch (error) {
      console.error("Error al guardar visita:", error);
      alert("Error al guardar visita. Por favor, inténtelo nuevamente.");
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
            alert(
              `✅ Visita eliminada exitosamente\n\nSe eliminó la visita del cliente "${clienteInfo}" del ${viajeInfo}.`,
            );
          }
        }
      } catch (error) {
        console.error("Error al eliminar visita:", error);
        alert(
          `❌ Error al eliminar la visita\n\nNo se pudo eliminar la visita. Por favor, inténtelo nuevamente.`,
        );
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

  const columns: Column<Visita>[] = [
    {
      key: "id_viaje",
      header: "Viaje",
      sortable: true,
      render: (visita) => (
        <div className="text-sm">
          <div className="font-medium">
            Viaje #{visita.viaje_nro || visita.id_viaje}
          </div>
          <div className="text-gray-500 dark:text-gray-400">
            {visita.viaje_fecha || "Sin fecha"}
          </div>
        </div>
      ),
    },
    {
      key: "id_cliente",
      header: "Cliente",
      sortable: true,
      render: (visita) => (
        <div className="text-sm">
          <div className="font-medium">
            {visita.cliente_nombre || "Sin nombre"}
          </div>
          <div className="text-gray-500 dark:text-gray-400">
            Código: {visita.cliente_codigo || "N/A"}
          </div>
        </div>
      ),
    },
    {
      key: "pedidos",
      header: "Pedidos",
      sortable: true,
      render: (visita) => (
        <span className="font-medium text-center">{visita.pedidos || 0}</span>
      ),
    },
    {
      key: "entrega_cf",
      header: "Entrega (CF)",
      sortable: true,
      render: (visita) => (
        <span className="text-green-600 dark:text-green-400 font-medium">
          {visita.entrega_cf
            ? visita.entrega_cf.toLocaleString("es-PE", {
                minimumFractionDigits: 2,
              })
            : "0.00"}
        </span>
      ),
    },
    {
      key: "recojo_cf",
      header: "Recojo (CF)",
      sortable: true,
      render: (visita) => (
        <span className="text-blue-600 dark:text-blue-400 font-medium">
          {visita.recojo_cf
            ? visita.recojo_cf.toLocaleString("es-PE", {
                minimumFractionDigits: 2,
              })
            : "0.00"}
        </span>
      ),
    },
    {
      key: "peso_kg",
      header: "Peso (Kg)",
      sortable: true,
      render: (visita) => (
        <span className="text-purple-600 dark:text-purple-400 font-medium">
          {visita.peso_kg
            ? `${visita.peso_kg.toLocaleString("es-PE", {
                minimumFractionDigits: 2,
              })} kg`
            : "0.00 kg"}
        </span>
      ),
    },
    {
      key: "distancia_km",
      header: "Distancia (Km)",
      sortable: true,
      render: (visita) => (
        <span className="text-orange-600 dark:text-orange-400 font-medium">
          {visita.distancia_km
            ? `${visita.distancia_km.toLocaleString("es-PE", {
                minimumFractionDigits: 2,
              })} km`
            : "0.00 km"}
        </span>
      ),
    },
    {
      key: "vehiculo_placa",
      header: "Vehículo",
      render: (visita) => (
        <span className="text-sm font-mono">
          {visita.vehiculo_placa || "N/A"}
        </span>
      ),
    },
    {
      key: "repartidor_nombre",
      header: "Repartidor",
      render: (visita) => (
        <div className="text-sm">
          <div className="font-medium">{visita.repartidor_nombre || "N/A"}</div>
          <div className="text-gray-500 dark:text-gray-400">
            {visita.repartidor_codigo || "N/A"}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Header */}
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
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Gestión de Visitas
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                  Registra las visitas a clientes durante los viajes
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) setEditingVisita(null);
              }}
            >
              <DialogTrigger asChild>
                <Button
                  onClick={handleNewVisita}
                  className="w-full sm:w-auto mobile-button"
                >
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
                  key={editingVisita?.id_visita || "new"}
                  visita={editingVisita}
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                  isEditing={!!editingVisita}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Tabla de visitas con paginación */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-gray-100">
              Lista de Visitas
            </CardTitle>
            <CardDescription className="dark:text-gray-300">
              Gestiona todas las visitas con funciones de búsqueda, filtrado y
              ordenamiento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={visitasPaginated}
              columns={columns}
              searchPlaceholder="Buscar por cliente, código, vehículo..."
              onEdit={handleEdit}
              onDelete={handleDelete}
              searchKeys={[
                "cliente_nombre",
                "cliente_codigo",
                "vehiculo_placa",
                "repartidor_nombre",
                "viaje_nro",
              ]}
            />

            {/* Controles de paginación */}
            <div className="flex justify-between items-center mt-4">
              <div>
                Mostrando {startIndex + 1} - {Math.min(endIndex, visitas.length)} de {visitas.length} visitas
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
                >
                  Anterior
                </button>
                <span>
                  Página {currentPage} de {Math.ceil(visitas.length / rowsPerPage)}
                </span>
                <button
                  disabled={currentPage === Math.ceil(visitas.length / rowsPerPage)}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
                >
                  Siguiente
                </button>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setCurrentPage(1);
                  }}
                  className="ml-4 p-1 border rounded dark:bg-gray-800 dark:border-gray-600"
                >
                  {[5, 10, 20, 50].map((n) => (
                    <option key={n} value={n}>{n} filas</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
