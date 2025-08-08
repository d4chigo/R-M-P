"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, ArrowLeft, Calendar } from 'lucide-react'
import Link from "next/link"
import { ViajesTable } from "@/components/tables/viajes-table"
import { ViajeForm } from "@/components/forms/viaje-form"

interface Viaje {
  id: number
  id_ruta: number
  id_vehiculo: number
  fecha: string
  ruta_nombre?: string
  vehiculo_placa?: string
}

export default function ViajesPage() {
  const [viajes, setViajes] = useState<Viaje[]>([
    {
      id: 1,
      id_ruta: 1,
      id_vehiculo: 1,
      fecha: "2024-02-15",
      ruta_nombre: "Chiclayo - Lima",
      vehiculo_placa: "ABC-123"
    }
  ])

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleSubmit = (viajeData: Omit<Viaje, 'id' | 'ruta_nombre' | 'vehiculo_placa'>) => {
    const newViaje: Viaje = {
      id: viajes.length + 1,
      ...viajeData,
      ruta_nombre: "Ruta " + viajeData.id_ruta,
      vehiculo_placa: "VEH-" + viajeData.id_vehiculo
    }
    setViajes([...viajes, newViaje])
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
              <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestión de Viajes</h1>
                <p className="text-gray-600">Programa y gestiona los viajes de transporte</p>
              </div>
            </div>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Viaje
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Programar Nuevo Viaje</DialogTitle>
                <DialogDescription>
                  Complete los campos para programar un nuevo viaje.
                </DialogDescription>
              </DialogHeader>
              <ViajeForm 
                onSubmit={handleSubmit}
                onCancel={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Viajes</CardTitle>
            <CardDescription>
              {viajes.length} viaje{viajes.length !== 1 ? 's' : ''} programado{viajes.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ViajesTable viajes={viajes} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
