"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Vehiculo } from "@/hooks/use-vehiculos";
import { formatDateForInput } from "@/lib/utils/date";

interface VehiculoFormSimpleProps {
  vehiculo?: Vehiculo | null;
  onSubmit: (vehiculo: Omit<Vehiculo, "id">) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export function VehiculoFormSimple({
  vehiculo,
  onSubmit,
  onCancel,
  isEditing = false,
}: VehiculoFormSimpleProps) {
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
  });

  useEffect(() => {
    console.log("🚛 Simple Form - vehiculo prop:", vehiculo);
    if (vehiculo) {
      // Format date for HTML date input (YYYY-MM-DD)
      const formattedDate = formatDateForInput(vehiculo.fecha_adquisicion);

      setFormData({
        placa: vehiculo.placa || "",
        marca: vehiculo.marca || "",
        modelo: vehiculo.modelo || "",
        anio: vehiculo.anio?.toString() || "",
        tipo: vehiculo.tipo || "",
        capacidad_carga_kg: vehiculo.capacidad_carga_kg?.toString() || "",
        tipo_carga: vehiculo.tipo_carga || "",
        estado: vehiculo.estado || "",
        fecha_adquisicion: formattedDate,
        vin: vehiculo.vin || "",
      });
    }
  }, [vehiculo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🚛 Simple Form - submitting:", formData);

    onSubmit({
      placa: formData.placa,
      marca: formData.marca,
      modelo: formData.modelo,
      anio: Number.parseInt(formData.anio) || 0,
      tipo: formData.tipo,
      capacidad_carga_kg: Number.parseFloat(formData.capacidad_carga_kg) || 0,
      tipo_carga: formData.tipo_carga,
      estado: formData.estado,
      fecha_adquisicion: formData.fecha_adquisicion,
      vin: formData.vin,
    });
  };

  const handleInputChange = (field: string, value: string) => {
    console.log("🚛 Simple Form - change:", field, "->", value);
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="placa">Placa *</Label>
          <Input
            id="placa"
            value={formData.placa}
            onChange={(e) => handleInputChange("placa", e.target.value)}
            placeholder="ABC-123"
            required
          />
        </div>
        <div>
          <Label htmlFor="vin">VIN *</Label>
          <Input
            id="vin"
            value={formData.vin}
            onChange={(e) => handleInputChange("vin", e.target.value)}
            placeholder="1HGCM82633A004352"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="marca">Marca *</Label>
          <Input
            id="marca"
            value={formData.marca}
            onChange={(e) => handleInputChange("marca", e.target.value)}
            placeholder="Volvo"
            required
          />
        </div>
        <div>
          <Label htmlFor="modelo">Modelo *</Label>
          <Input
            id="modelo"
            value={formData.modelo}
            onChange={(e) => handleInputChange("modelo", e.target.value)}
            placeholder="FH16"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
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
            required
          />
        </div>
        <div>
          <Label htmlFor="capacidad_carga_kg">Capacidad (kg) *</Label>
          <Input
            id="capacidad_carga_kg"
            type="number"
            value={formData.capacidad_carga_kg}
            onChange={(e) =>
              handleInputChange("capacidad_carga_kg", e.target.value)
            }
            placeholder="25000"
            min="0"
            step="0.01"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="tipo">Tipo de Vehículo *</Label>
          <select
            id="tipo"
            value={formData.tipo}
            onChange={(e) => handleInputChange("tipo", e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            required
          >
            <option value="">Seleccionar tipo</option>
            <option value="Camión">Camión</option>
            <option value="Tractocamión">Tractocamión</option>
            <option value="Camioneta">Camioneta</option>
            <option value="Furgón">Furgón</option>
          </select>
        </div>
        <div>
          <Label htmlFor="tipo_carga">Tipo de Carga *</Label>
          <select
            id="tipo_carga"
            value={formData.tipo_carga}
            onChange={(e) => handleInputChange("tipo_carga", e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            required
          >
            <option value="">Seleccionar tipo de carga</option>
            <option value="General">General</option>
            <option value="Refrigerada">Refrigerada</option>
            <option value="Líquidos">Líquidos</option>
            <option value="Peligrosa">Peligrosa</option>
            <option value="Contenedores">Contenedores</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="estado">Estado *</Label>
          <select
            id="estado"
            value={formData.estado}
            onChange={(e) => handleInputChange("estado", e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            required
          >
            <option value="">Seleccionar estado</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
            <option value="Mantenimiento">Mantenimiento</option>
            <option value="Fuera de Servicio">Fuera de Servicio</option>
          </select>
        </div>
        <div>
          <Label htmlFor="fecha_adquisicion">Fecha de Adquisición *</Label>
          <Input
            id="fecha_adquisicion"
            type="date"
            value={formData.fecha_adquisicion}
            onChange={(e) =>
              handleInputChange("fecha_adquisicion", e.target.value)
            }
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {isEditing ? "Actualizar Vehículo" : "Registrar Vehículo"}
        </Button>
      </div>
    </form>
  );
}
