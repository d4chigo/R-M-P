import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Cliente {
  id: number;
  nombre: string;
  codigo: string;
  id_tipo_cliente: number;
  id_ruta_pvta?: number;
  id_ruta_tvta?: number;
  ruc: string;
  ciudad: string;
  telefono: string;
  email: string;
  contacto_nombre: string;
  horario: string;
  estado: string;
  longitud: number;
  latitud: number;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

interface ClientesTableProps {
  clientes: Cliente[];
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {clientes.map((cliente) => (
            <TableRow key={cliente.id}>
              <TableCell className="font-medium">{cliente.id}</TableCell>
              <TableCell className="font-semibold">{cliente.codigo}</TableCell>
              <TableCell>{cliente.nombre}</TableCell>
              <TableCell>{cliente.ruc}</TableCell>
              <TableCell>{cliente.ciudad}</TableCell>
              <TableCell>{cliente.telefono}</TableCell>
              <TableCell>{cliente.email}</TableCell>
              <TableCell>{cliente.contacto_nombre}</TableCell>
              <TableCell>{cliente.horario}</TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    cliente.estado === "Activo"
                      ? "bg-green-100 text-green-800"
                      : cliente.estado === "Suspendido"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {cliente.estado}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
