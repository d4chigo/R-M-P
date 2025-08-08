import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Viaje {
  id: number
  id_ruta: number
  id_vehiculo: number
  fecha: string
  ruta_nombre?: string
  vehiculo_placa?: string
}

interface ViajeFormProps {
  onSubmit: (viaje: Omit<Viaje, 'id' | 'ruta_nombre' | 'vehiculo_placa'>) => void
  onCancel: () => void
}

export function ViajeForm({ onSubmit, onCancel }: ViajeFormProps) {
  const [formData, setFormData] = useState({
    id_ruta: "",
    id_vehiculo: "",
    fecha: ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      id_ruta: parseInt(formData.id_ruta),
      id_vehiculo: parseInt(formData.id_vehiculo),
      fecha: formData.fecha
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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
            <SelectItem value="1">1 - Chiclayo - Lima</SelectItem>
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

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Programar Viaje</Button>
      </div>
    </form>
  )
}
