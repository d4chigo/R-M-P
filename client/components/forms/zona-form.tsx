"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Zona } from "@/hooks/use-zonas"

interface ZonaFormProps {
  zona?: Zona | null
  onSubmit: (zona: Omit<Zona, "id">) => void
  onCancel: () => void
  isEditing?: boolean
}

export function ZonaForm({ zona, onSubmit, onCancel, isEditing = false }: ZonaFormProps) {
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
  })

  useEffect(() => {
    if (zona) {
      setFormData({
        nombre: zona.nombre,
        descripcion: zona.descripcion,
      })
    }
  }, [zona])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      nombre: formData.nombre,
      descripcion: formData.descripcion,
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="nombre">Nombre de la Zona *</Label>
        <Input
          id="nombre"
          value={formData.nombre}
          onChange={(e) => handleInputChange("nombre", e.target.value)}
          placeholder="Zona Norte, Zona Centro, etc."
          required
        />
      </div>

      <div>
        <Label htmlFor="descripcion">Descripción *</Label>
        <Textarea
          id="descripcion"
          value={formData.descripcion}
          onChange={(e) => handleInputChange("descripcion", e.target.value)}
          placeholder="Descripción detallada de la zona geográfica..."
          rows={4}
          required
        />
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto bg-transparent">
          Cancelar
        </Button>
        <Button type="submit" className="w-full sm:w-auto">
          {isEditing ? "Actualizar Zona" : "Crear Zona"}
        </Button>
      </div>
    </form>
  )
}
