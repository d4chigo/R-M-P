"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Clock, Download, Filter, CheckCircle, XCircle } from 'lucide-react'
import Link from "next/link"

interface CumplimientoVH {
  fecha: string
  placa: string
  codigo_cliente: string
  cliente: string
  open: string
  close: string
  arrive: string
  leave: string
  idr: string
  fuera_vh: boolean
}

export default function CumplimientoVHPage() {
  const [filtroFecha, setFiltroFecha] = useState("")
  const [filtroPlaca, setFiltroPlaca] = useState("")

  const [cumplimientoVH] = useState<CumplimientoVH[]>([
    {
      fecha: "2024-02-15",
      placa: "ABC-123",
      codigo_cliente: "CLI001",
      cliente: "Distribuidora Central S.A.",
      open: "08:00",
      close: "18:00",
      arrive: "09:30",
      leave: "10:15",
      idr: "IDR001",
      fuera_vh: false
    },
    {
      fecha: "2024-02-15",
      placa: "ABC-123",
      codigo_cliente: "CLI002",
      cliente: "Comercial Norte EIRL",
      open: "09:00",
      close: "17:00",
      arrive: "18:30",
      leave: "19:00",
      idr: "IDR002",
      fuera_vh: true
    },
    {
      fecha: "2024-02-15",
      placa: "DEF-456",
      codigo_cliente: "CLI003",
      cliente: "Logística Sur SAC",
      open: "07:30",
      close: "16:30",
      arrive: "11:45",
      leave: "12:30",
      idr: "IDR003",
      fuera_vh: false
    },
    {
      fecha: "2024-02-15",
      placa: "DEF-456",
      codigo_cliente: "CLI004",
      cliente: "Almacenes del Centro",
      open: "10:00",
      close: "19:00",
      arrive: "08:30",
      leave: "09:15",
      idr: "IDR004",
      fuera_vh: true
    },
    {
      fecha: "2024-02-16",
      placa: "ABC-123",
      codigo_cliente: "CLI005",
      cliente: "Distribuciones Lima",
      open: "08:30",
      close: "17:30",
      arrive: "14:00",
      leave: "14:45",
      idr: "IDR005",
      fuera_vh: false
    }
  ])

  const cumplimientoFiltrado = cumplimientoVH.filter(item => {
    const matchFecha = !filtroFecha || item.fecha.includes(filtroFecha)
    const matchPlaca = !filtroPlaca || item.placa.toLowerCase().includes(filtroPlaca.toLowerCase())
    return matchFecha && matchPlaca
  })

  const totalVisitas = cumplimientoFiltrado.length
  const visitasDentroVH = cumplimientoFiltrado.filter(item => !item.fuera_vh).length
  const visitasFueraVH = cumplimientoFiltrado.filter(item => item.fuera_vh).length
  const porcentajeCumplimiento = totalVisitas > 0 ? ((visitasDentroVH / totalVisitas) * 100).toFixed(1) : "0"

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
              <div className="w-10 h-10 bg-violet-500 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Cumplimiento de Ventanas Horarias</h1>
                <p className="text-gray-600">Análisis de cumplimiento de horarios de atención</p>
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
                <Label htmlFor="filtro-placa">Placa</Label>
                <Input
                  id="filtro-placa"
                  value={filtroPlaca}
                  onChange={(e) => setFiltroPlaca(e.target.value)}
                  placeholder="Buscar por placa..."
                />
              </div>
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setFiltroFecha("")
                    setFiltroPlaca("")
                  }}
                >
                  Limpiar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Métricas de cumplimiento */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{totalVisitas}</div>
              <div className="text-sm text-gray-600">Total Visitas</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{visitasDentroVH}</div>
              <div className="text-sm text-gray-600">Dentro de VH</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{visitasFueraVH}</div>
              <div className="text-sm text-gray-600">Fuera de VH</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{porcentajeCumplimiento}%</div>
              <div className="text-sm text-gray-600">% Cumplimiento</div>
            </CardContent>
          </Card>
        </div>

        {/* Indicador visual de cumplimiento */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Indicador de Cumplimiento General</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className={`h-4 rounded-full ${
                      parseFloat(porcentajeCumplimiento) >= 90 ? 'bg-green-500' :
                      parseFloat(porcentajeCumplimiento) >= 70 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${porcentajeCumplimiento}%` }}
                  />
                </div>
              </div>
              <div className="text-lg font-semibold">
                {porcentajeCumplimiento}% de cumplimiento
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {parseFloat(porcentajeCumplimiento) >= 90 ? 'Excelente cumplimiento' :
               parseFloat(porcentajeCumplimiento) >= 70 ? 'Buen cumplimiento, puede mejorar' :
               'Requiere atención inmediata'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detalle de Cumplimiento de Ventanas Horarias</CardTitle>
            <CardDescription>
              {cumplimientoFiltrado.length} visita{cumplimientoFiltrado.length !== 1 ? 's' : ''} encontrada{cumplimientoFiltrado.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Placa</TableHead>
                    <TableHead>Código Cliente</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Ventana Horaria</TableHead>
                    <TableHead>Horario Real</TableHead>
                    <TableHead>IDR</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fuera de VH?</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cumplimientoFiltrado.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{new Date(item.fecha).toLocaleDateString()}</TableCell>
                      <TableCell className="font-semibold">{item.placa}</TableCell>
                      <TableCell className="font-mono text-sm">{item.codigo_cliente}</TableCell>
                      <TableCell>{item.cliente}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{item.open} - {item.close}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>Llegada: <span className="font-medium">{item.arrive}</span></div>
                          <div>Salida: <span className="font-medium">{item.leave}</span></div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{item.idr}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {item.fuera_vh ? (
                            <XCircle className="w-5 h-5 text-red-500" />
                          ) : (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          )}
                          <span className={`text-sm font-medium ${
                            item.fuera_vh ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {item.fuera_vh ? 'Incumplido' : 'Cumplido'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.fuera_vh ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {item.fuera_vh ? 'SÍ' : 'NO'}
                        </span>
                      </TableCell>
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
