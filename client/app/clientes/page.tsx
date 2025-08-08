"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, ArrowLeft, Users } from 'lucide-react'
import Link from "next/link"
import { ClientesTable } from "@/components/tables/clientes-table"
import { ClienteForm } from "@/components/forms/cliente-form"

interface Cliente {
  id: number
  nombre: string
  codigo: string
  id_tipo_cliente: number
  ruc: string
  direccion: string
  ciudad: string
  departamento: string
  pais: string
  telefono: string
  email: string
  contacto_nombre: string
  contacto_telefono: string
  abre: string
  cierra: string
  estado: string
  fecha_registro: string
  longitud: number
  latitud: number
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([
    {
      id: 1,
      nombre: "Distribuidora Central S.A.",
      codigo: "CLI001",
      id_tipo_cliente: 1,
      ruc: "20123456789",
      direccion: "Av. Principal 123",
      ciudad: "Chiclayo",
      departamento: "Lambayeque",
      pais: "Perú",
      telefono: "+51-971562893",
      email: "contacto@distribuidora.com",
      contacto_nombre: "Miguel Miranda",
      contacto_telefono: "+51-971562893",
      abre: "08:00",
      cierra: "18:00",
      estado: "Activo",
      fecha_registro: "2024-01-15T10:30:00",
      longitud: -77.0428,
      latitud: -12.0464
    }
  ])

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleSubmit = (clienteData: Omit<Cliente, 'id' | 'fecha_registro'>) => {
    const newCliente: Cliente = {
      id: clientes.length + 1,
      ...clienteData,
      fecha_registro: new Date().toISOString()
    }
    setClientes([...clientes, newCliente])
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
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestión de Clientes</h1>
                <p className="text-gray-600">Administra la base de datos de clientes</p>
              </div>
            </div>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Registrar Nuevo Cliente</DialogTitle>
                <DialogDescription>
                  Complete todos los campos para registrar un nuevo cliente en el sistema.
                </DialogDescription>
              </DialogHeader>
              <ClienteForm 
                onSubmit={handleSubmit}
                onCancel={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Clientes</CardTitle>
            <CardDescription>
              {clientes.length} cliente{clientes.length !== 1 ? 's' : ''} registrado{clientes.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ClientesTable clientes={clientes} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
