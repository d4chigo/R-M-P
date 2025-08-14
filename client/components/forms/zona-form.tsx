"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Zona } from "@/hooks/use-zonas";

interface ZonaFormProps {
  zona?: Zona | null;
  onSubmit: (zona: Omit<Zona, "id">) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export function ZonaForm({
  zona,
  onSubmit,
  onCancel,
  isEditing = false,
}: ZonaFormProps) {
  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    descripcion: "",
    region: "",
    latitud: "",
    longitud: "",
  });

  useEffect(() => {
    if (zona) {
      setFormData({
        codigo: zona.codigo || "",
        nombre: zona.nombre,
        descripcion: zona.descripcion,
        region: zona.region || "",
        latitud: zona.latitud ? zona.latitud.toString() : "",
        longitud: zona.longitud ? zona.longitud.toString() : "",
      });
    }
  }, [zona]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      codigo: formData.codigo,
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      region: formData.region,
      latitud: formData.latitud
        ? Number.parseFloat(formData.latitud)
        : undefined,
      longitud: formData.longitud
        ? Number.parseFloat(formData.longitud)
        : undefined,
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="codigo">Código de la Zona *</Label>
        <Input
          id="codigo"
          value={formData.codigo}
          onChange={(e) => handleInputChange("codigo", e.target.value)}
          placeholder="ZN001, ZS001, ZC001, etc."
          required
        />
      </div>

      <div>
        <Label htmlFor="nombre">Nombre de la Zona *</Label>
        <Input
          id="nombre"
          value={formData.nombre}
          onChange={(e) => handleInputChange("nombre", e.target.value)}
          placeholder="Zona Norte, Zona Centro, etc."
          required
        />
      </div>

      <div>
        <Label htmlFor="descripcion">Descripción *</Label>
        <Textarea
          id="descripcion"
          value={formData.descripcion}
          onChange={(e) => handleInputChange("descripcion", e.target.value)}
          placeholder="Descripción detallada de la zona geográfica..."
          rows={3}
          required
        />
      </div>

      <div>
        <Label htmlFor="region">Región</Label>
        <Input
          id="region"
          value={formData.region}
          onChange={(e) => handleInputChange("region", e.target.value)}
          placeholder="Lima, Callao, Arequipa, etc."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="latitud">Latitud</Label>
          <Input
            id="latitud"
            type="number"
            step="any"
            value={formData.latitud}
            onChange={(e) => handleInputChange("latitud", e.target.value)}
            placeholder="-12.0464"
          />
        </div>
        <div>
          <Label htmlFor="longitud">Longitud</Label>
          <Input
            id="longitud"
            type="number"
            step="any"
            value={formData.longitud}
            onChange={(e) => handleInputChange("longitud", e.target.value)}
            placeholder="-77.0428"
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
          {isEditing ? "Actualizar Zona" : "Crear Zona"}
        </Button>
      </div>
    </form>
  );
}
