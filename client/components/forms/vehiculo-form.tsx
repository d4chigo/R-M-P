"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Vehiculo } from "@/hooks/use-vehiculos"

interface VehiculoFormProps {
  vehiculo?: Vehiculo | null
  onSubmit: (vehiculo: Omit<Vehiculo, "id">) => void
  onCancel: () => void
  isEditing?: boolean
}

export function VehiculoForm({ vehiculo, onSubmit, onCancel, isEditing = false }: VehiculoFormProps) {
  const [formData, setFormData] = useState({
    placa: "",
    marca: "",
    modelo: "",
    anio: "",
    tipo: "",
    capacidad_carga_kg: "",
    tipo_carga: "",
    estado: "",
    fecha_adquisicion: "",
    vin: "",
    id_carreta: "",
  })

  useEffect(() => {
    if (vehiculo) {
      setFormData({
        placa: vehiculo.placa,
        marca: vehiculo.marca,
        modelo: vehiculo.modelo,
        anio: vehiculo.anio.toString(),
        tipo: vehiculo.tipo,
        capacidad_carga_kg: vehiculo.capacidad_carga_kg.toString(),
        tipo_carga: vehiculo.tipo_carga,
        estado: vehiculo.estado,
        fecha_adquisicion: vehiculo.fecha_adquisicion,
        vin: vehiculo.vin,
        id_carreta: vehiculo.id_carreta?.toString() || "",
      })
    }
  }, [vehiculo])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      placa: formData.placa,
      marca: formData.marca,
      modelo: formData.modelo,
      anio: Number.parseInt(formData.anio),
      tipo: formData.tipo,
      capacidad_carga_kg: Number.parseFloat(formData.capacidad_carga_kg),
      tipo_carga: formData.tipo_carga,
      estado: formData.estado,
      fecha_adquisicion: formData.fecha_adquisicion,
      vin: formData.vin,
      id_carreta: formData.id_carreta ? Number.parseInt(formData.id_carreta) : undefined,
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="mobile-form-spacing">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="placa">Placa *</Label>
            <Input
              id="placa"
              value={formData.placa}
              onChange={(e) => handleInputChange("placa", e.target.value)}
              placeholder="ABC-123"
              className="mobile-input"
              required
            />
          </div>
          <div>
            <Label htmlFor="vin">VIN *</Label>
            <Input
              id="vin"
              value={formData.vin}
              onChange={(e) => handleInputChange("vin", e.target.value)}
              placeholder="Número de identificación del vehículo"
              className="mobile-input"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="marca">Marca *</Label>
            <Input
              id="marca"
              value={formData.marca}
              onChange={(e) => handleInputChange("marca", e.target.value)}
              placeholder="Volvo, Mercedes, etc."
              className="mobile-input"
              required
            />
          </div>
          <div>
            <Label htmlFor="modelo">Modelo *</Label>
            <Input
              id="modelo"
              value={formData.modelo}
              onChange={(e) => handleInputChange("modelo", e.target.value)}
              placeholder="FH16, Actros, etc."
              className="mobile-input"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="anio">Año *</Label>
            <Input
              id="anio"
              type="number"
              value={formData.anio}
              onChange={(e) => handleInputChange("anio", e.target.value)}
              placeholder="2023"
              min="1990"
              max="2030"
              className="mobile-input"
              required
            />
          </div>
          <div>
            <Label htmlFor="tipo">Tipo de Vehículo *</Label>
            <Select value={formData.tipo} onValueChange={(value) => handleInputChange("tipo", value)}>
              <SelectTrigger className="mobile-input">
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Camión">Camión</SelectItem>
                <SelectItem value="Tractocamión">Tractocamión</SelectItem>
                <SelectItem value="Camioneta">Camioneta</SelectItem>
                <SelectItem value="Furgón">Furgón</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="capacidad_carga_kg">Capacidad de Carga (kg) *</Label>
            <Input
              id="capacidad_carga_kg"
              type="number"
              value={formData.capacidad_carga_kg}
              onChange={(e) => handleInputChange("capacidad_carga_kg", e.target.value)}
              placeholder="25000"
              min="0"
              step="0.01"
              className="mobile-input"
              required
            />
          </div>
          <div>
            <Label htmlFor="tipo_carga">Tipo de Carga *</Label>
            <Select value={formData.tipo_carga} onValueChange={(value) => handleInputChange("tipo_carga", value)}>
              <SelectTrigger className="mobile-input">
                <SelectValue placeholder="Seleccionar tipo de carga" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Carga General">Carga General</SelectItem>
                <SelectItem value="Refrigerada">Refrigerada</SelectItem>
                <SelectItem value="Líquidos">Líquidos</SelectItem>
                <SelectItem value="Peligrosa">Peligrosa</SelectItem>
                <SelectItem value="Contenedores">Contenedores</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="estado">Estado *</Label>
            <Select value={formData.estado} onValueChange={(value) => handleInputChange("estado", value)}>
              <SelectTrigger className="mobile-input">
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
          <div>
            <Label htmlFor="fecha_adquisicion">Fecha de Adquisición *</Label>
            <Input
              id="fecha_adquisicion"
              type="date"
              value={formData.fecha_adquisicion}
              onChange={(e) => handleInputChange("fecha_adquisicion", e.target.value)}
              className="mobile-input"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="id_carreta">ID Carreta (Opcional)</Label>
          <Input
            id="id_carreta"
            type="number"
            value={formData.id_carreta}
            onChange={(e) => handleInputChange("id_carreta", e.target.value)}
            placeholder="ID de la carreta asociada"
            min="1"
            className="mobile-input"
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} className="mobile-button bg-transparent">
            Cancelar
          </Button>
          <Button type="submit" className="mobile-button">
            {isEditing ? "Actualizar Vehículo" : "Registrar Vehículo"}
          </Button>
        </div>
      </form>
    </div>
  )
}
