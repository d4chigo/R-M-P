"use client";

import { useState, useCallback, useEffect } from "react";
import { useCrud } from "./use-api";

export interface Visita {
  id?: number;
  id_viaje: number;
  id_cliente: number;
  entrega: number;
  recojo: number;
  llega: string; // TIME format: "HH:MM:SS"
  sale: string; // TIME format: "HH:MM:SS"
  sec1: string;
  sec2: string;
  distancia_km?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
  // Campos relacionados (pueden venir del backend con joins)
  cliente_nombre?: string;
  cliente_codigo?: string;
  cliente_ruc?: string;
  viaje_info?: string;
  viaje_fecha?: string;
  ruta_nombre?: string;
  vehiculo_placa?: string;
}

export const useVisitas = () => {
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const crud = useCrud<Visita>("/visitas");

  // Cargar todas las visitas
  const fetchVisitas = useCallback(async () => {
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
    } finally {
      setIsLoading(false);
    }
  }, [crud]);

  // Crear visita
  const createVisita = useCallback(
    async (visita: Omit<Visita, "id">) => {
      setError(null);

      try {
        const response = await crud.create(visita);
        if (response.success) {
          // Agregar la nueva visita al estado sin recargar toda la lista
          if (response.data) {
            setVisitas((prev) => [...prev, response.data]);
          }
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
    [crud],
  );

  // Actualizar visita
  const updateVisita = useCallback(
    async (id: number, visita: Partial<Visita>) => {
      setError(null);

      try {
        const response = await crud.update(id, visita);
        if (response.success) {
          // Actualizar solo la visita modificada en el estado
          setVisitas((prev) =>
            prev.map((v) => (v.id === id ? { ...v, ...visita } : v)),
          );
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
    [crud],
  );

  // Eliminar visita
  const deleteVisita = useCallback(
    async (id: number) => {
      setError(null);

      try {
        const response = await crud.remove(id);
        if (response.success) {
          // Remover la visita del estado sin recargar toda la lista
          setVisitas((prev) => prev.filter((v) => v.id !== id));
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
    [crud],
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
    [crud],
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

  // Obtener visitas por estado (simulado basado en horas)
  const getVisitasByEstado = useCallback(
    (estado: string) => {
      const horaActual = new Date().toTimeString().split(" ")[0];

      switch (estado) {
        case "Pendiente":
          return visitas.filter((visita) => !visita.llega);
        case "En Curso":
          return visitas.filter((visita) => visita.llega && !visita.sale);
        case "Completada":
          return visitas.filter((visita) => visita.llega && visita.sale);
        default:
          return visitas;
      }
    },
    [visitas],
  );

  // Obtener visitas pendientes
  const getVisitasPendientes = useCallback(() => {
    return visitas.filter((visita) => !visita.llega);
  }, [visitas]);

  // Obtener visitas completadas
  const getVisitasCompletadas = useCallback(() => {
    return visitas.filter((visita) => visita.llega && visita.sale);
  }, [visitas]);

  // Obtener visitas en curso
  const getVisitasEnCurso = useCallback(() => {
    return visitas.filter((visita) => visita.llega && !visita.sale);
  }, [visitas]);

  // Marcar visita como iniciada
  const iniciarVisita = useCallback(
    async (id: number) => {
      const horaActual = new Date().toTimeString().split(" ")[0]; // HH:MM:SS
      return await updateVisita(id, {
        llega: horaActual,
      });
    },
    [updateVisita],
  );

  // Marcar visita como completada
  const completarVisita = useCallback(
    async (id: number) => {
      const horaActual = new Date().toTimeString().split(" ")[0]; // HH:MM:SS
      return await updateVisita(id, {
        sale: horaActual,
      });
    },
    [updateVisita],
  );

  // Actualizar tiempos de llegada y salida
  const updateTiempos = useCallback(
    async (id: number, llega?: string, sale?: string) => {
      const updateData: Partial<Visita> = {};

      if (llega) updateData.llega = llega;
      if (sale) updateData.sale = sale;

      return await updateVisita(id, updateData);
    },
    [updateVisita],
  );

  // Actualizar cantidades de entrega y recojo
  const updateCantidades = useCallback(
    async (id: number, entrega?: number, recojo?: number) => {
      const updateData: Partial<Visita> = {};

      if (entrega !== undefined) updateData.entrega = entrega;
      if (recojo !== undefined) updateData.recojo = recojo;

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

  // Buscar visitas por RUC de cliente
  const searchByClienteRuc = useCallback(
    (ruc: string) => {
      return visitas.filter((visita) => visita.cliente_ruc?.includes(ruc));
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

  // Calcular tiempo total de visita (diferencia entre llegada y salida)
  const calcularTiempoVisita = useCallback((visita: Visita) => {
    if (!visita.llega || !visita.sale) return 0;

    const [llegaHoras, llegaMinutos, llegaSegundos] = visita.llega
      .split(":")
      .map(Number);
    const [saleHoras, saleMinutos, saleSegundos] = visita.sale
      .split(":")
      .map(Number);

    const llegaEnMinutos = llegaHoras * 60 + llegaMinutos + llegaSegundos / 60;
    const saleEnMinutos = saleHoras * 60 + saleMinutos + saleSegundos / 60;

    return Math.max(0, saleEnMinutos - llegaEnMinutos);
  }, []);

  // Obtener estadísticas de visitas
  const getEstadisticasVisitas = useCallback(() => {
    const total = visitas.length;
    const pendientes = visitas.filter((v) => !v.llega).length;
    const enCurso = visitas.filter((v) => v.llega && !v.sale).length;
    const completadas = visitas.filter((v) => v.llega && v.sale).length;

    const totalEntrega = visitas.reduce((sum, v) => sum + (v.entrega || 0), 0);
    const totalRecojo = visitas.reduce((sum, v) => sum + (v.recojo || 0), 0);

    const tiempoPromedio =
      visitas
        .filter((v) => v.llega && v.sale)
        .reduce((sum, v) => sum + calcularTiempoVisita(v), 0) /
      Math.max(1, completadas);

    return {
      total,
      pendientes,
      enCurso,
      completadas,
      canceladas: 0, // No hay campo canceladas en BD
      totalEntrega,
      totalRecojo,
      tiempoPromedioMinutos: Math.round(tiempoPromedio),
      porcentajeCompletadas:
        total > 0 ? Math.round((completadas / total) * 100) : 0,
    };
  }, [visitas, calcularTiempoVisita]);

  // Reordenar visitas de un viaje (funcionalidad removida - no hay campo orden_visita en BD)
  const reordenarVisitas = useCallback(
    async (visitasConNuevoOrden: { id: number }[]) => {
      // Esta funcionalidad no está disponible sin el campo orden_visita en BD
      return {
        success: false,
        error: "Funcionalidad no disponible sin campo orden_visita",
      };
    },
    [updateVisita],
  );

  // Efecto para cargar visitas al montar el componente
  useEffect(() => {
    fetchVisitas();
  }, [fetchVisitas]);

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
    iniciarVisita,
    completarVisita,
    updateTiempos,
    updateCantidades,
    searchByClienteNombre,
    searchByClienteRuc,
    searchByClienteCodigo,
    getVisitasByFecha,
    getVisitasByRangoFechas,
    calcularTiempoVisita,
    getEstadisticasVisitas,
    reordenarVisitas,
    refetch: fetchVisitas,
  };
};

export default useVisitas;
