"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Zona } from "@/hooks/use-zonas";
import { MapPin, Globe } from "lucide-react";

interface ZonaFormProps {
  zona?: Zona | null;
  onSubmit: (zona: Omit<Zona, "id_zona">) => void;
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
    descripcion: "",
    latitud: "",
    longitud: "",
  });

  const [errors, setErrors] = useState({
    codigo: "",
    descripcion: "",
    latitud: "",
    longitud: "",
  });

  useEffect(() => {
    if (zona) {
      setFormData({
        codigo: zona.codigo || "",
        descripcion: zona.descripcion || "",
        latitud: zona.latitud ? zona.latitud.toString() : "",
        longitud: zona.longitud ? zona.longitud.toString() : "",
      });
    }
  }, [zona]);

  const validateForm = () => {
    const newErrors = {
      codigo: "",
      descripcion: "",
      latitud: "",
      longitud: "",
    };

    // Validar código
    if (!formData.codigo.trim()) {
      newErrors.codigo = "El código es requerido";
    } else if (formData.codigo.length > 20) {
      newErrors.codigo = "El código no puede exceder 20 caracteres";
    }

    // Validar descripción
    if (!formData.descripcion.trim()) {
      newErrors.descripcion = "La descripción es requerida";
    } else if (formData.descripcion.length > 500) {
      newErrors.descripcion = "La descripción no puede exceder 500 caracteres";
    }

    // Validar latitud
    if (formData.latitud) {
      const lat = parseFloat(formData.latitud);
      if (isNaN(lat)) {
        newErrors.latitud = "La latitud debe ser un número válido";
      } else if (lat < -90 || lat > 90) {
        newErrors.latitud = "La latitud debe estar entre -90 y 90 grados";
      }
    }

    // Validar longitud
    if (formData.longitud) {
      const lng = parseFloat(formData.longitud);
      if (isNaN(lng)) {
        newErrors.longitud = "La longitud debe ser un número válido";
      } else if (lng < -180 || lng > 180) {
        newErrors.longitud = "La longitud debe estar entre -180 y 180 grados";
      }
    }

    // Validar que si se proporciona una coordenada, se proporcione la otra
    if ((formData.latitud && !formData.longitud) || (!formData.latitud && formData.longitud)) {
      if (formData.latitud && !formData.longitud) {
        newErrors.longitud = "Si proporciona latitud, también debe proporcionar longitud";
      }
      if (!formData.latitud && formData.longitud) {
        newErrors.latitud = "Si proporciona longitud, también debe proporcionar latitud";
      }
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== "");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit({
        codigo: formData.codigo.trim(),
        descripcion: formData.descripcion.trim(),
        latitud: formData.latitud ? parseFloat(formData.latitud) : undefined,
        longitud: formData.longitud ? parseFloat(formData.longitud) : undefined,
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const setLimaCenter = () => {
    setFormData(prev => ({
      ...prev,
      latitud: "-12.0464",
      longitud: "-77.0428"
    }));
    setErrors(prev => ({
      ...prev,
      latitud: "",
      longitud: ""
    }));
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitud: position.coords.latitude.toString(),
            longitud: position.coords.longitude.toString()
          }));
          setErrors(prev => ({
            ...prev,
            latitud: "",
            longitud: ""
          }));
        },
        (error) => {
          console.error("Error obteniendo ubicación:", error);
          alert("No se pudo obtener la ubicación actual");
        }
      );
    } else {
      alert("La geolocalización no está soportada en este navegador");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="codigo" className="text-sm font-medium">
          Código de la Zona *
        </Label>
        <Input
          id="codigo"
          value={formData.codigo}
          onChange={(e) => handleInputChange("codigo", e.target.value)}
          placeholder="Ej: ZN001, ZS001, ZC001"
          className={`mt-1 ${errors.codigo ? "border-red-500 focus:border-red-500" : ""}`}
          maxLength={20}
          required
        />
        {errors.codigo && (
          <p className="text-sm text-red-500 mt-1">{errors.codigo}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Máximo 20 caracteres. Debe ser único.
        </p>
      </div>

      <div>
        <Label htmlFor="descripcion" className="text-sm font-medium">
          Descripción de la Zona *
        </Label>
        <Textarea
          id="descripcion"
          value={formData.descripcion}
          onChange={(e) => handleInputChange("descripcion", e.target.value)}
          placeholder="Ej: Zona Norte de Lima - Incluye Los Olivos, Independencia, San Martín de Porres..."
          className={`mt-1 ${errors.descripcion ? "border-red-500 focus:border-red-500" : ""}`}
          maxLength={500}
          rows={3}
          required
        />
        {errors.descripcion && (
          <p className="text-sm text-red-500 mt-1">{errors.descripcion}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Máximo 500 caracteres. {formData.descripcion.length}/500
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-green-600" />
          <Label className="text-sm font-medium">
            Coordenadas GPS (Opcional)
          </Label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="latitud" className="text-sm">
              Latitud
            </Label>
            <Input
              id="latitud"
              type="number"
              step="any"
              value={formData.latitud}
              onChange={(e) => handleInputChange("latitud", e.target.value)}
              placeholder="-12.0464"
              className={`mt-1 ${errors.latitud ? "border-red-500 focus:border-red-500" : ""}`}
            />
            {errors.latitud && (
              <p className="text-sm text-red-500 mt-1">{errors.latitud}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Entre -90 y 90 grados
            </p>
          </div>

          <div>
            <Label htmlFor="longitud" className="text-sm">
              Longitud
            </Label>
            <Input
              id="longitud"
              type="number"
              step="any"
              value={formData.longitud}
              onChange={(e) => handleInputChange("longitud", e.target.value)}
              placeholder="-77.0428"
              className={`mt-1 ${errors.longitud ? "border-red-500 focus:border-red-500" : ""}`}
            />
            {errors.longitud && (
              <p className="text-sm text-red-500 mt-1">{errors.longitud}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Entre -180 y 180 grados
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={setLimaCenter}
            className="flex items-center gap-2"
          >
            <Globe className="w-4 h-4" />
            Centro de Lima
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={getCurrentLocation}
            className="flex items-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            Mi Ubicación
          </Button>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            💡 <strong>Tip:</strong> Las coordenadas GPS son opcionales pero muy útiles para:
          </p>
          <ul className="text-xs text-blue-600 dark:text-blue-400 mt-1 ml-4 list-disc">
            <li>Mostrar la zona en el mapa interactivo</li>
            <li>Calcular distancias entre zonas</li>
            <li>Optimizar rutas de entrega</li>
            <li>Análisis geográfico de operaciones</li>
          </ul>
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
