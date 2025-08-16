import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import {
  TablePagination,
  usePagination,
} from "@/components/ui/table-pagination";

interface Visita {
  id_visita: number;
  id_viaje: number;
  id_cliente: number;
  pedidos?: number;
  entrega_cf?: number;
  recojo_cf?: number;
  peso_kg?: number;
  distancia_km?: number;
  cliente_nombre?: string;
  cliente_codigo?: string;
  viaje_fecha?: string;
  viaje_nro?: number;
  vehiculo_placa?: string;
  repartidor_nombre?: string;
  repartidor_codigo?: string;
}

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
  const {
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    paginatedData,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination(visitas, initialPageSize);

  if (visitas.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay visitas registradas
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
              <TableHead>Vehículo</TableHead>
              <TableHead>Repartidor</TableHead>
              {(onEdit || onDelete) && (
                <TableHead className="text-right">Acciones</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((visita) => (
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
                      Código: {visita.cliente_codigo || "N/A"}
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
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
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
