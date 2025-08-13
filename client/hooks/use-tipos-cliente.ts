"use client";

import { useState, useCallback, useEffect } from "react";
import { useCrud } from "./use-api";

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

  const crud = useCrud<TipoCliente>("/tipos-cliente");

  // Cargar todos los tipos de cliente
  const fetchTiposCliente = useCallback(async () => {
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
          // Agregar el nuevo tipo de cliente al estado sin recargar toda la lista
          if (response.data) {
            setTiposCliente((prev) => [...prev, response.data]);
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
    [crud],
  );

  // Actualizar tipo de cliente
  const updateTipoCliente = useCallback(
    async (id: number, tipoCliente: Partial<TipoCliente>) => {
      setError(null);

      try {
        const response = await crud.update(id, tipoCliente);
        if (response.success) {
          // Actualizar solo el tipo de cliente modificado en el estado
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
          // Remover el tipo de cliente del estado sin recargar toda la lista
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
    // Aquí podrías agregar lógica para verificar si hay clientes asociados
    // Por ahora retornamos true
    return true;
  }, []);

  // Efecto para cargar tipos de cliente al montar el componente
  useEffect(() => {
    fetchTiposCliente();
  }, [fetchTiposCliente]);

  return {
    tiposCliente,
    isLoading: isLoading || crud.loading,
    error: error || crud.error,
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
