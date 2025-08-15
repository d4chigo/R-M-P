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
import { formatDateForDisplay } from "@/lib/utils/date";
import { normalizeBoolean } from "@/hooks/use-vehiculos";

interface Vehiculo {
  id_vehiculo: number;
  placa: string;
  marca: string;
  modelo: string;
  anio?: number;
  capacidad_kg?: number;
  capacidad_cajas?: number;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

interface VehiculosTableProps {
  vehiculos: Vehiculo[];
  onEdit?: (vehiculo: Vehiculo) => void;
  onDelete?: (vehiculo: Vehiculo) => void;
}

export function VehiculosTable({
  vehiculos,
  onEdit,
  onDelete,
}: VehiculosTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Placa</TableHead>
            <TableHead>Marca/Modelo</TableHead>
            <TableHead>Año</TableHead>
            <TableHead>Capacidad (kg)</TableHead>
            <TableHead>Capacidad Cajas</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha Registro</TableHead>
            {(onEdit || onDelete) && <TableHead>Acciones</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehiculos.map((vehiculo) => (
            <TableRow key={vehiculo.id_vehiculo}>
              <TableCell className="font-medium">
                {vehiculo.id_vehiculo}
              </TableCell>
              <TableCell className="font-semibold">{vehiculo.placa}</TableCell>
              <TableCell>
                {vehiculo.marca} {vehiculo.modelo}
              </TableCell>
              <TableCell>{vehiculo.anio || "N/A"}</TableCell>
              <TableCell>
                {vehiculo.capacidad_kg != null
                  ? vehiculo.capacidad_kg.toLocaleString()
                  : "N/A"}
              </TableCell>
              <TableCell>
                {vehiculo.capacidad_cajas != null
                  ? vehiculo.capacidad_cajas.toLocaleString()
                  : "N/A"}
              </TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    normalizeBoolean(vehiculo.activo)
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                  }`}
                >
                  {normalizeBoolean(vehiculo.activo) ? "Activo" : "Inactivo"}
                </span>
              </TableCell>
              <TableCell>{formatDateForDisplay(vehiculo.created_at)}</TableCell>
              {(onEdit || onDelete) && (
                <TableCell>
                  <div className="flex gap-2">
                    {onEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(vehiculo)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(vehiculo)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
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
  );
}
