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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  activo?: boolean;
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

  const [formData, setFormData] = useState<RepartidorFormData>({
    codigo: "",
    nombre: "",
    dni: "",
    licencia_conducir: "",
    telefono: "",
    activo: true,
  });

  // Estados para paginación
  const [pagina, setPagina] = useState(1);
  const [tamanoPagina, setTamanoPagina] = useState(10);

  const repartidoresFiltrados = repartidores.filter((r) =>
    r.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.dni || "").includes(searchQuery) ||
    (r.licencia_conducir || "").includes(searchQuery)
  );

  const totalPaginas = Math.ceil(repartidoresFiltrados.length / tamanoPagina);

  const repartidoresPaginados = repartidoresFiltrados.slice(
    (pagina - 1) * tamanoPagina,
    pagina * tamanoPagina
  );

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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPagina(1); // Reiniciar a página 1 al buscar
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

    const success = await createRepartidor(formData);
    if (success) {
      setIsCreateDialogOpen(false);
      resetForm();
    }
  };

  const handleEdit = (repartidor: any) => {
    setSelectedRepartidor(repartidor);
    setFormData({
      codigo: repartidor.codigo,
      nombre: repartidor.nombre,
      dni: repartidor.dni || "",
      licencia_conducir: repartidor.licencia_conducir || "",
      telefono: repartidor.telefono || "",
      activo: repartidor.activo,
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

    const success = await updateRepartidor(
      selectedRepartidor.id_repartidor,
      formData
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

  const openDeleteDialog = (repartidor: any) => {
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
                  checked={formData.activo}
                  onChange={(e) =>
                    setFormData({ ...formData, activo: e.target.checked })
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
          <div className="flex gap-4">
            <Input
              placeholder="Buscar por código, nombre, DNI o licencia..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Repartidores</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Cargando repartidores...</div>
          ) : repartidoresPaginados.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No se encontraron repartidores</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>DNI</TableHead>
                    <TableHead>Licencia</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Activo</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {repartidoresPaginados.map((repartidor) => (
                    <TableRow
                      key={repartidor.id_repartidor}
                      className={!repartidor.activo ? "opacity-60" : ""}
                    >
                      <TableCell>
                        <Badge variant="outline">{repartidor.codigo}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{repartidor.nombre}</TableCell>
                      <TableCell>{repartidor.dni || <span className="text-muted-foreground">-</span>}</TableCell>
                      <TableCell>{repartidor.licencia_conducir || <span className="text-muted-foreground">-</span>}</TableCell>
                      <TableCell>{repartidor.telefono || <span className="text-muted-foreground">-</span>}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          repartidor.activo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                          {repartidor.activo ? "Activo" : "Inactivo"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(repartidor)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => openDeleteDialog(repartidor)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Paginación */}
              <div className="flex flex-col md:flex-row items-center justify-between mt-4 gap-2">
                <div>
                  Mostrando página {pagina} de {totalPaginas} ({repartidoresFiltrados.length} repartidores)
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="px-2 py-1 border rounded disabled:opacity-50"
                    onClick={() => setPagina(p => Math.max(1, p - 1))}
                    disabled={pagina === 1}
                  >
                    Anterior
                  </button>
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(num => (
                    <button
                      key={num}
                      className={`px-2 py-1 border rounded ${pagina === num ? 'bg-blue-600 text-white' : ''}`}
                      onClick={() => setPagina(num)}
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    className="px-2 py-1 border rounded disabled:opacity-50"
                    onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                    disabled={pagina === totalPaginas}
                  >
                    Siguiente
                  </button>
                  <select
                    className="ml-2 border rounded px-2 py-1"
                    value={tamanoPagina}
                    onChange={e => { setTamanoPagina(Number(e.target.value)); setPagina(1); }}
                  >
                    {[5, 10, 20, 50].map(size => (
                      <option key={size} value={size}>{size} por página</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
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
                checked={formData.activo}
                onChange={(e) =>
                  setFormData({ ...formData, activo: e.target.checked })
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
