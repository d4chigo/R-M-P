import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Vehiculo {
  id: number
  placa: string
  marca: string
  modelo: string
  anio: number
  tipo: string
  capacidad_carga_kg: number
  tipo_carga: string
  estado: string
  fecha_adquisicion: string
  vin: string
  id_carreta?: number
}

interface VehiculosTableProps {
  vehiculos: Vehiculo[]
}

export function VehiculosTable({ vehiculos }: VehiculosTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Placa</TableHead>
            <TableHead>Marca/Modelo</TableHead>
            <TableHead>Año</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Capacidad (kg)</TableHead>
            <TableHead>Tipo Carga</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha Adquisición</TableHead>
            <TableHead>VIN</TableHead>
            <TableHead>ID Carreta</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehiculos.map((vehiculo) => (
            <TableRow key={vehiculo.id}>
              <TableCell className="font-medium">{vehiculo.id}</TableCell>
              <TableCell className="font-semibold">{vehiculo.placa}</TableCell>
              <TableCell>{vehiculo.marca} {vehiculo.modelo}</TableCell>
              <TableCell>{vehiculo.anio}</TableCell>
              <TableCell>{vehiculo.tipo}</TableCell>
              <TableCell>{vehiculo.capacidad_carga_kg.toLocaleString()}</TableCell>
              <TableCell>{vehiculo.tipo_carga}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  vehiculo.estado === 'Activo' ? 'bg-green-100 text-green-800' :
                  vehiculo.estado === 'Mantenimiento' ? 'bg-yellow-100 text-yellow-800' :
                  vehiculo.estado === 'Inactivo' ? 'bg-gray-100 text-gray-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {vehiculo.estado}
                </span>
              </TableCell>
              <TableCell>{new Date(vehiculo.fecha_adquisicion).toLocaleDateString()}</TableCell>
              <TableCell className="font-mono text-xs">{vehiculo.vin}</TableCell>
              <TableCell>{vehiculo.id_carreta || '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
