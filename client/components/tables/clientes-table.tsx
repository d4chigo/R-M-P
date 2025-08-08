import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Cliente {
  id: number
  nombre: string
  codigo: string
  id_tipo_cliente: number
  ruc: string
  direccion: string
  ciudad: string
  departamento: string
  pais: string
  telefono: string
  email: string
  contacto_nombre: string
  contacto_telefono: string
  abre: string
  cierra: string
  estado: string
  fecha_registro: string
  longitud: number
  latitud: number
}

interface ClientesTableProps {
  clientes: Cliente[]
}

export function ClientesTable({ clientes }: ClientesTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Código</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>RUC</TableHead>
            <TableHead>Ciudad</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Contacto</TableHead>
            <TableHead>Horario</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Latitud</TableHead>
            <TableHead>Longitud</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clientes.map((cliente) => (
            <TableRow key={cliente.id}>
              <TableCell className="font-medium">{cliente.id}</TableCell>
              <TableCell className="font-semibold">{cliente.codigo}</TableCell>
              <TableCell>{cliente.nombre}</TableCell>
              <TableCell>{cliente.ruc}</TableCell>
              <TableCell>{cliente.ciudad}, {cliente.departamento}</TableCell>
              <TableCell>{cliente.telefono}</TableCell>
              <TableCell>{cliente.email}</TableCell>
              <TableCell>
                <div className="text-sm">
                  <div className="font-medium">{cliente.contacto_nombre}</div>
                  <div className="text-gray-500">{cliente.contacto_telefono}</div>
                </div>
              </TableCell>
              <TableCell>{cliente.abre} - {cliente.cierra}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  cliente.estado === 'Activo' ? 'bg-green-100 text-green-800' :
                  cliente.estado === 'Suspendido' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {cliente.estado}
                </span>
              </TableCell>
              <TableCell>{cliente.latitud}</TableCell>
              <TableCell>{cliente.longitud}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
