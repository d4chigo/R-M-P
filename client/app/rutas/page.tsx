"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, ArrowLeft, Route } from 'lucide-react'
import Link from "next/link"
import { RutasTable } from "@/components/tables/rutas-table"
import { RutaForm } from "@/components/forms/ruta-form"

interface Ruta {
  id: number
  codigo: string
  nombre: string
  origen: string
  destino: string
  distancia_km: number
  duracion_aproximada: string
  tipo_ruta: string
  estado: string
  fecha_creacion: string
  ultima_actualizacion?: string
}

export default function RutasPage() {
  const [rutas, setRutas] = useState<Ruta[]>([
    {
      id: 1,
      codigo: "RUT001",
      nombre: "Chiclayo - Lima",
      origen: "Chiclayo",
      destino: "Lima",
      distancia_km: 1009,
      duracion_aproximada: "14:30:00",
      tipo_ruta: "Nacional",
      estado: "Activo",
      fecha_creacion: "2025-01-15T10:30:00"
    }
  ])

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleSubmit = (rutaData: Omit<Ruta, 'id' | 'fecha_creacion' | 'ultima_actualizacion'>) => {
    const newRuta: Ruta = {
      id: rutas.length + 1,
      ...rutaData,
      fecha_creacion: new Date().toISOString()
    }
    setRutas([...rutas, newRuta])
    setIsDialogOpen(false)
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
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                <Route className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestión de Rutas</h1>
                <p className="text-gray-600">Administra las rutas de transporte</p>
              </div>
            </div>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Ruta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Registrar Nueva Ruta</DialogTitle>
                <DialogDescription>
                  Complete los campos para registrar una nueva ruta de transporte.
                </DialogDescription>
              </DialogHeader>
              <RutaForm 
                onSubmit={handleSubmit}
                onCancel={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Rutas</CardTitle>
            <CardDescription>
              {rutas.length} ruta{rutas.length !== 1 ? 's' : ''} registrada{rutas.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RutasTable rutas={rutas} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
