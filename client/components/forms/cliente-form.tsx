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
import type { Cliente } from "@/hooks/use-clientes";
import { useZonas } from "@/hooks/use-zonas";

interface ClienteFormProps {
  cliente?: Cliente | null;
  onSubmit: (cliente: {
    codigo: string;
    nombre: string;
    direccion?: string;
    id_zona?: number;
    activo?: boolean;
  }) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

interface OptionType {
  value: number;
  label: string;
}

export function ClienteForm({
  cliente,
  onSubmit,
  onCancel,
  isEditing = false,
}: ClienteFormProps) {
  const { zonas, fetchZonas, isLoading: zonasLoading } = useZonas();

  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    direccion: "",
    selectedZonaId: "",
  });

  // Cargar zonas al montar el componente
  useEffect(() => {
    fetchZonas();
  }, [fetchZonas]);

  useEffect(() => {
    if (cliente && !zonasLoading) {
      setFormData({
        codigo: cliente.codigo || "",
        nombre: cliente.nombre || "",
        direccion: cliente.direccion || "",
        selectedZonaId: cliente.id_zona?.toString() || "",
      });
    } else if (!cliente) {
      setFormData({
        codigo: "",
        nombre: "",
        direccion: "",
        selectedZonaId: "",
      });
    }
  }, [cliente, zonasLoading]);

  // Preparar opciones para dropdown de zonas
  const zonasOptions = zonas.map((zona) => ({
    codigo: zona.codigo,
    label: `${zona.codigo} - ${zona.nombre} - ${zona.region || "Sin región"}`,
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones básicas
    if (!formData.codigo || !formData.nombre) {
      alert("Código y nombre son obligatorios");
      return;
    }

    onSubmit({
      codigo: formData.codigo,
      nombre: formData.nombre,
      direccion: formData.direccion || undefined,
      id_zona: formData.selectedZonaId
        ? Number.parseInt(formData.selectedZonaId)
        : undefined,
      activo: true,
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Función para manejar selección de zona y autocompletar coordenadas
  const handleZonaSelect = (codigoZona: string, tipo: "pvta" | "tvta") => {
    const field = tipo === "pvta" ? "codigo_zona_pvta" : "codigo_zona_tvta";
    handleInputChange(field, codigoZona);

    // Auto-completar coordenadas si la zona tiene coordenadas
    const zona = zonas.find((z) => z.codigo === codigoZona);
    if (zona && zona.latitud && zona.longitud) {
      const shouldUpdate =
        !formData.latitud ||
        !formData.longitud ||
        confirm(
          `¿Desea actualizar las coordenadas con las de la zona ${zona.nombre}?`,
        );

      if (shouldUpdate) {
        setFormData((prev) => ({
          ...prev,
          latitud: zona.latitud!.toString(),
          longitud: zona.longitud!.toString(),
        }));
      }
    }
  };

  // Estilos personalizados para react-select que coincidan con shadcn/ui
  const selectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      minHeight: "40px",
      borderColor: state.isFocused ? "hsl(var(--ring))" : "hsl(var(--border))",
      borderRadius: "6px",
      backgroundColor: "hsl(var(--background))",
      boxShadow: state.isFocused ? "0 0 0 2px hsl(var(--ring))" : "none",
      "&:hover": {
        borderColor: "hsl(var(--border))",
      },
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: "hsl(var(--popover))",
      border: "1px solid hsl(var(--border))",
      borderRadius: "6px",
      zIndex: 50,
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "hsl(var(--accent))"
        : state.isFocused
          ? "hsl(var(--accent) / 0.8)"
          : "transparent",
      color: "hsl(var(--foreground))",
      padding: "8px 12px",
      "&:active": {
        backgroundColor: "hsl(var(--accent))",
      },
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: "hsl(var(--foreground))",
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: "hsl(var(--muted-foreground))",
    }),
    input: (provided: any) => ({
      ...provided,
      color: "hsl(var(--foreground))",
    }),
  };

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

      <div>
        <Label htmlFor="direccion">Dirección</Label>
        <Input
          id="direccion"
          value={formData.direccion}
          onChange={(e) => handleInputChange("direccion", e.target.value)}
          placeholder="Av. Principal 123, Distrito"
        />
      </div>

      <div>
        <Label htmlFor="selectedZonaId">Zona</Label>
        <Select
          value={formData.selectedZonaId}
          onValueChange={(value) => handleInputChange("selectedZonaId", value)}
          disabled={zonasLoading}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={
                zonasLoading ? "Cargando zonas..." : "Seleccionar zona"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {zonas.map((zona) => (
              <SelectItem
                key={zona.id_zona}
                value={zona.id_zona?.toString() || ""}
              >
                {zona.codigo} - {zona.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {isEditing ? "Actualizar Cliente" : "Registrar Cliente"}
        </Button>
      </div>
    </form>
  );
}
