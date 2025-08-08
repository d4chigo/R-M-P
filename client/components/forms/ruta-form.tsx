import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Ruta {
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

interface RutaFormProps {
  onSubmit: (ruta: Omit<Ruta, 'id' | 'fecha_creacion' | 'ultima_actualizacion'>) => void
  onCancel: () => void
}

export function RutaForm({ onSubmit, onCancel }: RutaFormProps) {
  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    origen: "",
    destino: "",
    distancia_km: "",
    duracion_aproximada: "",
    tipo_ruta: "",
    estado: ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      codigo: formData.codigo,
      nombre: formData.nombre,
      origen: formData.origen,
      destino: formData.destino,
      distancia_km: parseFloat(formData.distancia_km),
      duracion_aproximada: formData.duracion_aproximada,
      tipo_ruta: formData.tipo_ruta,
      estado: formData.estado
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="codigo">Código de Ruta *</Label>
          <Input
            id="codigo"
            value={formData.codigo}
            onChange={(e) => handleInputChange("codigo", e.target.value)}
            placeholder="RUT001"
            required
          />
        </div>
        <div>
          <Label htmlFor="nombre">Nombre de la Ruta *</Label>
          <Input
            id="nombre"
            value={formData.nombre}
            onChange={(e) => handleInputChange("nombre", e.target.value)}
            placeholder="Lima - Arequipa"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="origen">Origen *</Label>
          <Input
            id="origen"
            value={formData.origen}
            onChange={(e) => handleInputChange("origen", e.target.value)}
            placeholder="Lima"
            required
          />
        </div>
        <div>
          <Label htmlFor="destino">Destino *</Label>
          <Input
            id="destino"
            value={formData.destino}
            onChange={(e) => handleInputChange("destino", e.target.value)}
            placeholder="Arequipa"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="distancia_km">Distancia (km) *</Label>
          <Input
            id="distancia_km"
            type="number"
            value={formData.distancia_km}
            onChange={(e) => handleInputChange("distancia_km", e.target.value)}
            placeholder="1009"
            min="0"
            step="0.01"
            required
          />
        </div>
        <div>
          <Label htmlFor="duracion_aproximada">Duración Aproximada *</Label>
          <Input
            id="duracion_aproximada"
            type="time"
            value={formData.duracion_aproximada}
            onChange={(e) => handleInputChange("duracion_aproximada", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="tipo_ruta">Tipo de Ruta *</Label>
          <Select value={formData.tipo_ruta} onValueChange={(value) => handleInputChange("tipo_ruta", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Nacional">Nacional</SelectItem>
              <SelectItem value="Internacional">Internacional</SelectItem>
              <SelectItem value="Regional">Regional</SelectItem>
              <SelectItem value="Local">Local</SelectItem>
            </SelectContent>
          </Select>
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
              <SelectItem value="En Mantenimiento">En Mantenimiento</SelectItem>
              <SelectItem value="Suspendido">Suspendido</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Registrar Ruta</Button>
      </div>
    </form>
  )
}
