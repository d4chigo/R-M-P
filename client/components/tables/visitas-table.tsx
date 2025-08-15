import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
}

export function VisitasTable({ visitas }: VisitasTableProps) {
  return (
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {visitas.map((visita) => (
            <TableRow key={visita.id_visita}>
              <TableCell className="font-medium">{visita.id_visita}</TableCell>
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
