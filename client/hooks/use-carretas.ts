"use client";

import { useState, useCallback, useEffect } from "react";
import { useCrud } from "./use-api";

export interface Carreta {
  id?: number;
  placa: string;
  tipo: string;
  capacidad_kg: number;
  estado: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export const useCarretas = () => {
  const [carretas, setCarretas] = useState<Carreta[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const crud = useCrud<Carreta>("/carretas");

  // Cargar todas las carretas
  const fetchCarretas = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await crud.getAll();
      if (response.success && response.data) {
        setCarretas(response.data);
      } else {
        setError(response.error || "Error al cargar carretas");
      }
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  }, [crud]);

  // Crear carreta
  const createCarreta = useCallback(
    async (carreta: Omit<Carreta, "id">) => {
      setError(null);

      try {
        const response = await crud.create(carreta);
        if (response.success) {
          // Agregar la nueva carreta al estado sin recargar toda la lista
          if (response.data) {
            setCarretas((prev) => [...prev, response.data]);
          }
          return { success: true, data: response.data };
        } else {
          setError(response.error || "Error al crear carreta");
          return { success: false, error: response.error };
        }
      } catch (err) {
        const errorMessage = "Error de conexión al crear carreta";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [crud],
  );

  // Actualizar carreta
  const updateCarreta = useCallback(
    async (id: number, carreta: Partial<Carreta>) => {
      setError(null);

      try {
        const response = await crud.update(id, carreta);
        if (response.success) {
          // Actualizar solo la carreta modificada en el estado
          setCarretas((prev) =>
            prev.map((c) => (c.id === id ? { ...c, ...carreta } : c)),
          );
          return { success: true, data: response.data };
        } else {
          setError(response.error || "Error al actualizar carreta");
          return { success: false, error: response.error };
        }
      } catch (err) {
        const errorMessage = "Error de conexión al actualizar carreta";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [crud],
  );

  // Eliminar carreta
  const deleteCarreta = useCallback(
    async (id: number) => {
      setError(null);

      try {
        const response = await crud.remove(id);
        if (response.success) {
          // Remover la carreta del estado sin recargar toda la lista
          setCarretas((prev) => prev.filter((c) => c.id !== id));
          return { success: true };
        } else {
          setError(response.error || "Error al eliminar carreta");
          return { success: false, error: response.error };
        }
      } catch (err) {
        const errorMessage = "Error de conexión al eliminar carreta";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [crud],
  );

  // Obtener carretas disponibles (sin asignar a vehículos)
  const getCarretasDisponibles = useCallback(() => {
    // Esta lógica podría requerir una consulta específica al backend
    return carretas.filter((carreta) => carreta.estado === "Disponible");
  }, [carretas]);

  // Cambiar estado de carreta
  const toggleCarretaEstado = useCallback(
    async (id: number, currentEstado: string) => {
      const newEstado = currentEstado === "Activo" ? "Inactivo" : "Activo";
      return await updateCarreta(id, { estado: newEstado });
    },
    [updateCarreta],
  );

  useEffect(() => {
    fetchCarretas();
  }, [fetchCarretas]);

  return {
    carretas,
    isLoading: isLoading || crud.loading,
    error: error || crud.error,
    fetchCarretas,
    createCarreta,
    updateCarreta,
    deleteCarreta,
    getCarretasDisponibles,
    toggleCarretaEstado,
    refetch: fetchCarretas,
  };
};

export default useCarretas;
