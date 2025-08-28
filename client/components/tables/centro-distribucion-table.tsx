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
import { Edit, Trash2, Eye, Warehouse, MapPin, Package, Users } from "lucide-react";
import {
  TablePagination,
  usePagination,
} from "@/components/ui/table-pagination";
import { Skeleton } from "@/components/ui/skeleton";

interface CentroDistribucion {
  id_centro?: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  direccion: string;
  ciudad: string;
  estado: 'activo' | 'inactivo' | 'mantenimiento';
  capacidad_almacen?: number;
  personal_asignado?: number;
  telefono?: string;
  email?: string;
  latitud?: number;
  longitud?: number;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}

interface CentroDistribucionTableProps {
  centros: CentroDistribucion[];
  onEdit?: (centro: CentroDistribucion) => void;
  onDelete?: (centro: CentroDistribucion) => void;
  onViewDetails?: (centro: CentroDistribucion) => void;
  isLoading?: boolean;
  initialPageSize?: number;
}

export function CentroDistribucionTable({
  centros,
  onEdit,
  onDelete,
  onViewDetails,
  isLoading = false,
  initialPageSize = 10,
}: CentroDistribucionTableProps) {
  const {
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    paginatedData,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination(centros, initialPageSize);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activo':
        return 'default';
      case 'inactivo':
        return 'secondary';
      case 'mantenimiento':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getEstadoText = (estado: string) => {
    switch (estado) {
      case 'activo':
        return 'Activo';
      case 'inactivo':
        return 'Inactivo';
      case 'mantenimiento':
        return 'Mantenimiento';
      default:
        return estado;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Ciudad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Capacidad</TableHead>
                <TableHead>Personal</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (centros.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Warehouse className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-medium">No hay centros de distribución registrados</p>
        <p className="text-sm">Comienza agregando el primer centro de distribución</p>
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
              <TableHead>Nombre</TableHead>
              <TableHead>Ciudad</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Capacidad</TableHead>
              <TableHead>Personal</TableHead>
              {(onEdit || onDelete || onViewDetails) && (
                <TableHead className="text-right">Acciones</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-gray-500 dark:text-gray-400"
                >
                  No hay centros de distribución registrados
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((centro) => (
                <TableRow key={centro.id_centro}>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {centro.codigo}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <div>
                      <p className="font-medium">{centro.nombre}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {centro.descripcion}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{centro.ciudad}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getEstadoColor(centro.estado)}>
                      {getEstadoText(centro.estado)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-muted-foreground" />
                      <span>
                        {centro.capacidad_almacen 
                          ? `${centro.capacidad_almacen.toLocaleString()} m³`
                          : 'No especificado'
                        }
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>
                        {centro.personal_asignado || 'No especificado'}
                      </span>
                    </div>
                  </TableCell>
                  {(onEdit || onDelete || onViewDetails) && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {onViewDetails && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewDetails(centro)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(centro)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(centro)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30"
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

      {/* Paginación */}
      {centros.length > 0 && (
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  );
} 