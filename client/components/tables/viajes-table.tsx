import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Viaje {
  id: number
  id_ruta: number
  id_vehiculo: number
  fecha: string
  ruta_nombre?: string
  vehiculo_placa?: string
}

interface ViajesTableProps {
  viajes: Viaje[]
}

export function ViajesTable({ viajes }: ViajesTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>ID Ruta</TableHead>
          <TableHead>Ruta</TableHead>
          <TableHead>ID Vehículo</TableHead>
          <TableHead>Vehículo</TableHead>
          <TableHead>Fecha</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {viajes.map((viaje) => (
          <TableRow key={viaje.id}>
            <TableCell className="font-medium">{viaje.id}</TableCell>
            <TableCell>{viaje.id_ruta}</TableCell>
            <TableCell>{viaje.ruta_nombre}</TableCell>
            <TableCell>{viaje.id_vehiculo}</TableCell>
            <TableCell className="font-semibold">{viaje.vehiculo_placa}</TableCell>
            <TableCell>{new Date(viaje.fecha).toLocaleDateString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
