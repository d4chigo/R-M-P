import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Visita {
  id: number
  id_viaje: number
  id_cliente: number
  entrega: number
  recojo: number
  llega: string
  sale: string
  sec1: string
  sec2: string
  distancia_km?: string
  cliente_nombre?: string
  viaje_info?: string
}

interface VisitasTableProps {
  visitas: Visita[]
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
            <TableHead>Entrega</TableHead>
            <TableHead>Recojo</TableHead>
            <TableHead>Llegada</TableHead>
            <TableHead>Salida</TableHead>
            <TableHead>Sec1</TableHead>
            <TableHead>Sec2</TableHead>
            <TableHead>Distancia</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visitas.map((visita) => (
            <TableRow key={visita.id}>
              <TableCell className="font-medium">{visita.id}</TableCell>
              <TableCell>
                <div className="text-sm">
                  <div className="font-medium">{visita.id_viaje}</div>
                  <div className="text-gray-500">{visita.viaje_info}</div>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <div className="font-medium">{visita.id_cliente}</div>
                  <div className="text-gray-500">{visita.cliente_nombre}</div>
                </div>
              </TableCell>
              <TableCell className="text-green-600 font-medium">
                {visita.entrega.toLocaleString()}
              </TableCell>
              <TableCell className="text-blue-600 font-medium">
                {visita.recojo.toLocaleString()}
              </TableCell>
              <TableCell>{visita.llega}</TableCell>
              <TableCell>{visita.sale}</TableCell>
              <TableCell className="font-mono text-xs">{visita.sec1}</TableCell>
              <TableCell className="font-mono text-xs">{visita.sec2}</TableCell>
              <TableCell>{visita.distancia_km || '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
