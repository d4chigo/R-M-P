"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, BarChart3, Download, Filter } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/ui/theme-toggle"

interface ResumenRuta {
  fecha: string
  placa: string
  vehiculo: string
  repartidor: string
  nro_viajes: number
  territorio: string
  distancia: number
  salida_cd: string
  llegada_cd: string
  tiempo: string
  nro_clientes: number
  nro_pedidos: number
  entrega_cf: number
  recojo_cf: number
  peso_kg: number
}

export default function ResumenRutasPage() {
  const [filtroFecha, setFiltroFecha] = useState("")
  const [filtroPlaca, setFiltroPlaca] = useState("")

  const [resumenRutas] = useState<ResumenRuta[]>([
    {
      fecha: "2024-02-15",
      placa: "ABC-123",
      vehiculo: "Volvo FH16",
      repartidor: "Carlos Mendoza",
      nro_viajes: 3,
      territorio: "Lima Norte",
      distancia: 145.5,
      salida_cd: "06:30",
      llegada_cd: "18:45",
      tiempo: "12:15",
      nro_clientes: 15,
      nro_pedidos: 28,
      entrega_cf: 15750.8,
      recojo_cf: 8420.5,
      peso_kg: 18500,
    },
    {
      fecha: "2024-02-15",
      placa: "DEF-456",
      vehiculo: "Mercedes Actros",
      repartidor: "Ana García",
      nro_viajes: 2,
      territorio: "Lima Sur",
      distancia: 98.2,
      salida_cd: "07:00",
      llegada_cd: "16:30",
      tiempo: "09:30",
      nro_clientes: 12,
      nro_pedidos: 22,
      entrega_cf: 12300.45,
      recojo_cf: 6750.25,
      peso_kg: 14200,
    },
    {
      fecha: "2024-02-16",
      placa: "ABC-123",
      vehiculo: "Volvo FH16",
      repartidor: "Carlos Mendoza",
      nro_viajes: 4,
      territorio: "Lima Este",
      distancia: 167.8,
      salida_cd: "06:15",
      llegada_cd: "19:20",
      tiempo: "13:05",
      nro_clientes: 18,
      nro_pedidos: 35,
      entrega_cf: 18950.75,
      recojo_cf: 9850.3,
      peso_kg: 21300,
    },
  ])

  const rutasFiltradas = resumenRutas.filter((ruta) => {
    const matchFecha = !filtroFecha || ruta.fecha.includes(filtroFecha)
    const matchPlaca = !filtroPlaca || ruta.placa.toLowerCase().includes(filtroPlaca.toLowerCase())
    return matchFecha && matchPlaca
  })

  const exportarExcel = () => {
    // Aquí iría la lógica para exportar a Excel
    alert("Exportando a Excel...")
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
              <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Resumen de Rutas</h1>
                <p className="text-gray-600 dark:text-gray-300">Análisis completo de rutas por fecha y vehículo</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button onClick={exportarExcel}>
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
                <Label htmlFor="filtro-placa" className="dark:text-gray-300">
                  Placa
                </Label>
                <Input
                  id="filtro-placa"
                  value={filtroPlaca}
                  onChange={(e) => setFiltroPlaca(e.target.value)}
                  placeholder="Buscar por placa..."
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                />
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFiltroFecha("")
                    setFiltroPlaca("")
                  }}
                  className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Limpiar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumen de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {rutasFiltradas.reduce((sum, ruta) => sum + ruta.nro_viajes, 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Total Viajes</div>
            </CardContent>
          </Card>
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {rutasFiltradas.reduce((sum, ruta) => sum + ruta.nro_clientes, 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Total Clientes</div>
            </CardContent>
          </Card>
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">
                {rutasFiltradas.reduce((sum, ruta) => sum + ruta.distancia, 0).toFixed(1)} km
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Distancia Total</div>
            </CardContent>
          </Card>
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">
                {rutasFiltradas.reduce((sum, ruta) => sum + ruta.peso_kg, 0).toLocaleString()} kg
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Peso Total</div>
            </CardContent>
          </Card>
        </div>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-gray-100">Resumen Detallado de Rutas</CardTitle>
            <CardDescription className="dark:text-gray-300">
              {rutasFiltradas.length} registro{rutasFiltradas.length !== 1 ? "s" : ""} encontrado
              {rutasFiltradas.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="dark:border-gray-700">
                    <TableHead className="dark:text-gray-300">Fecha</TableHead>
                    <TableHead className="dark:text-gray-300">Placa</TableHead>
                    <TableHead className="dark:text-gray-300">Vehículo</TableHead>
                    <TableHead className="dark:text-gray-300">Repartidor</TableHead>
                    <TableHead className="dark:text-gray-300">Nro Viajes</TableHead>
                    <TableHead className="dark:text-gray-300">Territorio</TableHead>
                    <TableHead className="dark:text-gray-300">Distancia</TableHead>
                    <TableHead className="dark:text-gray-300">Salida CD</TableHead>
                    <TableHead className="dark:text-gray-300">Llegada CD</TableHead>
                    <TableHead className="dark:text-gray-300">Tiempo</TableHead>
                    <TableHead className="dark:text-gray-300">Nro Clientes</TableHead>
                    <TableHead className="dark:text-gray-300">Nro Pedidos</TableHead>
                    <TableHead className="dark:text-gray-300">Entrega (CF)</TableHead>
                    <TableHead className="dark:text-gray-300">Recojo (CF)</TableHead>
                    <TableHead className="dark:text-gray-300">Peso (Kg)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rutasFiltradas.map((ruta, index) => (
                    <TableRow key={index} className="dark:border-gray-700 dark:hover:bg-gray-800">
                      <TableCell className="dark:text-gray-300">
                        {new Date(ruta.fecha).toLocaleDateString("es-PE", { timeZone: "America/Lima" })}
                      </TableCell>
                      <TableCell className="font-semibold dark:text-gray-100">{ruta.placa}</TableCell>
                      <TableCell className="dark:text-gray-300">{ruta.vehiculo}</TableCell>
                      <TableCell className="dark:text-gray-300">{ruta.repartidor}</TableCell>
                      <TableCell className="text-center dark:text-gray-300">{ruta.nro_viajes}</TableCell>
                      <TableCell className="dark:text-gray-300">{ruta.territorio}</TableCell>
                      <TableCell className="dark:text-gray-300">{ruta.distancia} km</TableCell>
                      <TableCell className="dark:text-gray-300">{ruta.salida_cd}</TableCell>
                      <TableCell className="dark:text-gray-300">{ruta.llegada_cd}</TableCell>
                      <TableCell className="dark:text-gray-300">{ruta.tiempo}</TableCell>
                      <TableCell className="text-center dark:text-gray-300">{ruta.nro_clientes}</TableCell>
                      <TableCell className="text-center dark:text-gray-300">{ruta.nro_pedidos}</TableCell>
                      <TableCell className="text-green-600 dark:text-green-400 font-medium">
                        {ruta.entrega_cf.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-blue-600 dark:text-blue-400 font-medium">
                        {ruta.recojo_cf.toLocaleString()}
                      </TableCell>
                      <TableCell className="font-medium dark:text-gray-300">{ruta.peso_kg.toLocaleString()}</TableCell>
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
