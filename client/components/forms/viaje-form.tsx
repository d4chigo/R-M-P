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
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<string[]>([]);

  // Resetear formulario cuando cambia el viaje o se carga datos
  useEffect(() => {
    console.log("🔄 useEffect ejecutado con viaje:", viaje);

    if (viaje && Object.keys(viaje).length > 0) {
      console.log("📊 Datos del viaje completos:", {
        fecha: viaje.fecha,
        tipo_viaje: viaje.tipo_viaje,
        vehiculosLoading,
        repartidoresLoading,
      });

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
      };

      console.log("📝 Estableciendo datos del formulario:", newFormData);
      setFormData(newFormData);
    } else if (!viaje || Object.keys(viaje).length === 0) {
      // Formulario nuevo
      console.log("🆕 Reseteando formulario para nuevo viaje");
      setFormData({
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
      });
    }
    setErrors({});
    setWarnings([]);
  }, [viaje, vehiculosLoading, repartidoresLoading]);

  // Efecto para forzar re-render cuando los datos están listos
  useEffect(() => {
    if (isEditing && viaje && !vehiculosLoading && !repartidoresLoading) {
      console.log("🔄 Forzando actualización de datos para edición");
      const updatedFormData = {
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
      };

      setFormData((prev) => {
        console.log("🔄 Comparando datos:", { prev, updated: updatedFormData });
        return updatedFormData;
      });
    }
  }, [isEditing, viaje, vehiculosLoading, repartidoresLoading]);

  // Función para formatear datetime-local
  const formatDateTimeLocal = (dateTime: string): string => {
    if (!dateTime) return "";
    const date = new Date(dateTime);
    return date.toISOString().slice(0, 16);
  };

  // Función para formatear fecha DATE (yyyy-mm-dd)
  const formatDateLocal = (date: string): string => {
    if (!date) return "";
    // Si ya viene en formato yyyy-mm-dd, devolverla tal como está
    if (typeof date === "string" && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return date;
    }
    // Si viene como timestamp o fecha completa, extraer solo la parte de fecha
    const dateObj = new Date(date);
    return dateObj.toISOString().split("T")[0];
  };

  // Validaciones en tiempo real
  useEffect(() => {
    const newWarnings: string[] = [];

    // Validar fecha no sea pasada (solo para nuevos viajes)
    if (!isEditing && formData.fecha) {
      const today = new Date().toISOString().split("T")[0];
      if (formData.fecha < today) {
        newWarnings.push("La fecha seleccionada es anterior al día de hoy");
      }
    }

    // Validar que llegada sea posterior a salida
    if (formData.salida_cd && formData.llegada_cd) {
      const salida = new Date(formData.salida_cd);
      const llegada = new Date(formData.llegada_cd);
      if (llegada <= salida) {
        newWarnings.push(
          "La hora de llegada debe ser posterior a la hora de salida",
        );
      }
    }

    // Validar número de viaje
    if (formData.nro_viaje && parseInt(formData.nro_viaje) < 1) {
      newWarnings.push("El número de viaje debe ser mayor a 0");
    }

    setWarnings(newWarnings);
  }, [formData, isEditing]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Campos obligatorios
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

    // Validar vehículo activo
    const vehiculoSeleccionado = vehiculos.find(
      (v) => v.id_vehiculo?.toString() === formData.id_vehiculo,
    );
    if (vehiculoSeleccionado && !vehiculoSeleccionado.activo) {
      newErrors.id_vehiculo = "El vehículo seleccionado no está activo";
    }

    // Validar repartidor activo
    const repartidorSeleccionado = repartidores.find(
      (r) => r.id_repartidor?.toString() === formData.id_repartidor,
    );
    if (repartidorSeleccionado && !repartidorSeleccionado.activo) {
      newErrors.id_repartidor = "El repartidor seleccionado no está activo";
    }

    // Validar valores numéricos si se proporcionan
    if (formData.distancia_km && parseFloat(formData.distancia_km) < 0) {
      newErrors.distancia_km = "La distancia no puede ser negativa";
    }

    if (
      formData.tiempo_manejo_min &&
      parseInt(formData.tiempo_manejo_min) < 0
    ) {
      newErrors.tiempo_manejo_min = "El tiempo de manejo no puede ser negativo";
    }

    if (
      formData.tiempo_servicio_min &&
      parseInt(formData.tiempo_servicio_min) < 0
    ) {
      newErrors.tiempo_servicio_min =
        "El tiempo de servicio no puede ser negativo";
    }

    if (formData.recarga_min && parseInt(formData.recarga_min) < 0) {
      newErrors.recarga_min = "El tiempo de recarga no puede ser negativo";
    }

    if (formData.refrigerio_min && parseInt(formData.refrigerio_min) < 0) {
      newErrors.refrigerio_min =
        "El tiempo de refrigerio no puede ser negativo";
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
    });
  };

  const handleInputChange = (field: string, value: string) => {
    console.log(`🔄 Campo ${field} cambiado a:`, value);
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      console.log("📝 Nuevo estado del formulario:", newData);
      return newData;
    });
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Filtrar vehículos y repartidores activos
  const vehiculosActivos = vehiculos.filter((v) => v.activo);
  const repartidoresActivos = repartidores.filter((r) => r.activo);

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
            onChange={(e) => {
              console.log("📅 Fecha cambiada:", e.target.value);
              handleInputChange("fecha", e.target.value);
            }}
            className={errors.fecha ? "border-red-500" : ""}
            required
          />
          {errors.fecha && (
            <p className="text-sm text-red-500 mt-1">{errors.fecha}</p>
          )}
          {isEditing && (
            <p className="text-xs text-gray-500 mt-1">
              Fecha actual: {formData.fecha || "No cargada"}
              {viaje?.fecha && ` | Original: ${viaje.fecha}`}
            </p>
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
        <div>
          <Label htmlFor="id_vehiculo">Vehículo *</Label>
          <Select
            value={formData.id_vehiculo}
            onValueChange={(value) => handleInputChange("id_vehiculo", value)}
            disabled={vehiculosLoading}
          >
            <SelectTrigger
              className={errors.id_vehiculo ? "border-red-500" : ""}
            >
              <SelectValue
                placeholder={
                  vehiculosLoading
                    ? "Cargando vehículos..."
                    : "Seleccionar vehículo"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {vehiculosActivos.map((vehiculo) => (
                <SelectItem
                  key={vehiculo.id_vehiculo}
                  value={vehiculo.id_vehiculo?.toString() || ""}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {vehiculo.placa} - {vehiculo.marca} {vehiculo.modelo}
                    </span>
                    {vehiculo.capacidad_kg && (
                      <span className="text-xs text-gray-500">
                        Capacidad: {vehiculo.capacidad_kg}kg
                        {vehiculo.capacidad_cajas &&
                          ` - ${vehiculo.capacidad_cajas} cajas`}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.id_vehiculo && (
            <p className="text-sm text-red-500 mt-1">{errors.id_vehiculo}</p>
          )}
        </div>
        <div>
          <Label htmlFor="id_repartidor">Repartidor *</Label>
          <Select
            value={formData.id_repartidor}
            onValueChange={(value) => handleInputChange("id_repartidor", value)}
            disabled={repartidoresLoading}
          >
            <SelectTrigger
              className={errors.id_repartidor ? "border-red-500" : ""}
            >
              <SelectValue
                placeholder={
                  repartidoresLoading
                    ? "Cargando repartidores..."
                    : "Seleccionar repartidor"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {repartidoresActivos.map((repartidor) => (
                <SelectItem
                  key={repartidor.id_repartidor}
                  value={repartidor.id_repartidor?.toString() || ""}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {repartidor.codigo} - {repartidor.nombre}
                    </span>
                    {repartidor.telefono && (
                      <span className="text-xs text-gray-500">
                        Tel: {repartidor.telefono}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          <Select
            value={formData.tipo_viaje || undefined}
            onValueChange={(value) => handleInputChange("tipo_viaje", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ENTREGA">Entrega</SelectItem>
              <SelectItem value="RECOJO">Recojo</SelectItem>
              <SelectItem value="MIXTO">Mixto</SelectItem>
              <SelectItem value="ESPECIAL">Especial</SelectItem>
              <SelectItem value="MANTENIMIENTO">Mantenimiento</SelectItem>
              <SelectItem value="EMERGENCIA">Emergencia</SelectItem>
            </SelectContent>
          </Select>
          {isEditing && (
            <p className="text-xs text-gray-500 mt-1">
              Tipo actual: {formData.tipo_viaje || "No seleccionado"}
              {viaje?.tipo_viaje && ` | Original: ${viaje.tipo_viaje}`}
            </p>
          )}
        </div>
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
