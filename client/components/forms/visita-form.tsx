import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Visita {
  id: number
  id_viaje: number
  id_cliente: number
  entrega: number
  recojo: number
  llega: string
  sale: string
  sec1: string
  sec2: string
  distancia_km?: string
  cliente_nombre?: string
  viaje_info?: string
}

interface VisitaFormProps {
  onSubmit: (visita: Omit<Visita, 'id' | 'cliente_nombre' | 'viaje_info'>) => void
  onCancel: () => void
}

export function VisitaForm({ onSubmit, onCancel }: VisitaFormProps) {
  const [formData, setFormData] = useState({
    id_viaje: "",
    id_cliente: "",
    entrega: "",
    recojo: "",
    llega: "",
    sale: "",
    sec1: "",
    sec2: "",
    distancia_km: ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      id_viaje: parseInt(formData.id_viaje),
      id_cliente: parseInt(formData.id_cliente),
      entrega: parseFloat(formData.entrega),
      recojo: parseFloat(formData.recojo),
      llega: formData.llega,
      sale: formData.sale,
      sec1: formData.sec1,
      sec2: formData.sec2,
      distancia_km: formData.distancia_km
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="id_viaje">ID Viaje *</Label>
          <Select value={formData.id_viaje} onValueChange={(value) => handleInputChange("id_viaje", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar viaje" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 - Lima - Arequipa</SelectItem>
              <SelectItem value="2">2 - Lima - Cusco</SelectItem>
              <SelectItem value="3">3 - Lima - Trujillo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="id_cliente">ID Cliente *</Label>
          <Select value={formData.id_cliente} onValueChange={(value) => handleInputChange("id_cliente", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 - Distribuidora Central S.A.</SelectItem>
              <SelectItem value="2">2 - Comercial Norte EIRL</SelectItem>
              <SelectItem value="3">3 - Logística Sur SAC</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="entrega">Entrega *</Label>
          <Input
            id="entrega"
            type="number"
            step="0.01"
            value={formData.entrega}
            onChange={(e) => handleInputChange("entrega", e.target.value)}
            placeholder="1500.50"
            required
          />
        </div>
        <div>
          <Label htmlFor="recojo">Recojo *</Label>
          <Input
            id="recojo"
            type="number"
            step="0.01"
            value={formData.recojo}
            onChange={(e) => handleInputChange("recojo", e.target.value)}
            placeholder="800.25"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="llega">Hora de Llegada *</Label>
          <Input
            id="llega"
            type="time"
            value={formData.llega}
            onChange={(e) => handleInputChange("llega", e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="sale">Hora de Salida *</Label>
          <Input
            id="sale"
            type="time"
            value={formData.sale}
            onChange={(e) => handleInputChange("sale", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="sec1">Secuencia 1 *</Label>
          <Input
            id="sec1"
            value={formData.sec1}
            onChange={(e) => handleInputChange("sec1", e.target.value)}
            placeholder="SEC001"
            required
          />
        </div>
        <div>
          <Label htmlFor="sec2">Secuencia 2 *</Label>
          <Input
            id="sec2"
            value={formData.sec2}
            onChange={(e) => handleInputChange("sec2", e.target.value)}
            placeholder="SEC002"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="distancia_km">Distancia (km) - Opcional</Label>
        <Input
          id="distancia_km"
          value={formData.distancia_km}
          onChange={(e) => handleInputChange("distancia_km", e.target.value)}
          placeholder="25.5"
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Registrar Visita</Button>
      </div>
    </form>
  )
}
