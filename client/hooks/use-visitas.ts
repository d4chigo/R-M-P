"use client"

import { useState } from "react"

export interface Visita {
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

export function useVisitas() {
  const [visitas, setVisitas] = useState<Visita[]>([
    {
      id: 1,
      id_viaje: 1,
      id_cliente: 1,
      entrega: 1500.5,
      recojo: 800.25,
      llega: "08:30",
      sale: "10:15",
      sec1: "SEC001",
      sec2: "SEC002",
      distancia_km: "25.5",
      cliente_nombre: "Distribuidora Central S.A.",
      viaje_info: "Lima - Arequipa",
    },
    {
      id: 2,
      id_viaje: 2,
      id_cliente: 2,
      entrega: 2200.75,
      recojo: 1100.5,
      llega: "14:00",
      sale: "15:30",
      sec1: "SEC003",
      sec2: "SEC004",
      distancia_km: "18.2",
      cliente_nombre: "Comercial Norte EIRL",
      viaje_info: "Lima - Cusco",
    },
  ])

  const [editingVisita, setEditingVisita] = useState<Visita | null>(null)

  const addVisita = (visitaData: Omit<Visita, "id" | "cliente_nombre" | "viaje_info">) => {
    const newVisita: Visita = {
      id: Math.max(...visitas.map((v) => v.id), 0) + 1,
      ...visitaData,
      cliente_nombre: `Cliente ${visitaData.id_cliente}`,
      viaje_info: `Viaje ${visitaData.id_viaje}`,
    }
    setVisitas([...visitas, newVisita])
  }

  const updateVisita = (id: number, visitaData: Omit<Visita, "id" | "cliente_nombre" | "viaje_info">) => {
    setVisitas(
      visitas.map((v) =>
        v.id === id
          ? {
              ...visitaData,
              id,
              cliente_nombre: `Cliente ${visitaData.id_cliente}`,
              viaje_info: `Viaje ${visitaData.id_viaje}`,
            }
          : v,
      ),
    )
    setEditingVisita(null)
  }

  const deleteVisita = (id: number) => {
    setVisitas(visitas.filter((v) => v.id !== id))
  }

  const startEdit = (visita: Visita) => {
    setEditingVisita(visita)
  }

  const cancelEdit = () => {
    setEditingVisita(null)
  }

  return {
    visitas,
    editingVisita,
    addVisita,
    updateVisita,
    deleteVisita,
    startEdit,
    cancelEdit,
  }
}
