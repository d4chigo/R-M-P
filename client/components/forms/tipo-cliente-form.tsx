import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface TipoCliente {
  id: number
  nombre: string
}

interface TipoClienteFormProps {
  onSubmit: (tipoCliente: Omit<TipoCliente, 'id'>) => void
  onCancel: () => void
}

export function TipoClienteForm({ onSubmit, onCancel }: TipoClienteFormProps) {
  const [formData, setFormData] = useState({
    nombre: ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      nombre: formData.nombre
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="nombre">Nombre del Tipo *</Label>
        <Input
          id="nombre"
          value={formData.nombre}
          onChange={(e) => handleInputChange("nombre", e.target.value)}
          placeholder="Ej: Mayorista, Minorista, etc."
          required
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Crear Tipo</Button>
      </div>
    </form>
  )
}
