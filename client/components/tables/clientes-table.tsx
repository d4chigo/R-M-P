"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Edit,
  Trash2,
  Eye,
  ToggleLeft,
  ToggleRight,
  Search,
  Calendar,
  X,
} from "lucide-react";
import {
  TablePagination,
  usePagination,
} from "@/components/ui/table-pagination";
import type { Cliente } from "@/hooks/use-clientes";

interface ClientesTableProps {
  clientes: Cliente[];
  onEdit?: (cliente: Cliente) => void;
  onDelete?: (id: number) => void;
  onView?: (cliente: Cliente) => void;
  onToggleActivo?: (id: number, currentActivo: boolean) => void;
  isLoading?: boolean;
  initialPageSize?: number;
}

export function ClientesTable({
  clientes,
  onEdit,
  onDelete,
  onView,
  onToggleActivo,
  isLoading = false,
  initialPageSize = 10,
}: ClientesTableProps) {
  const [sortField, setSortField] = useState<string>("nombre");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Función para formatear fecha para comparación
  const formatDateForComparison = (dateStr: string): string => {
    try {
      if (dateStr.includes("T")) {
        return dateStr.split("T")[0];
      }
      if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateStr;
      }
      const date = new Date(dateStr);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch {
      return "";
    }
  };

  // Función para mostrar fecha en formato peruano
  const formatDateForDisplayLocal = (dateStr: string): string => {
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  // Filtrar datos basado en búsqueda y fecha
  const filteredClientes = useMemo(() => {
    let filtered = clientes;

    // Filtro de búsqueda
    if (searchTerm) {
      filtered = filtered.filter((cliente) => {
        const searchableFields = [
          cliente.codigo,
          cliente.nombre,
          cliente.direccion,
          cliente.zona_nombre,
          cliente.zona_codigo,
          cliente.activo ? "activo" : "inactivo",
        ];

        return searchableFields.some((field) =>
          field?.toLowerCase().includes(searchTerm.toLowerCase()),
        );
      });
    }

    // Filtro de fecha
    if (dateFilter) {
      filtered = filtered.filter((cliente) => {
        const clienteDate = formatDateForComparison(cliente.created_at || "");
        return clienteDate === dateFilter;
      });
    }

    return filtered;
  }, [clientes, searchTerm, dateFilter]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedClientes = [...filteredClientes].sort((a, b) => {
    let aValue: any = a[sortField as keyof Cliente];
    let bValue: any = b[sortField as keyof Cliente];

    // Handle null/undefined values
    if (aValue == null) aValue = "";
    if (bValue == null) bValue = "";

    // Convert to string for comparison
    aValue = String(aValue).toLowerCase();
    bValue = String(bValue).toLowerCase();

    if (sortDirection === "asc") {
      return aValue.localeCompare(bValue);
    } else {
      return bValue.localeCompare(aValue);
    }
  });

  const {
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    paginatedData,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination(sortedClientes, initialPageSize);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("es-PE", {
      timeZone: "America/Lima",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setDateFilter("");
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }

  if (clientes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No se encontraron clientes</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
          <Input
            placeholder="Buscar por código, nombre, dirección, zona o estado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 mobile-input dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
          />
        </div>

        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            placeholder="Filtrar por fecha de registro"
            className="pl-10 w-full sm:w-auto mobile-input dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          />
        </div>

        {(searchTerm || dateFilter) && (
          <Button
            variant="outline"
            onClick={clearFilters}
            className="mobile-button dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <X className="w-4 h-4 mr-2" />
            Limpiar Filtros
          </Button>
        )}
      </div>

      {/* Información de resultados */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Mostrando {filteredClientes.length} de {clientes.length} clientes
        {searchTerm && ` para "${searchTerm}"`}
        {dateFilter &&
          ` registrados el ${formatDateForDisplayLocal(dateFilter)}`}
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("codigo")}
              >
                Código
                {sortField === "codigo" && (
                  <span className="ml-1">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("nombre")}
              >
                Nombre
                {sortField === "nombre" && (
                  <span className="ml-1">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </TableHead>
              <TableHead>Dirección</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("zona_nombre")}
              >
                Zona
                {sortField === "zona_nombre" && (
                  <span className="ml-1">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("activo")}
              >
                Estado
                {sortField === "activo" && (
                  <span className="ml-1">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("created_at")}
              >
                Creado
                {sortField === "created_at" && (
                  <span className="ml-1">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-gray-500 dark:text-gray-400"
                >
                  {filteredClientes.length === 0 && (searchTerm || dateFilter)
                    ? "No se encontraron clientes que coincidan con los filtros"
                    : "No hay clientes registrados"}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((cliente) => (
                <TableRow
                  key={cliente.id_cliente}
                  className="hover:bg-muted/50"
                >
                  <TableCell className="font-mono font-semibold">
                    {cliente.codigo}
                  </TableCell>
                  <TableCell className="font-medium">
                    {cliente.nombre}
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <div
                      className="truncate"
                      title={cliente.direccion || "Sin dirección"}
                    >
                      {cliente.direccion || (
                        <span className="text-muted-foreground italic">
                          Sin dirección
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {cliente.zona_nombre ? (
                      <div className="space-y-1">
                        <div className="font-medium">{cliente.zona_nombre}</div>
                        {cliente.zona_codigo && (
                          <div className="text-sm text-muted-foreground font-mono">
                            {cliente.zona_codigo}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground italic">
                        Sin zona
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={cliente.activo ? "default" : "secondary"}
                      className={
                        cliente.activo
                          ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-300"
                      }
                    >
                      {cliente.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(cliente.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      {onView && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onView(cliente)}
                          className="h-8 w-8 p-0"
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      {onEdit && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(cliente)}
                          className="h-8 w-8 p-0"
                          title="Editar cliente"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {onToggleActivo && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            onToggleActivo(cliente.id_cliente!, cliente.activo)
                          }
                          className={`h-8 w-8 p-0 ${
                            cliente.activo
                              ? "text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:text-orange-400 dark:hover:text-orange-300 dark:hover:bg-orange-900/20"
                              : "text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/20"
                          }`}
                          title={
                            cliente.activo
                              ? "Desactivar cliente"
                              : "Activar cliente"
                          }
                        >
                          {cliente.activo ? (
                            <ToggleLeft className="h-4 w-4" />
                          ) : (
                            <ToggleRight className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDelete(cliente.id_cliente!)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                          title="Eliminar cliente"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
        totalItems={totalItems}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
}
