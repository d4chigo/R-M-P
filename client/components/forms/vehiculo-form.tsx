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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import type { Vehiculo } from "@/hooks/use-vehiculos";
import { normalizeBoolean } from "@/hooks/use-vehiculos";

interface VehiculoFormProps {
  vehiculo?: Vehiculo | null;
  onSubmit: (vehiculo: {
    placa: string;
    marca: string;
    modelo: string;
    anio?: number;
    capacidad_kg?: number;
    capacidad_cajas?: number;
    activo?: boolean;
  }) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export function VehiculoForm({
  vehiculo,
  onSubmit,
  onCancel,
  isEditing = false,
}: VehiculoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    placa: "",
    marca: "",
    modelo: "",
    anio: "",
    capacidad_kg: "",
    capacidad_cajas: "",
    activo: true,
  });

  useEffect(() => {
    if (vehiculo) {
      setFormData({
        placa: vehiculo.placa || "",
        marca: vehiculo.marca || "",
        modelo: vehiculo.modelo || "",
        anio: vehiculo.anio?.toString() || "",
        capacidad_kg: vehiculo.capacidad_kg?.toString() || "",
        capacidad_cajas: vehiculo.capacidad_cajas?.toString() || "",
        activo: normalizeBoolean(vehiculo.activo),
      });
    }
  }, [vehiculo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      // Validaciones básicas
      if (!formData.placa.trim()) {
        throw new Error("La placa es requerida");
      }
      if (!formData.marca.trim()) {
        throw new Error("La marca es requerida");
      }
      if (!formData.modelo.trim()) {
        throw new Error("El modelo es requerido");
      }

      await onSubmit({
        placa: formData.placa.trim().toUpperCase(),
        marca: formData.marca.trim(),
        modelo: formData.modelo.trim(),
        anio: formData.anio ? Number.parseInt(formData.anio) : undefined,
        capacidad_kg: formData.capacidad_kg
          ? Number.parseFloat(formData.capacidad_kg)
          : undefined,
        capacidad_cajas: formData.capacidad_cajas
          ? Number.parseInt(formData.capacidad_cajas)
          : undefined,
        activo: formData.activo,
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      setFormError(
        error instanceof Error
          ? error.message
          : "Error al guardar el vehículo. Por favor intenta nuevamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="mobile-form-spacing">
      {formError && (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Placa - Campo requerido */}
        <div>
          <Label htmlFor="placa">Placa *</Label>
          <Input
            id="placa"
            value={formData.placa}
            onChange={(e) =>
              handleInputChange("placa", e.target.value.toUpperCase())
            }
            placeholder="ABC-123"
            maxLength={10}
            className="mobile-input"
            required
          />
        </div>

        {/* Marca y Modelo - Campos requeridos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="marca">Marca *</Label>
            <Input
              id="marca"
              value={formData.marca}
              onChange={(e) => handleInputChange("marca", e.target.value)}
              placeholder="Toyota, Volvo, Mercedes, etc."
              maxLength={50}
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
              placeholder="FH16, Actros, Hino, etc."
              maxLength={50}
              className="mobile-input"
              required
            />
          </div>
        </div>

        {/* Año y Estado */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="anio">Año</Label>
            <Input
              id="anio"
              type="number"
              value={formData.anio}
              onChange={(e) => handleInputChange("anio", e.target.value)}
              placeholder="2023"
              min="1990"
              max="2030"
              className="mobile-input"
            />
          </div>
          <div>
            <Label htmlFor="activo">Estado</Label>
            <Select
              value={formData.activo ? "true" : "false"}
              onValueChange={(value) =>
                handleInputChange("activo", value === "true")
              }
            >
              <SelectTrigger className="mobile-input">
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Activo</SelectItem>
                <SelectItem value="false">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Capacidades - Campos opcionales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="capacidad_kg">Capacidad de Carga (Kg)</Label>
            <Input
              id="capacidad_kg"
              type="number"
              step="0.01"
              value={formData.capacidad_kg}
              onChange={(e) =>
                handleInputChange("capacidad_kg", e.target.value)
              }
              placeholder="25000"
              min="0"
              className="mobile-input"
            />
          </div>
          <div>
            <Label htmlFor="capacidad_cajas">Capacidad en Cajas</Label>
            <Input
              id="capacidad_cajas"
              type="number"
              value={formData.capacidad_cajas}
              onChange={(e) =>
                handleInputChange("capacidad_cajas", e.target.value)
              }
              placeholder="100"
              min="0"
              className="mobile-input"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="mobile-button bg-transparent"
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="mobile-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                {isEditing ? "Actualizando..." : "Registrando..."}
              </>
            ) : isEditing ? (
              "Actualizar Vehículo"
            ) : (
              "Registrar Vehículo"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
