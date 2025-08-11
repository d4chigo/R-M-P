"use client"

import { useState } from "react"

export interface TipoCliente {
  id: number
  nombre: string
}

export function useTiposCliente() {
  const [tiposCliente, setTiposCliente] = useState<TipoCliente[]>([
    { id: 1, nombre: "Mayorista" },
    { id: 2, nombre: "Minorista" },
    { id: 3, nombre: "Distribuidor" },
    { id: 4, nombre: "Corporativo" },
  ])

  const [editingTipoCliente, setEditingTipoCliente] = useState<TipoCliente | null>(null)

  const addTipoCliente = (tipoClienteData: Omit<TipoCliente, "id">) => {
    const newTipoCliente: TipoCliente = {
      id: Math.max(...tiposCliente.map((t) => t.id), 0) + 1,
      ...tipoClienteData,
    }
    setTiposCliente([...tiposCliente, newTipoCliente])
  }

  const updateTipoCliente = (id: number, tipoClienteData: Omit<TipoCliente, "id">) => {
    setTiposCliente(tiposCliente.map((t) => (t.id === id ? { ...tipoClienteData, id } : t)))
    setEditingTipoCliente(null)
  }

  const deleteTipoCliente = (id: number) => {
    setTiposCliente(tiposCliente.filter((t) => t.id !== id))
  }

  const startEdit = (tipoCliente: TipoCliente) => {
    setEditingTipoCliente(tipoCliente)
  }

  const cancelEdit = () => {
    setEditingTipoCliente(null)
  }

  return {
    tiposCliente,
    editingTipoCliente,
    addTipoCliente,
    updateTipoCliente,
    deleteTipoCliente,
    startEdit,
    cancelEdit,
  }
}
