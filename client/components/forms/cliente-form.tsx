"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { Cliente } from "@/hooks/use-clientes";
import { useZonas } from "@/hooks/use-zonas";

interface ClienteFormProps {
  cliente?: Cliente | null;
  onSubmit: (cliente: {
    codigo: string;
    nombre: string;
    direccion?: string;
    id_zona?: number;
    activo: boolean;
  }) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export function ClienteForm({
  cliente,
  onSubmit,
  onCancel,
  isEditing = false,
}: ClienteFormProps) {
  const { zonas, fetchZonas, isLoading: zonasLoading, error } = useZonas();

  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    direccion: "",
    id_zona: "0",
    activo: true,
  });

  // Cargar zonas al montar el componente
  useEffect(() => {
    console.log("🔍 ClienteForm: Componente montado, cargando zonas...");
    fetchZonas();
  }, []);

  // Debug: Log cuando cambien las zonas
  useEffect(() => {
    console.log("📊 ClienteForm: Estado de zonas:", {
      count: zonas.length,
      isLoading: zonasLoading,
      error: error,
      zonas: zonas.map((z) => ({
        id: z.id_zona,
        codigo: z.codigo,
        descripcion: z.descripcion,
      })),
    });
  }, [zonas, zonasLoading, error]);

  // Llenar el formulario cuando se edita un cliente
  useEffect(() => {
    if (cliente && !zonasLoading) {
      setFormData({
        codigo: cliente.codigo || "",
        nombre: cliente.nombre || "",
        direccion: cliente.direccion || "",
        id_zona:
          cliente.id_zona && cliente.id_zona > 0
            ? cliente.id_zona.toString()
            : "0",
        activo: Boolean(cliente.activo),
      });
    } else if (!cliente) {
      setFormData({
        codigo: "",
        nombre: "",
        direccion: "",
        id_zona: "0",
        activo: true,
      });
    }
  }, [cliente, zonasLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones básicas
    if (!formData.codigo.trim()) {
      alert("El código es obligatorio");
      return;
    }

    if (!formData.nombre.trim()) {
      alert("El nombre es obligatorio");
      return;
    }

    // Validación de formato de código
    if (formData.codigo.length > 20) {
      alert("El código no puede exceder 20 caracteres");
      return;
    }

    // Validación de formato de nombre
    if (formData.nombre.length > 100) {
      alert("El nombre no puede exceder 100 caracteres");
      return;
    }

    onSubmit({
      codigo: formData.codigo.trim(),
      nombre: formData.nombre.trim(),
      direccion: formData.direccion.trim() || undefined,
      id_zona:
        formData.id_zona && formData.id_zona !== "0"
          ? Number.parseInt(formData.id_zona)
          : undefined,
      activo: formData.activo,
    });
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Código y Nombre - campos obligatorios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="codigo">
            Código <span className="text-red-500">*</span>
          </Label>
          <Input
            id="codigo"
            value={formData.codigo}
            onChange={(e) => handleInputChange("codigo", e.target.value)}
            placeholder="CLI001"
            maxLength={20}
            required
            className="font-mono"
          />
          <p className="text-sm text-muted-foreground">
            Máximo 20 caracteres. Debe ser único.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="nombre">
            Nombre <span className="text-red-500">*</span>
          </Label>
          <Input
            id="nombre"
            value={formData.nombre}
            onChange={(e) => handleInputChange("nombre", e.target.value)}
            placeholder="Distribuidora Central S.A."
            maxLength={100}
            required
          />
          <p className="text-sm text-muted-foreground">
            Máximo 100 caracteres.
          </p>
        </div>
      </div>

      {/* Dirección - campo opcional */}
      <div className="space-y-2">
        <Label htmlFor="direccion">Dirección</Label>
        <Textarea
          id="direccion"
          value={formData.direccion}
          onChange={(e) => handleInputChange("direccion", e.target.value)}
          placeholder="Av. Principal 123, Distrito, Ciudad"
          rows={3}
          className="resize-none"
        />
        <p className="text-sm text-muted-foreground">
          Dirección completa del cliente (opcional).
        </p>
      </div>

      {/* Zona - campo opcional */}
      <div className="space-y-2">
        <Label htmlFor="id_zona">Zona</Label>
        <Select
          value={formData.id_zona || "0"}
          onValueChange={(value) => handleInputChange("id_zona", value)}
          disabled={zonasLoading}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={
                zonasLoading
                  ? "Cargando zonas..."
                  : "Seleccionar zona (opcional)"
              }
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Sin zona asignada</SelectItem>
            {zonasLoading ? (
              <SelectItem value="loading" disabled>
                Cargando zonas...
              </SelectItem>
            ) : error ? (
              <SelectItem value="error" disabled>
                Error al cargar zonas
              </SelectItem>
            ) : zonas.length === 0 ? (
              <SelectItem value="empty" disabled>
                No hay zonas disponibles
              </SelectItem>
            ) : (
              zonas
                .filter((zona) => zona.id_zona && zona.id_zona > 0)
                .map((zona) => (
                  <SelectItem
                    key={zona.id_zona}
                    value={zona.id_zona!.toString()}
                  >
                    {zona.codigo} - {zona.descripcion}
                  </SelectItem>
                ))
            )}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          Zona geográfica donde se encuentra el cliente.
        </p>
      </div>

      {/* Estado Activo - campo booleano */}
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="space-y-1">
          <Label htmlFor="activo" className="text-base font-medium">
            Cliente Activo
          </Label>
          <p className="text-sm text-muted-foreground">
            Los clientes inactivos no aparecerán en las listas principales.
          </p>
        </div>
        <Switch
          id="activo"
          checked={formData.activo}
          onCheckedChange={(checked) => handleInputChange("activo", checked)}
        />
      </div>

      {/* Información adicional para edición */}
      {isEditing && cliente && (
        <div className="p-4 bg-muted/50 rounded-lg space-y-2">
          <h4 className="font-medium text-sm">Información del Sistema</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <span className="font-medium">ID:</span> {cliente.id_cliente}
            </div>
            <div>
              <span className="font-medium">Creado:</span>{" "}
              {cliente.created_at
                ? new Date(cliente.created_at).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "N/A"}
            </div>
            <div>
              <span className="font-medium">Última modificación:</span>{" "}
              {cliente.updated_at
                ? new Date(cliente.updated_at).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "N/A"}
            </div>
            {cliente.zona_nombre && (
              <div>
                <span className="font-medium">Zona actual:</span>{" "}
                {cliente.zona_codigo} - {cliente.zona_nombre}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {isEditing ? "Actualizar Cliente" : "Crear Cliente"}
        </Button>
      </div>
    </form>
  );
}
