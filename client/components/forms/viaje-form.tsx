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
  onSubmit: (
    viaje: Omit<Viaje, "id" | "ruta_nombre" | "vehiculo_placa">,
  ) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export function ViajeForm({
  viaje,
  onSubmit,
  onCancel,
  isEditing = false,
}: ViajeFormProps) {
  const { rutas, isLoading: rutasLoading } = useRutas();
  const { vehiculos, isLoading: vehiculosLoading } = useVehiculos();

  const [formData, setFormData] = useState({
    id_ruta: "",
    ruta: "",
    id_vehiculo: "",
    vehiculo: "",
    fecha: "",
    repartidor: "",
  });

  useEffect(() => {
    // Solo establecer valores si los datos necesarios ya están cargados
    if (
      viaje &&
      !rutasLoading &&
      !vehiculosLoading &&
      rutas.length > 0 &&
      vehiculos.length > 0
    ) {
      setFormData({
        id_ruta: viaje.id_ruta?.toString() || "",
        ruta: viaje.ruta || "",
        id_vehiculo: viaje.id_vehiculo?.toString() || "",
        vehiculo: viaje.vehiculo || "",
        fecha: viaje.fecha || "",
        repartidor: viaje.repartidor || "",
      });
    } else if (!viaje) {
      // Reset form when no viaje is selected
      setFormData({
        id_ruta: "",
        ruta: "",
        id_vehiculo: "",
        vehiculo: "",
        fecha: "",
        repartidor: "",
      });
    }
  }, [viaje, rutasLoading, vehiculosLoading, rutas.length, vehiculos.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id_ruta: Number.parseInt(formData.id_ruta),
      ruta: formData.ruta,
      id_vehiculo: Number.parseInt(formData.id_vehiculo),
      vehiculo: formData.vehiculo,
      fecha: formData.fecha,
      repartidor: formData.repartidor,
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="id_ruta">ID Ruta *</Label>
          <Select
            value={formData.id_ruta}
            onValueChange={(value) => {
              handleInputChange("id_ruta", value);
              const selectedRuta = rutas.find(
                (r) => r.id?.toString() === value,
              );
              if (selectedRuta) {
                handleInputChange("ruta", selectedRuta.nombre);
              }
            }}
            disabled={rutasLoading}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  rutasLoading ? "Cargando rutas..." : "Seleccionar ruta"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {rutas.map((ruta) => (
                <SelectItem key={ruta.id} value={ruta.id?.toString() || ""}>
                  {ruta.id} - {ruta.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="ruta">Descripción de Ruta *</Label>
          <Input
            id="ruta"
            value={formData.ruta}
            onChange={(e) => handleInputChange("ruta", e.target.value)}
            placeholder="Lima - Arequipa"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="id_vehiculo">ID Vehículo *</Label>
          <Select
            value={formData.id_vehiculo}
            onValueChange={(value) => {
              handleInputChange("id_vehiculo", value);
              const selectedVehiculo = vehiculos.find(
                (v) => v.id?.toString() === value,
              );
              if (selectedVehiculo) {
                handleInputChange("vehiculo", selectedVehiculo.placa);
              }
            }}
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
                  {vehiculo.id} - {vehiculo.placa}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="vehiculo">Placa del Vehículo *</Label>
          <Input
            id="vehiculo"
            value={formData.vehiculo}
            onChange={(e) => handleInputChange("vehiculo", e.target.value)}
            placeholder="ABC-123"
            required
          />
        </div>
      </div>

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
          <Label htmlFor="repartidor">Repartidor *</Label>
          <Input
            id="repartidor"
            value={formData.repartidor}
            onChange={(e) => handleInputChange("repartidor", e.target.value)}
            placeholder="Nombre del repartidor"
            required
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
