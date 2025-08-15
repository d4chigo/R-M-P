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
import type { Visita } from "@/hooks/use-visitas";
import { useViajes } from "@/hooks/use-viajes";
import { useClientes } from "@/hooks/use-clientes";

interface VisitaFormProps {
  visita?: Visita | null;
  onSubmit: (visita: {
    id_viaje: number;
    id_cliente: number;
    pedidos?: number;
    entrega_cf?: number;
    recojo_cf?: number;
    peso_kg?: number;
    distancia_km?: number;
  }) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export function VisitaForm({
  visita,
  onSubmit,
  onCancel,
  isEditing = false,
}: VisitaFormProps) {
  const { viajes, isLoading: viajesLoading } = useViajes();
  const { clientes, isLoading: clientesLoading } = useClientes();

  const [formData, setFormData] = useState({
    id_viaje: "",
    id_cliente: "",
    pedidos: "",
    entrega_cf: "",
    recojo_cf: "",
    peso_kg: "",
    distancia_km: "",
  });

  const [dataLoaded, setDataLoaded] = useState(false);

  // Función para resetear formulario
  const resetForm = () => {
    setFormData({
      id_viaje: "",
      id_cliente: "",
      pedidos: "",
      entrega_cf: "",
      recojo_cf: "",
      peso_kg: "",
      distancia_km: "",
    });
  };

  useEffect(() => {
    console.log("=== useEffect DEBUG ===");
    console.log("visita:", visita);
    console.log("isEditing:", isEditing);
    console.log("viajesLoading:", viajesLoading);
    console.log("clientesLoading:", clientesLoading);
    console.log("viajes.length:", viajes.length);
    console.log("clientes.length:", clientes.length);

    if (visita && visita.id_visita && isEditing) {
      // Solo cargar datos si hay una visita válida con ID para editar
      // Y esperar a que los datos de viajes y clientes estén disponibles
      if (
        !viajesLoading &&
        !clientesLoading &&
        viajes.length > 0 &&
        clientes.length > 0
      ) {
        console.log("Cargando datos del formulario para edición");

        const newFormData = {
          id_viaje: visita.id_viaje.toString(),
          id_cliente: visita.id_cliente.toString(),
          pedidos: visita.pedidos?.toString() || "",
          entrega_cf: visita.entrega_cf?.toString() || "",
          recojo_cf: visita.recojo_cf?.toString() || "",
          peso_kg: visita.peso_kg?.toString() || "",
          distancia_km: visita.distancia_km?.toString() || "",
        };

        // Forzar re-render después de un timeout para asegurar que los Select se actualicen
        setTimeout(() => {
          setFormData(newFormData);
          setDataLoaded(true);
        }, 100);

        console.log("Datos cargados:", {
          id_viaje: visita.id_viaje.toString(),
          id_cliente: visita.id_cliente.toString(),
        });
      }
    } else if (!isEditing) {
      // Resetear formulario cuando no hay visita para editar o es nueva
      console.log("Reseteando formulario");
      resetForm();
      setDataLoaded(false);
    }
  }, [visita, isEditing, viajes, clientes, viajesLoading, clientesLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones básicas
    if (
      !formData.id_viaje ||
      !formData.id_cliente ||
      formData.id_viaje === "no-data" ||
      formData.id_cliente === "no-data" ||
      formData.id_viaje === "0" ||
      formData.id_cliente === "0"
    ) {
      alert("Viaje y cliente son obligatorios");
      return;
    }

    const viajeId = Number.parseInt(formData.id_viaje);
    const clienteId = Number.parseInt(formData.id_cliente);

    // Validar que los IDs sean números válidos
    if (isNaN(viajeId) || isNaN(clienteId) || viajeId <= 0 || clienteId <= 0) {
      alert("Los IDs de viaje y cliente deben ser válidos");
      return;
    }

    onSubmit({
      id_viaje: viajeId,
      id_cliente: clienteId,
      pedidos: formData.pedidos ? Number.parseInt(formData.pedidos) : undefined,
      entrega_cf: formData.entrega_cf
        ? Number.parseFloat(formData.entrega_cf)
        : undefined,
      recojo_cf: formData.recojo_cf
        ? Number.parseFloat(formData.recojo_cf)
        : undefined,
      peso_kg: formData.peso_kg
        ? Number.parseFloat(formData.peso_kg)
        : undefined,
      distancia_km: formData.distancia_km
        ? Number.parseFloat(formData.distancia_km)
        : undefined,
    });
  };

  const handleInputChange = (field: string, value: string) => {
    // Evitar valores inválidos para los selects
    if (
      (field === "id_viaje" || field === "id_cliente") &&
      (value === "no-data" || value === "0")
    ) {
      return;
    }

    setFormData((prev: typeof formData) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="id_viaje">ID Viaje *</Label>
          <Select
            key={`viaje-${dataLoaded}-${formData.id_viaje}`}
            value={formData.id_viaje || undefined}
            onValueChange={(value) => handleInputChange("id_viaje", value)}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  viajesLoading || viajes.length === 0
                    ? "Cargando viajes..."
                    : "Seleccionar viaje"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {viajesLoading || viajes.length === 0 ? (
                <SelectItem value="no-data" disabled>
                  Cargando viajes...
                </SelectItem>
              ) : (
                viajes.map((viaje) => (
                  <SelectItem
                    key={viaje.id_viaje}
                    value={viaje.id_viaje?.toString() || "0"}
                  >
                    Viaje #{viaje.nro_viaje} - {viaje.fecha} (ID:{" "}
                    {viaje.id_viaje})
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="id_cliente">ID Cliente *</Label>
          <Select
            key={`cliente-${dataLoaded}-${formData.id_cliente}`}
            value={formData.id_cliente || undefined}
            onValueChange={(value) => handleInputChange("id_cliente", value)}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  clientesLoading || clientes.length === 0
                    ? "Cargando clientes..."
                    : "Seleccionar cliente"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {clientesLoading || clientes.length === 0 ? (
                <SelectItem value="no-data" disabled>
                  Cargando clientes...
                </SelectItem>
              ) : (
                clientes.map((cliente) => (
                  <SelectItem
                    key={cliente.id_cliente}
                    value={cliente.id_cliente?.toString() || "0"}
                  >
                    {cliente.nombre} (ID: {cliente.id_cliente})
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="pedidos">Número de Pedidos</Label>
          <Input
            id="pedidos"
            type="number"
            value={formData.pedidos}
            onChange={(e) => handleInputChange("pedidos", e.target.value)}
            placeholder="0"
          />
        </div>
        <div>
          <Label htmlFor="entrega_cf">Entrega (CF)</Label>
          <Input
            id="entrega_cf"
            type="number"
            step="0.01"
            value={formData.entrega_cf}
            onChange={(e) => handleInputChange("entrega_cf", e.target.value)}
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="recojo_cf">Recojo (CF)</Label>
          <Input
            id="recojo_cf"
            type="number"
            step="0.01"
            value={formData.recojo_cf}
            onChange={(e) => handleInputChange("recojo_cf", e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div>
          <Label htmlFor="peso_kg">Peso (kg)</Label>
          <Input
            id="peso_kg"
            type="number"
            step="0.01"
            value={formData.peso_kg}
            onChange={(e) => handleInputChange("peso_kg", e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div>
          <Label htmlFor="distancia_km">Distancia (km)</Label>
          <Input
            id="distancia_km"
            type="number"
            step="0.01"
            value={formData.distancia_km}
            onChange={(e) => handleInputChange("distancia_km", e.target.value)}
            placeholder="0.0"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            resetForm();
            onCancel();
          }}
          className="w-full sm:w-auto bg-transparent"
        >
          Cancelar
        </Button>
        <Button type="submit" className="w-full sm:w-auto">
          {isEditing ? "Actualizar Visita" : "Registrar Visita"}
        </Button>
      </div>
    </form>
  );
}
