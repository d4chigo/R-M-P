"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  User,
  Phone,
  CreditCard,
  FileText,
  Power,
  UserCheck,
  ArrowLeft,
  BarChart3,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RepartidoresTable } from "@/components/tables/repartidores-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { useRepartidores } from "@/hooks/use-repartidores";
import { useToast } from "@/hooks/use-toast";

interface RepartidorFormData {
  codigo: string;
  nombre: string;
  dni?: string;
  licencia_conducir?: string;
  telefono?: string;
  activo?: boolean | number;
}

export default function RepartidoresPage() {
  const router = useRouter();
  const {
    repartidores,
    loading,
    createRepartidor,
    updateRepartidor,
    deleteRepartidor,
    searchRepartidores,
  } = useRepartidores();

  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRepartidor, setSelectedRepartidor] = useState<any>(null);
  const [showStats, setShowStats] = useState(false);

  const [formData, setFormData] = useState<RepartidorFormData>({
    codigo: "",
    nombre: "",
    dni: "",
    licencia_conducir: "",
    telefono: "",
    activo: true,
  });

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      await searchRepartidores(query);
    } else {
      // Si no hay query, recargar todos los repartidores
      window.location.reload();
    }
  };

  const resetForm = () => {
    setFormData({
      codigo: "",
      nombre: "",
      dni: "",
      licencia_conducir: "",
      telefono: "",
      activo: true,
    });
  };

  const handleCreate = async () => {
    if (!formData.codigo.trim() || !formData.nombre.trim()) {
      toast({
        title: "Error",
        description: "Código y nombre son requeridos",
        variant: "destructive",
      });
      return;
    }

    const normalizedData = {
      codigo: formData.codigo,
      nombre: formData.nombre,
      dni: formData.dni,
      licencia_conducir: formData.licencia_conducir,
      telefono: formData.telefono,
      activo: Boolean(formData.activo),
    };
    const success = await createRepartidor(normalizedData);
    if (success) {
      setIsCreateDialogOpen(false);
      resetForm();
    }
  };

  const handleEdit = (repartidor: Repartidor) => {
    setSelectedRepartidor(repartidor);
    setFormData({
      codigo: repartidor.codigo,
      nombre: repartidor.nombre,
      dni: repartidor.dni || "",
      licencia_conducir: repartidor.licencia_conducir || "",
      telefono: repartidor.telefono || "",
      activo:
        typeof repartidor.activo === "boolean"
          ? repartidor.activo
          : Boolean(repartidor.activo),
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!formData.codigo.trim() || !formData.nombre.trim()) {
      toast({
        title: "Error",
        description: "Código y nombre son requeridos",
        variant: "destructive",
      });
      return;
    }

    const normalizedData = {
      codigo: formData.codigo,
      nombre: formData.nombre,
      dni: formData.dni,
      licencia_conducir: formData.licencia_conducir,
      telefono: formData.telefono,
      activo: Boolean(formData.activo),
    };
    const success = await updateRepartidor(
      selectedRepartidor.id_repartidor,
      normalizedData,
    );
    if (success) {
      setIsEditDialogOpen(false);
      resetForm();
      setSelectedRepartidor(null);
    }
  };

  const handleDelete = async () => {
    if (selectedRepartidor) {
      const result = await deleteRepartidor(selectedRepartidor.id_repartidor);
      if (result.success) {
        setDeleteDialogOpen(false);
        setSelectedRepartidor(null);
      }
    }
  };

  const openDeleteDialog = (repartidor: Repartidor) => {
    setSelectedRepartidor(repartidor);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Regresar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Repartidores</h1>
            <p className="text-muted-foreground">
              Gestión de repartidores y conductores
            </p>
          </div>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Repartidor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Repartidor</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="codigo">Código *</Label>
                <Input
                  id="codigo"
                  value={formData.codigo}
                  onChange={(e) =>
                    setFormData({ ...formData, codigo: e.target.value })
                  }
                  placeholder="Ej: R001"
                />
              </div>
              <div>
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  placeholder="Nombre completo del repartidor"
                />
              </div>
              <div>
                <Label htmlFor="dni">DNI</Label>
                <Input
                  id="dni"
                  value={formData.dni}
                  onChange={(e) =>
                    setFormData({ ...formData, dni: e.target.value })
                  }
                  placeholder="Número de DNI"
                />
              </div>
              <div>
                <Label htmlFor="licencia">Licencia de Conducir</Label>
                <Input
                  id="licencia"
                  value={formData.licencia_conducir}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      licencia_conducir: e.target.value,
                    })
                  }
                  placeholder="Número de licencia"
                />
              </div>
              <div>
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={formData.telefono}
                  onChange={(e) =>
                    setFormData({ ...formData, telefono: e.target.value })
                  }
                  placeholder="Número de teléfono"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="activo"
                  checked={Boolean(formData.activo)}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      activo: e.target.checked as boolean,
                    })
                  }
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <Label htmlFor="activo">Activo</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleCreate} disabled={loading}>
                  {loading ? "Creando..." : "Crear"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Repartidores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <Input
              placeholder="Buscar por código, nombre, DNI o licencia..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1"
            />
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
                <User className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{repartidores.length}</p>
                  <p className="text-sm text-muted-foreground">
                    Total Repartidores
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {repartidores.filter((r) => r.licencia_conducir).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Con Licencia</p>
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
                    {repartidores.filter((r) => r.activo).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Activos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Phone className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {repartidores.filter((r) => r.telefono).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Con Teléfono</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Repartidores</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Cargando repartidores...</div>
          ) : (
            <RepartidoresTable
              repartidores={repartidores}
              onEdit={(rep: any) => handleEdit(rep)}
              onDelete={(rep: any) => openDeleteDialog(rep)}
              initialPageSize={10}
            />
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Repartidor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-codigo">Código *</Label>
              <Input
                id="edit-codigo"
                value={formData.codigo}
                onChange={(e) =>
                  setFormData({ ...formData, codigo: e.target.value })
                }
                placeholder="Ej: R001"
              />
            </div>
            <div>
              <Label htmlFor="edit-nombre">Nombre *</Label>
              <Input
                id="edit-nombre"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                placeholder="Nombre completo del repartidor"
              />
            </div>
            <div>
              <Label htmlFor="edit-dni">DNI</Label>
              <Input
                id="edit-dni"
                value={formData.dni}
                onChange={(e) =>
                  setFormData({ ...formData, dni: e.target.value })
                }
                placeholder="Número de DNI"
              />
            </div>
            <div>
              <Label htmlFor="edit-licencia">Licencia de Conducir</Label>
              <Input
                id="edit-licencia"
                value={formData.licencia_conducir}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    licencia_conducir: e.target.value,
                  })
                }
                placeholder="Número de licencia"
              />
            </div>
            <div>
              <Label htmlFor="edit-telefono">Teléfono</Label>
              <Input
                id="edit-telefono"
                value={formData.telefono}
                onChange={(e) =>
                  setFormData({ ...formData, telefono: e.target.value })
                }
                placeholder="Número de teléfono"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-activo"
                checked={Boolean(formData.activo)}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    activo: e.target.checked as boolean,
                  })
                }
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <Label htmlFor="edit-activo">Activo</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleUpdate} disabled={loading}>
                {loading ? "Actualizando..." : "Actualizar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar repartidor?</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-2">
                <p>
                  Está a punto de eliminar el repartidor{" "}
                  <strong>{selectedRepartidor?.nombre}</strong>.
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                  <p className="text-sm text-amber-800">
                    <strong>Importante:</strong> Si este repartidor tiene viajes
                    registrados en el sistema, será desactivado en lugar de
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
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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
