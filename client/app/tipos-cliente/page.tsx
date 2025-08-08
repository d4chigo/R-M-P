"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, ArrowLeft, UserCheck } from 'lucide-react'
import Link from "next/link"
import { TiposClienteTable } from "@/components/tables/tipos-cliente-table"
import { TipoClienteForm } from "@/components/forms/tipo-cliente-form"

interface TipoCliente {
  id: number
  nombre: string
}

export default function TiposClientePage() {
  const [tiposCliente, setTiposCliente] = useState<TipoCliente[]>([
    { id: 1, nombre: "Mayorista" },
    { id: 2, nombre: "Minorista" },
    { id: 3, nombre: "Distribuidor" },
    { id: 4, nombre: "Corporativo" }
  ])

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleSubmit = (tipoClienteData: Omit<TipoCliente, 'id'>) => {
    const newTipoCliente: TipoCliente = {
      id: tiposCliente.length + 1,
      ...tipoClienteData
    }
    setTiposCliente([...tiposCliente, newTipoCliente])
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
              <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Tipos de Cliente</h1>
                <p className="text-gray-600">Configura los tipos de cliente del sistema</p>
              </div>
            </div>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Tipo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Tipo de Cliente</DialogTitle>
                <DialogDescription>
                  Ingrese el nombre del nuevo tipo de cliente.
                </DialogDescription>
              </DialogHeader>
              <TipoClienteForm 
                onSubmit={handleSubmit}
                onCancel={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Tipos de Cliente</CardTitle>
            <CardDescription>
              {tiposCliente.length} tipo{tiposCliente.length !== 1 ? 's' : ''} de cliente configurado{tiposCliente.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TiposClienteTable tiposCliente={tiposCliente} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
