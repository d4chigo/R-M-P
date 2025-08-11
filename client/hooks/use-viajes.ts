"use client"

import { useState } from "react"

export interface Viaje {
  id: number
  id_ruta: number
  id_vehiculo: number
  fecha: string
  ruta_nombre?: string
  vehiculo_placa?: string
}

export function useViajes() {
  const [viajes, setViajes] = useState<Viaje[]>([
    {
      id: 1,
      id_ruta: 1,
      id_vehiculo: 1,
      fecha: "2024-02-15",
      ruta_nombre: "Lima - Arequipa",
      vehiculo_placa: "ABC-123",
    },
    {
      id: 2,
      id_ruta: 2,
      id_vehiculo: 2,
      fecha: "2024-02-16",
      ruta_nombre: "Lima - Cusco",
      vehiculo_placa: "DEF-456",
    },
  ])

  const [editingViaje, setEditingViaje] = useState<Viaje | null>(null)

  const addViaje = (viajeData: Omit<Viaje, "id" | "ruta_nombre" | "vehiculo_placa">) => {
    const newViaje: Viaje = {
      id: Math.max(...viajes.map((v) => v.id), 0) + 1,
      ...viajeData,
      ruta_nombre: `Ruta ${viajeData.id_ruta}`,
      vehiculo_placa: `VEH-${viajeData.id_vehiculo}`,
    }
    setViajes([...viajes, newViaje])
  }

  const updateViaje = (id: number, viajeData: Omit<Viaje, "id" | "ruta_nombre" | "vehiculo_placa">) => {
    setViajes(
      viajes.map((v) =>
        v.id === id
          ? {
              ...viajeData,
              id,
              ruta_nombre: `Ruta ${viajeData.id_ruta}`,
              vehiculo_placa: `VEH-${viajeData.id_vehiculo}`,
            }
          : v,
      ),
    )
    setEditingViaje(null)
  }

  const deleteViaje = (id: number) => {
    setViajes(viajes.filter((v) => v.id !== id))
  }

  const startEdit = (viaje: Viaje) => {
    setEditingViaje(viaje)
  }

  const cancelEdit = () => {
    setEditingViaje(null)
  }

  return {
    viajes,
    editingViaje,
    addViaje,
    updateViaje,
    deleteViaje,
    startEdit,
    cancelEdit,
  }
}
