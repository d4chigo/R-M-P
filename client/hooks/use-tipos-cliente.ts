"use client";

import { useState, useCallback, useEffect } from "react";
import { useSimpleCrud } from "./use-simple-api";

export interface TipoCliente {
  id?: number;
  nombre: string;
  descripcion?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export const useTiposCliente = () => {
  const [tiposCliente, setTiposCliente] = useState<TipoCliente[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const crud = useSimpleCrud<TipoCliente>("/tipos-cliente");

  // Cargar todos los tipos de cliente
  const fetchTiposCliente = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await crud.getAll();
      if (response.success && response.data) {
        setTiposCliente(response.data);
      } else {
        setError(response.error || "Error al cargar tipos de cliente");
      }
    } catch (err) {
      setError("Error de conexión");
      console.error("Error fetching tipos cliente:", err);
    } finally {
      setIsLoading(false);
    }
  }, [crud]);

  // Crear tipo de cliente
  const createTipoCliente = useCallback(
    async (tipoCliente: Omit<TipoCliente, "id">) => {
      setError(null);

      try {
        const response = await crud.create(tipoCliente);
        if (response.success) {
          if (response.data) {
            setTiposCliente((prev) => [response.data as TipoCliente, ...prev]);
          } else {
            await fetchTiposCliente();
          }
          return { success: true, data: response.data };
        } else {
          setError(response.error || "Error al crear tipo de cliente");
          return { success: false, error: response.error };
        }
      } catch (err) {
        const errorMessage = "Error de conexión al crear tipo de cliente";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [crud, fetchTiposCliente],
  );

  // Actualizar tipo de cliente
  const updateTipoCliente = useCallback(
    async (id: number, tipoCliente: Partial<TipoCliente>) => {
      setError(null);

      try {
        const response = await crud.update(id, tipoCliente);
        if (response.success) {
          setTiposCliente((prev) =>
            prev.map((t) => (t.id === id ? { ...t, ...tipoCliente } : t)),
          );
          return { success: true, data: response.data };
        } else {
          setError(response.error || "Error al actualizar tipo de cliente");
          return { success: false, error: response.error };
        }
      } catch (err) {
        const errorMessage = "Error de conexión al actualizar tipo de cliente";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [crud],
  );

  // Eliminar tipo de cliente
  const deleteTipoCliente = useCallback(
    async (id: number) => {
      setError(null);

      try {
        const response = await crud.remove(id);
        if (response.success) {
          setTiposCliente((prev) => prev.filter((t) => t.id !== id));
          return { success: true };
        } else {
          setError(response.error || "Error al eliminar tipo de cliente");
          return { success: false, error: response.error };
        }
      } catch (err) {
        const errorMessage = "Error de conexión al eliminar tipo de cliente";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [crud],
  );

  // Obtener tipo de cliente por ID
  const getTipoClienteById = useCallback(
    async (id: number) => {
      setError(null);

      try {
        const response = await crud.getById(id);
        if (response.success) {
          return { success: true, data: response.data };
        } else {
          setError(response.error || "Error al obtener tipo de cliente");
          return { success: false, error: response.error };
        }
      } catch (err) {
        const errorMessage = "Error de conexión al obtener tipo de cliente";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [crud],
  );

  // Buscar tipos de cliente por nombre
  const searchByNombre = useCallback(
    (nombre: string) => {
      return tiposCliente.filter((tipo) =>
        tipo.nombre.toLowerCase().includes(nombre.toLowerCase()),
      );
    },
    [tiposCliente],
  );

  // Verificar si un tipo de cliente puede ser eliminado
  const canDelete = useCallback(async (id: number) => {
    return true;
  }, []);

  // Efecto para cargar tipos de cliente al montar el componente
  useEffect(() => {
    fetchTiposCliente();
  }, []);

  return {
    tiposCliente,
    isLoading,
    error,
    fetchTiposCliente,
    createTipoCliente,
    updateTipoCliente,
    deleteTipoCliente,
    getTipoClienteById,
    searchByNombre,
    canDelete,
    refetch: fetchTiposCliente,
  };
};

export default useTiposCliente;
