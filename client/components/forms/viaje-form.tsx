"use client";

import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import Cookies from 'js-cookie';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info as InfoIcon, AlertTriangle } from "lucide-react";
import type { Viaje } from "@/hooks/use-viajes";
import { useVehiculos } from "@/hooks/use-vehiculos";
import { useRepartidores } from "@/hooks/use-repartidores";
import { getTodayString } from "@/lib/utils/date";

// Type for form data
interface FormData {
  [key: string]: string | number | undefined;
  fecha: string;
  id_vehiculo: number | string;
  id_repartidor: number | string;
  nro_viaje: number | string;
  territorios_visitados?: string;
  salida_cd?: string;
  llegada_cd?: string;
  distancia_km?: string | number;
  tipo_viaje?: string;
  nro_conductores?: string | number;
  nro_liquidadores?: string | number;
  nro_auxiliares?: string | number;
  nro_trip_adicional?: string | number;
  tripulacion_especial?: string;
  nro_clientes?: string | number;
  nro_pedidos?: string | number;
  entrega_cf?: string | number;
  recojo_cf?: string | number;
  peso_kg?: string | number;
}

interface ViajeFormProps {
  viaje?: Viaje | null;
  onSubmit: (viaje: {
    fecha: string;
    id_vehiculo: number;
    id_repartidor: number;
    nro_viaje: number;
    territorios_visitados?: string;
    salida_cd?: string;
    llegada_cd?: string;
    distancia_km?: number;
    territorios_visitados?: number;
    tipo_viaje?: string;
    // Tripulación
    nro_conductores?: number;
    nro_liquidadores?: number;
    nro_auxiliares?: number;
    nro_trip_adicional?: number;
    tripulacion_especial?: string;
    // Resumen de ruta
    nro_clientes?: number;
    nro_pedidos?: number;
    entrega_cf?: number;
    recojo_cf?: number;
    peso_kg?: number;
    [key: string]: any;
  }) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export function ViajeForm({
  viaje,
  onSubmit,
  onCancel,
  isEditing = false,
}: ViajeFormProps) {
  const { vehiculos, isLoading: vehiculosLoading } = useVehiculos();
  const { repartidores, loading: repartidoresLoading } = useRepartidores();

  const [formData, setFormData] = useState<{
    fecha: string;
    id_vehiculo: string;
    id_repartidor: string;
    id_centro: string;
    nro_viaje: string;
    territorios_visitados: string;
    salida_cd: string;
    llegada_cd: string;
    distancia_km: string;
    territorios_visitados: string;
    tipo_viaje: string | undefined;
    // Tripulación
    nro_conductores: string;
    nro_liquidadores: string;
    nro_auxiliares: string;
    nro_trip_adicional: string;
    tripulacion_especial: string;
    // Resumen de ruta
    nro_clientes: string;
    nro_pedidos: string;
    entrega_cf: string;
    recojo_cf: string;
    peso_kg: string;
  }>({
    fecha: getTodayString(),
    id_vehiculo: "",
    id_repartidor: "",
    id_centro: "",
    nro_viaje: "1",
    territorios_visitados: "",
    salida_cd: "",
    llegada_cd: "",
    distancia_km: "",
    territorios_visitados: "0",
    tipo_viaje: undefined,
    // Valores por defecto para tripulación
    nro_conductores: "1", // Valor por defecto: 1 conductor
    nro_liquidadores: "0",
    nro_auxiliares: "0",
    nro_trip_adicional: "0",
    tripulacion_especial: "",
    // Valores por defecto para resumen de ruta
    nro_clientes: "0",
    nro_pedidos: "0",
    entrega_cf: "0",
    recojo_cf: "0",
    peso_kg: "0",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<string[]>([]);
  const [searchVehiculo, setSearchVehiculo] = useState("");
  const [searchRepartidor, setSearchRepartidor] = useState("");
  const [searchCentro, setSearchCentro] = useState("");
  const [showVehiculosDropdown, setShowVehiculosDropdown] = useState(false);
  const [showRepartidoresDropdown, setShowRepartidoresDropdown] = useState(false);
  const [showCentrosDropdown, setShowCentrosDropdown] = useState(false);
  const [centros, setCentros] = useState<Array<any>>([]);
  const [centrosLoading, setCentrosLoading] = useState(false);

  // Resetear formulario cuando cambia el viaje o se carga datos
  useEffect(() => {
    if (viaje && Object.keys(viaje).length > 0) {
      const newFormData = {
        fecha: formatDateLocal(viaje.fecha) || "",
        id_vehiculo: viaje.id_vehiculo?.toString() || "",
        id_repartidor: viaje.id_repartidor?.toString() || "",
        nro_viaje: viaje.nro_viaje?.toString() || "1",
        territorios_visitados: viaje.territorios_visitados || "",
        salida_cd: viaje.salida_cd ? formatDateTimeLocal(viaje.salida_cd) : "",
        llegada_cd: viaje.llegada_cd ? formatDateTimeLocal(viaje.llegada_cd) : "",
        distancia_km: viaje.distancia_km?.toString() || "",
        tipo_viaje: viaje.tipo_viaje || undefined,
        // Tripulación
        nro_conductores: viaje.nro_conductores?.toString() || "1",
        nro_liquidadores: viaje.nro_liquidadores?.toString() || "0",
        nro_auxiliares: viaje.nro_auxiliares?.toString() || "0",
        nro_trip_adicional: viaje.nro_trip_adicional?.toString() || "0",
        tripulacion_especial: viaje.tripulacion_especial || "",
        // Resumen de ruta
        nro_clientes: viaje.nro_clientes?.toString() || "0",
        nro_pedidos: viaje.nro_pedidos?.toString() || "0",
        entrega_cf: viaje.entrega_cf?.toString() || "0",
        recojo_cf: viaje.recojo_cf?.toString() || "0",
        peso_kg: viaje.peso_kg?.toString() || "0",
      };

      // Establecer los valores de búsqueda basados en los IDs seleccionados
      const vehiculoSeleccionado = vehiculos.find(v => v.id_vehiculo?.toString() === newFormData.id_vehiculo);
      const repartidorSeleccionado = repartidores.find(r => r.id_repartidor?.toString() === newFormData.id_repartidor);

      if (vehiculoSeleccionado) {
        setSearchVehiculo(`${vehiculoSeleccionado.placa} - ${vehiculoSeleccionado.marca} ${vehiculoSeleccionado.modelo}`);
      }

      if (repartidorSeleccionado) {
        setSearchRepartidor(`${repartidorSeleccionado.codigo} - ${repartidorSeleccionado.nombre}`);
      }

      setFormData(newFormData);
    }
  }, [viaje, vehiculos, repartidores, centros]);

  // Cargar centros de distribución
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setCentrosLoading(true);
      try {
        const API_BASE = (window && (window as any).__env && (window as any).__env.NEXT_PUBLIC_API_URL) || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
        const token = Cookies.get('auth_token');
        if (!token) {
          // No hay token, saltar carga (las rutas requieren autenticación)
          setCentros([]);
          return;
        }
        const res = await fetch(`${API_BASE}/centros-distribucion`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        const json = await res.json();
        if (mounted && json && json.success) setCentros(json.data || []);
      } catch (err) {
        // no bloquear el formulario si falla
      } finally {
        if (mounted) setCentrosLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  // Función para formatear datetime-local
  const formatDateTimeLocal = (dateTime: string): string => {
    if (!dateTime) return "";
    const date = new Date(dateTime);
    return date.toISOString().slice(0, 16);
  };

  // Función para formatear fecha DATE (yyyy-mm-dd)
  const formatDateLocal = (date: string): string => {
    if (!date) return "";
    // Si ya está en formato YYYY-MM-DD, devolver tal como está
    if (typeof date === "string" && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return date;
    }
    // Si tiene tiempo, extraer solo la fecha
    if (date.includes("T")) {
      return date.split("T")[0];
    }
    // Para otros casos, intentar parsearlo como fecha local
    try {
      const dateObj = new Date(date + "T00:00:00");
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch {
      return date;
    }
  };

  // Validaciones en tiempo real
  useEffect(() => {
    const newWarnings: string[] = [];
    if (!isEditing && formData.fecha) {
      const today = getTodayString();
      if (formData.fecha < today) {
        newWarnings.push("La fecha seleccionada es anterior al día de hoy");
      }
    }
    setWarnings(newWarnings);
  }, [formData, isEditing]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.fecha) {
      newErrors.fecha = "La fecha es obligatoria";
    }
    if (!formData.id_vehiculo) {
      newErrors.id_vehiculo = "Debe seleccionar un vehículo";
    }
    if (!formData.id_repartidor) {
      newErrors.id_repartidor = "Debe seleccionar un repartidor";
    }
    if (!formData.nro_viaje || parseInt(formData.nro_viaje) < 1) {
      newErrors.nro_viaje =
        "El número de viaje es obligatorio y debe ser mayor a 0";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    onSubmit({
      fecha: formData.fecha,
      id_vehiculo: parseInt(formData.id_vehiculo),
      id_repartidor: parseInt(formData.id_repartidor),
      id_centro: formData.id_centro ? parseInt(formData.id_centro) : undefined,
      nro_viaje: parseInt(formData.nro_viaje),
      territorios_visitados: formData.territorios_visitados || undefined,
      salida_cd: formData.salida_cd || undefined,
      llegada_cd: formData.llegada_cd || undefined,
      distancia_km: formData.distancia_km ? parseFloat(formData.distancia_km) : undefined,
      territorios_visitados: formData.territorios_visitados ? parseInt(formData.territorios_visitados) : undefined,
      tipo_viaje: formData.tipo_viaje,
      // Tripulación
      nro_conductores: formData.nro_conductores ? parseInt(formData.nro_conductores) : 1,
      nro_liquidadores: formData.nro_liquidadores ? parseInt(formData.nro_liquidadores) : 0,
      nro_auxiliares: formData.nro_auxiliares ? parseInt(formData.nro_auxiliares) : 0,
      nro_trip_adicional: formData.nro_trip_adicional ? parseInt(formData.nro_trip_adicional) : 0,
      tripulacion_especial: formData.tripulacion_especial || undefined,
      // Resumen de ruta
      nro_clientes: formData.nro_clientes ? parseInt(formData.nro_clientes) : 0,
      nro_pedidos: formData.nro_pedidos ? parseInt(formData.nro_pedidos) : 0,
      entrega_cf: formData.entrega_cf ? parseFloat(formData.entrega_cf) : 0,
      recojo_cf: formData.recojo_cf ? parseFloat(formData.recojo_cf) : 0,
      peso_kg: formData.peso_kg ? parseFloat(formData.peso_kg) : 0,
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Filtrar vehículos y repartidores activos
  const vehiculosActivos = vehiculos.filter((v) => v.activo);
  const repartidoresActivos = repartidores.filter((r) => r.activo);
  const centrosActivos = centros.filter((c) => c.estado === 'activo');

  // Filtrar vehículos y repartidores según la búsqueda
  const filteredVehiculos = vehiculosActivos.filter(
    (vehiculo) =>
      vehiculo.placa.toLowerCase().includes(searchVehiculo.toLowerCase()) ||
      vehiculo.marca.toLowerCase().includes(searchVehiculo.toLowerCase()) ||
      vehiculo.modelo.toLowerCase().includes(searchVehiculo.toLowerCase())
  );

  const filteredRepartidores = repartidoresActivos.filter(
    (repartidor) =>
      repartidor.nombre.toLowerCase().includes(searchRepartidor.toLowerCase()) ||
      repartidor.codigo.toLowerCase().includes(searchRepartidor.toLowerCase())
  );

  const filteredCentros = centrosActivos.filter(
    (centro) =>
      centro.codigo.toLowerCase().includes(searchCentro.toLowerCase()) ||
      centro.nombre.toLowerCase().includes(searchCentro.toLowerCase()) ||
      (centro.ciudad || '').toLowerCase().includes(searchCentro.toLowerCase())
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Alertas de advertencia */}
      {warnings.length > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
          <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <AlertDescription>
            <ul className="list-disc pl-4">
              {warnings.map((warning, index) => (
                <li key={index} className="text-yellow-800 dark:text-yellow-200">
                  {warning}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Información del formulario */}
      <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
        <InfoIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-blue-800 dark:text-blue-200">
          Los campos marcados con (*) son obligatorios. Los horarios y tiempos
          son opcionales y pueden completarse después.
        </AlertDescription>
      </Alert>

      {/* Fila 1: Fecha y Número de Viaje */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fecha">Fecha del Viaje *</Label>
          <Input
            id="fecha"
            type="date"
            value={formData.fecha}
            onChange={(e) => handleInputChange("fecha", e.target.value)}
            className={errors.fecha ? "border-red-500" : ""}
            required
          />
          {errors.fecha && (
            <p className="text-sm text-red-500 mt-1">{errors.fecha}</p>
          )}
        </div>
        <div>
          <Label htmlFor="nro_viaje">Número de Viaje *</Label>
          <Input
            id="nro_viaje"
            type="number"
            value={formData.nro_viaje}
            onChange={(e) => handleInputChange("nro_viaje", e.target.value)}
            placeholder="1"
            min="1"
            className={errors.nro_viaje ? "border-red-500" : ""}
            required
          />
          {errors.nro_viaje && (
            <p className="text-sm text-red-500 mt-1">{errors.nro_viaje}</p>
          )}
        </div>
      </div>

      {/* Fila 2: Vehículo y Repartidor */}
      <div className="grid grid-cols-2 gap-4">
        <div className="relative">
          <Label htmlFor="searchVehiculo">Vehículo *</Label>
          <Input
            id="searchVehiculo"
            type="text"
            value={searchVehiculo}
            onChange={(e) => {
              setSearchVehiculo(e.target.value);
              if (e.target.value === "") {
                handleInputChange("id_vehiculo", "");
              }
            }}
            onFocus={() => setShowVehiculosDropdown(true)}
            onBlur={() => setTimeout(() => setShowVehiculosDropdown(false), 200)}
            placeholder="Buscar vehículo por placa, marca o modelo"
            className={`${errors.id_vehiculo ? "border-red-500" : ""} bg-white dark:bg-gray-800 text-black dark:text-white`}
          />
          {showVehiculosDropdown && (
            <div className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto border border-gray-300 rounded bg-white dark:bg-gray-800 shadow-lg">
              {filteredVehiculos.length > 0 ? (
                filteredVehiculos.map((vehiculo) => (
                  <div
                    key={vehiculo.id_vehiculo}
                    className="p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-600 last:border-b-0 text-black dark:text-white"
                    onClick={() => {
                      handleInputChange("id_vehiculo", vehiculo.id_vehiculo?.toString() || "");
                      setSearchVehiculo(`${vehiculo.placa} - ${vehiculo.marca} ${vehiculo.modelo}`);
                      setShowVehiculosDropdown(false);
                    }}
                  >
                    <div className="font-medium">{vehiculo.placa}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {vehiculo.marca} {vehiculo.modelo}
                    </div>
                    {vehiculo.capacidad_kg && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Capacidad: {vehiculo.capacidad_kg}kg
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-2 text-gray-500 dark:text-gray-400 text-sm">
                  No se encontraron vehículos
                </div>
              )}
            </div>
          )}
          {errors.id_vehiculo && (
            <p className="text-sm text-red-500 mt-1">{errors.id_vehiculo}</p>
          )}
        </div>

        <div className="relative">
          <Label htmlFor="searchRepartidor">Repartidor *</Label>
          <Input
            id="searchRepartidor"
            type="text"
            value={searchRepartidor}
            onChange={(e) => {
              setSearchRepartidor(e.target.value);
              if (e.target.value === "") {
                handleInputChange("id_repartidor", "");
              }
            }}
            onFocus={() => setShowRepartidoresDropdown(true)}
            onBlur={() => setTimeout(() => setShowRepartidoresDropdown(false), 200)}
            placeholder="Buscar repartidor por nombre o código"
            className={`${errors.id_repartidor ? "border-red-500" : ""} bg-white dark:bg-gray-800 text-black dark:text-white`}
          />
          {showRepartidoresDropdown && (
            <div className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto border border-gray-300 rounded bg-white dark:bg-gray-800 shadow-lg">
              {filteredRepartidores.length > 0 ? (
                filteredRepartidores.map((repartidor) => (
                  <div
                    key={repartidor.id_repartidor}
                    className="p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-600 last:border-b-0 text-black dark:text-white"
                    onClick={() => {
                      handleInputChange("id_repartidor", repartidor.id_repartidor?.toString() || "");
                      setSearchRepartidor(`${repartidor.codigo} - ${repartidor.nombre}`);
                      setShowRepartidoresDropdown(false);
                    }}
                  >
                    <div className="font-medium">{repartidor.codigo}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {repartidor.nombre}
                    </div>
                    {repartidor.telefono && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Tel: {repartidor.telefono}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-2 text-gray-500 dark:text-gray-400 text-sm">
                  No se encontraron repartidores
                </div>
              )}
            </div>
          )}
          {errors.id_repartidor && (
            <p className="text-sm text-red-500 mt-1">{errors.id_repartidor}</p>
          )}
        </div>
      </div>

      {/* Fila 2b: Centro de distribución */}
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="searchCentro">Centro de distribución</Label>
          <div className="relative">
            <Input
              id="searchCentro"
              type="text"
              value={searchCentro}
              onChange={(e) => { setSearchCentro(e.target.value); if (e.target.value === '') setFormData(prev => ({ ...prev, id_centro: '' })); }}
              onFocus={() => setShowCentrosDropdown(true)}
              onBlur={() => setTimeout(() => setShowCentrosDropdown(false), 200)}
              placeholder={centrosLoading ? 'Cargando centros...' : 'Buscar centro por código o nombre'}
              className={"bg-white dark:bg-gray-800 text-black dark:text-white"}
            />
            {showCentrosDropdown && (
              <div className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto border border-gray-300 rounded bg-white dark:bg-gray-800 shadow-lg">
                {filteredCentros.length > 0 ? (
                  filteredCentros.map((centro) => (
                    <div
                      key={centro.id_centro}
                      className="p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-600 last:border-b-0 text-black dark:text-white"
                      onMouseDown={(e) => { e.preventDefault(); setFormData(prev => ({ ...prev, id_centro: centro.id_centro?.toString() || '' })); setSearchCentro(`${centro.codigo} - ${centro.nombre}`); setShowCentrosDropdown(false); }}
                    >
                      <div className="font-medium">{centro.codigo}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">{centro.nombre} {centro.ciudad ? `(${centro.ciudad})` : ''}</div>
                    </div>
                  ))
                ) : (
                  <div className="p-2 text-gray-500 dark:text-gray-400 text-sm">No se encontraron centros</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fila 3: Horarios */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="salida_cd">Salida del CD</Label>
          <Input
            id="salida_cd"
            type="datetime-local"
            value={formData.salida_cd}
            onChange={(e) => handleInputChange("salida_cd", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="llegada_cd">Llegada al CD</Label>
          <Input
            id="llegada_cd"
            type="datetime-local"
            value={formData.llegada_cd}
            onChange={(e) => handleInputChange("llegada_cd", e.target.value)}
          />
        </div>
      </div>

      {/* Fila 4: Distancia y Territorios Visitados */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="distancia_km">Distancia (km)</Label>
          <Input
            id="distancia_km"
            type="number"
            step="0.01"
            min="0"
            value={formData.distancia_km}
            onChange={(e) => handleInputChange("distancia_km", e.target.value)}
            className={errors.distancia_km ? "border-red-500" : ""}
          />
        </div>
        <div>
          <Label htmlFor="territorios_visitados">Territorios Visitados</Label>
          <Input
            id="territorios_visitados"
            type="text"
            value={formData.territorios_visitados}
            onChange={(e) => handleInputChange("territorios_visitados", e.target.value)}
            placeholder="Ej: Lima Norte, Los Olivos, Comas"
            className={errors.territorios_visitados ? "border-red-500" : ""}
          />
        </div>
      </div>

      {/* Se eliminaron selects duplicados de Tipo de Viaje; conservar el único select al final del formulario */}

      {/* Sección de Tripulación */}
      <div className="border-t border-gray-200 pt-4 mt-4">
        <h3 className="text-lg font-medium mb-4">Tripulación</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <Label htmlFor="nro_conductores">Conductores</Label>
            <Input
              id="nro_conductores"
              type="number"
              min="1"
              value={formData.nro_conductores}
              onChange={(e) => handleInputChange("nro_conductores", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="nro_liquidadores">Liquidadores</Label>
            <Input
              id="nro_liquidadores"
              type="number"
              min="0"
              value={formData.nro_liquidadores}
              onChange={(e) => handleInputChange("nro_liquidadores", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="nro_auxiliares">Auxiliares</Label>
            <Input
              id="nro_auxiliares"
              type="number"
              min="0"
              value={formData.nro_auxiliares}
              onChange={(e) => handleInputChange("nro_auxiliares", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="nro_trip_adicional">Personal Adicional</Label>
            <Input
              id="nro_trip_adicional"
              type="number"
              min="0"
              value={formData.nro_trip_adicional}
              onChange={(e) => handleInputChange("nro_trip_adicional", e.target.value)}
            />
          </div>
          <div className="md:col-span-2 lg:col-span-1">
            <Label htmlFor="tripulacion_especial">Especificaciones</Label>
            <Input
              id="tripulacion_especial"
              type="text"
              value={formData.tripulacion_especial}
              onChange={(e) => handleInputChange("tripulacion_especial", e.target.value)}
              placeholder="Ej: Supervisor, Practicante"
            />
          </div>
        </div>
      </div>

      {/* Sección de Resumen de Ruta */}
      <div className="border-t border-gray-200 pt-4 mt-4">
        <h3 className="text-lg font-medium mb-4">Resumen de Ruta</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <Label htmlFor="nro_clientes">N° de Clientes</Label>
            <Input
              id="nro_clientes"
              type="number"
              min="0"
              value={formData.nro_clientes}
              onChange={(e) => handleInputChange("nro_clientes", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="nro_pedidos">N° de Pedidos</Label>
            <Input
              id="nro_pedidos"
              type="number"
              min="0"
              value={formData.nro_pedidos}
              onChange={(e) => handleInputChange("nro_pedidos", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="entrega_cf">Entrega (CF)</Label>
            <Input
              id="entrega_cf"
              type="number"
              min="0"
              step="0.01"
              value={formData.entrega_cf}
              onChange={(e) => handleInputChange("entrega_cf", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="recojo_cf">Recojo (CF)</Label>
            <Input
              id="recojo_cf"
              type="number"
              min="0"
              step="0.01"
              value={formData.recojo_cf}
              onChange={(e) => handleInputChange("recojo_cf", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="peso_kg">Peso Total (kg)</Label>
            <Input
              id="peso_kg"
              type="number"
              min="0"
              step="0.01"
              value={formData.peso_kg}
              onChange={(e) => handleInputChange("peso_kg", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Tipo de Viaje */}
      <div>
        <Label htmlFor="tipo_viaje">Tipo de Viaje</Label>
        <select
          id="tipo_viaje"
          value={formData.tipo_viaje || ""}
          onChange={(e) => handleInputChange("tipo_viaje", e.target.value || undefined)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Seleccione un tipo de viaje</option>
          <option value="ENTREGA">Entrega</option>
          <option value="RECOJO">Recojo</option>
          <option value="MIXTO">Mixto</option>
          <option value="ESPECIAL">Especial</option>
          <option value="MANTENIMIENTO">Mantenimiento</option>
          <option value="EMERGENCIA">Emergencia</option>
        </select>
      </div>

      {/* Tiempos de recarga/refrigerio eliminados del formulario según esquema actualizado */}

      {/* Botones */}
      <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="w-full sm:w-auto bg-transparent"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="w-full sm:w-auto"
          disabled={vehiculosLoading || repartidoresLoading}
        >
          {isEditing ? "Actualizar Viaje" : "Crear Viaje"}
        </Button>
      </div>
    </form>
  );
}
