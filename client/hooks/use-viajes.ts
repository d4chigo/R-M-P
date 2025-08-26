"use client";

import { useState, useCallback, useEffect } from "react";
import { useSimpleCrud } from "./use-simple-api";

export interface Viaje {
  id?: number;
  id_viaje?: number;
  fecha: string;
  id_vehiculo: number;
  id_repartidor: number;
  nro_viaje: number;
  salida_cd?: string;
  llegada_cd?: string;
  distancia_km?: number;
  tipo_viaje?: string;
  // Resumen de ruta
  nro_clientes?: number;
  nro_pedidos?: number;
  entrega_cf?: number;
  recojo_cf?: number;
  peso_kg?: number;
  // Tripulación
  nro_conductores?: number;
  nro_liquidadores?: number;
  nro_auxiliares?: number;
  nro_trip_adicional?: number;
  tripulacion_especial?: string | null;
  created_by?: number;
  updated_by?: number;
  created_at?: string;
  updated_at?: string;
  // Campos relacionados (pueden venir del backend con joins)
  vehiculo_placa?: string;
  vehiculo_marca?: string;
  vehiculo_modelo?: string;
  vehiculo_capacidad_kg?: number;
  vehiculo_capacidad_cajas?: number;
  repartidor_codigo?: string;
  repartidor_nombre?: string;
  repartidor_dni?: string;
  repartidor_telefono?: string;
  repartidor_estado?: string;
  created_by_username?: string;
  updated_by_username?: string;
}

export const useViajes = () => {
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const crud = useSimpleCrud<Viaje>("/viajes");

  // Cargar todos los viajes
  const fetchViajes = useCallback(async () => {
    if (isLoading) return; // Prevenir múltiples llamadas simultáneas

    setIsLoading(true);
    setError(null);

    try {
      const response = await crud.getAll();
      if (response.success && response.data) {
        setViajes(response.data);
      } else {
        setError(response.error || "Error al cargar viajes");
      }
    } catch (err) {
      setError("Error de conexión");
      console.error("Error fetching viajes:", err);
    } finally {
      setIsLoading(false);
    }
  }, [crud.getAll, isLoading]);

  // Crear viaje
  const createViaje = useCallback(
    async (
      viaje: Omit<Viaje, "id" | "id_viaje" | "created_at" | "updated_at">,
    ) => {
      setError(null);

      try {
        const response = await crud.create(viaje);
        if (response.success) {
          // Agregar el nuevo viaje al estado sin recargar toda la lista
          if (response.data) {
            setViajes((prev) => [...prev, response.data as Viaje]);
          }
          return { success: true, data: response.data };
        } else {
          setError(response.error || "Error al crear viaje");
          return { success: false, error: response.error };
        }
      } catch (err) {
        const errorMessage = "Error de conexión al crear viaje";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [crud.create],
  );

  // Actualizar viaje
  const updateViaje = useCallback(
    async (id: number, viaje: Partial<Viaje>) => {
      setError(null);

      try {
        const response = await crud.update(id, viaje);
        if (response.success) {
          // Actualizar solo el viaje modificado en el estado
          setViajes((prev) =>
            prev.map((v) =>
              v.id === id || v.id_viaje === id ? { ...v, ...viaje } : v,
            ),
          );
          return { success: true, data: response.data };
        } else {
          setError(response.error || "Error al actualizar viaje");
          return { success: false, error: response.error };
        }
      } catch (err) {
        const errorMessage = "Error de conexión al actualizar viaje";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [crud.update],
  );

  // Eliminar viaje con manejo de referencias
  const deleteViaje = useCallback(
    async (id: number) => {
      setError(null);

      try {
        const response = await crud.remove(id);
        if (response.success) {
          // Remover el viaje del estado sin recargar toda la lista
          setViajes((prev) =>
            prev.filter((v) => v.id !== id && v.id_viaje !== id),
          );
          return {
            success: true,
            message: response.message || "Viaje eliminado exitosamente",
          };
        } else {
          // El error puede contener información sobre referencias
          const errorMessage = response.error || "Error al eliminar viaje";
          setError(errorMessage);
          return {
            success: false,
            error: errorMessage,
            hasReferences: errorMessage.includes("visitas asociadas"),
          };
        }
      } catch (err) {
        const errorMessage = "Error de conexión al eliminar viaje";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [crud.remove],
  );

  // Obtener viaje por ID
  const getViajeById = useCallback(
    async (id: number) => {
      setError(null);

      try {
        const response = await crud.getById(id);
        if (response.success) {
          return { success: true, data: response.data };
        } else {
          setError(response.error || "Error al obtener viaje");
          return { success: false, error: response.error };
        }
      } catch (err) {
        const errorMessage = "Error de conexión al obtener viaje";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [crud.getById],
  );

  // Obtener viajes por fecha
  const getViajesByFecha = useCallback(async (fecha: string) => {
    setError(null);
    try {
      const response = await fetch(`/api/viajes/fecha/${fecha}`);
      const result = await response.json();
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        setError(result.error || "Error al obtener viajes por fecha");
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = "Error de conexión al obtener viajes por fecha";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Obtener viajes por vehículo
  const getViajesByVehiculo = useCallback(
    (idVehiculo: number) => {
      return viajes.filter((viaje) => viaje.id_vehiculo === idVehiculo);
    },
    [viajes],
  );

  // Obtener viajes por repartidor
  const getViajesByRepartidor = useCallback(
    (idRepartidor: number) => {
      return viajes.filter((viaje) => viaje.id_repartidor === idRepartidor);
    },
    [viajes],
  );

  // Obtener viajes por estado (basado en fechas)
  const getViajesByEstado = useCallback(
    (estado: string) => {
      const hoy = new Date().toISOString().split("T")[0];

      switch (estado) {
        case "Programado":
          return viajes.filter((viaje) => viaje.fecha > hoy);
        case "En Curso":
          return viajes.filter((viaje) => viaje.fecha === hoy);
        case "Completado":
          return viajes.filter((viaje) => viaje.fecha < hoy);
        default:
          return viajes;
      }
    },
    [viajes],
  );

  // Obtener viajes por rango de fechas
  const getViajesByRangoFechas = useCallback(
    (fechaInicio: string, fechaFin: string) => {
      return viajes.filter((viaje) => {
        const fechaViaje = new Date(viaje.fecha);
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        return fechaViaje >= inicio && fechaViaje <= fin;
      });
    },
    [viajes],
  );

  // Obtener viajes activos (En Curso) - basado en fecha actual
  const getViajesActivos = useCallback(() => {
    const hoy = new Date().toISOString().split("T")[0];
    return viajes.filter((viaje) => viaje.fecha === hoy);
  }, [viajes]);

  // Obtener viajes programados - basado en fecha futura
  const getViajesProgramados = useCallback(() => {
    const hoy = new Date().toISOString().split("T")[0];
    return viajes.filter((viaje) => viaje.fecha > hoy);
  }, [viajes]);

  // Obtener viajes completados - basado en fecha pasada
  const getViajesCompletados = useCallback(() => {
    const hoy = new Date().toISOString().split("T")[0];
    return viajes.filter((viaje) => viaje.fecha < hoy);
  }, [viajes]);

  // Buscar viajes por placa de vehículo
  const searchByPlacaVehiculo = useCallback(
    (placa: string) => {
      return viajes.filter((viaje) =>
        viaje.vehiculo_placa?.toLowerCase().includes(placa.toLowerCase()),
      );
    },
    [viajes],
  );

  // Buscar viajes por código de repartidor
  const searchByCodigoRepartidor = useCallback(
    (codigo: string) => {
      return viajes.filter((viaje) =>
        viaje.repartidor_codigo?.toLowerCase().includes(codigo.toLowerCase()),
      );
    },
    [viajes],
  );

  // Obtener estadísticas de viajes
  const getEstadisticasViajes = useCallback(() => {
    const total = viajes.length;
    const hoy = new Date().toISOString().split("T")[0];

    const programados = viajes.filter((v) => v.fecha > hoy).length;
    const enCurso = viajes.filter((v) => v.fecha === hoy).length;
    const completados = viajes.filter((v) => v.fecha < hoy).length;

    const totalDistancia = viajes.reduce(
      (sum, v) => sum + (v.distancia_km || 0),
      0,
    );

    return {
      total,
      programados,
      enCurso,
      completados,
      porcentajeCompletados:
        total > 0 ? Math.round((completados / total) * 100) : 0,
      totalDistancia: Math.round(totalDistancia * 100) / 100,
      promedioDistanciaPorViaje:
        total > 0 ? Math.round((totalDistancia / total) * 100) / 100 : 0,
    };
  }, [viajes]);

  // Validar disponibilidad de vehículo para una fecha
  const validateVehiculoDisponibilidad = useCallback(
    (idVehiculo: number, fecha: string, excludeViajeId?: number) => {
      const viajesEnFecha = viajes.filter(
        (v) =>
          v.id_vehiculo === idVehiculo &&
          v.fecha === fecha &&
          (excludeViajeId
            ? v.id !== excludeViajeId && v.id_viaje !== excludeViajeId
            : true),
      );
      return {
        disponible: viajesEnFecha.length === 0,
        viajesConflicto: viajesEnFecha,
      };
    },
    [viajes],
  );

  // Validar disponibilidad de repartidor para una fecha
  const validateRepartidorDisponibilidad = useCallback(
    (idRepartidor: number, fecha: string, excludeViajeId?: number) => {
      const viajesEnFecha = viajes.filter(
        (v) =>
          v.id_repartidor === idRepartidor &&
          v.fecha === fecha &&
          (excludeViajeId
            ? v.id !== excludeViajeId && v.id_viaje !== excludeViajeId
            : true),
      );
      return {
        disponible: viajesEnFecha.length === 0,
        viajesConflicto: viajesEnFecha,
      };
    },
    [viajes],
  );

  // Efecto para cargar viajes al montar el componente
  useEffect(() => {
    let mounted = true;

    const loadViajes = async () => {
      if (viajes.length === 0 && mounted && !isLoading) {
        await fetchViajes();
      }
    };

    loadViajes();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    viajes,
    isLoading: isLoading || crud.loading,
    error: error || crud.error,
    fetchViajes,
    createViaje,
    updateViaje,
    deleteViaje,
    getViajeById,
    getViajesByFecha,
    getViajesByVehiculo,
    getViajesByRepartidor,
    getViajesByEstado,
    getViajesByRangoFechas,
    getViajesActivos,
    getViajesProgramados,
    getViajesCompletados,
    searchByPlacaVehiculo,
    searchByCodigoRepartidor,
    getEstadisticasViajes,
    validateVehiculoDisponibilidad,
    validateRepartidorDisponibilidad,
    refetch: fetchViajes,
  };
};

export default useViajes;
