"use client"

import { useState } from "react"

export interface Vehiculo {
  id: number
  placa: string
  marca: string
  modelo: string
  anio: number
  tipo: string
  capacidad_carga_kg: number
  tipo_carga: string
  estado: string
  fecha_adquisicion: string
  vin: string
  id_carreta?: number
}

export function useVehiculos() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([
    {
      id: 1,
      placa: "ABC-123",
      marca: "Volvo",
      modelo: "FH16",
      anio: 2022,
      tipo: "Camión",
      capacidad_carga_kg: 25000,
      tipo_carga: "Carga General",
      estado: "Activo",
      fecha_adquisicion: "2022-01-15",
      vin: "YV2A2A18XCA123456",
      id_carreta: 1,
    },
    {
      id: 2,
      placa: "DEF-456",
      marca: "Mercedes",
      modelo: "Actros",
      anio: 2023,
      tipo: "Tractocamión",
      capacidad_carga_kg: 35000,
      tipo_carga: "Contenedores",
      estado: "Activo",
      fecha_adquisicion: "2023-03-20",
      vin: "WDB9340361L123456",
    },
    {
      id: 3,
      placa: "GHI-789",
      marca: "Scania",
      modelo: "R450",
      anio: 2021,
      tipo: "Camión",
      capacidad_carga_kg: 28000,
      tipo_carga: "Refrigerada",
      estado: "Mantenimiento",
      fecha_adquisicion: "2021-08-10",
      vin: "YS2R4X20005123456",
    },
  ])

  const [editingVehiculo, setEditingVehiculo] = useState<Vehiculo | null>(null)

  const addVehiculo = (vehiculoData: Omit<Vehiculo, "id">) => {
    const newVehiculo: Vehiculo = {
      id: Math.max(...vehiculos.map((v) => v.id), 0) + 1,
      ...vehiculoData,
    }
    setVehiculos([...vehiculos, newVehiculo])
  }

  const updateVehiculo = (id: number, vehiculoData: Omit<Vehiculo, "id">) => {
    setVehiculos(vehiculos.map((v) => (v.id === id ? { ...vehiculoData, id } : v)))
    setEditingVehiculo(null)
  }

  const deleteVehiculo = (id: number) => {
    setVehiculos(vehiculos.filter((v) => v.id !== id))
  }

  const startEdit = (vehiculo: Vehiculo) => {
    setEditingVehiculo(vehiculo)
  }

  const cancelEdit = () => {
    setEditingVehiculo(null)
  }

  return {
    vehiculos,
    editingVehiculo,
    addVehiculo,
    updateVehiculo,
    deleteVehiculo,
    startEdit,
    cancelEdit,
  }
}
