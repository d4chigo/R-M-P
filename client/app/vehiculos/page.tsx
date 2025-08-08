"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, ArrowLeft, Truck } from 'lucide-react'
import Link from "next/link"
import { VehiculosTable } from "@/components/tables/vehiculos-table"
import { VehiculoForm } from "@/components/forms/vehiculo-form"

interface Vehiculo {
  id: number
  placa: string
  marca: string
  modelo: string
  anio: number
  tipo: string
  capacidad_carga_kg: number
  tipo_carga: string
  estado: string
  fecha_adquisicion: string
  vin: string
  id_carreta?: number
}

export default function VehiculosPage() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([
    {
      id: 1,
      placa: "ABC-123",
      marca: "Volvo",
      modelo: "FH16",
      anio: 2022,
      tipo: "Camión",
      capacidad_carga_kg: 25000,
      tipo_carga: "Carga General",
      estado: "Activo",
      fecha_adquisicion: "2022-01-15",
      vin: "YV2A2A18XCA123456",
      id_carreta: 1
    }
  ])

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleSubmit = (vehiculoData: Omit<Vehiculo, 'id'>) => {
    const newVehiculo: Vehiculo = {
      id: vehiculos.length + 1,
      ...vehiculoData
    }
    setVehiculos([...vehiculos, newVehiculo])
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
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestión de Vehículos</h1>
                <p className="text-gray-600">Administra la flota de vehículos de transporte</p>
              </div>
            </div>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Vehículo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Registrar Nuevo Vehículo</DialogTitle>
                <DialogDescription>
                  Complete todos los campos para registrar un nuevo vehículo en el sistema.
                </DialogDescription>
              </DialogHeader>
              <VehiculoForm 
                onSubmit={handleSubmit}
                onCancel={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Vehículos</CardTitle>
            <CardDescription>
              {vehiculos.length} vehículo{vehiculos.length !== 1 ? 's' : ''} registrado{vehiculos.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VehiculosTable vehiculos={vehiculos} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
