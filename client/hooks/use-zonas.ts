"use client";

import { useState, useCallback, useEffect } from "react";
import { useSimpleCrud } from "./use-simple-api";

export interface Zona {
  id_zona?: number;
  codigo: string;
  descripcion: string;
  latitud?: number;
  longitud?: number;
  created_at?: string;
  updated_at?: string;
}

export const useZonas = () => {
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const crud = useSimpleCrud<Zona>("/zonas");

  // Cargar todas las zonas
  const fetchZonas = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await crud.getAll();
      if (response.success && response.data) {
        setZonas(response.data);
      } else {
        setError(response.error || "Error al cargar zonas");
      }
    } catch (err) {
      setError("Error de conexión");
      console.error("Error fetching zonas:", err);
    } finally {
      setIsLoading(false);
    }
  }, [crud]);

  // Crear zona
  const createZona = useCallback(
    async (zona: Omit<Zona, "id_zona">) => {
      setError(null);

      try {
        const response = await crud.create(zona);
        if (response.success) {
          if (response.data) {
            setZonas((prev) => [response.data as Zona, ...prev]);
          } else {
            await fetchZonas();
          }
          return { success: true, data: response.data };
        } else {
          setError(response.error || "Error al crear zona");
          return { success: false, error: response.error };
        }
      } catch (err) {
        const errorMessage = "Error de conexión al crear zona";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [crud, fetchZonas],
  );

  // Actualizar zona
  const updateZona = useCallback(
    async (id: number, zona: Partial<Zona>) => {
      setError(null);

      try {
        const response = await crud.update(id, zona);
        if (response.success) {
          setZonas((prev) =>
            prev.map((z) => (z.id_zona === id ? ({ ...z, ...zona } as Zona) : z)),
          );
          return { success: true, data: response.data };
        } else {
          setError(response.error || "Error al actualizar zona");
          return { success: false, error: response.error };
        }
      } catch (err) {
        const errorMessage = "Error de conexión al actualizar zona";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [crud],
  );

  // Eliminar zona
  const deleteZona = useCallback(
    async (id: number) => {
      setError(null);

      try {
        const response = await crud.remove(id);
        if (response.success) {
          setZonas((prev) => prev.filter((z) => z.id_zona !== id));
          return { success: true };
        } else {
          setError(response.error || "Error al eliminar zona");
          return { success: false, error: response.error };
        }
      } catch (err) {
        const errorMessage = "Error de conexión al eliminar zona";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [crud],
  );

  // Obtener zona por ID
  const getZonaById = useCallback(
    async (id: number) => {
      setError(null);

      try {
        const response = await crud.getById(id);
        if (response.success) {
          return { success: true, data: response.data };
        } else {
          setError(response.error || "Error al obtener zona");
          return { success: false, error: response.error };
        }
      } catch (err) {
        const errorMessage = "Error de conexión al obtener zona";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [crud],
  );

  // Obtener zona por código
  const getZonaByCodigo = useCallback(async (codigo: string) => {
    setError(null);

    try {
      const response = await fetch(`/api/zonas/codigo/${codigo}`);
      const data = await response.json();
      if (data.success) {
        return { success: true, data: data.data };
      } else {
        setError(data.message || "Error al obtener zona");
        return { success: false, error: data.message };
      }
    } catch (err) {
      const errorMessage = "Error de conexión al obtener zona";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Buscar zonas por descripción
  const searchByDescripcion = useCallback(
    (descripcion: string) => {
      return zonas.filter((zona) =>
        zona.descripcion.toLowerCase().includes(descripcion.toLowerCase()),
      );
    },
    [zonas],
  );

  // Buscar zonas por código
  const searchByCodigo = useCallback(
    (codigo: string) => {
      return zonas.filter((zona) =>
        zona.codigo.toLowerCase().includes(codigo.toLowerCase()),
      );
    },
    [zonas],
  );

  // Efecto para cargar zonas al montar el componente
  useEffect(() => {
    fetchZonas();
  }, []);

  return {
    zonas,
    isLoading,
    error,
    fetchZonas,
    createZona,
    updateZona,
    deleteZona,
    getZonaById,
    getZonaByCodigo,
    searchByDescripcion,
    searchByCodigo,
    refetch: fetchZonas,
  };
};

export default useZonas;
