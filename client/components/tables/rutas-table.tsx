import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TablePagination,
  usePagination,
} from "@/components/ui/table-pagination";

interface Ruta {
  id: number;
  codigo: string;
  nombre: string;
  origen: string;
  destino: string;
  distancia_km: number;
  duracion_aproximada: string;
  tipo_ruta: string;
  estado: string;
  fecha_creacion: string;
  ultima_actualizacion?: string;
}

interface RutasTableProps {
  rutas: Ruta[];
  initialPageSize?: number;
}

export function RutasTable({ rutas, initialPageSize = 10 }: RutasTableProps) {
  const {
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    paginatedData,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination(rutas, initialPageSize);
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Código</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Origen</TableHead>
              <TableHead>Destino</TableHead>
              <TableHead>Distancia (km)</TableHead>
              <TableHead>Duración</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha Creación</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((ruta) => (
              <TableRow key={ruta.id}>
                <TableCell className="font-medium">{ruta.id}</TableCell>
                <TableCell className="font-semibold">{ruta.codigo}</TableCell>
                <TableCell>{ruta.nombre}</TableCell>
                <TableCell>{ruta.origen}</TableCell>
                <TableCell>{ruta.destino}</TableCell>
                <TableCell>{ruta.distancia_km.toLocaleString()}</TableCell>
                <TableCell>{ruta.duracion_aproximada}</TableCell>
                <TableCell>{ruta.tipo_ruta}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      ruta.estado === "Activo"
                        ? "bg-green-100 text-green-800"
                        : ruta.estado === "En Mantenimiento"
                          ? "bg-yellow-100 text-yellow-800"
                          : ruta.estado === "Suspendido"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {ruta.estado}
                  </span>
                </TableCell>
                <TableCell>
                  {new Date(ruta.fecha_creacion).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
}
