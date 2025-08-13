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
import { useUsuarios } from "@/hooks/use-usuarios";

interface ViajeFormProps {
  viaje?: Viaje | null;
  onSubmit: (
    viaje: Omit<
      Viaje,
      "id" | "ruta_nombre" | "vehiculo_placa" | "repartidor_nombre"
    >,
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
  const { rutas } = useRutas();
  const { vehiculos } = useVehiculos();
  const { usuarios } = useUsuarios();

  const [formData, setFormData] = useState({
    id_ruta: "",
    ruta: "",
    id_vehiculo: "",
    vehiculo: "",
    fecha: "",
    id_repartidor: "",
  });

  useEffect(() => {
    if (viaje) {
      setFormData({
        id_ruta: viaje.id_ruta.toString(),
        ruta: viaje.ruta,
        id_vehiculo: viaje.id_vehiculo.toString(),
        vehiculo: viaje.vehiculo,
        fecha: viaje.fecha,
        id_repartidor: viaje.id_repartidor.toString(),
      });
    }
  }, [viaje]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id_ruta: Number.parseInt(formData.id_ruta),
      ruta: formData.ruta,
      id_vehiculo: Number.parseInt(formData.id_vehiculo),
      vehiculo: formData.vehiculo,
      fecha: formData.fecha,
      id_repartidor: Number.parseInt(formData.id_repartidor),
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
            value={formData.id_ruta || ""}
            onValueChange={(value) => {
              handleInputChange("id_ruta", value);
              const selectedRuta = rutas.find(
                (r) => r.id?.toString() === value,
              );
              if (selectedRuta) {
                handleInputChange("ruta", selectedRuta.nombre);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar ruta" />
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
            value={formData.id_vehiculo || ""}
            onValueChange={(value) => {
              handleInputChange("id_vehiculo", value);
              const selectedVehiculo = vehiculos.find(
                (v) => v.id?.toString() === value,
              );
              if (selectedVehiculo) {
                handleInputChange("vehiculo", selectedVehiculo.placa);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar vehículo" />
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
          <Label htmlFor="id_repartidor">Repartidor *</Label>
          <Select
            value={formData.id_repartidor || ""}
            onValueChange={(value) => handleInputChange("id_repartidor", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar repartidor" />
            </SelectTrigger>
            <SelectContent>
              {usuarios.map((usuario) => (
                <SelectItem
                  key={usuario.id}
                  value={usuario.id?.toString() || ""}
                >
                  {usuario.id} - {usuario.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
