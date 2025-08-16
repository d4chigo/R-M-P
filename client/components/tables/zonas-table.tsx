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
import { Edit, Trash2, MapPin, Search, Calendar, X } from "lucide-react";
import {
  TablePagination,
  usePagination,
} from "@/components/ui/table-pagination";

interface Zona {
  id_zona: number;
  codigo: string;
  descripcion: string;
  latitud?: number;
  longitud?: number;
  created_at: string;
  updated_at: string;
}

interface ZonasTableProps {
  zonas: Zona[];
  onEdit?: (zona: Zona) => void;
  onDelete?: (zona: Zona) => void;
  onViewMap?: (zona: Zona) => void;
  initialPageSize?: number;
}

export function ZonasTable({
  zonas,
  onEdit,
  onDelete,
  onViewMap,
  initialPageSize = 10,
}: ZonasTableProps) {
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
  const filteredZonas = useMemo(() => {
    let filtered = zonas;

    // Filtro de búsqueda
    if (searchTerm) {
      filtered = filtered.filter((zona) => {
        const searchableFields = [
          zona.codigo,
          zona.descripcion,
          zona.latitud?.toString(),
          zona.longitud?.toString(),
          zona.latitud != null && zona.longitud != null
            ? "con coordenadas"
            : "sin coordenadas",
        ];

        return searchableFields.some((field) =>
          field?.toLowerCase().includes(searchTerm.toLowerCase()),
        );
      });
    }

    // Filtro de fecha
    if (dateFilter) {
      filtered = filtered.filter((zona) => {
        const zonaDate = formatDateForComparison(zona.created_at);
        return zonaDate === dateFilter;
      });
    }

    return filtered;
  }, [zonas, searchTerm, dateFilter]);

  const {
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    paginatedData,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination(filteredZonas, initialPageSize);

  const clearFilters = () => {
    setSearchTerm("");
    setDateFilter("");
  };

  if (zonas.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay zonas registradas
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
            placeholder="Buscar por código, descripción o coordenadas..."
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
            placeholder="Filtrar por fecha de creación"
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
        Mostrando {filteredZonas.length} de {zonas.length} zonas
        {searchTerm && ` para "${searchTerm}"`}
        {dateFilter && ` creadas el ${formatDateForDisplayLocal(dateFilter)}`}
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Coordenadas</TableHead>
              <TableHead>Fecha Creación</TableHead>
              {(onEdit || onDelete || onViewMap) && (
                <TableHead className="text-right">Acciones</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-gray-500 dark:text-gray-400"
                >
                  {filteredZonas.length === 0 && (searchTerm || dateFilter)
                    ? "No se encontraron zonas que coincidan con los filtros"
                    : "No hay zonas registradas"}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((zona) => (
                <TableRow key={zona.id_zona}>
                  <TableCell>
                    <Badge variant="outline">{zona.codigo}</Badge>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <p className="text-sm line-clamp-3">{zona.descripcion}</p>
                  </TableCell>
                  <TableCell>
                    {zona.latitud != null &&
                    zona.longitud != null &&
                    !isNaN(Number(zona.latitud)) &&
                    !isNaN(Number(zona.longitud)) ? (
                      <div className="text-sm">
                        <div>Lat: {Number(zona.latitud).toFixed(6)}</div>
                        <div>Lng: {Number(zona.longitud).toFixed(6)}</div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">
                        No definidas
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(zona.created_at).toLocaleDateString("es-PE", {
                        timeZone: "America/Lima",
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(zona.created_at).toLocaleTimeString("es-PE", {
                        timeZone: "America/Lima",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </TableCell>
                  {(onEdit || onDelete || onViewMap) && (
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        {onViewMap &&
                          zona.latitud != null &&
                          zona.longitud != null &&
                          !isNaN(Number(zona.latitud)) &&
                          !isNaN(Number(zona.longitud)) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onViewMap(zona)}
                              className="h-8 w-8 p-0"
                              title="Ver en mapa"
                            >
                              <MapPin className="h-4 w-4" />
                            </Button>
                          )}
                        {onEdit && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(zona)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDelete(zona)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
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
