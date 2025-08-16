"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import {
  TablePagination,
  usePagination,
} from "@/components/ui/table-pagination";
import type { Cliente } from "@/hooks/use-clientes";

interface ClientesTableProps {
  clientes: Cliente[];
  onEdit?: (cliente: Cliente) => void;
  onDelete?: (id: number) => void;
  onView?: (cliente: Cliente) => void;
  onToggleActivo?: (id: number, currentActivo: boolean) => void;
  isLoading?: boolean;
  initialPageSize?: number;
}

export function ClientesTable({
  clientes,
  onEdit,
  onDelete,
  onView,
  onToggleActivo,
  isLoading = false,
  initialPageSize = 10,
}: ClientesTableProps) {
  const [sortField, setSortField] = useState<string>("nombre");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedClientes = [...clientes].sort((a, b) => {
    let aValue: any = a[sortField as keyof Cliente];
    let bValue: any = b[sortField as keyof Cliente];

    // Handle null/undefined values
    if (aValue == null) aValue = "";
    if (bValue == null) bValue = "";

    // Convert to string for comparison
    aValue = String(aValue).toLowerCase();
    bValue = String(bValue).toLowerCase();

    if (sortDirection === "asc") {
      return aValue.localeCompare(bValue);
    } else {
      return bValue.localeCompare(aValue);
    }
  });

  const {
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    paginatedData,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination(sortedClientes, initialPageSize);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }

  if (clientes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No se encontraron clientes</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {/* Campo ID comentado */}
              {/*
      <TableHead
        className="cursor-pointer hover:bg-muted/50"
        onClick={() => handleSort("id_cliente")}
      >
        ID
        {sortField === "id_cliente" && (
          <span className="ml-1">
            {sortDirection === "asc" ? "↑" : "↓"}
          </span>
        )}
      </TableHead>
      */}
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("codigo")}
              >
                Código
                {sortField === "codigo" && (
                  <span className="ml-1">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("nombre")}
              >
                Nombre
                {sortField === "nombre" && (
                  <span className="ml-1">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </TableHead>
              <TableHead>Dirección</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("zona_nombre")}
              >
                Zona
                {sortField === "zona_nombre" && (
                  <span className="ml-1">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("activo")}
              >
                Estado
                {sortField === "activo" && (
                  <span className="ml-1">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("created_at")}
              >
                Creado
                {sortField === "created_at" && (
                  <span className="ml-1">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </TableHead>
              <TableHead className="w-[50px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedData.map((cliente) => (
              <TableRow key={cliente.id_cliente} className="hover:bg-muted/50">
                {/* Campo ID comentado */}
                {/*
            <TableCell className="font-medium">
              {cliente.id_cliente}
            </TableCell>
            */}
                <TableCell className="font-mono font-semibold">
                  {cliente.codigo}
                </TableCell>
                <TableCell className="font-medium">{cliente.nombre}</TableCell>
                <TableCell className="max-w-[200px]">
                  <div
                    className="truncate"
                    title={cliente.direccion || "Sin dirección"}
                  >
                    {cliente.direccion || (
                      <span className="text-muted-foreground italic">
                        Sin dirección
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {cliente.zona_nombre ? (
                    <div className="space-y-1">
                      <div className="font-medium">{cliente.zona_nombre}</div>
                      {cliente.zona_codigo && (
                        <div className="text-sm text-muted-foreground font-mono">
                          {cliente.zona_codigo}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground italic">
                      Sin zona
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={cliente.activo ? "default" : "secondary"}
                    className={
                      cliente.activo
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }
                  >
                    {cliente.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(cliente.created_at)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menú</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onView && (
                        <DropdownMenuItem onClick={() => onView(cliente)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalles
                        </DropdownMenuItem>
                      )}
                      {onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(cliente)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                      )}
                      {onToggleActivo && (
                        <DropdownMenuItem
                          onClick={() =>
                            onToggleActivo(cliente.id_cliente!, cliente.activo)
                          }
                        >
                          {cliente.activo ? (
                            <>
                              <ToggleLeft className="mr-2 h-4 w-4" />
                              Desactivar
                            </>
                          ) : (
                            <>
                              <ToggleRight className="mr-2 h-4 w-4" />
                              Activar
                            </>
                          )}
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <DropdownMenuItem
                          onClick={() => onDelete(cliente.id_cliente!)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
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
