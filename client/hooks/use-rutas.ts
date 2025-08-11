"use client"

import { useState } from "react"

export interface Ruta {
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

export function useRutas() {
  const [rutas, setRutas] = useState<Ruta[]>([
    {
      id: 1,
      codigo: "RUT001",
      nombre: "Lima - Arequipa",
      origen: "Lima",
      destino: "Arequipa",
      distancia_km: 1009,
      duracion_aproximada: "14:30",
      tipo_ruta: "Nacional",
      estado: "Activo",
      fecha_creacion: "2024-01-15T10:30:00",
    },
    {
      id: 2,
      codigo: "RUT002",
      nombre: "Lima - Cusco",
      origen: "Lima",
      destino: "Cusco",
      distancia_km: 1165,
      duracion_aproximada: "16:00",
      tipo_ruta: "Nacional",
      estado: "Activo",
      fecha_creacion: "2024-01-20T09:15:00",
    },
  ])

  const [editingRuta, setEditingRuta] = useState<Ruta | null>(null)

  const addRuta = (rutaData: Omit<Ruta, "id" | "fecha_creacion" | "ultima_actualizacion">) => {
    const newRuta: Ruta = {
      id: Math.max(...rutas.map((r) => r.id), 0) + 1,
      ...rutaData,
      fecha_creacion: new Date().toISOString(),
    }
    setRutas([...rutas, newRuta])
  }

  const updateRuta = (id: number, rutaData: Omit<Ruta, "id" | "fecha_creacion" | "ultima_actualizacion">) => {
    setRutas(
      rutas.map((r) =>
        r.id === id
          ? {
              ...rutaData,
              id,
              fecha_creacion: r.fecha_creacion,
              ultima_actualizacion: new Date().toISOString(),
            }
          : r,
      ),
    )
    setEditingRuta(null)
  }

  const deleteRuta = (id: number) => {
    setRutas(rutas.filter((r) => r.id !== id))
  }

  const startEdit = (ruta: Ruta) => {
    setEditingRuta(ruta)
  }

  const cancelEdit = () => {
    setEditingRuta(null)
  }

  return {
    rutas,
    editingRuta,
    addRuta,
    updateRuta,
    deleteRuta,
    startEdit,
    cancelEdit,
  }
}
