"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Plus,
  ArrowLeft,
  Warehouse,
  BarChart3,
  Search,
  Calendar,
  ChevronDown,
  ChevronUp,
  Activity,
  Users,
  Info,
  Package,
  MapPin,
} from "lucide-react";
import { CentroDistribucionTable } from "@/components/tables/centro-distribucion-table";
import { CentroDistribucionForm } from "@/components/forms/centro-distribucion-form";
import { CentroDistribucionMapa } from "@/components/centro-distribucion-mapa";
import { useCentroDistribucion, type CentroDistribucion } from "@/hooks/use-centro-distribucion";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function CentroDistribucionPage() {
  const { centros, createCentro, updateCentro, deleteCentro, isLoading, error } =
    useCentroDistribucion();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCentro, setEditingCentro] = useState<CentroDistribucion | null>(null);
  const [selectedCentro, setSelectedCentro] = useState<CentroDistribucion | null>(null);
  const [activeTab, setActiveTab] = useState<string>("lista");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [showStats, setShowStats] = useState(false);

  // 🔧 Normalizar fecha a YYYY-MM-DD
  const toLocalYMD = (dateString: string | Date | null | undefined): string => {
    if (!dateString) return "";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
  };

  // 🔍 Filtrado (búsqueda y fecha)
  const filteredCentros = centros.filter((c) => {
    const matchesSearch =
      c.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.direccion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.ciudad?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate = dateFilter
      ? toLocalYMD(c.fecha_creacion) === dateFilter
      : true;

    return matchesSearch && matchesDate;
  });

  const handleSubmit = async (centroData: Omit<CentroDistribucion, "id_centro">) => {
    try {
      let result;
      if (editingCentro && editingCentro.id_centro) {
        result = await updateCentro(editingCentro.id_centro, centroData);
      } else {
        result = await createCentro(centroData);
      }

      if (result.success) {
        toast({
          title: editingCentro ? "Centro actualizado" : "Centro creado",
          description: editingCentro
            ? `Se actualizó el centro ${centroData.codigo}`
            : `Se registró exitosamente el centro ${centroData.codigo}`,
        });
        setIsDialogOpen(false);
        setEditingCentro(null);
      } else {
        if (
          result.error?.includes("código") ||
          result.error?.includes("duplicado") ||
          result.error?.includes("existe")
        ) {
          toast({
            title: "Error de validación",
            description: result.error,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: result.error || "Error al procesar la solicitud",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error al procesar centro:", error);
      toast({
        title: "Error",
        description: "Error inesperado al procesar la solicitud",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (centro: CentroDistribucion) => {
    setEditingCentro(centro);
    setIsDialogOpen(true);
  };

  const handleDelete = async (centro: CentroDistribucion) => {
    if (confirm(`¿Estás seguro de que quieres eliminar el centro ${centro.codigo}?`)) {
      try {
        const result = await deleteCentro(centro.id_centro!);
        if (result.success) {
          toast({
            title: "Centro eliminado",
            description: `Se eliminó exitosamente el centro ${centro.codigo}`,
          });
        } else {
          toast({
            title: "Error",
            description: result.error || "Error al eliminar el centro",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error al eliminar centro:", error);
        toast({
          title: "Error",
          description: "Error inesperado al eliminar el centro",
          variant: "destructive",
        });
      }
    }
  };

  const handleViewDetails = (centro: CentroDistribucion) => {
    setSelectedCentro(centro);
  };

  // Cambia a la pestaña de mapa y selecciona el centro
  const goToMap = (centro: CentroDistribucion) => {
    setSelectedCentro(centro);
    setActiveTab("mapa");
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingCentro(null);
  };

  const openCreateDialog = () => {
    setEditingCentro(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                <Warehouse className="w-8 h-8 mr-3 text-blue-600" />
                Centro de Distribución
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Gestión de centros de distribución y almacenes
              </p>
            </div>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por código, nombre, dirección o ciudad..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-auto"
              />
              <Button
                variant="outline"
                onClick={() => setShowStats(!showStats)}
                className="flex items-center gap-2"
              >
                {showStats ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                Estadísticas
              </Button>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        {showStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Centros</CardTitle>
                <Warehouse className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{centros.length}</div>
                <p className="text-xs text-muted-foreground">
                  Centros registrados
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Activos</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {centros.filter(c => c.estado === 'activo').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Centros operativos
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Capacidad Total</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {centros.reduce((sum, c) => sum + (c.capacidad_almacen || 0), 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  m³ disponibles
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Personal</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {centros.reduce((sum, c) => sum + (c.personal_asignado || 0), 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Empleados totales
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Contenido principal con pestañas */}
        <div className="space-y-6">
          {/* Pestañas */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v)} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="lista" className="flex items-center gap-2">
                <Warehouse className="w-4 h-4" />
                Lista de Centros
              </TabsTrigger>
              <TabsTrigger value="mapa" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Mapa
              </TabsTrigger>
              <TabsTrigger value="detalles" className="flex items-center gap-2">
                <Info className="w-4 h-4" />
                Detalles
              </TabsTrigger>
            </TabsList>

            {/* Pestaña: Lista de Centros */}
            <TabsContent value="lista" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Centros de Distribución</CardTitle>
                    <CardDescription>
                      Lista de todos los centros registrados en el sistema
                    </CardDescription>
                  </div>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={openCreateDialog} className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Nuevo Centro
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>
                          {editingCentro ? "Editar Centro" : "Nuevo Centro de Distribución"}
                        </DialogTitle>
                        <DialogDescription>
                          {editingCentro
                            ? "Modifica la información del centro de distribución"
                            : "Completa la información para registrar un nuevo centro de distribución"}
                        </DialogDescription>
                      </DialogHeader>
                      <CentroDistribucionForm
                        centro={editingCentro}
                        onSubmit={handleSubmit}
                        onCancel={closeDialog}
                        isEditing={!!editingCentro}
                      />
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <CentroDistribucionTable
                    centros={filteredCentros}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onViewDetails={handleViewDetails}
                    onGoToMap={goToMap}
                    isLoading={isLoading}
                  />
                  {error && (
                    <div className="text-center py-4 text-red-600 dark:text-red-400">
                      Error: {error}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pestaña: Mapa */}
            <TabsContent value="mapa" className="space-y-6">
              <CentroDistribucionMapa
                centros={filteredCentros}
                onCentroSelect={handleViewDetails}
                selectedCentro={selectedCentro}
              />
            </TabsContent>

            {/* Pestaña: Detalles */}
            <TabsContent value="detalles" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    Detalles del Centro
                  </CardTitle>
                  <CardDescription>
                    Información detallada del centro seleccionado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedCentro ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{selectedCentro.codigo}</Badge>
                        <Badge variant={selectedCentro.estado === 'activo' ? 'default' : 'secondary'}>
                          {selectedCentro.estado}
                        </Badge>
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg">{selectedCentro.nombre}</h4>
                        <p className="text-sm text-muted-foreground">{selectedCentro.descripcion}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{selectedCentro.direccion}</span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Ciudad:</span> {selectedCentro.ciudad}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Capacidad:</span> {selectedCentro.capacidad_almacen?.toLocaleString()} m³
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Personal:</span> {selectedCentro.personal_asignado} empleados
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Teléfono:</span> {selectedCentro.telefono || 'No especificado'}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Email:</span> {selectedCentro.email || 'No especificado'}
                        </div>
                        {selectedCentro.latitud != null && selectedCentro.longitud != null && (
                          <div className="text-sm">
                            <span className="font-medium">Coordenadas:</span> {Number(selectedCentro.latitud).toFixed(6)}, {Number(selectedCentro.longitud).toFixed(6)}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg font-medium">No hay centro seleccionado</p>
                      <p className="text-sm">Selecciona un centro desde la lista o el mapa para ver sus detalles</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 