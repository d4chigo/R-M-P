"use client"

import { useState } from "react"

export interface Cliente {
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

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([
    {
      id: 1,
      nombre: "Distribuidora Central S.A.",
      codigo: "CLI001",
      id_tipo_cliente: 1,
      ruc: "20123456789",
      direccion: "Av. Principal 123",
      ciudad: "Lima",
      departamento: "Lima",
      pais: "Perú",
      telefono: "+51-1-2345678",
      email: "contacto@distribuidora.com",
      contacto_nombre: "Juan Pérez",
      contacto_telefono: "+51-987654321",
      abre: "08:00",
      cierra: "18:00",
      estado: "Activo",
      fecha_registro: "2024-01-15T10:30:00",
      longitud: -77.0428,
      latitud: -12.0464,
    },
    {
      id: 2,
      nombre: "Comercial Norte EIRL",
      codigo: "CLI002",
      id_tipo_cliente: 2,
      ruc: "20987654321",
      direccion: "Jr. Comercio 456",
      ciudad: "Trujillo",
      departamento: "La Libertad",
      pais: "Perú",
      telefono: "+51-44-123456",
      email: "ventas@comercialnorte.com",
      contacto_nombre: "María García",
      contacto_telefono: "+51-987123456",
      abre: "09:00",
      cierra: "17:00",
      estado: "Activo",
      fecha_registro: "2024-02-01T14:20:00",
      longitud: -79.0292,
      latitud: -8.1116,
    },
  ])

  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null)

  const addCliente = (clienteData: Omit<Cliente, "id" | "fecha_registro">) => {
    const newCliente: Cliente = {
      id: Math.max(...clientes.map((c) => c.id), 0) + 1,
      ...clienteData,
      fecha_registro: new Date().toISOString(),
    }
    setClientes([...clientes, newCliente])
  }

  const updateCliente = (id: number, clienteData: Omit<Cliente, "id" | "fecha_registro">) => {
    setClientes(clientes.map((c) => (c.id === id ? { ...clienteData, id, fecha_registro: c.fecha_registro } : c)))
    setEditingCliente(null)
  }

  const deleteCliente = (id: number) => {
    setClientes(clientes.filter((c) => c.id !== id))
  }

  const startEdit = (cliente: Cliente) => {
    setEditingCliente(cliente)
  }

  const cancelEdit = () => {
    setEditingCliente(null)
  }

  return {
    clientes,
    editingCliente,
    addCliente,
    updateCliente,
    deleteCliente,
    startEdit,
    cancelEdit,
  }
}
