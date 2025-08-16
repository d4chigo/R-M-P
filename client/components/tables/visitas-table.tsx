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
import { Input } from "@/components/ui/input";
import { Edit, Trash2, Search, X } from "lucide-react";
import {
  TablePagination,
  usePagination,
} from "@/components/ui/table-pagination";
import type { Visita } from "@/hooks/use-visitas";

interface VisitasTableProps {
  visitas: Visita[];
  onEdit?: (visita: Visita) => void;
  onDelete?: (visita: Visita) => void;
  initialPageSize?: number;
}

export function VisitasTable({
  visitas,
  onEdit,
  onDelete,
  initialPageSize = 10,
}: VisitasTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrar datos basado en busqueda
  const filteredVisitas = useMemo(() => {
    if (!searchTerm) return visitas;

    return visitas.filter((visita) => {
      const searchableFields = [
        visita.id_visita?.toString(),
        visita.id_viaje?.toString(),
        visita.viaje_nro?.toString(),
        visita.viaje_fecha,
        visita.cliente_nombre,
        visita.cliente_codigo,
        visita.pedidos?.toString(),
        visita.entrega_cf?.toString(),
        visita.recojo_cf?.toString(),
        visita.peso_kg?.toString(),
        visita.distancia_km?.toString(),
        visita.vehiculo_placa,
        visita.repartidor_nombre,
        visita.repartidor_codigo,
      ];

      return searchableFields.some((field) =>
        field?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    });
  }, [visitas, searchTerm]);

  const {
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    paginatedData,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination(filteredVisitas, initialPageSize);

  const clearFilters = () => {
    setSearchTerm("");
  };

  if (visitas.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay visitas registradas
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
            placeholder="Buscar por cliente, viaje, vehiculo, repartidor, pedidos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 mobile-input dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
          />
        </div>

        {searchTerm && (
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

      {/* Informacion de resultados */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Mostrando {filteredVisitas.length} de {visitas.length} visitas
        {searchTerm && ` para "${searchTerm}"`}
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Viaje</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Pedidos</TableHead>
              <TableHead>Entrega (CF)</TableHead>
              <TableHead>Recojo (CF)</TableHead>
              <TableHead>Peso (Kg)</TableHead>
              <TableHead>Distancia (Km)</TableHead>
              <TableHead>Vehiculo</TableHead>
              <TableHead>Repartidor</TableHead>
              {(onEdit || onDelete) && (
                <TableHead className="text-right">Acciones</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={11}
                  className="text-center py-8 text-gray-500 dark:text-gray-400"
                >
                  {filteredVisitas.length === 0 && searchTerm
                    ? "No se encontraron visitas que coincidan con la busqueda"
                    : "No hay visitas registradas"}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((visita) => (
                <TableRow key={visita.id_visita}>
                  <TableCell className="font-medium">
                    {visita.id_visita}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">
                        Viaje #{visita.viaje_nro || visita.id_viaje}
                      </div>
                      <div className="text-gray-500">
                        {visita.viaje_fecha || "Sin fecha"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">
                        {visita.cliente_nombre || "Sin nombre"}
                      </div>
                      <div className="text-gray-500">
                        Codigo: {visita.cliente_codigo || "N/A"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {visita.pedidos || 0}
                  </TableCell>
                  <TableCell className="text-green-600 font-medium">
                    {visita.entrega_cf
                      ? visita.entrega_cf.toLocaleString("es-PE", {
                          minimumFractionDigits: 2,
                        })
                      : "0.00"}
                  </TableCell>
                  <TableCell className="text-blue-600 font-medium">
                    {visita.recojo_cf
                      ? visita.recojo_cf.toLocaleString("es-PE", {
                          minimumFractionDigits: 2,
                        })
                      : "0.00"}
                  </TableCell>
                  <TableCell className="text-purple-600 font-medium">
                    {visita.peso_kg
                      ? `${visita.peso_kg.toLocaleString("es-PE", { minimumFractionDigits: 2 })} kg`
                      : "0.00 kg"}
                  </TableCell>
                  <TableCell className="text-orange-600 font-medium">
                    {visita.distancia_km
                      ? `${visita.distancia_km.toLocaleString("es-PE", { minimumFractionDigits: 2 })} km`
                      : "0.00 km"}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {visita.vehiculo_placa || "N/A"}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">
                        {visita.repartidor_nombre || "N/A"}
                      </div>
                      <div className="text-gray-500">
                        {visita.repartidor_codigo || "N/A"}
                      </div>
                    </div>
                  </TableCell>
                  {(onEdit || onDelete) && (
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        {onEdit && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(visita)}
                            className="h-8 w-8 p-0"
                            title="Editar visita"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDelete(visita)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                            title="Eliminar visita"
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
