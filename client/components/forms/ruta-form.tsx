"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { Ruta } from "@/hooks/use-rutas";
import { formatTimeForInput, formatTimeForDatabase } from "@/lib/utils/date";

interface RutaFormProps {
  ruta?: Ruta | null;
  onSubmit: (ruta: Omit<Ruta, "id">) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export function RutaForm({
  ruta,
  onSubmit,
  onCancel,
  isEditing = false,
}: RutaFormProps) {
  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    origen: "",
    destino: "",
    distancia_km: "",
    duracion_aproximada: "",
    tipo_ruta: "",
    estado: "",
  });

  useEffect(() => {
    console.log("🔄 RutaForm useEffect triggered - ruta:", ruta);
    if (ruta && ruta.id) {
      // Convert duration from HH:MM:SS to HH:MM for time input
      const formattedDuration = formatTimeForInput(ruta.duracion_aproximada);

      const newFormData = {
        codigo: ruta.codigo || "",
        nombre: ruta.nombre || "",
        origen: ruta.origen || "",
        destino: ruta.destino || "",
        distancia_km: ruta.distancia_km?.toString() || "",
        duracion_aproximada: formattedDuration,
        tipo_ruta: ruta.tipo_ruta || "",
        estado: ruta.estado || "",
      };

      console.log("📝 Setting formData:", newFormData);
      console.log(
        "🎯 tipo_ruta:",
        ruta.tipo_ruta,
        "-> formData.tipo_ruta:",
        newFormData.tipo_ruta,
      );
      console.log(
        "🎯 estado:",
        ruta.estado,
        "-> formData.estado:",
        newFormData.estado,
      );

      setFormData(newFormData);
    } else if (!ruta) {
      console.log("🆕 Resetting form for new ruta");
      setFormData({
        codigo: "",
        nombre: "",
        origen: "",
        destino: "",
        distancia_km: "",
        duracion_aproximada: "",
        tipo_ruta: "",
        estado: "",
      });
    }
  }, [ruta?.id, ruta?.tipo_ruta, ruta?.estado]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate field lengths to prevent database errors
    const validationErrors = [];

    if (formData.codigo.length > 10) {
      validationErrors.push("El código no puede exceder 10 caracteres");
    }
    if (formData.nombre.length > 50) {
      validationErrors.push("El nombre no puede exceder 50 caracteres");
    }
    if (formData.origen.length > 50) {
      validationErrors.push("El origen no puede exceder 50 caracteres");
    }
    if (formData.destino.length > 50) {
      validationErrors.push("El destino no puede exceder 50 caracteres");
    }
    if (formData.tipo_ruta.length > 20) {
      validationErrors.push("El tipo de ruta no puede exceder 20 caracteres");
    }
    if (formData.estado.length > 20) {
      validationErrors.push("El estado no puede exceder 20 caracteres");
    }

    if (validationErrors.length > 0) {
      alert("Errores de validación:\n" + validationErrors.join("\n"));
      return;
    }

    // Convert duration back to HH:MM:SS format for database
    const durationForDatabase = formatTimeForDatabase(
      formData.duracion_aproximada,
    );

    const submitData = {
      codigo: formData.codigo,
      nombre: formData.nombre,
      origen: formData.origen,
      destino: formData.destino,
      distancia_km: Number.parseFloat(formData.distancia_km),
      duracion_aproximada: durationForDatabase,
      tipo_ruta: formData.tipo_ruta,
      estado: formData.estado,
      fecha_creacion: new Date().toISOString(),
    };

    console.log("🚛 RutaForm - final submit data:", submitData);
    onSubmit(submitData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="codigo">Código de Ruta *</Label>
          <Input
            id="codigo"
            value={formData.codigo}
            onChange={(e) => handleInputChange("codigo", e.target.value)}
            placeholder="RUT001"
            maxLength={10}
            required
          />
        </div>
        <div>
          <Label htmlFor="nombre">Nombre de la Ruta *</Label>
          <Input
            id="nombre"
            value={formData.nombre}
            onChange={(e) => handleInputChange("nombre", e.target.value)}
            placeholder="Lima - Arequipa"
            maxLength={50}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="origen">Origen *</Label>
          <Input
            id="origen"
            value={formData.origen}
            onChange={(e) => handleInputChange("origen", e.target.value)}
            placeholder="Lima"
            maxLength={50}
            required
          />
        </div>
        <div>
          <Label htmlFor="destino">Destino *</Label>
          <Input
            id="destino"
            value={formData.destino}
            onChange={(e) => handleInputChange("destino", e.target.value)}
            placeholder="Arequipa"
            maxLength={50}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="distancia_km">Distancia (km) *</Label>
          <Input
            id="distancia_km"
            type="number"
            value={formData.distancia_km}
            onChange={(e) => handleInputChange("distancia_km", e.target.value)}
            placeholder="1009"
            min="0"
            step="0.01"
            required
          />
        </div>
        <div>
          <Label htmlFor="duracion_aproximada">Duración Aproximada *</Label>
          <Input
            id="duracion_aproximada"
            type="time"
            value={formData.duracion_aproximada}
            onChange={(e) =>
              handleInputChange("duracion_aproximada", e.target.value)
            }
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="tipo_ruta">Tipo de Ruta *</Label>
          <select
            id="tipo_ruta"
            value={formData.tipo_ruta}
            onChange={(e) => handleInputChange("tipo_ruta", e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            required
          >
            <option value="">Seleccionar tipo</option>
            <option value="Nacional">Nacional</option>
            <option value="Internacional">Internacional</option>
            <option value="Regional">Regional</option>
            <option value="Local">Local</option>
          </select>
          <div style={{ fontSize: "10px", color: "#666", marginTop: "2px" }}>
            Debug: value="{formData.tipo_ruta}"
          </div>
        </div>
        <div>
          <Label htmlFor="estado">Estado *</Label>
          <select
            id="estado"
            value={formData.estado}
            onChange={(e) => handleInputChange("estado", e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            required
          >
            <option value="">Seleccionar estado</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
            <option value="En Mantenimiento">En Mantenimiento</option>
            <option value="Suspendido">Suspendido</option>
          </select>
          <div style={{ fontSize: "10px", color: "#666", marginTop: "2px" }}>
            Debug: value="{formData.estado}"
          </div>
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
          {isEditing ? "Actualizar Ruta" : "Registrar Ruta"}
        </Button>
      </div>
    </form>
  );
}
