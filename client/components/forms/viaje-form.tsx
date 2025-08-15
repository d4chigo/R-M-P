"use client";

import type React from "react";

import { useState, useEffect } from "react";
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
import type { Viaje } from "@/hooks/use-viajes";
import { useRutas } from "@/hooks/use-rutas";
import { useVehiculos } from "@/hooks/use-vehiculos";

interface ViajeFormProps {
  viaje?: Viaje | null;
  onSubmit: (viaje: {
    fecha: string;
    id_vehiculo: number;
    id_repartidor: number;
    nro_viaje: number;
    salida_cd?: string;
    llegada_cd?: string;
    distancia_km?: number;
    tiempo_manejo_min?: number;
    tiempo_servicio_min?: number;
    recarga_min?: number;
    refrigerio_min?: number;
    tipo_viaje?: string;
  }) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export function ViajeForm({
  viaje,
  onSubmit,
  onCancel,
  isEditing = false,
}: ViajeFormProps) {
  const { vehiculos, isLoading: vehiculosLoading } = useVehiculos();

  const [formData, setFormData] = useState({
    fecha: "",
    id_vehiculo: "",
    id_repartidor: "",
    nro_viaje: "1",
    salida_cd: "",
    llegada_cd: "",
    distancia_km: "",
    tiempo_manejo_min: "",
    tiempo_servicio_min: "",
    recarga_min: "",
    refrigerio_min: "",
    tipo_viaje: "",
  });

  useEffect(() => {
    if (viaje && !vehiculosLoading && vehiculos.length > 0) {
      setFormData({
        fecha: viaje.fecha || "",
        id_vehiculo: viaje.id_vehiculo?.toString() || "",
        id_repartidor: viaje.id_repartidor?.toString() || "",
        nro_viaje: viaje.nro_viaje?.toString() || "1",
        salida_cd: viaje.salida_cd || "",
        llegada_cd: viaje.llegada_cd || "",
        distancia_km: viaje.distancia_km?.toString() || "",
        tiempo_manejo_min: viaje.tiempo_manejo_min?.toString() || "",
        tiempo_servicio_min: viaje.tiempo_servicio_min?.toString() || "",
        recarga_min: viaje.recarga_min?.toString() || "",
        refrigerio_min: viaje.refrigerio_min?.toString() || "",
        tipo_viaje: viaje.tipo_viaje || "",
      });
    } else if (!viaje) {
      setFormData({
        fecha: "",
        id_vehiculo: "",
        id_repartidor: "",
        nro_viaje: "1",
        salida_cd: "",
        llegada_cd: "",
        distancia_km: "",
        tiempo_manejo_min: "",
        tiempo_servicio_min: "",
        recarga_min: "",
        refrigerio_min: "",
        tipo_viaje: "",
      });
    }
  }, [viaje, vehiculosLoading, vehiculos.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones básicas
    if (
      !formData.fecha ||
      !formData.id_vehiculo ||
      !formData.id_repartidor ||
      !formData.nro_viaje
    ) {
      alert("Fecha, vehículo, repartidor y número de viaje son obligatorios");
      return;
    }

    onSubmit({
      fecha: formData.fecha,
      id_vehiculo: Number.parseInt(formData.id_vehiculo),
      id_repartidor: Number.parseInt(formData.id_repartidor),
      nro_viaje: Number.parseInt(formData.nro_viaje),
      salida_cd: formData.salida_cd || undefined,
      llegada_cd: formData.llegada_cd || undefined,
      distancia_km: formData.distancia_km
        ? Number.parseFloat(formData.distancia_km)
        : undefined,
      tiempo_manejo_min: formData.tiempo_manejo_min
        ? Number.parseInt(formData.tiempo_manejo_min)
        : undefined,
      tiempo_servicio_min: formData.tiempo_servicio_min
        ? Number.parseInt(formData.tiempo_servicio_min)
        : undefined,
      recarga_min: formData.recarga_min
        ? Number.parseInt(formData.recarga_min)
        : undefined,
      refrigerio_min: formData.refrigerio_min
        ? Number.parseInt(formData.refrigerio_min)
        : undefined,
      tipo_viaje: formData.tipo_viaje || undefined,
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
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
        <div>
          <Label htmlFor="nro_viaje">Número de Viaje *</Label>
          <Input
            id="nro_viaje"
            type="number"
            value={formData.nro_viaje}
            onChange={(e) => handleInputChange("nro_viaje", e.target.value)}
            placeholder="1"
            min="1"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="id_vehiculo">Vehículo *</Label>
          <Select
            value={formData.id_vehiculo}
            onValueChange={(value) => handleInputChange("id_vehiculo", value)}
            disabled={vehiculosLoading}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  vehiculosLoading
                    ? "Cargando vehículos..."
                    : "Seleccionar vehículo"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {vehiculos.map((vehiculo) => (
                <SelectItem
                  key={vehiculo.id}
                  value={vehiculo.id?.toString() || ""}
                >
                  {vehiculo.placa} - {vehiculo.marca} {vehiculo.modelo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="id_repartidor">ID Repartidor *</Label>
          <Input
            id="id_repartidor"
            type="number"
            value={formData.id_repartidor}
            onChange={(e) => handleInputChange("id_repartidor", e.target.value)}
            placeholder="ID del repartidor"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="salida_cd">Salida CD</Label>
          <Input
            id="salida_cd"
            type="datetime-local"
            value={formData.salida_cd}
            onChange={(e) => handleInputChange("salida_cd", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="llegada_cd">Llegada CD</Label>
          <Input
            id="llegada_cd"
            type="datetime-local"
            value={formData.llegada_cd}
            onChange={(e) => handleInputChange("llegada_cd", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="distancia_km">Distancia (km)</Label>
          <Input
            id="distancia_km"
            type="number"
            step="0.1"
            value={formData.distancia_km}
            onChange={(e) => handleInputChange("distancia_km", e.target.value)}
            placeholder="0.0"
          />
        </div>
        <div>
          <Label htmlFor="tipo_viaje">Tipo de Viaje</Label>
          <Select
            value={formData.tipo_viaje}
            onValueChange={(value) => handleInputChange("tipo_viaje", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ENTREGA">Entrega</SelectItem>
              <SelectItem value="RECOJO">Recojo</SelectItem>
              <SelectItem value="MIXTO">Mixto</SelectItem>
              <SelectItem value="ESPECIAL">Especial</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div>
          <Label htmlFor="tiempo_manejo_min">Manejo (min)</Label>
          <Input
            id="tiempo_manejo_min"
            type="number"
            value={formData.tiempo_manejo_min}
            onChange={(e) =>
              handleInputChange("tiempo_manejo_min", e.target.value)
            }
            placeholder="0"
          />
        </div>
        <div>
          <Label htmlFor="tiempo_servicio_min">Servicio (min)</Label>
          <Input
            id="tiempo_servicio_min"
            type="number"
            value={formData.tiempo_servicio_min}
            onChange={(e) =>
              handleInputChange("tiempo_servicio_min", e.target.value)
            }
            placeholder="0"
          />
        </div>
        <div>
          <Label htmlFor="recarga_min">Recarga (min)</Label>
          <Input
            id="recarga_min"
            type="number"
            value={formData.recarga_min}
            onChange={(e) => handleInputChange("recarga_min", e.target.value)}
            placeholder="0"
          />
        </div>
        <div>
          <Label htmlFor="refrigerio_min">Refrigerio (min)</Label>
          <Input
            id="refrigerio_min"
            type="number"
            value={formData.refrigerio_min}
            onChange={(e) =>
              handleInputChange("refrigerio_min", e.target.value)
            }
            placeholder="0"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="w-full sm:w-auto bg-transparent"
        >
          Cancelar
        </Button>
        <Button type="submit" className="w-full sm:w-auto">
          {isEditing ? "Actualizar Viaje" : "Programar Viaje"}
        </Button>
      </div>
    </form>
  );
}
