"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CentroDistribucion } from "@/hooks/use-centro-distribucion";
import { Warehouse, MapPin, Globe, Package, Users, Phone, Mail } from "lucide-react";

interface CentroDistribucionFormProps {
  centro?: CentroDistribucion | null;
  onSubmit: (centro: Omit<CentroDistribucion, "id_centro">) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export function CentroDistribucionForm({
  centro,
  onSubmit,
  onCancel,
  isEditing = false,
}: CentroDistribucionFormProps) {
  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    descripcion: "",
    direccion: "",
    ciudad: "",
    estado: "activo" as const,
    capacidad_almacen: "",
    personal_asignado: "",
    telefono: "",
    email: "",
    latitud: "",
    longitud: "",
  });

  const [errors, setErrors] = useState({
    codigo: "",
    nombre: "",
    descripcion: "",
    direccion: "",
    ciudad: "",
    estado: "",
    capacidad_almacen: "",
    personal_asignado: "",
    telefono: "",
    email: "",
    latitud: "",
    longitud: "",
  });

  useEffect(() => {
    if (centro) {
      setFormData({
        codigo: centro.codigo || "",
        nombre: centro.nombre || "",
        descripcion: centro.descripcion || "",
        direccion: centro.direccion || "",
        ciudad: centro.ciudad || "",
        estado: centro.estado || "activo" as const,
        capacidad_almacen: centro.capacidad_almacen ? centro.capacidad_almacen.toString() : "",
        personal_asignado: centro.personal_asignado ? centro.personal_asignado.toString() : "",
        telefono: centro.telefono || "",
        email: centro.email || "",
        latitud: centro.latitud ? centro.latitud.toString() : "",
        longitud: centro.longitud ? centro.longitud.toString() : "",
      });
    }
  }, [centro]);

  const validateForm = () => {
    const newErrors = {
      codigo: "",
      nombre: "",
      descripcion: "",
      direccion: "",
      ciudad: "",
      estado: "",
      capacidad_almacen: "",
      personal_asignado: "",
      telefono: "",
      email: "",
      latitud: "",
      longitud: "",
    };

    // Validar código
    if (!formData.codigo.trim()) {
      newErrors.codigo = "El código es requerido";
    } else if (formData.codigo.length > 20) {
      newErrors.codigo = "El código no puede exceder 20 caracteres";
    }

    // Validar nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido";
    } else if (formData.nombre.length > 100) {
      newErrors.nombre = "El nombre no puede exceder 100 caracteres";
    }

    // Validar descripción
    if (!formData.descripcion.trim()) {
      newErrors.descripcion = "La descripción es requerida";
    } else if (formData.descripcion.length > 500) {
      newErrors.descripcion = "La descripción no puede exceder 500 caracteres";
    }

    // Validar dirección
    if (!formData.direccion.trim()) {
      newErrors.direccion = "La dirección es requerida";
    } else if (formData.direccion.length > 200) {
      newErrors.direccion = "La dirección no puede exceder 200 caracteres";
    }

    // Validar ciudad
    if (!formData.ciudad.trim()) {
      newErrors.ciudad = "La ciudad es requerida";
    } else if (formData.ciudad.length > 100) {
      newErrors.ciudad = "La ciudad no puede exceder 100 caracteres";
    }

    // Validar estado
    if (!formData.estado) {
      newErrors.estado = "El estado es requerido";
    }

    // Validar capacidad de almacén
    if (formData.capacidad_almacen) {
      const capacidad = parseFloat(formData.capacidad_almacen);
      if (isNaN(capacidad)) {
        newErrors.capacidad_almacen = "La capacidad debe ser un número válido";
      } else if (capacidad < 0) {
        newErrors.capacidad_almacen = "La capacidad no puede ser negativa";
      } else if (capacidad > 1000000) {
        newErrors.capacidad_almacen = "La capacidad no puede exceder 1,000,000 m³";
      }
    }

    // Validar personal asignado
    if (formData.personal_asignado) {
      const personal = parseInt(formData.personal_asignado);
      if (isNaN(personal)) {
        newErrors.personal_asignado = "El personal debe ser un número entero válido";
      } else if (personal < 0) {
        newErrors.personal_asignado = "El personal no puede ser negativo";
      } else if (personal > 10000) {
        newErrors.personal_asignado = "El personal no puede exceder 10,000 empleados";
      }
    }

    // Validar teléfono
    if (formData.telefono && formData.telefono.length > 20) {
      newErrors.telefono = "El teléfono no puede exceder 20 caracteres";
    }

    // Validar email
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "El email debe tener un formato válido";
      } else if (formData.email.length > 100) {
        newErrors.email = "El email no puede exceder 100 caracteres";
      }
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
      const centroData = {
        codigo: formData.codigo.trim(),
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        direccion: formData.direccion.trim(),
        ciudad: formData.ciudad.trim(),
        estado: formData.estado,
        capacidad_almacen: formData.capacidad_almacen ? parseFloat(formData.capacidad_almacen) : undefined,
        personal_asignado: formData.personal_asignado ? parseInt(formData.personal_asignado) : undefined,
        telefono: formData.telefono.trim() || undefined,
        email: formData.email.trim() || undefined,
        latitud: formData.latitud ? parseFloat(formData.latitud) : undefined,
        longitud: formData.longitud ? parseFloat(formData.longitud) : undefined,
      };

      onSubmit(centroData);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Código */}
        <div className="space-y-2">
          <Label htmlFor="codigo" className="flex items-center gap-2">
            <Warehouse className="w-4 h-4" />
            Código *
          </Label>
          <Input
            id="codigo"
            value={formData.codigo}
            onChange={(e) => handleInputChange("codigo", e.target.value)}
            placeholder="CD001"
            className={errors.codigo ? "border-red-500" : ""}
          />
          {errors.codigo && (
            <p className="text-sm text-red-500">{errors.codigo}</p>
          )}
        </div>

        {/* Nombre */}
        <div className="space-y-2">
          <Label htmlFor="nombre" className="flex items-center gap-2">
            <Warehouse className="w-4 h-4" />
            Nombre *
          </Label>
          <Input
            id="nombre"
            value={formData.nombre}
            onChange={(e) => handleInputChange("nombre", e.target.value)}
            placeholder="Centro de Distribución Norte"
            className={errors.nombre ? "border-red-500" : ""}
          />
          {errors.nombre && (
            <p className="text-sm text-red-500">{errors.nombre}</p>
          )}
        </div>
      </div>

      {/* Descripción */}
      <div className="space-y-2">
        <Label htmlFor="descripcion" className="flex items-center gap-2">
          <Warehouse className="w-4 h-4" />
          Descripción *
        </Label>
        <Textarea
          id="descripcion"
          value={formData.descripcion}
          onChange={(e) => handleInputChange("descripcion", e.target.value)}
          placeholder="Descripción del centro de distribución..."
          rows={3}
          className={errors.descripcion ? "border-red-500" : ""}
        />
        {errors.descripcion && (
          <p className="text-sm text-red-500">{errors.descripcion}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Dirección */}
        <div className="space-y-2">
          <Label htmlFor="direccion" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Dirección *
          </Label>
          <Input
            id="direccion"
            value={formData.direccion}
            onChange={(e) => handleInputChange("direccion", e.target.value)}
            placeholder="Av. Principal 123"
            className={errors.direccion ? "border-red-500" : ""}
          />
          {errors.direccion && (
            <p className="text-sm text-red-500">{errors.direccion}</p>
          )}
        </div>

        {/* Ciudad */}
        <div className="space-y-2">
          <Label htmlFor="ciudad" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Ciudad *
          </Label>
          <Input
            id="ciudad"
            value={formData.ciudad}
            onChange={(e) => handleInputChange("ciudad", e.target.value)}
            placeholder="Ciudad de México"
            className={errors.ciudad ? "border-red-500" : ""}
          />
          {errors.ciudad && (
            <p className="text-sm text-red-500">{errors.ciudad}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Estado */}
        <div className="space-y-2">
          <Label htmlFor="estado" className="flex items-center gap-2">
            <Warehouse className="w-4 h-4" />
            Estado *
          </Label>
          <Select
            value={formData.estado}
            onValueChange={(value) => handleInputChange("estado", value)}
          >
            <SelectTrigger className={errors.estado ? "border-red-500" : ""}>
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="activo">Activo</SelectItem>
              <SelectItem value="inactivo">Inactivo</SelectItem>
              <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
            </SelectContent>
          </Select>
          {errors.estado && (
            <p className="text-sm text-red-500">{errors.estado}</p>
          )}
        </div>

        {/* Capacidad de Almacén */}
        <div className="space-y-2">
          <Label htmlFor="capacidad_almacen" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Capacidad de Almacén (m³)
          </Label>
          <Input
            id="capacidad_almacen"
            type="number"
            value={formData.capacidad_almacen}
            onChange={(e) => handleInputChange("capacidad_almacen", e.target.value)}
            placeholder="1000"
            min="0"
            className={errors.capacidad_almacen ? "border-red-500" : ""}
          />
          {errors.capacidad_almacen && (
            <p className="text-sm text-red-500">{errors.capacidad_almacen}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Personal Asignado */}
        <div className="space-y-2">
          <Label htmlFor="personal_asignado" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Personal Asignado
          </Label>
          <Input
            id="personal_asignado"
            type="number"
            value={formData.personal_asignado}
            onChange={(e) => handleInputChange("personal_asignado", e.target.value)}
            placeholder="50"
            min="0"
            className={errors.personal_asignado ? "border-red-500" : ""}
          />
          {errors.personal_asignado && (
            <p className="text-sm text-red-500">{errors.personal_asignado}</p>
          )}
        </div>

        {/* Teléfono */}
        <div className="space-y-2">
          <Label htmlFor="telefono" className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Teléfono
          </Label>
          <Input
            id="telefono"
            value={formData.telefono}
            onChange={(e) => handleInputChange("telefono", e.target.value)}
            placeholder="+52 55 1234 5678"
            className={errors.telefono ? "border-red-500" : ""}
          />
          {errors.telefono && (
            <p className="text-sm text-red-500">{errors.telefono}</p>
          )}
        </div>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="flex items-center gap-2">
          <Mail className="w-4 h-4" />
          Email
        </Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          placeholder="centro@empresa.com"
          className={errors.email ? "border-red-500" : ""}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Latitud */}
        <div className="space-y-2">
          <Label htmlFor="latitud" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Latitud
          </Label>
          <Input
            id="latitud"
            type="number"
            step="any"
            value={formData.latitud}
            onChange={(e) => handleInputChange("latitud", e.target.value)}
            placeholder="19.4326"
            className={errors.latitud ? "border-red-500" : ""}
          />
          {errors.latitud && (
            <p className="text-sm text-red-500">{errors.latitud}</p>
          )}
        </div>

        {/* Longitud */}
        <div className="space-y-2">
          <Label htmlFor="longitud" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Longitud
          </Label>
          <Input
            id="longitud"
            type="number"
            step="any"
            value={formData.longitud}
            onChange={(e) => handleInputChange("longitud", e.target.value)}
            placeholder="-99.1332"
            className={errors.longitud ? "border-red-500" : ""}
          />
          {errors.longitud && (
            <p className="text-sm text-red-500">{errors.longitud}</p>
          )}
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {isEditing ? "Actualizar Centro" : "Crear Centro"}
        </Button>
      </div>
    </form>
  );
} 