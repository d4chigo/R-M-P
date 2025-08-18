"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  TablePagination,
  usePagination,
} from "@/components/ui/table-pagination";

interface ResumenRuta {
  Fecha: string;
  Placa: string;
  Vehiculo: string;
  Repartidor: string;
  "Estado Repartidor": string;
  "Nro de viajes": number;
  Zona: number;
  Distancia: number;
  "Salida del CD": string;
  "Llegada al CD": string;
  Tiempo: string;
  "Nro de clientes": number;
  "Nro de pedidos": number;
  "Entrega (CF)": number;
  "Recojo (CF)": number;
  "Peso (Kg)": number;
}

interface ResumenRutasTableProps {
  resumenData: ResumenRuta[];
  initialPageSize?: number;
  loading?: boolean;
  isLoadingData?: boolean;
}

export function ResumenRutasTable({
  resumenData,
  initialPageSize = 15,
  loading = false,
  isLoadingData = false,
}: ResumenRutasTableProps) {
  const {
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    paginatedData,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination(resumenData, initialPageSize);

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("es-PE", {
        timeZone: "America/Lima",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return "-";

    // Si es un valor TIME de MySQL (formato HH:MM:SS)
    if (
      typeof timeString === "string" &&
      timeString.match(/^\d{1,2}:\d{2}:\d{2}$/)
    ) {
      // Retornar solo HH:MM
      return timeString.substring(0, 5);
    }

    // Si es un timestamp completo, intentar parsearlo
    try {
      return new Date(timeString).toLocaleTimeString("es-PE", {
        timeZone: "America/Lima",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch {
      return timeString;
    }
  };

  const formatNumber = (value: number | string) => {
    if (value == null || value === "") return "0.00";
    const num = typeof value === "string" ? parseFloat(value) : value;
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  if (loading || isLoadingData) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2">
          {isLoadingData ? "Actualizando datos..." : "Cargando datos..."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Placa</TableHead>
              <TableHead>Vehículo</TableHead>
              <TableHead>Repartidor</TableHead>
              <TableHead className="text-center">Viajes</TableHead>
              <TableHead className="text-center">Zona</TableHead>
              <TableHead className="text-right">Distancia</TableHead>
              <TableHead>Salida CD</TableHead>
              <TableHead>Llegada CD</TableHead>
              <TableHead>Tiempo</TableHead>
              <TableHead className="text-center">Clientes</TableHead>
              <TableHead className="text-center">Pedidos</TableHead>
              <TableHead className="text-right">Entrega (CF)</TableHead>
              <TableHead className="text-right">Recojo (CF)</TableHead>
              <TableHead className="text-right">Peso (Kg)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((row, index) => (
              <TableRow key={index} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  {formatDate(row.Fecha)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-mono">
                    {row.Placa}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{row.Vehiculo}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">{row.Repartidor}</div>
                    <div className="text-xs text-muted-foreground">
                      {row["Estado Repartidor"]}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center font-medium">
                  <Badge variant="secondary">{row["Nro de viajes"]}</Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant={row.Zona > 0 ? "default" : "secondary"}
                    className={row.Zona > 0 ? "bg-blue-100 text-blue-800" : ""}
                  >
                    {row.Zona || 0}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatNumber(row.Distancia)} km
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {formatTime(row["Salida del CD"])}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {formatTime(row["Llegada al CD"])}
                </TableCell>
                <TableCell className="font-mono text-sm font-medium">
                  {formatTime(row.Tiempo)}
                </TableCell>
                <TableCell className="text-center">
                  <span className="font-medium text-green-700 dark:text-green-400">
                    {row["Nro de clientes"]}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="font-medium text-blue-700 dark:text-blue-400">
                    {row["Nro de pedidos"]}
                  </span>
                </TableCell>
                <TableCell className="text-right font-medium text-green-600">
                  {formatNumber(row["Entrega (CF)"])}
                </TableCell>
                <TableCell className="text-right font-medium text-orange-600">
                  {formatNumber(row["Recojo (CF)"])}
                </TableCell>
                <TableCell className="text-right font-medium text-purple-600">
                  {formatNumber(row["Peso (Kg)"])}
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
        pageSizeOptions={[10, 15, 25, 50]}
        showPageSizeSelector={true}
        showPageInfo={true}
      />
    </div>
  );
}
