"use client";

import type React from "react";
import { useState, useEffect, useMemo } from "react";
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
    estado_entrega?: 'ENTREGADO' | 'NO_ENTREGADO' | 'REPROGRAMADO';
    motivo_no_entrega?: string | null;
    hora_llegada?: string | null;
    hora_salida?: string | null;
    ventana_ini?: string | null;
    ventana_fin?: string | null;
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
    estado_entrega: "ENTREGADO" as 'ENTREGADO' | 'NO_ENTREGADO' | 'REPROGRAMADO',
    motivo_no_entrega: "",
    hora_llegada: "",
    hora_salida: "",
    ventana_ini: "",
    ventana_fin: "",
  });

  const [searchViaje, setSearchViaje] = useState("");
  const [searchCliente, setSearchCliente] = useState("");
  const [showViajesDropdown, setShowViajesDropdown] = useState(false);
  const [showClientesDropdown, setShowClientesDropdown] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Cálculo de IDR (minutos fuera de ventana) y bandera Fuera de VH en base a los campos del formulario
  const { idrMin, fueraVH } = useMemo(() => {
    const parse = (v?: string) => (v ? new Date(v) : null);
    const llegada = parse(formData.hora_llegada);
    const open = parse(formData.ventana_ini);
    const close = parse(formData.ventana_fin);

    if (!llegada || !open || !close) return { idrMin: null as number | null, fueraVH: null as boolean | null };

    if (llegada >= open && llegada <= close) return { idrMin: 0, fueraVH: false };

    const diffMs = llegada < open ? open.getTime() - llegada.getTime() : llegada.getTime() - close.getTime();
    const minutes = Math.round(diffMs / 60000);
    // Negativo si llegó antes de la ventana, positivo si después
    const idr = llegada < open ? -minutes : minutes;
    return { idrMin: idr, fueraVH: true };
  }, [formData.hora_llegada, formData.ventana_ini, formData.ventana_fin]);

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
      estado_entrega: "ENTREGADO",
      motivo_no_entrega: "",
      hora_llegada: "",
      hora_salida: "",
      ventana_ini: "",
      ventana_fin: "",
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
          estado_entrega: (visita.estado_entrega || 'ENTREGADO') as 'ENTREGADO' | 'NO_ENTREGADO' | 'REPROGRAMADO',
          motivo_no_entrega: visita.motivo_no_entrega || "",
          hora_llegada: visita.hora_llegada || "",
          hora_salida: visita.hora_salida || "",
          ventana_ini: visita.ventana_ini || "",
          ventana_fin: visita.ventana_fin || "",
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
      estado_entrega: formData.estado_entrega,
      motivo_no_entrega: formData.estado_entrega !== 'ENTREGADO' && formData.motivo_no_entrega
        ? formData.motivo_no_entrega
        : null,
      hora_llegada: formData.hora_llegada ? formData.hora_llegada : null,
      hora_salida: formData.hora_salida ? formData.hora_salida : null,
      ventana_ini: formData.ventana_ini ? formData.ventana_ini : null,
      ventana_fin: formData.ventana_fin ? formData.ventana_fin : null,
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="estado_entrega">Estado de entrega</Label>
          <select
            id="estado_entrega"
            className="w-full border rounded h-10 px-3 bg-white dark:bg-gray-800 text-black dark:text-white"
            value={formData.estado_entrega}
            onChange={(e) => handleInputChange('estado_entrega', e.target.value)}
          >
            <option value="ENTREGADO">ENTREGADO</option>
            <option value="NO_ENTREGADO">NO_ENTREGADO</option>
            <option value="REPROGRAMADO">REPROGRAMADO</option>
          </select>
        </div>
        {formData.estado_entrega !== 'ENTREGADO' && (
          <div>
            <Label htmlFor="motivo_no_entrega">Motivo (si no entregado)</Label>
            <Input
              id="motivo_no_entrega"
              type="text"
              value={formData.motivo_no_entrega}
              onChange={(e) => handleInputChange('motivo_no_entrega', e.target.value)}
              placeholder="Motivo de no entrega"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="hora_llegada">Hora de llegada</Label>
          <Input
            id="hora_llegada"
            type="datetime-local"
            value={formData.hora_llegada}
            onChange={(e) => handleInputChange('hora_llegada', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="hora_salida">Hora de salida</Label>
          <Input
            id="hora_salida"
            type="datetime-local"
            value={formData.hora_salida}
            onChange={(e) => handleInputChange('hora_salida', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="ventana_ini">Ventana inicio</Label>
          <Input
            id="ventana_ini"
            type="datetime-local"
            value={formData.ventana_ini}
            onChange={(e) => handleInputChange('ventana_ini', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="ventana_fin">Ventana fin</Label>
          <Input
            id="ventana_fin"
            type="datetime-local"
            value={formData.ventana_fin}
            onChange={(e) => handleInputChange('ventana_fin', e.target.value)}
          />
        </div>
      </div>

      {/* Campos calculados: IDR y Fuera de VH (solo lectura) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>IDR (minutos)</Label>
          <Input
            value={idrMin === null ? "-" : idrMin.toString()}
            readOnly
            className="bg-gray-50 dark:bg-gray-900"
          />
        </div>
        <div>
          <Label>Fuera de VH</Label>
          <Input
            value={fueraVH === null ? "-" : fueraVH ? "Sí" : "No"}
            readOnly
            className="bg-gray-50 dark:bg-gray-900"
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
