import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Zona {
  id: number
  nombre: string
  descripcion: string
}

interface ZonasTableProps {
  zonas: Zona[]
}

export function ZonasTable({ zonas }: ZonasTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Nombre</TableHead>
          <TableHead>Descripción</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {zonas.map((zona) => (
          <TableRow key={zona.id}>
            <TableCell className="font-medium">{zona.id}</TableCell>
            <TableCell className="font-semibold">{zona.nombre}</TableCell>
            <TableCell className="max-w-md">
              <p className="text-sm text-gray-600 line-clamp-3">{zona.descripcion}</p>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
