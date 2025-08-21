"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, AlertTriangle } from "lucide-react";
import type { Viaje } from "@/hooks/use-viajes";
import { useVehiculos } from "@/hooks/use-vehiculos";
import { useRepartidores } from "@/hooks/use-repartidores";

interface ViajeFormProps {
  viaje?: Viaje | null;
  onSubmit: (viaje: {
    fecha: string;
    id_vehiculo: number;
    id_repartidor: number;
    nro_viaje: number;
    salida_cd?: string;
    llegada_cd?: string;
    distancia_km?: number;
    tiempo_manejo_min?: number;
    tiempo_servicio_min?: number;
    recarga_min?: number;
    refrigerio_min?: number;
    tipo_viaje?: string;
    odometro_ini?: number | null;
    odometro_fin?: number | null;
    combustible_litros?: number | null;
    combustible_costo?: number | null;
    tiempo_espera_min?: number | null;
    paradas_no_plan?: number | null;
    observaciones?: string | null;
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
    nro_viaje: string;
    salida_cd: string;
    llegada_cd: string;
    distancia_km: string;
    tiempo_manejo_min: string;
    tiempo_servicio_min: string;
    recarga_min: string;
    refrigerio_min: string;
    tipo_viaje: string | undefined;
    odometro_ini: string;
    odometro_fin: string;
    combustible_litros: string;
    combustible_costo: string;
    tiempo_espera_min: string;
    paradas_no_plan: string;
    observaciones: string;
  }>({
    fecha: "",
    id_vehiculo: "",
    id_repartidor: "",
    nro_viaje: "1",
    salida_cd: "",
    llegada_cd: "",
    distancia_km: "",
    tiempo_manejo_min: "",
    tiempo_servicio_min: "",
    recarga_min: "",
    refrigerio_min: "",
    tipo_viaje: undefined,
    odometro_ini: "",
    odometro_fin: "",
    combustible_litros: "",
    combustible_costo: "",
    tiempo_espera_min: "",
    paradas_no_plan: "",
    observaciones: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<string[]>([]);
  const [searchVehiculo, setSearchVehiculo] = useState("");
  const [searchRepartidor, setSearchRepartidor] = useState("");
  const [showVehiculosDropdown, setShowVehiculosDropdown] = useState(false);
  const [showRepartidoresDropdown, setShowRepartidoresDropdown] = useState(false);

  // Resetear formulario cuando cambia el viaje o se carga datos
  useEffect(() => {
    if (viaje && Object.keys(viaje).length > 0) {
      const newFormData = {
        fecha: formatDateLocal(viaje.fecha) || "",
        id_vehiculo: viaje.id_vehiculo?.toString() || "",
        id_repartidor: viaje.id_repartidor?.toString() || "",
        nro_viaje: viaje.nro_viaje?.toString() || "1",
        salida_cd: viaje.salida_cd ? formatDateTimeLocal(viaje.salida_cd) : "",
        llegada_cd: viaje.llegada_cd
          ? formatDateTimeLocal(viaje.llegada_cd)
          : "",
        distancia_km: viaje.distancia_km?.toString() || "",
        tiempo_manejo_min: viaje.tiempo_manejo_min?.toString() || "",
        tiempo_servicio_min: viaje.tiempo_servicio_min?.toString() || "",
        recarga_min: viaje.recarga_min?.toString() || "",
        refrigerio_min: viaje.refrigerio_min?.toString() || "",
        tipo_viaje: viaje.tipo_viaje || undefined,
        odometro_ini: viaje.odometro_ini?.toString() || "",
        odometro_fin: viaje.odometro_fin?.toString() || "",
        combustible_litros: viaje.combustible_litros?.toString() || "",
        combustible_costo: viaje.combustible_costo?.toString() || "",
        tiempo_espera_min: viaje.tiempo_espera_min?.toString() || "",
        paradas_no_plan: viaje.paradas_no_plan?.toString() || "",
        observaciones: viaje.observaciones || "",
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
  }, [viaje, vehiculos, repartidores]);

  // Función para formatear datetime-local
  const formatDateTimeLocal = (dateTime: string): string => {
    if (!dateTime) return "";
    const date = new Date(dateTime);
    return date.toISOString().slice(0, 16);
  };

  // Función para formatear fecha DATE (yyyy-mm-dd)
  const formatDateLocal = (date: string): string => {
    if (!date) return "";
    if (typeof date === "string" && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return date;
    }
    const dateObj = new Date(date);
    return dateObj.toISOString().split("T")[0];
  };

  // Validaciones en tiempo real
  useEffect(() => {
    const newWarnings: string[] = [];
    if (!isEditing && formData.fecha) {
      const today = new Date().toISOString().split("T")[0];
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
    // Validaciones lógicas
    if (formData.odometro_ini && formData.odometro_fin) {
      const ini = parseFloat(formData.odometro_ini);
      const fin = parseFloat(formData.odometro_fin);
      if (!isNaN(ini) && !isNaN(fin) && fin < ini) {
        newErrors.odometro_fin = "El odómetro final no puede ser menor al inicial";
      }
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
      nro_viaje: parseInt(formData.nro_viaje),
      salida_cd: formData.salida_cd || undefined,
      llegada_cd: formData.llegada_cd || undefined,
      distancia_km: formData.distancia_km
        ? parseFloat(formData.distancia_km)
        : undefined,
      tiempo_manejo_min: formData.tiempo_manejo_min
        ? parseInt(formData.tiempo_manejo_min)
        : undefined,
      tiempo_servicio_min: formData.tiempo_servicio_min
        ? parseInt(formData.tiempo_servicio_min)
        : undefined,
      recarga_min: formData.recarga_min
        ? parseInt(formData.recarga_min)
        : undefined,
      refrigerio_min: formData.refrigerio_min
        ? parseInt(formData.refrigerio_min)
        : undefined,
      tipo_viaje: formData.tipo_viaje,
      odometro_ini: formData.odometro_ini ? parseFloat(formData.odometro_ini) : null,
      odometro_fin: formData.odometro_fin ? parseFloat(formData.odometro_fin) : null,
      combustible_litros: formData.combustible_litros ? parseFloat(formData.combustible_litros) : null,
      combustible_costo: formData.combustible_costo ? parseFloat(formData.combustible_costo) : null,
      tiempo_espera_min: formData.tiempo_espera_min ? parseInt(formData.tiempo_espera_min) : null,
      paradas_no_plan: formData.paradas_no_plan ? parseInt(formData.paradas_no_plan) : null,
      observaciones: formData.observaciones ? formData.observaciones : null,
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Alertas de advertencia */}
      {warnings.length > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
          <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            <ul className="list-disc list-inside space-y-1">
              {warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
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
            className={errors.id_vehiculo ? "border-red-500" : ""}
          />
          {showVehiculosDropdown && (
            <div className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto border border-gray-300 rounded bg-white shadow-lg">
              {filteredVehiculos.length > 0 ? (
                filteredVehiculos.map((vehiculo) => (
                  <div
                    key={vehiculo.id_vehiculo}
                    className="p-2 cursor-pointer hover:bg-gray-100 border-b border-gray-200 last:border-b-0"
                    onClick={() => {
                      handleInputChange("id_vehiculo", vehiculo.id_vehiculo?.toString() || "");
                      setSearchVehiculo(`${vehiculo.placa} - ${vehiculo.marca} ${vehiculo.modelo}`);
                      setShowVehiculosDropdown(false);
                    }}
                  >
                    <div className="font-medium">{vehiculo.placa}</div>
                    <div className="text-sm text-gray-600">
                      {vehiculo.marca} {vehiculo.modelo}
                    </div>
                    {vehiculo.capacidad_kg && (
                      <div className="text-xs text-gray-500">
                        Capacidad: {vehiculo.capacidad_kg}kg
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-2 text-gray-500 text-sm">
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
            className={errors.id_repartidor ? "border-red-500" : ""}
          />
          {showRepartidoresDropdown && (
            <div className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto border border-gray-300 rounded bg-white shadow-lg">
              {filteredRepartidores.length > 0 ? (
                filteredRepartidores.map((repartidor) => (
                  <div
                    key={repartidor.id_repartidor}
                    className="p-2 cursor-pointer hover:bg-gray-100 border-b border-gray-200 last:border-b-0"
                    onClick={() => {
                      handleInputChange("id_repartidor", repartidor.id_repartidor?.toString() || "");
                      setSearchRepartidor(`${repartidor.codigo} - ${repartidor.nombre}`);
                      setShowRepartidoresDropdown(false);
                    }}
                  >
                    <div className="font-medium">{repartidor.codigo}</div>
                    <div className="text-sm text-gray-600">
                      {repartidor.nombre}
                    </div>
                    {repartidor.telefono && (
                      <div className="text-xs text-gray-500">
                        Tel: {repartidor.telefono}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-2 text-gray-500 text-sm">
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

      {/* Fila 4: Distancia y Tipo de Viaje */}
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
            placeholder="0.00"
            className={errors.distancia_km ? "border-red-500" : ""}
          />
          {errors.distancia_km && (
            <p className="text-sm text-red-500 mt-1">{errors.distancia_km}</p>
          )}
        </div>
        <div>
          <Label htmlFor="tipo_viaje">Tipo de Viaje</Label>
          <Input
            id="tipo_viaje"
            type="text"
            value={formData.tipo_viaje || ""}
            onChange={(e) => handleInputChange("tipo_viaje", e.target.value)}
            placeholder="Ej: Entrega, Recojo, Mixto"
            list="tipo_viaje_options"
          />
          <datalist id="tipo_viaje_options">
            <option value="ENTREGA">Entrega</option>
            <option value="RECOJO">Recojo</option>
            <option value="MIXTO">Mixto</option>
            <option value="ESPECIAL">Especial</option>
            <option value="MANTENIMIENTO">Mantenimiento</option>
            <option value="EMERGENCIA">Emergencia</option>
          </datalist>
        </div>
      </div>

      {/* Fila 4.1: Odómetro */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="odometro_ini">Odómetro Inicial</Label>
          <Input
            id="odometro_ini"
            type="number"
            min="0"
            step="0.1"
            value={formData.odometro_ini}
            onChange={(e) => handleInputChange("odometro_ini", e.target.value)}
            placeholder="0"
            className={errors.odometro_ini ? "border-red-500" : ""}
          />
        </div>
        <div>
          <Label htmlFor="odometro_fin">Odómetro Final</Label>
          <Input
            id="odometro_fin"
            type="number"
            min="0"
            step="0.1"
            value={formData.odometro_fin}
            onChange={(e) => handleInputChange("odometro_fin", e.target.value)}
            placeholder="0"
            className={errors.odometro_fin ? "border-red-500" : ""}
          />
          {errors.odometro_fin && (
            <p className="text-sm text-red-500 mt-1">{errors.odometro_fin}</p>
          )}
        </div>
      </div>

      {/* Fila 4.2: Combustible */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="combustible_litros">Combustible (litros)</Label>
          <Input
            id="combustible_litros"
            type="number"
            min="0"
            step="0.01"
            value={formData.combustible_litros}
            onChange={(e) => handleInputChange("combustible_litros", e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div>
          <Label htmlFor="combustible_costo">Costo Combustible</Label>
          <Input
            id="combustible_costo"
            type="number"
            min="0"
            step="0.01"
            value={formData.combustible_costo}
            onChange={(e) => handleInputChange("combustible_costo", e.target.value)}
            placeholder="0.00"
          />
        </div>
      </div>

      {/* Fila 4.3: Espera y Paradas */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="tiempo_espera_min">Tiempo de Espera (min)</Label>
          <Input
            id="tiempo_espera_min"
            type="number"
            min="0"
            value={formData.tiempo_espera_min}
            onChange={(e) => handleInputChange("tiempo_espera_min", e.target.value)}
            placeholder="0"
          />
        </div>
        <div>
          <Label htmlFor="paradas_no_plan">Paradas no planificadas</Label>
          <Input
            id="paradas_no_plan"
            type="number"
            min="0"
            value={formData.paradas_no_plan}
            onChange={(e) => handleInputChange("paradas_no_plan", e.target.value)}
            placeholder="0"
          />
        </div>
      </div>

      {/* Fila 4.4: Observaciones */}
      <div>
        <Label htmlFor="observaciones">Observaciones</Label>
        <Input
          id="observaciones"
          type="text"
          value={formData.observaciones}
          onChange={(e) => handleInputChange("observaciones", e.target.value)}
          placeholder="Notas del viaje, incidencias, etc."
        />
      </div>

      {/* Fila 5: Tiempos */}
      <div className="grid grid-cols-4 gap-4">
        <div>
          <Label htmlFor="tiempo_manejo_min">Manejo (min)</Label>
          <Input
            id="tiempo_manejo_min"
            type="number"
            min="0"
            value={formData.tiempo_manejo_min}
            onChange={(e) =>
              handleInputChange("tiempo_manejo_min", e.target.value)
            }
            placeholder="0"
            className={errors.tiempo_manejo_min ? "border-red-500" : ""}
          />
          {errors.tiempo_manejo_min && (
            <p className="text-sm text-red-500 mt-1">
              {errors.tiempo_manejo_min}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="tiempo_servicio_min">Servicio (min)</Label>
          <Input
            id="tiempo_servicio_min"
            type="number"
            min="0"
            value={formData.tiempo_servicio_min}
            onChange={(e) =>
              handleInputChange("tiempo_servicio_min", e.target.value)
            }
            placeholder="0"
            className={errors.tiempo_servicio_min ? "border-red-500" : ""}
          />
          {errors.tiempo_servicio_min && (
            <p className="text-sm text-red-500 mt-1">
              {errors.tiempo_servicio_min}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="recarga_min">Recarga (min)</Label>
          <Input
            id="recarga_min"
            type="number"
            min="0"
            value={formData.recarga_min}
            onChange={(e) => handleInputChange("recarga_min", e.target.value)}
            placeholder="0"
            className={errors.recarga_min ? "border-red-500" : ""}
          />
          {errors.recarga_min && (
            <p className="text-sm text-red-500 mt-1">{errors.recarga_min}</p>
          )}
        </div>
        <div>
          <Label htmlFor="refrigerio_min">Refrigerio (min)</Label>
          <Input
            id="refrigerio_min"
            type="number"
            min="0"
            value={formData.refrigerio_min}
            onChange={(e) =>
              handleInputChange("refrigerio_min", e.target.value)
            }
            placeholder="0"
            className={errors.refrigerio_min ? "border-red-500" : ""}
          />
          {errors.refrigerio_min && (
            <p className="text-sm text-red-500 mt-1">{errors.refrigerio_min}</p>
          )}
        </div>
      </div>

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
