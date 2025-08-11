"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, TrendingUp, Download, Filter } from 'lucide-react'
import Link from "next/link"

interface RutaPorViaje {
  fecha: string
  cod_rs_tipo_veh: string
  tipo_vehiculo: string
  placa: string
  repartidor: string
  nro_viaje: number
  nro_clientes: number
  entrega_cf: number
  recojo_cf: number
  peso_kg: number
  capac_kg: number
  porc_capacidad_uso_kg: number
  capac_cajas: number
  porc_capacidad_uso_cajas: number
  distancia_recorrida: number
  salida_cd: string
  llegada_cd: string
  tiempo_viaje: string
  tiempo_manejo: string
  tiempo_servicio: string
  recarga: string
  refrigerio: string
  total_viajes: number
  tipo_viaje: string
}

export default function RutasPorViajePage() {
  const [filtroFecha, setFiltroFecha] = useState("")
  const [filtroPlaca, setFiltroPlaca] = useState("")

  const [rutasPorViaje] = useState<RutaPorViaje[]>([
    {
      fecha: "2024-02-15",
      cod_rs_tipo_veh: "CAM001",
      tipo_vehiculo: "Camión",
      placa: "ABC-123",
      repartidor: "Carlos Mendoza",
      nro_viaje: 1,
      nro_clientes: 8,
      entrega_cf: 8500.50,
      recojo_cf: 4200.25,
      peso_kg: 12500,
      capac_kg: 25000,
      porc_capacidad_uso_kg: 50.0,
      capac_cajas: 150,
      porc_capacidad_uso_cajas: 65.3,
      distancia_recorrida: 85.2,
      salida_cd: "06:30",
      llegada_cd: "12:45",
      tiempo_viaje: "06:15",
      tiempo_manejo: "04:30",
      tiempo_servicio: "01:30",
      recarga: "00:15",
      refrigerio: "00:30",
      total_viajes: 3,
      tipo_viaje: "Distribución"
    },
    {
      fecha: "2024-02-15",
      cod_rs_tipo_veh: "CAM001",
      tipo_vehiculo: "Camión",
      placa: "ABC-123",
      repartidor: "Carlos Mendoza",
      nro_viaje: 2,
      nro_clientes: 5,
      entrega_cf: 5200.30,
      recojo_cf: 2800.15,
      peso_kg: 8200,
      capac_kg: 25000,
      porc_capacidad_uso_kg: 32.8,
      capac_cajas: 150,
      porc_capacidad_uso_cajas: 42.7,
      distancia_recorrida: 45.8,
      salida_cd: "13:30",
      llegada_cd: "16:15",
      tiempo_viaje: "02:45",
      tiempo_manejo: "02:15",
      tiempo_servicio: "00:30",
      recarga: "00:00",
      refrigerio: "00:00",
      total_viajes: 3,
      tipo_viaje: "Distribución"
    },
    {
      fecha: "2024-02-15",
      cod_rs_tipo_veh: "TRA002",
      tipo_vehiculo: "Tractocamión",
      placa: "DEF-456",
      repartidor: "Ana García",
      nro_viaje: 1,
      nro_clientes: 12,
      entrega_cf: 12300.45,
      recojo_cf: 6750.25,
      peso_kg: 28500,
      capac_kg: 35000,
      porc_capacidad_uso_kg: 81.4,
      capac_cajas: 200,
      porc_capacidad_uso_cajas: 78.5,
      distancia_recorrida: 98.2,
      salida_cd: "07:00",
      llegada_cd: "16:30",
      tiempo_viaje: "09:30",
      tiempo_manejo: "06:45",
      tiempo_servicio: "02:15",
      recarga: "00:30",
      refrigerio: "00:45",
      total_viajes: 2,
      tipo_viaje: "Larga Distancia"
    }
  ])

  const rutasFiltradas = rutasPorViaje.filter(ruta => {
    const matchFecha = !filtroFecha || ruta.fecha.includes(filtroFecha)
    const matchPlaca = !filtroPlaca || ruta.placa.toLowerCase().includes(filtroPlaca.toLowerCase())
    return matchFecha && matchPlaca
  })

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
              <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Rutas por Viaje</h1>
                <p className="text-gray-600">Detalle de capacidad y rendimiento por viaje</p>
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

        {/* Métricas de rendimiento */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {(rutasFiltradas.reduce((sum, ruta) => sum + ruta.porc_capacidad_uso_kg, 0) / rutasFiltradas.length || 0).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Promedio Uso Capacidad</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {rutasFiltradas.reduce((sum, ruta) => sum + ruta.distancia_recorrida, 0).toFixed(1)} km
              </div>
              <div className="text-sm text-gray-600">Distancia Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">
                {rutasFiltradas.reduce((sum, ruta) => sum + ruta.nro_clientes, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Clientes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">
                {rutasFiltradas.length}
              </div>
              <div className="text-sm text-gray-600">Total Viajes</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Detalle de Rutas por Viaje</CardTitle>
            <CardDescription>
              {rutasFiltradas.length} viaje{rutasFiltradas.length !== 1 ? 's' : ''} encontrado{rutasFiltradas.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Cod RS Tipo Veh</TableHead>
                    <TableHead>Tipo Vehículo</TableHead>
                    <TableHead>Placa</TableHead>
                    <TableHead>Repartidor</TableHead>
                    <TableHead>Nro Viaje</TableHead>
                    <TableHead>Nro Clientes</TableHead>
                    <TableHead>Entrega (CF)</TableHead>
                    <TableHead>Recojo (CF)</TableHead>
                    <TableHead>Peso (Kg)</TableHead>
                    <TableHead>Capac. (Kg)</TableHead>
                    <TableHead>% Capacidad Uso (Kg)</TableHead>
                    <TableHead>Capac. (Cajas)</TableHead>
                    <TableHead>% Capacidad Uso (Cajas)</TableHead>
                    <TableHead>Distancia</TableHead>
                    <TableHead>Salida CD</TableHead>
                    <TableHead>Llegada CD</TableHead>
                    <TableHead>Tiempo Viaje</TableHead>
                    <TableHead>Tiempo Manejo</TableHead>
                    <TableHead>Tiempo Servicio</TableHead>
                    <TableHead>Tipo Viaje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rutasFiltradas.map((ruta, index) => (
                    <TableRow key={index}>
                      <TableCell>{new Date(ruta.fecha).toLocaleDateString()}</TableCell>
                      <TableCell className="font-mono text-xs">{ruta.cod_rs_tipo_veh}</TableCell>
                      <TableCell>{ruta.tipo_vehiculo}</TableCell>
                      <TableCell className="font-semibold">{ruta.placa}</TableCell>
                      <TableCell>{ruta.repartidor}</TableCell>
                      <TableCell className="text-center font-medium">{ruta.nro_viaje}</TableCell>
                      <TableCell className="text-center">{ruta.nro_clientes}</TableCell>
                      <TableCell className="text-green-600 font-medium">
                        {ruta.entrega_cf.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-blue-600 font-medium">
                        {ruta.recojo_cf.toLocaleString()}
                      </TableCell>
                      <TableCell>{ruta.peso_kg.toLocaleString()}</TableCell>
                      <TableCell>{ruta.capac_kg.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-12 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                ruta.porc_capacidad_uso_kg >= 80 ? 'bg-red-500' :
                                ruta.porc_capacidad_uso_kg >= 60 ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(ruta.porc_capacidad_uso_kg, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{ruta.porc_capacidad_uso_kg}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{ruta.capac_cajas}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-12 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                ruta.porc_capacidad_uso_cajas >= 80 ? 'bg-red-500' :
                                ruta.porc_capacidad_uso_cajas >= 60 ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(ruta.porc_capacidad_uso_cajas, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{ruta.porc_capacidad_uso_cajas}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{ruta.distancia_recorrida} km</TableCell>
                      <TableCell>{ruta.salida_cd}</TableCell>
                      <TableCell>{ruta.llegada_cd}</TableCell>
                      <TableCell>{ruta.tiempo_viaje}</TableCell>
                      <TableCell>{ruta.tiempo_manejo}</TableCell>
                      <TableCell>{ruta.tiempo_servicio}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          ruta.tipo_viaje === 'Larga Distancia' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {ruta.tipo_viaje}
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
