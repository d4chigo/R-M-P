"use client"

import { useState } from "react"

export interface Zona {
  id: number
  nombre: string
  descripcion: string
}

export function useZonas() {
  const [zonas, setZonas] = useState<Zona[]>([
    {
      id: 1,
      nombre: "Zona Norte",
      descripcion:
        "Comprende los departamentos del norte del país: Tumbes, Piura, Lambayeque, La Libertad, Cajamarca y Amazonas.",
    },
    {
      id: 2,
      nombre: "Zona Centro",
      descripcion: "Incluye Lima, Callao, Ica, Huancavelica, Junín, Pasco y Ancash.",
    },
    {
      id: 3,
      nombre: "Zona Sur",
      descripcion: "Abarca Arequipa, Moquegua, Tacna, Cusco, Apurímac, Ayacucho y Puno.",
    },
  ])

  const [editingZona, setEditingZona] = useState<Zona | null>(null)

  const addZona = (zonaData: Omit<Zona, "id">) => {
    const newZona: Zona = {
      id: Math.max(...zonas.map((z) => z.id), 0) + 1,
      ...zonaData,
    }
    setZonas([...zonas, newZona])
  }

  const updateZona = (id: number, zonaData: Omit<Zona, "id">) => {
    setZonas(zonas.map((z) => (z.id === id ? { ...zonaData, id } : z)))
    setEditingZona(null)
  }

  const deleteZona = (id: number) => {
    setZonas(zonas.filter((z) => z.id !== id))
  }

  const startEdit = (zona: Zona) => {
    setEditingZona(zona)
  }

  const cancelEdit = () => {
    setEditingZona(null)
  }

  return {
    zonas,
    editingZona,
    addZona,
    updateZona,
    deleteZona,
    startEdit,
    cancelEdit,
  }
}
