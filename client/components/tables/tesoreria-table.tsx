"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  DollarSign,
  Calendar,
  FileText,
  MoreHorizontal,
  Filter,
  Download,
} from "lucide-react";
import { Tesoreria } from "@/hooks/use-tesoreria";
import { TesoreriaForm } from "@/components/forms/tesoreria-form";
import { useTesoreria } from "@/hooks/use-tesoreria";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { TablePagination, usePagination } from "@/components/ui/table-pagination";
import { BarChart3, RefreshCcw } from "lucide-react";

interface TesoreriaTableProps {
  onRefresh?: () => void;
  variant?: "full" | "simple";
  mode?: "active" | "history" | "trash";
}

export function TesoreriaTable({ onRefresh, variant = "full", mode = "active" }: TesoreriaTableProps) {
  const { isAdmin } = useAuth();
  const {
    tesoreria,
    loading,
    error,
    createTesoreria,
    updateTesoreria,
    deleteTesoreria,
    searchTesoreria,
    fetchTesoreria,
    fetchActive,
    fetchHistory,
    fetchTrash,
    restoreTesoreria,
  } = useTesoreria();

  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategoria, setFilterCategoria] = useState<string>("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTesoreria, setSelectedTesoreria] = useState<Tesoreria | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [initialPageSize] = useState(10);

  // Mantener sincronizado con la página (variant="simple")
  useEffect(() => {
    const onRefresh = () => {
      if (mode === "active") return fetchActive();
      if (mode === "history") return fetchHistory();
      if (mode === "trash") return fetchTrash();
    };
    const onSearch = (e: Event) => {
      const detail = (e as CustomEvent).detail || {};
      // Asegurar que el scope se respete según el modo de la tabla
      const params = { ...detail, scope: mode } as any;
      // Para history, si no hay fechas, el backend decidirá por fecha < hoy
      searchTesoreria(params);
    };
    window.addEventListener("tesoreria:refresh", onRefresh as EventListener);
    window.addEventListener("tesoreria:search", onSearch as EventListener);
    return () => {
      window.removeEventListener("tesoreria:refresh", onRefresh as EventListener);
      window.removeEventListener("tesoreria:search", onSearch as EventListener);
    };
  }, [fetchActive, fetchHistory, fetchTrash, searchTesoreria, mode]);

  // Carga inicial según el modo
  useEffect(() => {
    if (mode === "active") fetchActive();
    if (mode === "history") fetchHistory();
    if (mode === "trash") fetchTrash();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // Paginación
  const {
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    paginatedData,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination(tesoreria, initialPageSize);

  const categorias = [
    "Combustible",
    "Mantenimiento",
    "Salarios",
    "Peajes",
    "Seguros",
    "Licencias",
    "Impuestos",
    "Servicios",
    "Ventas",
    "Comisiones",
    "Otros",
  ];

  const handleSearch = async () => {
    const params: any = {};
    if (searchTerm) params.q = searchTerm;
    if (filterCategoria) params.categoria = filterCategoria;

    await searchTesoreria(params);
  };

  const clearFilters = async () => {
    setSearchTerm("");
    setFilterCategoria("");
    await searchTesoreria({});
  };

  const handleCreate = async (data: any) => {
    const success = await createTesoreria(data);
    if (success) {
      toast({
        title: "Éxito",
        description: "Registro de tesorería creado exitosamente",
      });
      setIsCreateDialogOpen(false);
      onRefresh?.();
      return true;
    } else {
      toast({
        title: "Error",
        description: "Error al crear el registro de tesorería",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleUpdate = async (data: any) => {
  if (!selectedTesoreria) return false;
    const success = await updateTesoreria(selectedTesoreria.id, data);
    if (success) {
      toast({
        title: "Éxito",
        description: "Registro de tesorería actualizado exitosamente",
      });
      setIsEditDialogOpen(false);
      setSelectedTesoreria(null);
      onRefresh?.();
      return true;
    } else {
      toast({
        title: "Error",
        description: "Error al actualizar el registro de tesorería",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleDelete = async (id: number) => {
    const success = await deleteTesoreria(id);
    if (success) {
      toast({
        title: "Éxito",
        description: "Registro movido a la papelera",
      });
      onRefresh?.();
    } else {
      toast({
        title: "Error",
        description: "Error al mover a la papelera",
        variant: "destructive",
      });
    }
  };

  const handleRestore = async (id: number) => {
    const success = await restoreTesoreria(id);
    if (success) {
      toast({ title: "Éxito", description: "Registro restaurado correctamente" });
      onRefresh?.();
      // Tras restaurar, recargar trash
      await fetchTrash();
    } else {
      toast({ title: "Error", description: "No se pudo restaurar el registro", variant: "destructive" });
    }
  };

  const handleEdit = (tesoreria: Tesoreria) => {
    setSelectedTesoreria(tesoreria);
    setIsEditDialogOpen(true);
  };

  const handleView = (tesoreria: Tesoreria) => {
    setSelectedTesoreria(tesoreria);
    setIsViewDialogOpen(true);
  };

  const formatCurrency = (amount: number) => {
    const formatter = new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
    });
    return formatter.format(amount);
  };

  // Estadísticas simples
  const totalRegistros = tesoreria.length;
  const totalMonto = tesoreria.reduce((acc, it) => acc + (it.monto || 0), 0);
  const promedioMonto = totalRegistros > 0 ? totalMonto / totalRegistros : 0;

  if (loading) {
    if (variant === "simple") {
      return (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      );
    }
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cargando registros de tesorería...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    if (variant === "simple") {
      return <p className="text-red-600">{error}</p>;
    }
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  // Simple variant: render only table and pagination so the page can own layout
  if (variant === "simple") {
    return (
      <div className="space-y-4">
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Placa</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Detalle</TableHead>
                <TableHead>Reembolso</TableHead>
                <TableHead>Distrito</TableHead>
                <TableHead>Turno</TableHead>
                <TableHead>Encargado</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tesoreria.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No se encontraron registros de tesorería
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        {format(new Date(item.fecha), "dd/MM/yyyy", { locale: es })}
                      </div>
                    </TableCell>
                    <TableCell>{item.placa || "-"}</TableCell>
                    <TableCell>{item.nombre}</TableCell>
                    <TableCell>{item.cargo || "-"}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.categoria}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate" title={item.detalle || ""}>
                        {item.detalle || "-"}
                      </div>
                    </TableCell>
                    <TableCell>{item.reembolso || "-"}</TableCell>
                    <TableCell>{item.distrito || "-"}</TableCell>
                    <TableCell>{item.turno ?? "-"}</TableCell>
                    <TableCell>{item.encargado || "-"}</TableCell>
                    <TableCell>
                      <div className="font-medium">{formatCurrency(item.monto)}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {mode !== "trash" ? (
                          <>
                            {isAdmin ? (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleEdit(item)}
                                  aria-label="Editar"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                      aria-label="Eliminar"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>¿Mover a papelera?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Esta acción moverá el registro a la papelera. Podrás restaurarlo durante 7 días.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDelete(item.id)}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        Mover a papelera
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </>
                            ) : (
                              <span className="text-sm text-gray-500">—</span>
                            )}
                          </>
                        ) : (
                          isAdmin ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 px-2"
                              onClick={() => handleRestore(item.id)}
                            >
                              Restaurar
                            </Button>
                          ) : (
                            <span className="text-sm text-gray-500">—</span>
                          )
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={tesoreria.length}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />

        {/* Dialogos de Ver y Editar */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Registro de Tesorería</DialogTitle>
              <DialogDescription>
                Modifique los datos del registro de tesorería.
              </DialogDescription>
            </DialogHeader>
            {selectedTesoreria && (
              <TesoreriaForm
                tesoreria={selectedTesoreria}
                onSubmit={handleUpdate}
                onCancel={() => {
                  setIsEditDialogOpen(false);
                  setSelectedTesoreria(null);
                }}
                loading={loading}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Diálogo de visualización */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalles del Registro de Tesorería</DialogTitle>
            </DialogHeader>
            {selectedTesoreria && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Fecha</label>
                    <p className="text-sm">
                      {format(new Date(selectedTesoreria.fecha), "dd/MM/yyyy", { locale: es })}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Placa</label>
                    <p className="text-sm">{selectedTesoreria.placa || "-"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nombre</label>
                    <p className="text-sm">{selectedTesoreria.nombre}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Cargo</label>
                    <p className="text-sm">{selectedTesoreria.cargo || "-"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Categoría</label>
                    <p className="text-sm">{selectedTesoreria.categoria}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Reembolso</label>
                    <p className="text-sm">{selectedTesoreria.reembolso || "-"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Distrito</label>
                    <p className="text-sm">{selectedTesoreria.distrito || "-"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Turno</label>
                    <p className="text-sm">{selectedTesoreria.turno ?? "-"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Encargado</label>
                    <p className="text-sm">{selectedTesoreria.encargado || "-"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Monto</label>
                    <p className="text-sm font-medium">{formatCurrency(selectedTesoreria.monto)}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Detalle</label>
                  <p className="text-sm mt-1">{selectedTesoreria.detalle || "-"}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Creado</label>
                    <p className="text-sm">{format(new Date(selectedTesoreria.created_at), "dd/MM/yyyy HH:mm", { locale: es })}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Actualizado</label>
                    <p className="text-sm">{format(new Date(selectedTesoreria.updated_at), "dd/MM/yyyy HH:mm", { locale: es })}</p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Full variant (original layout)
  return (
    <div className="space-y-6">
      {/* Header con búsqueda y filtros */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Registros de Tesorería
            </CardTitle>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Resumen
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 p-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Card>
                      <CardHeader className="py-2">
                        <CardTitle className="text-xs font-medium">Total Registros</CardTitle>
                      </CardHeader>
                      <CardContent className="py-2">
                        <div className="text-lg font-bold">{totalRegistros}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="py-2">
                        <CardTitle className="text-xs font-medium">Total Monto</CardTitle>
                      </CardHeader>
                      <CardContent className="py-2">
                        <div className="text-lg font-bold text-green-600">{formatCurrency(totalMonto)}</div>
                      </CardContent>
                    </Card>
                    <Card className="col-span-2">
                      <CardHeader className="py-2">
                        <CardTitle className="text-xs font-medium">Promedio por Registro</CardTitle>
                      </CardHeader>
                      <CardContent className="py-2">
                        <div className="text-lg font-bold">{formatCurrency(promedioMonto)}</div>
                      </CardContent>
                    </Card>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Nuevo Registro
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Nuevo Registro de Tesorería</DialogTitle>
                    <DialogDescription>
                      Complete los datos para crear un nuevo registro de tesorería.
                    </DialogDescription>
                  </DialogHeader>
                  <TesoreriaForm
                    onSubmit={handleCreate}
                    onCancel={() => setIsCreateDialogOpen(false)}
                    loading={loading}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Select
              value={filterCategoria || "all"}
              onValueChange={(val) => setFilterCategoria(val === "all" ? "" : val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {categorias.map((categoria) => (
                  <SelectItem key={categoria} value={categoria}>
                    {categoria}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button onClick={handleSearch} className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtrar
              </Button>
              <Button variant="outline" onClick={clearFilters} className="flex items-center gap-2">
                <RefreshCcw className="h-4 w-4" />
                Limpiar
              </Button>
            </div>
          </div>

          {/* Tabla */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Placa</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Detalle</TableHead>
                  <TableHead>Reembolso</TableHead>
                  <TableHead>Distrito</TableHead>
                  <TableHead>Turno</TableHead>
                  <TableHead>Encargado</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tesoreria.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No se encontraron registros de tesorería
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          {format(new Date(item.fecha), "dd/MM/yyyy", { locale: es })}
                        </div>
                      </TableCell>
                      <TableCell>{item.placa || "-"}</TableCell>
                      <TableCell>{item.nombre}</TableCell>
                      <TableCell>{item.cargo || "-"}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.categoria}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={item.detalle || ""}>
                          {item.detalle || "-"}
                        </div>
                      </TableCell>
                      <TableCell>{item.reembolso || "-"}</TableCell>
                      <TableCell>{item.distrito || "-"}</TableCell>
                      <TableCell>{item.turno ?? "-"}</TableCell>
                      <TableCell>{item.encargado || "-"}</TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {formatCurrency(item.monto)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleEdit(item)}
                            aria-label="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                aria-label="Eliminar"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Se eliminará permanentemente el registro de tesorería.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(item.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {/* Paginación */}
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={tesoreria.length}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </CardContent>
      </Card>

      {/* Dialogos de Ver y Editar */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Registro de Tesorería</DialogTitle>
            <DialogDescription>
              Modifique los datos del registro de tesorería.
            </DialogDescription>
          </DialogHeader>
          {selectedTesoreria && (
            <TesoreriaForm
              tesoreria={selectedTesoreria}
              onSubmit={handleUpdate}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedTesoreria(null);
              }}
              loading={loading}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo de visualización */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Registro de Tesorería</DialogTitle>
          </DialogHeader>
          {selectedTesoreria && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Fecha</label>
                  <p className="text-sm">
                    {format(new Date(selectedTesoreria.fecha), "dd/MM/yyyy", { locale: es })}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Placa</label>
                  <p className="text-sm">{selectedTesoreria.placa || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Nombre</label>
                  <p className="text-sm">{selectedTesoreria.nombre}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Cargo</label>
                  <p className="text-sm">{selectedTesoreria.cargo || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Categoría</label>
                  <p className="text-sm">{selectedTesoreria.categoria}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Reembolso</label>
                  <p className="text-sm">{selectedTesoreria.reembolso || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Distrito</label>
                  <p className="text-sm">{selectedTesoreria.distrito || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Turno</label>
                  <p className="text-sm">{selectedTesoreria.turno ?? "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Encargado</label>
                  <p className="text-sm">{selectedTesoreria.encargado || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Monto</label>
                  <p className="text-sm font-medium">{formatCurrency(selectedTesoreria.monto)}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Detalle</label>
                <p className="text-sm mt-1">{selectedTesoreria.detalle || "-"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <label className="text-sm font-medium text-gray-500">Creado</label>
                  <p className="text-sm">{format(new Date(selectedTesoreria.created_at), "dd/MM/yyyy HH:mm", { locale: es })}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Actualizado</label>
                  <p className="text-sm">{format(new Date(selectedTesoreria.updated_at), "dd/MM/yyyy HH:mm", { locale: es })}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 