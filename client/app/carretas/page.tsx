"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, ArrowLeft, Package } from 'lucide-react'
import Link from "next/link"
import { CarretasTable } from "@/components/tables/carretas-table"
import { CarretaForm } from "@/components/forms/carreta-form"

interface Carreta {
  id: number
  placa: string
  tipo: string
  capacidad_kg: number
  estado: string
}

export default function CarretasPage() {
  const [carretas, setCarretas] = useState<Carreta[]>([
    {
      id: 1,
      placa: "REM-001",
      tipo: "Semirremolque",
      capacidad_kg: 30000,
      estado: "Activo"
    }
  ])

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleSubmit = (carretaData: Omit<Carreta, 'id'>) => {
    const newCarreta: Carreta = {
      id: carretas.length + 1,
      ...carretaData
    }
    setCarretas([...carretas, newCarreta])
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
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestión de Carretas</h1>
                <p className="text-gray-600">Administra las carretas y remolques</p>
              </div>
            </div>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Carreta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Registrar Nueva Carreta</DialogTitle>
                <DialogDescription>
                  Complete los campos para registrar una nueva carreta.
                </DialogDescription>
              </DialogHeader>
              <CarretaForm 
                onSubmit={handleSubmit}
                onCancel={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Carretas</CardTitle>
            <CardDescription>
              {carretas.length} carreta{carretas.length !== 1 ? 's' : ''} registrada{carretas.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CarretasTable carretas={carretas} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
