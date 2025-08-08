"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, ArrowLeft, FileText } from 'lucide-react'
import Link from "next/link"
import { VisitasTable } from "@/components/tables/visitas-table"
import { VisitaForm } from "@/components/forms/visita-form"

interface Visita {
  id: number
  id_viaje: number
  id_cliente: number
  entrega: number
  recojo: number
  llega: string
  sale: string
  sec1: string
  sec2: string
  distancia_km?: string
  cliente_nombre?: string
  viaje_info?: string
}

export default function VisitasPage() {
  const [visitas, setVisitas] = useState<Visita[]>([
    {
      id: 1,
      id_viaje: 1,
      id_cliente: 1,
      entrega: 1500.50,
      recojo: 800.25,
      llega: "08:30",
      sale: "10:15",
      sec1: "SEC001",
      sec2: "SEC002",
      distancia_km: "25.5",
      cliente_nombre: "Distribuidora Central S.A.",
      viaje_info: "Chiclayo - Lima"
    }
  ])

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleSubmit = (visitaData: Omit<Visita, 'id' | 'cliente_nombre' | 'viaje_info'>) => {
    const newVisita: Visita = {
      id: visitas.length + 1,
      ...visitaData,
      cliente_nombre: "Cliente " + visitaData.id_cliente,
      viaje_info: "Viaje " + visitaData.id_viaje
    }
    setVisitas([...visitas, newVisita])
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
              <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestión de Visitas</h1>
                <p className="text-gray-600">Registra las visitas a clientes durante los viajes</p>
              </div>
            </div>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Visita
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Registrar Nueva Visita</DialogTitle>
                <DialogDescription>
                  Complete los campos para registrar una visita a cliente.
                </DialogDescription>
              </DialogHeader>
              <VisitaForm 
                onSubmit={handleSubmit}
                onCancel={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Visitas</CardTitle>
            <CardDescription>
              {visitas.length} visita{visitas.length !== 1 ? 's' : ''} registrada{visitas.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VisitasTable visitas={visitas} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
