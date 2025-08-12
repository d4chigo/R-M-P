"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Users2, Download, Filter, Moon, Sun } from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"

interface ClienteMultiplesRutas {
  fecha: string
  codigo_siscod_sap: string
  codigo_rs: string
  placa: string
  nro_entrega_pedido: string
  nro_cajas: number
}

export default function ClientesMultiplesRutasPage() {
  const [filtroFecha, setFiltroFecha] = useState("")
  const [filtroCodigo, setFiltroCodigo] = useState("")
  const { theme, setTheme } = useTheme()

  const [clientesMultiplesRutas] = useState<ClienteMultiplesRutas[]>([
    {
      fecha: "2024-02-15",
      codigo_siscod_sap: "CLI001-SAP",
      codigo_rs: "RS001",
      placa: "ABC-123",
      nro_entrega_pedido: "PED-2024-001",
      nro_cajas: 25,
    },
    {
      fecha: "2024-02-15",
      codigo_siscod_sap: "CLI001-SAP",
      codigo_rs: "RS001",
      placa: "DEF-456",
      nro_entrega_pedido: "PED-2024-002",
      nro_cajas: 18,
    },
    {
      fecha: "2024-02-15",
      codigo_siscod_sap: "CLI002-SAP",
      codigo_rs: "RS002",
      placa: "ABC-123",
      nro_entrega_pedido: "PED-2024-003",
      nro_cajas: 32,
    },
    {
      fecha: "2024-02-15",
      codigo_siscod_sap: "CLI002-SAP",
      codigo_rs: "RS002",
      placa: "GHI-789",
      nro_entrega_pedido: "PED-2024-004",
      nro_cajas: 15,
    },
    {
      fecha: "2024-02-16",
      codigo_siscod_sap: "CLI003-SAP",
      codigo_rs: "RS003",
      placa: "ABC-123",
      nro_entrega_pedido: "PED-2024-005",
      nro_cajas: 28,
    },
    {
      fecha: "2024-02-16",
      codigo_siscod_sap: "CLI003-SAP",
      codigo_rs: "RS003",
      placa: "DEF-456",
      nro_entrega_pedido: "PED-2024-006",
      nro_cajas: 22,
    },
  ])

  const clientesFiltrados = clientesMultiplesRutas.filter((cliente) => {
    const matchFecha = !filtroFecha || cliente.fecha.includes(filtroFecha)
    const matchCodigo = !filtroCodigo || cliente.codigo_siscod_sap.toLowerCase().includes(filtroCodigo.toLowerCase())
    return matchFecha && matchCodigo
  })

  const clientesAgrupados = clientesFiltrados.reduce(
    (acc, cliente) => {
      const key = cliente.codigo_siscod_sap
      if (!acc[key]) {
        acc[key] = {
          codigo: key,
          rutas: new Set(),
          pedidos: 0,
          cajas: 0,
        }
      }
      acc[key].rutas.add(cliente.placa)
      acc[key].pedidos += 1
      acc[key].cajas += cliente.nro_cajas
      return acc
    },
    {} as Record<string, any>,
  )

  const exportarExcel = () => {
    alert("Exportando a Excel...")
  }

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900`}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button
                variant="outline"
                size="sm"
                className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 bg-transparent"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
                <Users2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Clientes con Múltiples Rutas</h1>
                <p className="text-gray-600 dark:text-gray-300">Clientes atendidos en múltiples rutas</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button onClick={exportarExcel} className="dark:bg-blue-600 dark:hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Exportar Excel
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <Card className="mb-6 dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-gray-100">
              <Filter className="w-5 h-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="filtro-fecha" className="dark:text-gray-300">
                  Fecha
                </Label>
                <Input
                  id="filtro-fecha"
                  type="date"
                  value={filtroFecha}
                  onChange={(e) => setFiltroFecha(e.target.value)}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="filtro-codigo" className="dark:text-gray-300">
                  Código Cliente
                </Label>
                <Input
                  id="filtro-codigo"
                  value={filtroCodigo}
                  onChange={(e) => setFiltroCodigo(e.target.value)}
                  placeholder="Buscar por código..."
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                />
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFiltroFecha("")
                    setFiltroCodigo("")
                  }}
                  className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Limpiar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumen de clientes con múltiples rutas */}
        <Card className="mb-6 dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-gray-100">Resumen de Clientes con Múltiples Rutas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="dark:border-gray-700">
                    <TableHead className="dark:text-gray-300">Código Cliente</TableHead>
                    <TableHead className="dark:text-gray-300">Número de Rutas</TableHead>
                    <TableHead className="dark:text-gray-300">Total Pedidos</TableHead>
                    <TableHead className="dark:text-gray-300">Total Cajas</TableHead>
                    <TableHead className="dark:text-gray-300">Placas Utilizadas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.values(clientesAgrupados)
                    .filter((cliente: any) => cliente.rutas.size > 1)
                    .map((cliente: any, index) => (
                      <TableRow key={index} className="dark:border-gray-700 dark:hover:bg-gray-800">
                        <TableCell className="font-semibold dark:text-gray-100">{cliente.codigo}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded-full text-sm font-medium">
                            {cliente.rutas.size} rutas
                          </span>
                        </TableCell>
                        <TableCell className="text-center dark:text-gray-300">{cliente.pedidos}</TableCell>
                        <TableCell className="font-medium dark:text-gray-300">{cliente.cajas}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {Array.from(cliente.rutas).map((placa: any, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 rounded text-xs"
                              >
                                {placa}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-gray-100">Detalle Completo de Entregas</CardTitle>
            <CardDescription className="dark:text-gray-300">
              {clientesFiltrados.length} entrega{clientesFiltrados.length !== 1 ? "s" : ""} encontrada
              {clientesFiltrados.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="dark:border-gray-700">
                    <TableHead className="dark:text-gray-300">Fecha</TableHead>
                    <TableHead className="dark:text-gray-300">Código SISCOD/SAP</TableHead>
                    <TableHead className="dark:text-gray-300">Código RS</TableHead>
                    <TableHead className="dark:text-gray-300">Placa</TableHead>
                    <TableHead className="dark:text-gray-300">Nro de Entrega/Pedido</TableHead>
                    <TableHead className="dark:text-gray-300">Nro Cajas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientesFiltrados.map((cliente, index) => (
                    <TableRow key={index} className="dark:border-gray-700 dark:hover:bg-gray-800">
                      <TableCell className="dark:text-gray-300">
                        {new Date(cliente.fecha + "T00:00:00-05:00").toLocaleDateString("es-PE", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          timeZone: "America/Lima",
                        })}
                      </TableCell>
                      <TableCell className="font-semibold dark:text-gray-100">{cliente.codigo_siscod_sap}</TableCell>
                      <TableCell className="font-mono text-sm dark:text-gray-300">{cliente.codigo_rs}</TableCell>
                      <TableCell className="font-semibold dark:text-gray-100">{cliente.placa}</TableCell>
                      <TableCell className="font-mono text-sm dark:text-gray-300">
                        {cliente.nro_entrega_pedido}
                      </TableCell>
                      <TableCell className="text-center font-medium dark:text-gray-300">{cliente.nro_cajas}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
