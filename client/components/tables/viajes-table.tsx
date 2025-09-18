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
import { getTodayString, formatDateForDisplay } from "@/lib/utils/date";
import { Clock, MapPin, Truck, User, Edit, Trash2 } from "lucide-react";
import {
  TablePagination,
  usePagination,
} from "@/components/ui/table-pagination";

interface Viaje {
  id?: number;
  id_viaje?: number;
  fecha: string;
  id_vehiculo: number;
  id_repartidor: number;
  nro_viaje: number;
  salida_cd?: string;
  llegada_cd?: string;
  distancia_km?: number;
  territorios_visitados?: number;
  tipo_viaje?: string;
  vehiculo_placa?: string;
  vehiculo_marca?: string;
  vehiculo_modelo?: string;
  repartidor_codigo?: string;
  repartidor_nombre?: string;
  repartidor_telefono?: string;
}

interface ViajesTableProps {
  viajes: Viaje[];
  onEdit?: (viaje: Viaje) => void;
  onDelete?: (viaje: Viaje) => void;
  initialPageSize?: number;
}

export function ViajesTable({
  viajes,
  onEdit,
  onDelete,
  initialPageSize = 10,
}: ViajesTableProps) {
  const {
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    paginatedData,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination(viajes, initialPageSize);

  const formatTime = (minutes: number | undefined) => {
    if (!minutes) return "-";
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getEstadoViaje = (fecha: string) => {
    const hoy = getTodayString();
    const fechaViaje = (fecha || "").split("T")[0];

    if (fechaViaje > hoy) {
      return { estado: "Programado", variant: "secondary" as const };
    } else if (fechaViaje === hoy) {
      return { estado: "En Curso", variant: "default" as const };
    } else {
      return { estado: "Completado", variant: "outline" as const };
    }
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>N° Viaje</TableHead>
              <TableHead>Vehículo</TableHead>
              <TableHead>Repartidor</TableHead>
              <TableHead>Horarios</TableHead>
              <TableHead>Detalles</TableHead>
              {(onEdit || onDelete) && (
                <TableHead className="text-right">Acciones</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((viaje) => {
              const { estado, variant } = getEstadoViaje(viaje.fecha);
              return (
                <TableRow key={viaje.id || viaje.id_viaje}>
                  <TableCell className="font-mono text-sm">
                    #{viaje.id_viaje || viaje.id}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{formatDateForDisplay(viaje.fecha)}</div>
                      <Badge variant={variant} className="text-xs">
                        {estado}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      Viaje {viaje.nro_viaje}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-blue-500" />
                        <span className="font-medium text-blue-700 dark:text-blue-300">
                          {viaje.vehiculo_placa || "Sin placa"}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {viaje.vehiculo_marca} {viaje.vehiculo_modelo}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-green-500" />
                        <span className="font-medium">
                          {viaje.repartidor_nombre || "Sin asignar"}
                        </span>
                      </div>
                      {viaje.repartidor_codigo && (
                        <div className="text-xs text-gray-500">
                          Código: {viaje.repartidor_codigo}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-green-600" />
                        <span className="text-green-600">
                          {viaje.salida_cd
                            ? new Date(viaje.salida_cd).toLocaleTimeString(
                                "es-PE",
                                {
                                  timeZone: "America/Lima",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )
                            : "No definida"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-red-600" />
                        <span className="text-red-600">
                          {viaje.llegada_cd
                            ? new Date(viaje.llegada_cd).toLocaleTimeString(
                                "es-PE",
                                {
                                  timeZone: "America/Lima",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )
                            : "No definida"}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-blue-500" />
                        <span>
                          {viaje.distancia_km
                            ? `${viaje.distancia_km} km`
                            : "Sin definir"}
                        </span>
                      </div>
                      {viaje.tipo_viaje && (
                        <Badge variant="secondary" className="text-xs">
                          {viaje.tipo_viaje}
                        </Badge>
                      )}
                      <div className="grid grid-cols-1 gap-1 mt-1">
                        {/* tiempos removidos */}
                        <div className="text-xs">
                          Territorios: {viaje.territorios_visitados ?? 0}
                        </div>
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
                            onClick={() => onEdit(viaje)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDelete(viaje)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
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
