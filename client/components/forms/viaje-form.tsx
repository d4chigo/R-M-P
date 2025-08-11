"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Viaje } from "@/hooks/use-viajes"

interface ViajeFormProps {
  viaje?: Viaje | null
  onSubmit: (viaje: Omit<Viaje, "id" | "ruta_nombre" | "vehiculo_placa">) => void
  onCancel: () => void
  isEditing?: boolean
}

export function ViajeForm({ viaje, onSubmit, onCancel, isEditing = false }: ViajeFormProps) {
  const [formData, setFormData] = useState({
    id_ruta: "",
    id_vehiculo: "",
    fecha: "",
  })

  useEffect(() => {
    if (viaje) {
      setFormData({
        id_ruta: viaje.id_ruta.toString(),
        id_vehiculo: viaje.id_vehiculo.toString(),
        fecha: viaje.fecha,
      })
    }
  }, [viaje])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      id_ruta: Number.parseInt(formData.id_ruta),
      id_vehiculo: Number.parseInt(formData.id_vehiculo),
      fecha: formData.fecha,
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="id_ruta">ID Ruta *</Label>
        <Select value={formData.id_ruta} onValueChange={(value) => handleInputChange("id_ruta", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar ruta" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 - Lima - Arequipa</SelectItem>
            <SelectItem value="2">2 - Lima - Cusco</SelectItem>
            <SelectItem value="3">3 - Lima - Trujillo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="id_vehiculo">ID Vehículo *</Label>
        <Select value={formData.id_vehiculo} onValueChange={(value) => handleInputChange("id_vehiculo", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar vehículo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 - ABC-123</SelectItem>
            <SelectItem value="2">2 - DEF-456</SelectItem>
            <SelectItem value="3">3 - GHI-789</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="fecha">Fecha del Viaje *</Label>
        <Input
          id="fecha"
          type="date"
          value={formData.fecha}
          onChange={(e) => handleInputChange("fecha", e.target.value)}
          required
        />
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto bg-transparent">
          Cancelar
        </Button>
        <Button type="submit" className="w-full sm:w-auto">
          {isEditing ? "Actualizar Viaje" : "Programar Viaje"}
        </Button>
      </div>
    </form>
  )
}
