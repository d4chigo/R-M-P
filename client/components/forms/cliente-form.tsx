"use client";

import type React from "react";

import { useState, useEffect, useCallback } from "react";
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
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    direccion: "",
    id_zona: "0",
    activo: true,
  });

  const [initialLoad, setInitialLoad] = useState(false);
  const [originalIdZona, setOriginalIdZona] = useState<number | undefined>(
    undefined,
  );

  // Cargar zonas al montar el componente
  const loadZonas = useCallback(async () => {
    if (!initialLoad) {
      console.log("🔍 ClienteForm: Cargando zonas iniciales...");
      try {
        await fetchZonas();
        setInitialLoad(true);
      } catch (error) {
        console.error("Error al cargar zonas:", error);
        toast({
          title: "Error al cargar zonas",
          description: "No se pudieron cargar las zonas disponibles",
          variant: "destructive",
        });
      }
    }
  }, [fetchZonas, initialLoad, toast]);

  useEffect(() => {
    loadZonas();
  }, [loadZonas]);

  // Llenar el formulario cuando se edita un cliente
  useEffect(() => {
    if (cliente) {
      console.log(
        "📝 ClienteForm: Actualizando formulario con datos del cliente:",
        cliente,
      );
      console.log("📝 ClienteForm: id_zona del cliente:", cliente.id_zona);

      // Guardar la zona original para preservarla
      setOriginalIdZona(cliente.id_zona);

      const newIdZona =
        cliente.id_zona && cliente.id_zona > 0
          ? cliente.id_zona.toString()
          : "0";
      console.log(
        "📝 ClienteForm: id_zona convertido para formulario:",
        newIdZona,
      );

      setFormData({
        codigo: cliente.codigo || "",
        nombre: cliente.nombre || "",
        direccion: cliente.direccion || "",
        id_zona: newIdZona,
        activo: Boolean(cliente.activo),
      });
    } else if (!isEditing) {
      // Solo resetear si no estamos editando
      setOriginalIdZona(undefined);
      setFormData({
        codigo: "",
        nombre: "",
        direccion: "",
        id_zona: "0",
        activo: true,
      });
    }
  }, [cliente, isEditing]);

  // Debug: Log cuando cambien las zonas
  useEffect(() => {
    console.log("📊 ClienteForm: Estado de zonas:", {
      count: zonas.length,
      isLoading: zonasLoading,
      error: error,
      zonas: zonas.slice(0, 3).map((z) => ({
        id: z.id_zona,
        codigo: z.codigo,
        descripcion: z.descripcion,
      })),
    });
  }, [zonas, zonasLoading, error]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones básicas
    if (!formData.codigo.trim()) {
      toast({
        title: "Campo requerido",
        description: "El código es obligatorio",
        variant: "destructive",
      });
      return;
    }

    if (!formData.nombre.trim()) {
      toast({
        title: "Campo requerido",
        description: "El nombre es obligatorio",
        variant: "destructive",
      });
      return;
    }

    // Validación de formato de código
    if (formData.codigo.length > 20) {
      toast({
        title: "Código muy largo",
        description: "El código no puede exceder 20 caracteres",
        variant: "destructive",
      });
      return;
    }

    // Validación de formato de nombre
    if (formData.nombre.length > 100) {
      toast({
        title: "Nombre muy largo",
        description: "El nombre no puede exceder 100 caracteres",
        variant: "destructive",
      });
      return;
    }

    // Solo enviar campos que realmente cambiaron
    const submitData: any = {
      codigo: formData.codigo.trim(),
      nombre: formData.nombre.trim(),
      activo: formData.activo,
    };

    // Solo incluir dirección si hay valor o estamos creando
    if (formData.direccion.trim() || !isEditing) {
      submitData.direccion = formData.direccion.trim() || undefined;
    }

    // Solo incluir id_zona si realmente cambió o estamos creando
    if (isEditing && cliente) {
      // Solo enviar id_zona si es diferente al original
      const newIdZona =
        formData.id_zona && formData.id_zona !== "0"
          ? Number.parseInt(formData.id_zona)
          : undefined;

      if (newIdZona !== originalIdZona) {
        submitData.id_zona = newIdZona;
        console.log(
          "🔄 ClienteForm: Zona cambió de",
          originalIdZona,
          "a",
          newIdZona,
        );
      } else {
        console.log("🔄 ClienteForm: Zona no cambió, no se envía");
      }
    } else {
      // Para creación nueva, siempre incluir
      submitData.id_zona =
        formData.id_zona && formData.id_zona !== "0"
          ? Number.parseInt(formData.id_zona)
          : undefined;
    }

    console.log("📤 ClienteForm: Enviando datos:", submitData);
    console.log("📤 ClienteForm: Cliente original completo:", cliente);
    console.log("📤 ClienteForm: FormData completo:", formData);
    onSubmit(submitData);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    console.log(`📝 ClienteForm: Actualizando ${field}:`, value);
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      console.log("📊 ClienteForm: Nuevo estado del formulario:", newData);
      return newData;
    });
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
          onValueChange={(value) => {
            console.log("🏷️ ClienteForm: Zona seleccionada:", value);
            console.log(
              "🏷️ ClienteForm: Cliente original id_zona:",
              cliente?.id_zona,
            );
            console.log(
              "🏷️ ClienteForm: Formdata actual id_zona:",
              formData.id_zona,
            );
            handleInputChange("id_zona", value);
          }}
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
                .sort((a, b) => a.codigo.localeCompare(b.codigo))
                .map((zona) => (
                  <SelectItem
                    key={`zona-${zona.id_zona}`}
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
