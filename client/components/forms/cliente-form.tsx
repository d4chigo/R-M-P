import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Cliente {
  id: number
  nombre: string
  codigo: string
  id_tipo_cliente: number
  ruc: string
  direccion: string
  ciudad: string
  departamento: string
  pais: string
  telefono: string
  email: string
  contacto_nombre: string
  contacto_telefono: string
  abre: string
  cierra: string
  estado: string
  fecha_registro: string
  longitud: number
  latitud: number
}

interface ClienteFormProps {
  onSubmit: (cliente: Omit<Cliente, 'id' | 'fecha_registro'>) => void
  onCancel: () => void
}

export function ClienteForm({ onSubmit, onCancel }: ClienteFormProps) {
  const [formData, setFormData] = useState({
    nombre: "",
    codigo: "",
    id_tipo_cliente: "",
    ruc: "",
    direccion: "",
    ciudad: "",
    departamento: "",
    pais: "",
    telefono: "",
    email: "",
    contacto_nombre: "",
    contacto_telefono: "",
    abre: "",
    cierra: "",
    estado: "",
    longitud: "",
    latitud: ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      nombre: formData.nombre,
      codigo: formData.codigo,
      id_tipo_cliente: parseInt(formData.id_tipo_cliente),
      ruc: formData.ruc,
      direccion: formData.direccion,
      ciudad: formData.ciudad,
      departamento: formData.departamento,
      pais: formData.pais,
      telefono: formData.telefono,
      email: formData.email,
      contacto_nombre: formData.contacto_nombre,
      contacto_telefono: formData.contacto_telefono,
      abre: formData.abre,
      cierra: formData.cierra,
      estado: formData.estado,
      longitud: parseFloat(formData.longitud),
      latitud: parseFloat(formData.latitud)
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nombre">Nombre de la Empresa *</Label>
          <Input
            id="nombre"
            value={formData.nombre}
            onChange={(e) => handleInputChange("nombre", e.target.value)}
            placeholder="Distribuidora Central S.A."
            required
          />
        </div>
        <div>
          <Label htmlFor="codigo">Código Cliente *</Label>
          <Input
            id="codigo"
            value={formData.codigo}
            onChange={(e) => handleInputChange("codigo", e.target.value)}
            placeholder="CLI001"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="ruc">RUC *</Label>
          <Input
            id="ruc"
            value={formData.ruc}
            onChange={(e) => handleInputChange("ruc", e.target.value)}
            placeholder="20123456789"
            required
          />
        </div>
        <div>
          <Label htmlFor="id_tipo_cliente">Tipo de Cliente *</Label>
          <Select value={formData.id_tipo_cliente} onValueChange={(value) => handleInputChange("id_tipo_cliente", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Mayorista</SelectItem>
              <SelectItem value="2">Minorista</SelectItem>
              <SelectItem value="3">Distribuidor</SelectItem>
              <SelectItem value="4">Corporativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="direccion">Dirección *</Label>
        <Input
          id="direccion"
          value={formData.direccion}
          onChange={(e) => handleInputChange("direccion", e.target.value)}
          placeholder="Av. Principal 123"
          required
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="ciudad">Ciudad *</Label>
          <Input
            id="ciudad"
            value={formData.ciudad}
            onChange={(e) => handleInputChange("ciudad", e.target.value)}
            placeholder="Lima"
            required
          />
        </div>
        <div>
          <Label htmlFor="departamento">Departamento *</Label>
          <Input
            id="departamento"
            value={formData.departamento}
            onChange={(e) => handleInputChange("departamento", e.target.value)}
            placeholder="Lima"
            required
          />
        </div>
        <div>
          <Label htmlFor="pais">País *</Label>
          <Input
            id="pais"
            value={formData.pais}
            onChange={(e) => handleInputChange("pais", e.target.value)}
            placeholder="Perú"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="telefono">Teléfono *</Label>
          <Input
            id="telefono"
            value={formData.telefono}
            onChange={(e) => handleInputChange("telefono", e.target.value)}
            placeholder="+51-1-2345678"
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder="contacto@empresa.com"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="contacto_nombre">Nombre del Contacto *</Label>
          <Input
            id="contacto_nombre"
            value={formData.contacto_nombre}
            onChange={(e) => handleInputChange("contacto_nombre", e.target.value)}
            placeholder="Juan Pérez"
            required
          />
        </div>
        <div>
          <Label htmlFor="contacto_telefono">Teléfono del Contacto *</Label>
          <Input
            id="contacto_telefono"
            value={formData.contacto_telefono}
            onChange={(e) => handleInputChange("contacto_telefono", e.target.value)}
            placeholder="+51-987654321"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="abre">Hora de Apertura *</Label>
          <Input
            id="abre"
            type="time"
            value={formData.abre}
            onChange={(e) => handleInputChange("abre", e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="cierra">Hora de Cierre *</Label>
          <Input
            id="cierra"
            type="time"
            value={formData.cierra}
            onChange={(e) => handleInputChange("cierra", e.target.value)}
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
              <SelectItem value="Suspendido">Suspendido</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="latitud">Latitud *</Label>
          <Input
            id="latitud"
            type="number"
            step="any"
            value={formData.latitud}
            onChange={(e) => handleInputChange("latitud", e.target.value)}
            placeholder="-12.0464"
            required
          />
        </div>
        <div>
          <Label htmlFor="longitud">Longitud *</Label>
          <Input
            id="longitud"
            type="number"
            step="any"
            value={formData.longitud}
            onChange={(e) => handleInputChange("longitud", e.target.value)}
            placeholder="-77.0428"
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Registrar Cliente</Button>
      </div>
    </form>
  )
}
