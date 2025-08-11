"use client"

import { useState } from "react"

export interface Carreta {
  id: number
  placa: string
  tipo: string
  capacidad_kg: number
  estado: string
}

export function useCarretas() {
  const [carretas, setCarretas] = useState<Carreta[]>([
    {
      id: 1,
      placa: "REM-001",
      tipo: "Semirremolque",
      capacidad_kg: 30000,
      estado: "Activo",
    },
    {
      id: 2,
      placa: "REM-002",
      tipo: "Plataforma",
      capacidad_kg: 25000,
      estado: "Activo",
    },
    {
      id: 3,
      placa: "REM-003",
      tipo: "Cisterna",
      capacidad_kg: 35000,
      estado: "Mantenimiento",
    },
  ])

  const [editingCarreta, setEditingCarreta] = useState<Carreta | null>(null)

  const addCarreta = (carretaData: Omit<Carreta, "id">) => {
    const newCarreta: Carreta = {
      id: Math.max(...carretas.map((c) => c.id), 0) + 1,
      ...carretaData,
    }
    setCarretas([...carretas, newCarreta])
  }

  const updateCarreta = (id: number, carretaData: Omit<Carreta, "id">) => {
    setCarretas(carretas.map((c) => (c.id === id ? { ...carretaData, id } : c)))
    setEditingCarreta(null)
  }

  const deleteCarreta = (id: number) => {
    setCarretas(carretas.filter((c) => c.id !== id))
  }

  const startEdit = (carreta: Carreta) => {
    setEditingCarreta(carreta)
  }

  const cancelEdit = () => {
    setEditingCarreta(null)
  }

  return {
    carretas,
    editingCarreta,
    addCarreta,
    updateCarreta,
    deleteCarreta,
    startEdit,
    cancelEdit,
  }
}
