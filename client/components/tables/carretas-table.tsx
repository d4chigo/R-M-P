import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Carreta {
  id: number
  placa: string
  tipo: string
  capacidad_kg: number
  estado: string
}

interface CarretasTableProps {
  carretas: Carreta[]
}

export function CarretasTable({ carretas }: CarretasTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Placa</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Capacidad (kg)</TableHead>
          <TableHead>Estado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {carretas.map((carreta) => (
          <TableRow key={carreta.id}>
            <TableCell className="font-medium">{carreta.id}</TableCell>
            <TableCell className="font-semibold">{carreta.placa}</TableCell>
            <TableCell>{carreta.tipo}</TableCell>
            <TableCell>{carreta.capacidad_kg.toLocaleString()}</TableCell>
            <TableCell>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                carreta.estado === 'Activo' ? 'bg-green-100 text-green-800' :
                carreta.estado === 'Mantenimiento' ? 'bg-yellow-100 text-yellow-800' :
                carreta.estado === 'Inactivo' ? 'bg-gray-100 text-gray-800' :
                'bg-red-100 text-red-800'
              }`}>
                {carreta.estado}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
