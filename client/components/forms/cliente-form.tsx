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
import { useTiposCliente } from "@/hooks/use-tipos-cliente";
import { useZonas } from "@/hooks/use-zonas";

interface ClienteFormProps {
  cliente?: Cliente | null;
  onSubmit: (cliente: Omit<Cliente, "id" | "fecha_registro">) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export function ClienteForm({
  cliente,
  onSubmit,
  onCancel,
  isEditing = false,
}: ClienteFormProps) {
  const { tiposCliente } = useTiposCliente();
  const { zonas } = useZonas();

  const [formData, setFormData] = useState({
    nombre: "",
    codigo: "",
    id_tipo_cliente: "",
    id_zona_pvta: "",
    id_zona_tvta: "",
    ruc: "",
    ciudad: "",
    telefono: "",
    email: "",
    contacto_nombre: "",
    horario: "",
    estado: "",
    longitud: "",
    latitud: "",
  });

  useEffect(() => {
    if (cliente) {
      setFormData({
        nombre: cliente.nombre,
        codigo: cliente.codigo,
        id_tipo_cliente: cliente.id_tipo_cliente.toString(),
        id_zona_pvta: cliente.id_zona_pvta?.toString() || "",
        id_zona_tvta: cliente.id_zona_tvta?.toString() || "",
        ruc: cliente.ruc,
        ciudad: cliente.ciudad,
        telefono: cliente.telefono,
        email: cliente.email,
        contacto_nombre: cliente.contacto_nombre,
        horario: cliente.horario,
        estado: cliente.estado,
        longitud: cliente.longitud.toString(),
        latitud: cliente.latitud.toString(),
      });
    }
  }, [cliente]);

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
      id_zona_pvta: formData.id_zona_pvta
        ? Number.parseInt(formData.id_zona_pvta)
        : undefined,
      id_zona_tvta: formData.id_zona_tvta
        ? Number.parseInt(formData.id_zona_tvta)
        : undefined,
      ruc: formData.ruc,
      ciudad: formData.ciudad,
      telefono: formData.telefono,
      email: formData.email,
      contacto_nombre: formData.contacto_nombre,
      horario: formData.horario,
      estado: formData.estado,
      longitud: Number.parseFloat(formData.longitud),
      latitud: Number.parseFloat(formData.latitud),
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
            value={formData.id_tipo_cliente}
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
            value={formData.estado}
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
          <Label htmlFor="id_zona_pvta">Zona PVTA</Label>
          <Select
            value={formData.id_zona_pvta}
            onValueChange={(value) => handleInputChange("id_zona_pvta", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar zona PVTA" />
            </SelectTrigger>
            <SelectContent>
              {zonas.map((zona) => (
                <SelectItem key={zona.id} value={zona.id?.toString() || ""}>
                  {zona.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="id_zona_tvta">Zona TVTA</Label>
          <Select
            value={formData.id_zona_tvta}
            onValueChange={(value) => handleInputChange("id_zona_tvta", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar zona TVTA" />
            </SelectTrigger>
            <SelectContent>
              {zonas.map((zona) => (
                <SelectItem key={zona.id} value={zona.id?.toString() || ""}>
                  {zona.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

      <div>
        <Label htmlFor="horario">Horario de Atención *</Label>
        <Input
          id="horario"
          value={formData.horario}
          onChange={(e) => handleInputChange("horario", e.target.value)}
          placeholder="Lunes a Viernes 8:00 AM - 6:00 PM"
          required
        />
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
