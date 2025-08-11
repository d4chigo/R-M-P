"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Users2, Download, Filter } from 'lucide-react'
import Link from "next/link"

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

  const [clientesMultiplesRutas] = useState<ClienteMultiplesRutas[]>([
    {
      fecha: "2024-02-15",
      codigo_siscod_sap: "CLI001-SAP",
      codigo_rs: "RS001",
      placa: "ABC-123",
      nro_entrega_pedido: "PED-2024-001",
      nro_cajas: 25
    },
    {
      fecha: "2024-02-15",
      codigo_siscod_sap: "CLI001-SAP",
      codigo_rs: "RS001",
      placa: "DEF-456",
      nro_entrega_pedido: "PED-2024-002",
      nro_cajas: 18
    },
    {
      fecha: "2024-02-15",
      codigo_siscod_sap: "CLI002-SAP",
      codigo_rs: "RS002",
      placa: "ABC-123",
      nro_entrega_pedido: "PED-2024-003",
      nro_cajas: 32
    },
    {
      fecha: "2024-02-15",
      codigo_siscod_sap: "CLI002-SAP",
      codigo_rs: "RS002",
      placa: "GHI-789",
      nro_entrega_pedido: "PED-2024-004",
      nro_cajas: 15
    },
    {
      fecha: "2024-02-16",
      codigo_siscod_sap: "CLI003-SAP",
      codigo_rs: "RS003",
      placa: "ABC-123",
      nro_entrega_pedido: "PED-2024-005",
      nro_cajas: 28
    },
    {
      fecha: "2024-02-16",
      codigo_siscod_sap: "CLI003-SAP",
      codigo_rs: "RS003",
      placa: "DEF-456",
      nro_entrega_pedido: "PED-2024-006",
      nro_cajas: 22
    }
  ])

  const clientesFiltrados = clientesMultiplesRutas.filter(cliente => {
    const matchFecha = !filtroFecha || cliente.fecha.includes(filtroFecha)
    const matchCodigo = !filtroCodigo || cliente.codigo_siscod_sap.toLowerCase().includes(filtroCodigo.toLowerCase())
    return matchFecha && matchCodigo
  })

  // Agrupar por cliente para mostrar estadísticas
  const clientesAgrupados = clientesFiltrados.reduce((acc, cliente) => {
    const key = cliente.codigo_siscod_sap
    if (!acc[key]) {
      acc[key] = {
        codigo: key,
        rutas: new Set(),
        pedidos: 0,
        cajas: 0
      }
    }
    acc[key].rutas.add(cliente.placa)
    acc[key].pedidos += 1
    acc[key].cajas += cliente.nro_cajas
    return acc
  }, {} as Record<string, any>)

  const exportarExcel = () => {
    alert("Exportando a Excel...")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
                <Users2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Clientes con Múltiples Rutas</h1>
                <p className="text-gray-600">Clientes atendidos en múltiples rutas</p>
              </div>
            </div>
          </div>
          
          <Button onClick={exportarExcel}>
            <Download className="w-4 h-4 mr-2" />
            Exportar Excel
          </Button>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="filtro-fecha">Fecha</Label>
                <Input
                  id="filtro-fecha"
                  type="date"
                  value={filtroFecha}
                  onChange={(e) => setFiltroFecha(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="filtro-codigo">Código Cliente</Label>
                <Input
                  id="filtro-codigo"
                  value={filtroCodigo}
                  onChange={(e) => setFiltroCodigo(e.target.value)}
                  placeholder="Buscar por código..."
                />
              </div>
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setFiltroFecha("")
                    setFiltroCodigo("")
                  }}
                >
                  Limpiar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumen de clientes con múltiples rutas */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Resumen de Clientes con Múltiples Rutas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código Cliente</TableHead>
                    <TableHead>Número de Rutas</TableHead>
                    <TableHead>Total Pedidos</TableHead>
                    <TableHead>Total Cajas</TableHead>
                    <TableHead>Placas Utilizadas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.values(clientesAgrupados)
                    .filter((cliente: any) => cliente.rutas.size > 1)
                    .map((cliente: any, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-semibold">{cliente.codigo}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {cliente.rutas.size} rutas
                        </span>
                      </TableCell>
                      <TableCell className="text-center">{cliente.pedidos}</TableCell>
                      <TableCell className="font-medium">{cliente.cajas}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {Array.from(cliente.rutas).map((placa: any, i) => (
                            <span key={i} className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
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

        <Card>
          <CardHeader>
            <CardTitle>Detalle Completo de Entregas</CardTitle>
            <CardDescription>
              {clientesFiltrados.length} entrega{clientesFiltrados.length !== 1 ? 's' : ''} encontrada{clientesFiltrados.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Código SISCOD/SAP</TableHead>
                    <TableHead>Código RS</TableHead>
                    <TableHead>Placa</TableHead>
                    <TableHead>Nro de Entrega/Pedido</TableHead>
                    <TableHead>Nro Cajas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientesFiltrados.map((cliente, index) => (
                    <TableRow key={index}>
                      <TableCell>{new Date(cliente.fecha).toLocaleDateString()}</TableCell>
                      <TableCell className="font-semibold">{cliente.codigo_siscod_sap}</TableCell>
                      <TableCell className="font-mono text-sm">{cliente.codigo_rs}</TableCell>
                      <TableCell className="font-semibold">{cliente.placa}</TableCell>
                      <TableCell className="font-mono text-sm">{cliente.nro_entrega_pedido}</TableCell>
                      <TableCell className="text-center font-medium">{cliente.nro_cajas}</TableCell>
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
