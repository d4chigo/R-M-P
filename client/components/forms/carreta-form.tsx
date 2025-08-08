import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Carreta {
  id: number
  placa: string
  tipo: string
  capacidad_kg: number
  estado: string
}

interface CarretaFormProps {
  onSubmit: (carreta: Omit<Carreta, 'id'>) => void
  onCancel: () => void
}

export function CarretaForm({ onSubmit, onCancel }: CarretaFormProps) {
  const [formData, setFormData] = useState({
    placa: "",
    tipo: "",
    capacidad_kg: "",
    estado: ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      placa: formData.placa,
      tipo: formData.tipo,
      capacidad_kg: parseFloat(formData.capacidad_kg),
      estado: formData.estado
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="placa">Placa *</Label>
        <Input
          id="placa"
          value={formData.placa}
          onChange={(e) => handleInputChange("placa", e.target.value)}
          placeholder="REM-001"
          required
        />
      </div>

      <div>
        <Label htmlFor="tipo">Tipo de Carreta *</Label>
        <Select value={formData.tipo} onValueChange={(value) => handleInputChange("tipo", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Semirremolque">Semirremolque</SelectItem>
            <SelectItem value="Remolque">Remolque</SelectItem>
            <SelectItem value="Plataforma">Plataforma</SelectItem>
            <SelectItem value="Cisterna">Cisterna</SelectItem>
            <SelectItem value="Refrigerada">Refrigerada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="capacidad_kg">Capacidad (kg) *</Label>
        <Input
          id="capacidad_kg"
          type="number"
          value={formData.capacidad_kg}
          onChange={(e) => handleInputChange("capacidad_kg", e.target.value)}
          placeholder="30000"
          min="0"
          step="0.01"
          required
        />
      </div>

      <div>
        <Label htmlFor="estado">Estado *</Label>
        <Select value={formData.estado} onValueChange={(value) => handleInputChange("estado", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Activo">Activo</SelectItem>
            <SelectItem value="Inactivo">Inactivo</SelectItem>
            <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
            <SelectItem value="Fuera de Servicio">Fuera de Servicio</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Registrar Carreta</Button>
      </div>
    </form>
  )
}
