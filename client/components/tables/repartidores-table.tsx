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
import { Edit, Trash2 } from "lucide-react";
import {
  TablePagination,
  usePagination,
} from "@/components/ui/table-pagination";

interface Repartidor {
  id_repartidor: number;
  codigo: string;
  nombre: string;
  dni?: string;
  licencia_conducir?: string;
  telefono?: string;
  activo: number | boolean;
  created_at: string;
  updated_at: string;
}

interface RepartidoresTableProps {
  repartidores: Repartidor[];
  onEdit?: (repartidor: Repartidor) => void;
  onDelete?: (repartidor: Repartidor) => void;
  initialPageSize?: number;
}

export function RepartidoresTable({
  repartidores,
  onEdit,
  onDelete,
  initialPageSize = 10,
}: RepartidoresTableProps) {
  const {
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    paginatedData,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination(repartidores, initialPageSize);

  if (repartidores.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay repartidores registrados
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
              <TableHead>DNI</TableHead>
              <TableHead>Licencia</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Estado</TableHead>
              {(onEdit || onDelete) && (
                <TableHead className="text-right">Acciones</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((repartidor) => (
              <TableRow
                key={repartidor.id_repartidor}
                className={!repartidor.activo ? "opacity-60" : ""}
              >
                <TableCell>
                  <Badge variant="outline">{repartidor.codigo}</Badge>
                </TableCell>
                <TableCell className="font-medium">
                  {repartidor.nombre}
                </TableCell>
                <TableCell>
                  {repartidor.dni || (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {repartidor.licencia_conducir || (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {repartidor.telefono || (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      repartidor.activo
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                    }`}
                  >
                    {repartidor.activo ? "Activo" : "Inactivo"}
                  </span>
                </TableCell>
                {(onEdit || onDelete) && (
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      {onEdit && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(repartidor)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDelete(repartidor)}
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
