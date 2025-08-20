"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

  const [searchViaje, setSearchViaje] = useState("");
  const [searchCliente, setSearchCliente] = useState("");
  const [showViajesDropdown, setShowViajesDropdown] = useState(false);
  const [showClientesDropdown, setShowClientesDropdown] = useState(false);
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
    setSearchViaje("");
    setSearchCliente("");
  };

  useEffect(() => {
    if (visita && visita.id_visita && isEditing) {
      if (
        !viajesLoading &&
        !clientesLoading &&
        viajes.length > 0 &&
        clientes.length > 0
      ) {
        const newFormData = {
          id_viaje: visita.id_viaje.toString(),
          id_cliente: visita.id_cliente.toString(),
          pedidos: visita.pedidos?.toString() || "",
          entrega_cf: visita.entrega_cf?.toString() || "",
          recojo_cf: visita.recojo_cf?.toString() || "",
          peso_kg: visita.peso_kg?.toString() || "",
          distancia_km: visita.distancia_km?.toString() || "",
        };

        setTimeout(() => {
          setFormData(newFormData);
          setDataLoaded(true);
        }, 100);
      }
    } else if (!isEditing) {
      resetForm();
      setDataLoaded(false);
    }
  }, [visita, isEditing, viajes, clientes, viajesLoading, clientesLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

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
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Filtrar viajes y clientes según la búsqueda
  const filteredViajes = viajes.filter((viaje) =>
    viaje.nro_viaje.toString().includes(searchViaje) ||
    viaje.fecha.includes(searchViaje)
  );

  const filteredClientes = clientes.filter((cliente) =>
    cliente.nombre.toLowerCase().includes(searchCliente.toLowerCase())
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative">
          <Label htmlFor="id_viaje">Viaje *</Label>
          <Input
            id="id_viaje"
            type="text"
            value={searchViaje}
            onChange={(e) => {
              setSearchViaje(e.target.value);
              if (e.target.value === "") {
                handleInputChange("id_viaje", "");
              }
            }}
            onFocus={() => setShowViajesDropdown(true)}
            onBlur={() => setTimeout(() => setShowViajesDropdown(false), 200)}
            placeholder="Buscar por ID de viaje"
            className="bg-white dark:bg-gray-800 text-black dark:text-white" // Asegúrate de que el texto sea visible
          />
          {showViajesDropdown && (
            <div className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto border border-gray-300 rounded bg-white shadow-lg dark:bg-gray-800">
              {filteredViajes.length > 0 ? (
                filteredViajes.map((viaje) => (
                  <div
                    key={viaje.id_viaje}
                    className="p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-200 last:border-b-0"
                    onClick={() => {
                      handleInputChange("id_viaje", viaje.id_viaje?.toString() || "");
                      setSearchViaje(`${viaje.nro_viaje} - ${viaje.fecha}`);
                      setShowViajesDropdown(false);
                    }}
                  >
                    Viaje #{viaje.nro_viaje} - {viaje.fecha} (ID: {viaje.id_viaje})
                  </div>
                ))
              ) : (
                <div className="p-2 text-gray-500 text-sm">
                  No se encontraron viajes
                </div>
              )}
            </div>
          )}
        </div>

        <div className="relative">
          <Label htmlFor="id_cliente">Cliente *</Label>
          <Input
            id="id_cliente"
            type="text"
            value={searchCliente}
            onChange={(e) => {
              setSearchCliente(e.target.value);
              if (e.target.value === "") {
                handleInputChange("id_cliente", "");
              }
            }}
            onFocus={() => setShowClientesDropdown(true)}
            onBlur={() => setTimeout(() => setShowClientesDropdown(false), 200)}
            placeholder="Buscar cliente por nombre o ID"
            className="bg-white dark:bg-gray-800 text-black dark:text-white" // Asegúrate de que el texto sea visible
          />
          {showClientesDropdown && (
            <div className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto border border-gray-300 rounded bg-white shadow-lg dark:bg-gray-800">
              {filteredClientes.length > 0 ? (
                filteredClientes.map((cliente) => (
                  <div
                    key={cliente.id_cliente}
                    className="p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-200 last:border-b-0"
                    onClick={() => {
                      handleInputChange("id_cliente", cliente.id_cliente?.toString() || "");
                      setSearchCliente(cliente.nombre);
                      setShowClientesDropdown(false);
                    }}
                  >
                    {cliente.nombre} (ID: {cliente.id_cliente})
                  </div>
                ))
              ) : (
                <div className="p-2 text-gray-500 text-sm">
                  No se encontraron clientes
                </div>
              )}
            </div>
          )}
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
