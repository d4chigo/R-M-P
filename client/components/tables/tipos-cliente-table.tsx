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

interface TipoCliente {
  id: number;
  nombre: string;
}

interface TiposClienteTableProps {
  tiposCliente: TipoCliente[];
  initialPageSize?: number;
}

export function TiposClienteTable({
  tiposCliente,
  initialPageSize = 10,
}: TiposClienteTableProps) {
  const {
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    paginatedData,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination(tiposCliente, initialPageSize);
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nombre</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((tipo) => (
              <TableRow key={tipo.id}>
                <TableCell className="font-medium">{tipo.id}</TableCell>
                <TableCell className="font-semibold">{tipo.nombre}</TableCell>
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
