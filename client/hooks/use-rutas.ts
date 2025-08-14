"use client";

import { useState, useCallback, useEffect } from "react";
import { useSimpleCrud } from "./use-simple-api";

export interface Ruta {
  id?: number;
  codigo: string;
  nombre: string;
  origen: string;
  destino: string;
  distancia_km: number;
  duracion_aproximada: string; // TIME format: "HH:MM:SS"
  tipo_ruta: string;
  estado: string;
  fecha_creacion: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export const useRutas = () => {
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const crud = useSimpleCrud<Ruta>("/rutas");

  // Cargar todas las rutas
  const fetchRutas = useCallback(async () => {
    if (isLoading) return; // Prevenir múltiples llamadas simultáneas

    setIsLoading(true);
    setError(null);

    try {
      const response = await crud.getAll();
      if (response.success && response.data) {
        setRutas(response.data);
      } else {
        setError(response.error || "Error al cargar rutas");
      }
    } catch (err) {
      setError("Error de conexión");
      console.error("Error fetching rutas:", err);
    } finally {
      setIsLoading(false);
    }
  }, [crud.getAll]);

  // Crear ruta
  const createRuta = useCallback(
    async (ruta: Omit<Ruta, "id">) => {
      setError(null);

      try {
        const response = await crud.create(ruta);
        if (response.success) {
          // Agregar la nueva ruta al estado sin recargar toda la lista
          if (response.data) {
            setRutas((prev) => [...prev, response.data as Ruta]);
          }
          return { success: true, data: response.data };
        } else {
          setError(response.error || "Error al crear ruta");
          return { success: false, error: response.error };
        }
      } catch (err) {
        const errorMessage = "Error de conexión al crear ruta";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [crud.create],
  );

  // Actualizar ruta
  const updateRuta = useCallback(
    async (id: number, ruta: Partial<Ruta>) => {
      setError(null);

      try {
        const response = await crud.update(id, ruta);
        if (response.success) {
          // Actualizar solo la ruta modificada en el estado
          setRutas((prev) =>
            prev.map((r) => (r.id === id ? ({ ...r, ...ruta } as Ruta) : r)),
          );
          return { success: true, data: response.data };
        } else {
          setError(response.error || "Error al actualizar ruta");
          return { success: false, error: response.error };
        }
      } catch (err) {
        const errorMessage = "Error de conexión al actualizar ruta";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [crud.update],
  );

  // Eliminar ruta
  const deleteRuta = useCallback(
    async (id: number) => {
      setError(null);

      try {
        const response = await crud.remove(id);
        if (response.success) {
          // Remover la ruta del estado sin recargar toda la lista
          setRutas((prev) => prev.filter((r) => r.id !== id));
          return { success: true };
        } else {
          setError(response.error || "Error al eliminar ruta");
          return { success: false, error: response.error };
        }
      } catch (err) {
        const errorMessage = "Error de conexión al eliminar ruta";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [crud.remove],
  );

  // Obtener rutas activas
  const getRutasActivas = useCallback(() => {
    return rutas.filter((ruta) => ruta.estado === "Activo");
  }, [rutas]);

  // Buscar rutas por origen o destino
  const searchByOrigenDestino = useCallback(
    (searchTerm: string) => {
      return rutas.filter(
        (ruta) =>
          ruta.origen.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ruta.destino.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    },
    [rutas],
  );

  // Obtener rutas por tipo
  const getRutasByTipo = useCallback(
    (tipo: string) => {
      return rutas.filter((ruta) => ruta.tipo_ruta === tipo);
    },
    [rutas],
  );

  // Load routes on component mount only once
  useEffect(() => {
    let mounted = true;

    const loadRutas = async () => {
      if (rutas.length === 0 && mounted && !isLoading) {
        await fetchRutas();
      }
    };

    loadRutas();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    rutas,
    isLoading: isLoading || crud.loading,
    error: error || crud.error,
    fetchRutas,
    createRuta,
    updateRuta,
    deleteRuta,
    getRutasActivas,
    searchByOrigenDestino,
    getRutasByTipo,
    refetch: fetchRutas,
  };
};

export default useRutas;
