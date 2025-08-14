"use client";

import { useState, useCallback, useEffect } from "react";
import { useSimpleCrud } from "./use-simple-api";

export interface Viaje {
  id?: number;
  id_ruta: number;
  ruta: string;
  id_vehiculo: number;
  vehiculo: string;
  fecha: string;
  id_repartidor: number;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
  // Campos relacionados (pueden venir del backend con joins)
  ruta_nombre?: string;
  ruta_origen?: string;
  ruta_destino?: string;
  vehiculo_placa?: string;
  vehiculo_marca?: string;
  vehiculo_modelo?: string;
  repartidor_nombre?: string;
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
    async (viaje: Omit<Viaje, "id">) => {
      setError(null);

      try {
        const response = await crud.create(viaje);
        if (response.success) {
          // Agregar el nuevo viaje al estado sin recargar toda la lista
          if (response.data) {
            setViajes((prev) => [...prev, response.data]);
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
            prev.map((v) => (v.id === id ? { ...v, ...viaje } : v)),
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

  // Eliminar viaje
  const deleteViaje = useCallback(
    async (id: number) => {
      setError(null);

      try {
        const response = await crud.remove(id);
        if (response.success) {
          // Remover el viaje del estado sin recargar toda la lista
          setViajes((prev) => prev.filter((v) => v.id !== id));
          return { success: true };
        } else {
          setError(response.error || "Error al eliminar viaje");
          return { success: false, error: response.error };
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

  // Obtener viajes por estado (simulado con fechas)
  const getViajesByEstado = useCallback(
    (estado: string) => {
      // Como no tenemos campo estado en BD, simulamos estados basados en fechas
      const hoy = new Date().toISOString().split("T")[0];
      const fechaViaje = new Date();

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

  // Obtener viajes por fecha
  const getViajesByFecha = useCallback(
    (fecha: string) => {
      return viajes.filter((viaje) => viaje.fecha === fecha);
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

  // Obtener viajes por vehículo
  const getViajesByVehiculo = useCallback(
    (idVehiculo: number) => {
      return viajes.filter((viaje) => viaje.id_vehiculo === idVehiculo);
    },
    [viajes],
  );

  // Obtener viajes por ruta
  const getViajesByRuta = useCallback(
    (idRuta: number) => {
      return viajes.filter((viaje) => viaje.id_ruta === idRuta);
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
      return viajes.filter(
        (viaje) =>
          viaje.vehiculo?.toLowerCase().includes(placa.toLowerCase()) ||
          viaje.vehiculo_placa?.toLowerCase().includes(placa.toLowerCase()),
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

    return {
      total,
      programados,
      enCurso,
      completados,
      cancelados: 0, // No hay campo cancelados en BD
      porcentajeCompletados:
        total > 0 ? Math.round((completados / total) * 100) : 0,
    };
  }, [viajes]);

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
    getViajesByEstado,
    getViajesByFecha,
    getViajesByRangoFechas,
    getViajesByVehiculo,
    getViajesByRuta,
    getViajesActivos,
    getViajesProgramados,
    getViajesCompletados,
    searchByPlacaVehiculo,
    getEstadisticasViajes,
    refetch: fetchViajes,
  };
};

export default useViajes;
