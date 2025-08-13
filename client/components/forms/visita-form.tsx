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
import type { Visita } from "@/hooks/use-visitas";
import { useViajes } from "@/hooks/use-viajes";
import { useClientes } from "@/hooks/use-clientes";

interface VisitaFormProps {
  visita?: Visita | null;
  onSubmit: (
    visita: Omit<
      Visita,
      | "id"
      | "cliente_nombre"
      | "viaje_info"
      | "cliente_codigo"
      | "cliente_ruc"
      | "viaje_fecha"
      | "ruta_nombre"
      | "vehiculo_placa"
    >,
  ) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export function VisitaForm({
  visita,
  onSubmit,
  onCancel,
  isEditing = false,
}: VisitaFormProps) {
  const { viajes } = useViajes();
  const { clientes } = useClientes();

  const [formData, setFormData] = useState({
    id_viaje: "",
    id_cliente: "",
    entrega: "",
    recojo: "",
    llega: "",
    sale: "",
    sec1: "",
    sec2: "",
    distancia_km: "",
  });

  useEffect(() => {
    if (visita) {
      setFormData({
        id_viaje: visita.id_viaje.toString(),
        id_cliente: visita.id_cliente.toString(),
        entrega: visita.entrega.toString(),
        recojo: visita.recojo.toString(),
        llega: visita.llega,
        sale: visita.sale,
        sec1: visita.sec1,
        sec2: visita.sec2,
        distancia_km: visita.distancia_km?.toString() || "",
      });
    }
  }, [visita]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id_viaje: Number.parseInt(formData.id_viaje),
      id_cliente: Number.parseInt(formData.id_cliente),
      entrega: Number.parseFloat(formData.entrega),
      recojo: Number.parseFloat(formData.recojo),
      llega: formData.llega,
      sale: formData.sale,
      sec1: formData.sec1,
      sec2: formData.sec2,
      distancia_km: formData.distancia_km || undefined,
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="id_viaje">ID Viaje *</Label>
          <Select
            value={formData.id_viaje || ""}
            onValueChange={(value) => handleInputChange("id_viaje", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar viaje" />
            </SelectTrigger>
            <SelectContent>
              {viajes.map((viaje) => (
                <SelectItem key={viaje.id} value={viaje.id?.toString() || ""}>
                  {viaje.id} - {viaje.ruta} ({viaje.fecha})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="id_cliente">ID Cliente *</Label>
          <Select
            value={formData.id_cliente || ""}
            onValueChange={(value) => handleInputChange("id_cliente", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar cliente" />
            </SelectTrigger>
            <SelectContent>
              {clientes.map((cliente) => (
                <SelectItem
                  key={cliente.id}
                  value={cliente.id?.toString() || ""}
                >
                  {cliente.id} - {cliente.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="entrega">Entrega (kg) *</Label>
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
          <Label htmlFor="recojo">Recojo (kg) *</Label>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          type="number"
          step="0.01"
          value={formData.distancia_km}
          onChange={(e) => handleInputChange("distancia_km", e.target.value)}
          placeholder="25.5"
        />
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
          {isEditing ? "Actualizar Visita" : "Registrar Visita"}
        </Button>
      </div>
    </form>
  );
}
