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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Plus, ArrowLeft, MapPin, Edit, Trash2, BarChart3 } from "lucide-react";
import Link from "next/link";
import { DataTable, type Column } from "@/components/ui/data-table";
import { ZonaForm } from "@/components/forms/zona-form";
import { useZonas, type Zona } from "@/hooks/use-zonas";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ZonaEstadisticas } from "@/components/zona-estadisticas";
import { ZonaMapa } from "@/components/zona-mapa";


export default function ZonasPage() {
  const { zonas, createZona, updateZona, deleteZona, isLoading, error } =
    useZonas();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingZona, setEditingZona] = useState<Zona | null>(null);
  const [selectedZona, setSelectedZona] = useState<Zona | null>(null);

  const handleSubmit = async (zonaData: Omit<Zona, "id_zona">) => {
    try {
      if (editingZona && editingZona.id_zona) {
        await updateZona(editingZona.id_zona, zonaData);
      } else {
        await createZona(zonaData);
      }
      setIsDialogOpen(false);
      setEditingZona(null);
    } catch (error) {
      console.error("Error al guardar zona:", error);
    }
  };

  const handleEdit = (zona: Zona) => {
    setEditingZona(zona);
    setIsDialogOpen(true);
  };

  const handleDelete = async (zona: Zona) => {
    const descripcionCorta = zona.descripcion.length > 50
      ? zona.descripcion.substring(0, 50) + "..."
      : zona.descripcion;
    if (confirm(`¿Está seguro de eliminar la zona ${zona.codigo}?\n\n${descripcionCorta}`)) {
      if (zona.id_zona) {
        await deleteZona(zona.id_zona);
      }
    }
  };

  const handleCancel = () => {
    setEditingZona(null);
    setIsDialogOpen(false);
  };

  const handleNewZona = () => {
    setEditingZona(null);
    setIsDialogOpen(true);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const columns: Column<Zona>[] = [
    {
      key: "codigo",
      header: "Código",
      sortable: true,
      render: (zona) => (
        <span className="font-bold text-blue-600 dark:text-blue-400">
          {zona.codigo}
        </span>
      ),
    },
    {
      key: "descripcion",
      header: "Descripción",
      sortable: true,
      render: (zona) => (
        <div className="max-w-md">
          <p className="font-semibold text-sm line-clamp-2">{zona.descripcion}</p>
        </div>
      ),
    },
    {
      key: "coordenadas",
      header: "Coordenadas",
      render: (zona) => (
        <div className="text-xs">
          {zona.latitud && zona.longitud ? (
            <div className="space-y-1">
              <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 px-2 py-1 rounded text-center">
                <div>📍 {Number(zona.latitud).toFixed(4)}</div>
                <div>{Number(zona.longitud).toFixed(4)}</div>
              </div>
            </div>
          ) : (
            <span className="text-gray-400 text-xs">Sin coordenadas</span>
          )}
        </div>
      ),
    },
    {
      key: "created_at",
      header: "Creada",
      sortable: true,
      render: (zona) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {formatDate(zona.created_at)}
        </span>
      ),
    },

  ];

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="w-full">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Gestión de Zonas
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                  Administra las zonas geográficas de operación
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={handleNewZona}
                  className="w-full sm:w-auto mobile-button"
                >
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

        <Tabs defaultValue="lista" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="lista" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Lista de Zonas
            </TabsTrigger>
            <TabsTrigger value="estadisticas" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Estadísticas
            </TabsTrigger>
            <TabsTrigger value="mapa" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Mapa
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lista" className="mt-6">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-gray-100 flex items-center gap-2">
                  Lista de Zonas
                  <span className="text-sm font-normal bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {zonas.length} {zonas.length === 1 ? "zona" : "zonas"}
                  </span>
                </CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Gestiona todas las zonas geográficas con funciones de búsqueda,
                  filtrado y ordenamiento
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Cargando zonas...
                      </p>
                    </div>
                  </div>
                ) : zonas.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      No hay zonas registradas
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Comienza creando tu primera zona geográfica
                    </p>
                    <Button onClick={handleNewZona}>
                      <Plus className="w-4 h-4 mr-2" />
                      Crear Primera Zona
                    </Button>
                  </div>
                ) : (
                  <DataTable
                    data={zonas}
                    columns={columns}
                    searchPlaceholder="Buscar por código o descripción..."
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    searchKeys={["codigo", "descripcion"]}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="estadisticas" className="mt-6">
            <ZonaEstadisticas />
          </TabsContent>

          <TabsContent value="mapa" className="mt-6">
            <ZonaMapa
              zonas={zonas}
              selectedZona={selectedZona}
              onZonaSelect={setSelectedZona}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
