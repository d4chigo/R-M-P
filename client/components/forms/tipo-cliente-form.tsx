"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TipoCliente } from "@/hooks/use-tipos-cliente";

interface TipoClienteFormProps {
  tipoCliente?: TipoCliente | null;
  onSubmit: (tipoCliente: Omit<TipoCliente, "id">) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export function TipoClienteForm({
  tipoCliente,
  onSubmit,
  onCancel,
  isEditing = false,
}: TipoClienteFormProps) {
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
  });

  useEffect(() => {
    if (tipoCliente) {
      setFormData({
        nombre: tipoCliente.nombre,
        descripcion: tipoCliente.descripcion || "",
      });
    }
  }, [tipoCliente]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      nombre: formData.nombre,
      descripcion: formData.descripcion,
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="nombre">Nombre del Tipo *</Label>
        <Input
          id="nombre"
          value={formData.nombre}
          onChange={(e) => handleInputChange("nombre", e.target.value)}
          placeholder="Ej: Mayorista, Minorista, etc."
          required
        />
      </div>

      <div>
        <Label htmlFor="descripcion">Descripción</Label>
        <Input
          id="descripcion"
          value={formData.descripcion}
          onChange={(e) => handleInputChange("descripcion", e.target.value)}
          placeholder="Descripción del tipo de cliente (opcional)"
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
          {isEditing ? "Actualizar Tipo" : "Crear Tipo"}
        </Button>
      </div>
    </form>
  );
}
