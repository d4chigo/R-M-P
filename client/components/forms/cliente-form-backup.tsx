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
import ReactSelect from "react-select";
import type { Cliente } from "@/hooks/use-clientes";
import { useTiposCliente } from "@/hooks/use-tipos-cliente";
import { useRutas } from "@/hooks/use-rutas";

interface ClienteFormProps {
  cliente?: Cliente | null;
  onSubmit: (cliente: Omit<Cliente, "id" | "fecha_registro">) => void;
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
  const { tiposCliente } = useTiposCliente();
  const { rutas, fetchRutas, isLoading: rutasLoading } = useRutas();

  const [formData, setFormData] = useState({
    nombre: "",
    codigo: "",
    id_tipo_cliente: "",
    id_ruta_pvta: "",
    id_ruta_tvta: "",
    ruc: "",
    ciudad: "",
    telefono: "",
    email: "",
    contacto_nombre: "",
    hora_apertura: "",
    hora_cierre: "",
    estado: "",
    longitud: "",
    latitud: "",
  });

  // Cargar rutas al montar el componente
  useEffect(() => {
    fetchRutas();
  }, [fetchRutas]);

  useEffect(() => {
    if (cliente) {
      setFormData({
        nombre: cliente.nombre,
        codigo: cliente.codigo,
        id_tipo_cliente: cliente.id_tipo_cliente.toString(),
        id_ruta_pvta: cliente.id_ruta_pvta?.toString() || "",
        id_ruta_tvta: cliente.id_ruta_tvta?.toString() || "",
        ruc: cliente.ruc,
        ciudad: cliente.ciudad,
        telefono: cliente.telefono,
        email: cliente.email,
        contacto_nombre: cliente.contacto_nombre,
        hora_apertura: cliente.horario
          ? cliente.horario.split(" - ")[0] || ""
          : "",
        hora_cierre: cliente.horario
          ? cliente.horario.split(" - ")[1] || ""
          : "",
        estado: cliente.estado,
        longitud: cliente.longitud.toString(),
        latitud: cliente.latitud.toString(),
      });
    }
  }, [cliente]);

  // Preparar opciones para react-select de rutas
  const rutasOptions: OptionType[] = rutas
    .filter((ruta) => ruta.estado === "Activo")
    .map((ruta) => ({
      value: ruta.id!,
      label: `${ruta.codigo} - ${ruta.nombre} (${ruta.origen} → ${ruta.destino})`,
    }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validar RUC
    if (formData.ruc.length !== 11 || !/^\d{11}$/.test(formData.ruc)) {
      alert("El RUC debe tener exactamente 11 dígitos");
      return;
    }

    onSubmit({
      nombre: formData.nombre,
      codigo: formData.codigo,
      id_tipo_cliente: Number.parseInt(formData.id_tipo_cliente),
      id_ruta_pvta: formData.id_ruta_pvta
        ? Number.parseInt(formData.id_ruta_pvta)
        : undefined,
      id_ruta_tvta: formData.id_ruta_tvta
        ? Number.parseInt(formData.id_ruta_tvta)
        : undefined,
      ruc: formData.ruc,
      ciudad: formData.ciudad,
      telefono: formData.telefono,
      email: formData.email,
      contacto_nombre: formData.contacto_nombre,
      horario: `${formData.hora_apertura} - ${formData.hora_cierre}`,
      estado: formData.estado,
      longitud: Number.parseFloat(formData.longitud),
      latitud: Number.parseFloat(formData.latitud),
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Encontrar la opción seleccionada para react-select
  const getSelectedRutaOption = (value: string): OptionType | null => {
    if (!value) return null;
    return (
      rutasOptions.find((option) => option.value.toString() === value) || null
    );
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

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="ruc">RUC *</Label>
          <Input
            id="ruc"
            value={formData.ruc}
            onChange={(e) => handleInputChange("ruc", e.target.value)}
            placeholder="20123456789"
            maxLength={11}
            pattern="\d{11}"
            title="El RUC debe tener exactamente 11 dígitos"
            required
          />
        </div>
        <div>
          <Label htmlFor="id_tipo_cliente">Tipo de Cliente *</Label>
          <Select
            value={formData.id_tipo_cliente || ""}
            onValueChange={(value) =>
              handleInputChange("id_tipo_cliente", value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              {tiposCliente.map((tipo) => (
                <SelectItem key={tipo.id} value={tipo.id?.toString() || ""}>
                  {tipo.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="estado">Estado *</Label>
          <Select
            value={formData.estado || ""}
            onValueChange={(value) => handleInputChange("estado", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Activo">Activo</SelectItem>
              <SelectItem value="Inactivo">Inactivo</SelectItem>
              <SelectItem value="Suspendido">Suspendido</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="ciudad">Ciudad *</Label>
          <Input
            id="ciudad"
            value={formData.ciudad}
            onChange={(e) => handleInputChange("ciudad", e.target.value)}
            placeholder="Lima"
            required
          />
        </div>
        <div>
          <Label htmlFor="id_ruta_pvta">Ruta PVTA</Label>
          <ReactSelect
            id="id_ruta_pvta"
            value={getSelectedRutaOption(formData.id_ruta_pvta)}
            onChange={(selectedOption: any) => {
              const value = selectedOption
                ? selectedOption.value.toString()
                : "";
              handleInputChange("id_ruta_pvta", value);
            }}
            options={rutasOptions}
            placeholder="Seleccionar ruta PVTA..."
            isClearable
            isSearchable
            isLoading={rutasLoading}
            noOptionsMessage={() => "No hay rutas disponibles"}
            loadingMessage={() => "Cargando rutas..."}
            styles={selectStyles}
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>
        <div>
          <Label htmlFor="id_ruta_tvta">Ruta TVTA</Label>
          <ReactSelect
            id="id_ruta_tvta"
            value={getSelectedRutaOption(formData.id_ruta_tvta)}
            onChange={(selectedOption: any) => {
              const value = selectedOption
                ? selectedOption.value.toString()
                : "";
              handleInputChange("id_ruta_tvta", value);
            }}
            options={rutasOptions}
            placeholder="Seleccionar ruta TVTA..."
            isClearable
            isSearchable
            isLoading={rutasLoading}
            noOptionsMessage={() => "No hay rutas disponibles"}
            loadingMessage={() => "Cargando rutas..."}
            styles={selectStyles}
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="telefono">Teléfono *</Label>
          <Input
            id="telefono"
            value={formData.telefono}
            onChange={(e) => handleInputChange("telefono", e.target.value)}
            placeholder="+51-1-2345678"
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder="contacto@empresa.com"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="contacto_nombre">Nombre del Contacto *</Label>
        <Input
          id="contacto_nombre"
          value={formData.contacto_nombre}
          onChange={(e) => handleInputChange("contacto_nombre", e.target.value)}
          placeholder="Juan Pérez"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="hora_apertura">Hora de Apertura *</Label>
          <Input
            id="hora_apertura"
            type="time"
            value={formData.hora_apertura}
            onChange={(e) => handleInputChange("hora_apertura", e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="hora_cierre">Hora de Cierre *</Label>
          <Input
            id="hora_cierre"
            type="time"
            value={formData.hora_cierre}
            onChange={(e) => handleInputChange("hora_cierre", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="latitud">Latitud *</Label>
          <Input
            id="latitud"
            type="number"
            step="any"
            value={formData.latitud}
            onChange={(e) => handleInputChange("latitud", e.target.value)}
            placeholder="-12.0464"
            required
          />
        </div>
        <div>
          <Label htmlFor="longitud">Longitud *</Label>
          <Input
            id="longitud"
            type="number"
            step="any"
            value={formData.longitud}
            onChange={(e) => handleInputChange("longitud", e.target.value)}
            placeholder="-77.0428"
            required
          />
        </div>
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
