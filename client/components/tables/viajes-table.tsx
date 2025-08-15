import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Truck, User } from "lucide-react";

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
  tiempo_manejo_min?: number;
  tiempo_servicio_min?: number;
  recarga_min?: number;
  refrigerio_min?: number;
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
}

export function ViajesTable({ viajes }: ViajesTableProps) {
  const formatTime = (minutes: number | undefined) => {
    if (!minutes) return "-";
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getEstadoViaje = (fecha: string) => {
    const hoy = new Date().toISOString().split("T")[0];
    const fechaViaje = fecha;

    if (fechaViaje > hoy) {
      return { estado: "Programado", variant: "secondary" as const };
    } else if (fechaViaje === hoy) {
      return { estado: "En Curso", variant: "default" as const };
    } else {
      return { estado: "Completado", variant: "outline" as const };
    }
  };

  return (
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
        </TableRow>
      </TableHeader>
      <TableBody>
        {viajes.map((viaje) => {
          const { estado, variant } = getEstadoViaje(viaje.fecha);
          return (
            <TableRow key={viaje.id || viaje.id_viaje}>
              <TableCell className="font-mono text-sm">
                #{viaje.id_viaje || viaje.id}
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium">
                    {new Date(viaje.fecha).toLocaleDateString("es-PE", {
                      timeZone: "America/Lima",
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </div>
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
                    {viaje.tiempo_manejo_min && (
                      <div className="text-gray-500">
                        Manejo: {formatTime(viaje.tiempo_manejo_min)}
                      </div>
                    )}
                    {viaje.tiempo_servicio_min && (
                      <div className="text-gray-500">
                        Servicio: {formatTime(viaje.tiempo_servicio_min)}
                      </div>
                    )}
                  </div>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
