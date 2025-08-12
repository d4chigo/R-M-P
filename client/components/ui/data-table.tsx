"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowUpDown, ArrowUp, ArrowDown, Edit, Trash2, Search, Calendar } from "lucide-react"

export interface Column<T> {
  key: keyof T | string
  header: string
  sortable?: boolean
  render?: (item: T) => React.ReactNode
  searchable?: boolean
}

export interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  searchPlaceholder?: string
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  showDateFilter?: boolean
  dateFilterKey?: keyof T
  searchKeys?: (keyof T)[]
}

type SortDirection = "asc" | "desc" | null

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchPlaceholder = "Buscar...",
  onEdit,
  onDelete,
  showDateFilter = false,
  dateFilterKey,
  searchKeys = [],
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)

  // Función para formatear fecha en zona horaria de Lima
  const formatDateForLima = (date: Date): string => {
    return date
      .toLocaleDateString("es-PE", {
        timeZone: "America/Lima",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .split("/")
      .reverse()
      .join("-") // Convierte DD/MM/YYYY a YYYY-MM-DD
  }

  // Función para mostrar fecha en formato peruano
  const formatDateForDisplay = (dateStr: string): string => {
    const [year, month, day] = dateStr.split("-")
    return `${day}/${month}/${year}`
  }

  const filteredAndSortedData = useMemo(() => {
    let filtered = data

    // Filtro de búsqueda
    if (searchTerm) {
      filtered = filtered.filter((item) => {
        const keysToSearch = searchKeys.length > 0 ? searchKeys : (Object.keys(item) as (keyof T)[])
        return keysToSearch.some((key) => {
          const value = item[key]
          return value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        })
      })
    }

    // Filtro de fecha mejorado
    if (dateFilter && dateFilterKey) {
      filtered = filtered.filter((item) => {
        const itemDate = item[dateFilterKey]
        if (!itemDate) return false

        let itemDateStr: string

        try {
          // Si la fecha ya está en formato YYYY-MM-DD
          if (typeof itemDate === "string" && itemDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
            itemDateStr = itemDate
          }
          // Si la fecha está en formato ISO (con hora)
          else if (typeof itemDate === "string" && itemDate.includes("T")) {
            itemDateStr = itemDate.split("T")[0]
          }
          // Para otros formatos de fecha
          else {
            // Crear fecha sin problemas de zona horaria
            const date = new Date(itemDate + "T00:00:00")
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, "0")
            const day = String(date.getDate()).padStart(2, "0")
            itemDateStr = `${year}-${month}-${day}`
          }
        } catch (error) {
          console.error("Error parsing date:", itemDate, error)
          return false
        }

        return itemDateStr === dateFilter
      })
    }

    // Ordenamiento
    if (sortColumn && sortDirection) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortColumn]
        const bValue = b[sortColumn]

        if (aValue === bValue) return 0

        const comparison = aValue < bValue ? -1 : 1
        return sortDirection === "asc" ? comparison : -comparison
      })
    }

    return filtered
  }, [data, searchTerm, dateFilter, sortColumn, sortDirection, searchKeys, dateFilterKey])

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : sortDirection === "desc" ? null : "asc")
      if (sortDirection === "desc") {
        setSortColumn(null)
      }
    } else {
      setSortColumn(columnKey)
      setSortDirection("asc")
    }
  }

  const getSortIcon = (columnKey: string) => {
    if (sortColumn !== columnKey) return <ArrowUpDown className="w-4 h-4" />
    if (sortDirection === "asc") return <ArrowUp className="w-4 h-4" />
    if (sortDirection === "desc") return <ArrowDown className="w-4 h-4" />
    return <ArrowUpDown className="w-4 h-4" />
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 mobile-input dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
          />
        </div>

        {showDateFilter && (
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-10 w-full sm:w-auto mobile-input dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            />
          </div>
        )}

        {(searchTerm || dateFilter) && (
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("")
              setDateFilter("")
            }}
            className="mobile-button dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Limpiar Filtros
          </Button>
        )}
      </div>

      {/* Información de resultados */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Mostrando {filteredAndSortedData.length} de {data.length} registros
        {searchTerm && ` para "${searchTerm}"`}
        {dateFilter && ` en fecha ${formatDateForDisplay(dateFilter)}`}
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto border rounded-lg dark:border-gray-700">
        <Table>
          <TableHeader>
            <TableRow className="dark:border-gray-700">
              {columns.map((column) => (
                <TableHead key={column.key as string} className="dark:text-gray-300">
                  {column.sortable ? (
                    <Button
                      variant="ghost"
                      onClick={() => handleSort(column.key as string)}
                      className="h-auto p-0 font-semibold hover:bg-transparent dark:text-gray-300 dark:hover:text-gray-100"
                    >
                      <span className="flex items-center gap-2">
                        {column.header}
                        {getSortIcon(column.key as string)}
                      </span>
                    </Button>
                  ) : (
                    column.header
                  )}
                </TableHead>
              ))}
              {(onEdit || onDelete) && <TableHead className="text-center dark:text-gray-300">Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedData.length === 0 ? (
              <TableRow className="dark:border-gray-700">
                <TableCell
                  colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
                  className="text-center py-8 text-gray-500 dark:text-gray-400"
                >
                  No se encontraron registros
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedData.map((item, index) => (
                <TableRow key={index} className="dark:border-gray-700 dark:hover:bg-gray-800">
                  {columns.map((column) => (
                    <TableCell key={column.key as string} className="dark:text-gray-300">
                      {column.render ? column.render(item) : item[column.key as keyof T]}
                    </TableCell>
                  ))}
                  {(onEdit || onDelete) && (
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        {onEdit && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(item)}
                            className="h-8 w-8 p-0 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDelete(item)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 dark:border-gray-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
