import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface TipoCliente {
  id: number
  nombre: string
}

interface TiposClienteTableProps {
  tiposCliente: TipoCliente[]
}

export function TiposClienteTable({ tiposCliente }: TiposClienteTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Nombre</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tiposCliente.map((tipo) => (
          <TableRow key={tipo.id}>
            <TableCell className="font-medium">{tipo.id}</TableCell>
            <TableCell className="font-semibold">{tipo.nombre}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
