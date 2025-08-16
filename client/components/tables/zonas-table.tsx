"use client";

import { useMemo } from "react";
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
import { Edit, Trash2, MapPin } from "lucide-react";
import {
  TablePagination,
  usePagination,
} from "@/components/ui/table-pagination";

interface Zona {
  id_zona?: number;
  codigo: string;
  descripcion: string;
  latitud?: number;
  longitud?: number;
  created_at?: string;
  updated_at?: string;
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
  const {
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    paginatedData,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination(zonas, initialPageSize);

  if (zonas.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay zonas registradas
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
                  colSpan={6}
                  className="text-center py-8 text-gray-500 dark:text-gray-400"
                >
                  No hay zonas registradas
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
                      {zona.created_at
                        ? new Date(zona.created_at).toLocaleDateString(
                            "es-PE",
                            {
                              timeZone: "America/Lima",
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            },
                          )
                        : "-"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {zona.created_at
                        ? new Date(zona.created_at).toLocaleTimeString(
                            "es-PE",
                            {
                              timeZone: "America/Lima",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )
                        : "-"}
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
