"use client";

import { useState, useCallback, useEffect } from "react";
import { useSimpleCrud } from "./use-simple-api";

export interface Visita {
  id_visita?: number;
  id_viaje: number;
  id_cliente: number;
  pedidos?: number;
  entrega_cf?: number;
  recojo_cf?: number;
  peso_kg?: number;
  distancia_km?: number;
  created_at?: string;
  updated_at?: string;
  created_by?: number;
  updated_by?: number;
  // Campos relacionados (pueden venir del backend con joins)
  cliente_nombre?: string;
  cliente_codigo?: string;
  viaje_info?: string;
  viaje_fecha?: string;
  viaje_nro?: number;
  vehiculo_placa?: string;
  repartidor_codigo?: string;
  repartidor_nombre?: string;
  created_by_name?: string;
  updated_by_name?: string;
}

export const useVisitas = () => {
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const crud = useSimpleCrud<Visita>("/visitas");

  // Cargar todas las visitas
  const fetchVisitas = useCallback(async () => {
    if (isLoading) return; // Prevenir múltiples llamadas simultáneas

    setIsLoading(true);
    setError(null);

    try {
      const response = await crud.getAll();
      if (response.success && response.data) {
        setVisitas(response.data);
      } else {
        setError(response.error || "Error al cargar visitas");
      }
    } catch (err) {
      setError("Error de conexión");
      console.error("Error fetching visitas:", err);
    } finally {
      setIsLoading(false);
    }
  }, [crud.getAll, isLoading]);

  // Crear visita
  const createVisita = useCallback(
    async (visita: Omit<Visita, "id_visita">) => {
      setError(null);

      try {
        const response = await crud.create(visita);
        if (response.success) {
          // Recargar toda la lista para obtener datos completos con JOINs
          await fetchVisitas();
          return { success: true, data: response.data };
        } else {
          setError(response.error || "Error al crear visita");
          return { success: false, error: response.error };
        }
      } catch (err) {
        const errorMessage = "Error de conexión al crear visita";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [crud.create, fetchVisitas],
  );

  // Actualizar visita
  const updateVisita = useCallback(
    async (id: number, visita: Partial<Visita>) => {
      setError(null);

      try {
        const response = await crud.update(id, visita);
        if (response.success) {
          // Recargar toda la lista para obtener datos completos con JOINs
          await fetchVisitas();
          return { success: true, data: response.data };
        } else {
          setError(response.error || "Error al actualizar visita");
          return { success: false, error: response.error };
        }
      } catch (err) {
        const errorMessage = "Error de conexión al actualizar visita";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [crud.update, fetchVisitas],
  );

  // Eliminar visita
  const deleteVisita = useCallback(
    async (id: number) => {
      setError(null);

      try {
        const response = await crud.remove(id);
        if (response.success) {
          // Recargar toda la lista después de eliminar
          await fetchVisitas();
          return { success: true };
        } else {
          setError(response.error || "Error al eliminar visita");
          return { success: false, error: response.error };
        }
      } catch (err) {
        const errorMessage = "Error de conexión al eliminar visita";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [crud.remove, fetchVisitas],
  );

  // Obtener visita por ID
  const getVisitaById = useCallback(
    async (id: number) => {
      setError(null);

      try {
        const response = await crud.getById(id);
        if (response.success) {
          return { success: true, data: response.data };
        } else {
          setError(response.error || "Error al obtener visita");
          return { success: false, error: response.error };
        }
      } catch (err) {
        const errorMessage = "Error de conexión al obtener visita";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [crud.getById],
  );

  // Obtener visitas por viaje
  const getVisitasByViaje = useCallback(
    (idViaje: number) => {
      return visitas.filter((visita) => visita.id_viaje === idViaje);
    },
    [visitas],
  );

  // Obtener visitas por cliente
  const getVisitasByCliente = useCallback(
    (idCliente: number) => {
      return visitas.filter((visita) => visita.id_cliente === idCliente);
    },
    [visitas],
  );

  // Obtener visitas por estado (basado en presencia de datos)
  const getVisitasByEstado = useCallback(
    (estado: string) => {
      switch (estado) {
        case "Pendiente":
          return visitas.filter(
            (visita) => !visita.entrega_cf && !visita.recojo_cf,
          );
        case "En Curso":
          return visitas.filter(
            (visita) => visita.entrega_cf || visita.recojo_cf,
          );
        case "Completada":
          return visitas.filter(
            (visita) => visita.entrega_cf && visita.recojo_cf,
          );
        default:
          return visitas;
      }
    },
    [visitas],
  );

  // Obtener visitas pendientes
  const getVisitasPendientes = useCallback(() => {
    return visitas.filter((visita) => !visita.entrega_cf && !visita.recojo_cf);
  }, [visitas]);

  // Obtener visitas completadas
  const getVisitasCompletadas = useCallback(() => {
    return visitas.filter((visita) => visita.entrega_cf && visita.recojo_cf);
  }, [visitas]);

  // Obtener visitas en curso
  const getVisitasEnCurso = useCallback(() => {
    return visitas.filter(
      (visita) =>
        (visita.entrega_cf || visita.recojo_cf) &&
        !(visita.entrega_cf && visita.recojo_cf),
    );
  }, [visitas]);

  // Actualizar cantidades de entrega y recojo
  const updateCantidades = useCallback(
    async (id: number, entrega_cf?: number, recojo_cf?: number) => {
      const updateData: Partial<Visita> = {};

      if (entrega_cf !== undefined) updateData.entrega_cf = entrega_cf;
      if (recojo_cf !== undefined) updateData.recojo_cf = recojo_cf;

      return await updateVisita(id, updateData);
    },
    [updateVisita],
  );

  // Buscar visitas por nombre de cliente
  const searchByClienteNombre = useCallback(
    (nombre: string) => {
      return visitas.filter((visita) =>
        visita.cliente_nombre?.toLowerCase().includes(nombre.toLowerCase()),
      );
    },
    [visitas],
  );

  // Buscar visitas por código de cliente
  const searchByClienteCodigo = useCallback(
    (codigo: string) => {
      return visitas.filter((visita) =>
        visita.cliente_codigo?.toLowerCase().includes(codigo.toLowerCase()),
      );
    },
    [visitas],
  );

  // Obtener visitas por fecha (usando fecha del viaje relacionado)
  const getVisitasByFecha = useCallback(
    (fecha: string) => {
      return visitas.filter((visita) => visita.viaje_fecha === fecha);
    },
    [visitas],
  );

  // Obtener visitas por rango de fechas
  const getVisitasByRangoFechas = useCallback(
    (fechaInicio: string, fechaFin: string) => {
      return visitas.filter((visita) => {
        if (!visita.viaje_fecha) return false;
        const fechaVisita = new Date(visita.viaje_fecha);
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        return fechaVisita >= inicio && fechaVisita <= fin;
      });
    },
    [visitas],
  );

  // Calcular peso total de visita
  const calcularPesoTotalVisita = useCallback((visita: Visita) => {
    return visita.peso_kg || 0;
  }, []);

  // Obtener estadísticas de visitas
  const getEstadisticasVisitas = useCallback(() => {
    const total = visitas.length;
    const pendientes = visitas.filter(
      (v) => !v.entrega_cf && !v.recojo_cf,
    ).length;
    const enCurso = visitas.filter(
      (v) => (v.entrega_cf || v.recojo_cf) && !(v.entrega_cf && v.recojo_cf),
    ).length;
    const completadas = visitas.filter(
      (v) => v.entrega_cf && v.recojo_cf,
    ).length;

    const totalEntrega = visitas.reduce(
      (sum, v) => sum + (v.entrega_cf || 0),
      0,
    );
    const totalRecojo = visitas.reduce((sum, v) => sum + (v.recojo_cf || 0), 0);
    const totalPedidos = visitas.reduce((sum, v) => sum + (v.pedidos || 0), 0);
    const pesoTotal = visitas.reduce((sum, v) => sum + (v.peso_kg || 0), 0);
    const distanciaTotal = visitas.reduce(
      (sum, v) => sum + (v.distancia_km || 0),
      0,
    );

    return {
      total,
      pendientes,
      enCurso,
      completadas,
      totalEntrega,
      totalRecojo,
      totalPedidos,
      pesoTotal,
      distanciaTotal,
      porcentajeCompletadas:
        total > 0 ? Math.round((completadas / total) * 100) : 0,
    };
  }, [visitas]);

  // Reordenar visitas de un viaje (funcionalidad no disponible - no hay campo orden_visita en BD)
  const reordenarVisitas = useCallback(
    async (visitasConNuevoOrden: { id_visita: number }[]) => {
      // Esta funcionalidad no está disponible sin el campo orden_visita en BD
      return {
        success: false,
        error: "Funcionalidad no disponible sin campo orden_visita",
      };
    },
    [],
  );

  // Efecto para cargar visitas al montar el componente
  useEffect(() => {
    let mounted = true;

    const loadVisitas = async () => {
      if (visitas.length === 0 && mounted && !isLoading) {
        await fetchVisitas();
      }
    };

    loadVisitas();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    visitas,
    isLoading: isLoading || crud.loading,
    error: error || crud.error,
    fetchVisitas,
    createVisita,
    updateVisita,
    deleteVisita,
    getVisitaById,
    getVisitasByViaje,
    getVisitasByCliente,
    getVisitasByEstado,
    getVisitasPendientes,
    getVisitasCompletadas,
    getVisitasEnCurso,
    updateCantidades,
    searchByClienteNombre,
    searchByClienteCodigo,
    getVisitasByFecha,
    getVisitasByRangoFechas,
    calcularPesoTotalVisita,
    getEstadisticasVisitas,
    reordenarVisitas,
    refetch: fetchVisitas,
  };
};

export default useVisitas;
