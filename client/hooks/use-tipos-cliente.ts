"use client";

import { useState, useCallback, useEffect } from "react";
import { useSimpleCrud } from "./use-simple-api";

export interface TipoCliente {
  id?: number;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
  created_at?: string;
  updated_at?: string;
}

export const useTiposCliente = () => {
  const [tiposCliente, setTiposCliente] = useState<TipoCliente[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Since there's no actual TIPO_CLIENTE table in the database, we'll provide static data
  // This can be later replaced with actual API calls when TIPO_CLIENTE table is created
  const staticTiposCliente: TipoCliente[] = [
    {
      id: 1,
      nombre: "Mayorista",
      descripcion: "Cliente que compra grandes volúmenes",
      activo: true,
    },
    {
      id: 2,
      nombre: "Minorista",
      descripcion: "Cliente que compra volúmenes pequeños",
      activo: true,
    },
    {
      id: 3,
      nombre: "Corporativo",
      descripcion: "Cliente empresarial con contrato especial",
      activo: true,
    },
    {
      id: 4,
      nombre: "Distribuidor",
      descripcion: "Cliente que redistribuye productos",
      activo: true,
    },
    {
      id: 5,
      nombre: "VIP",
      descripcion: "Cliente con beneficios especiales",
      activo: true,
    },
  ];

  // For future implementation when TIPO_CLIENTE table exists
  const crud = useSimpleCrud<TipoCliente>("/tipos-cliente");

  // Load all client types (currently static data)
  const fetchTiposCliente = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      // For now, use static data
      // TODO: Replace with actual API call when TIPO_CLIENTE table exists
      // const response = await crud.getAll();

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 200));

      setTiposCliente(staticTiposCliente);
    } catch (err) {
      setError("Error de conexión");
      console.error("Error fetching tipos cliente:", err);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  // Create client type (placeholder for future implementation)
  const createTipoCliente = useCallback(async (tipo: Omit<TipoCliente, "id">) => {
    setError(null);

    try {
      // TODO: Implement when TIPO_CLIENTE table exists
      // const response = await crud.create(tipo);

      // For now, add to static data with new ID
      const newId = Math.max(...staticTiposCliente.map((t) => t.id || 0)) + 1;
      const newTipo = { ...tipo, id: newId };
      setTiposCliente((prev: TipoCliente[]) => [...prev, newTipo]);

      return { success: true, data: newTipo };
    } catch (err) {
      const errorMessage = "Error de conexión al crear tipo de cliente";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Update client type (placeholder for future implementation)
  const updateTipoCliente = useCallback(async (id: number, tipo: Partial<TipoCliente>) => {
    setError(null);

    try {
      // TODO: Implement when TIPO_CLIENTE table exists
      // const response = await crud.update(id, tipo);

      // For now, update in static data
      setTiposCliente((prev: TipoCliente[]) =>
        prev.map((t: TipoCliente) => (t.id === id ? { ...t, ...tipo } : t)),
      );

      return { success: true, data: tipo };
    } catch (err) {
      const errorMessage = "Error de conexión al actualizar tipo de cliente";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Delete client type (placeholder for future implementation)
  const deleteTipoCliente = useCallback(async (id: number) => {
    setError(null);

    try {
      // TODO: Implement when TIPO_CLIENTE table exists
      // const response = await crud.remove(id);

      // For now, remove from static data
      setTiposCliente((prev: TipoCliente[]) => prev.filter((t: TipoCliente) => t.id !== id));

      return { success: true };
    } catch (err) {
      const errorMessage = "Error de conexión al eliminar tipo de cliente";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Get client type by ID
  const getTipoClienteById = useCallback(
    async (id: number) => {
      setError(null);

      try {
        const tipo = tiposCliente.find((t: TipoCliente) => t.id === id);
        if (tipo) {
          return { success: true, data: tipo };
        } else {
          setError("Tipo de cliente no encontrado");
          return { success: false, error: "Tipo de cliente no encontrado" };
        }
      } catch (err) {
        const errorMessage = "Error de conexión al obtener tipo de cliente";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [tiposCliente],
  );

  // Search client types by name
  const searchTiposCliente = useCallback(
    (searchTerm: string) => {
      return tiposCliente.filter(
        (tipo: TipoCliente) =>
          tipo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tipo.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    },
    [tiposCliente],
  );

  // Get active client types
  const getTiposClienteActivos = useCallback(() => {
    return tiposCliente.filter((tipo: TipoCliente) => tipo.activo !== false);
  }, [tiposCliente]);

  // Get client types statistics
  const getEstadisticasTiposCliente = useCallback(() => {
    const total = tiposCliente.length;
    const activos = tiposCliente.filter((t: TipoCliente) => t.activo !== false).length;
    const inactivos = total - activos;

    return {
      total,
      activos,
      inactivos,
      porcentaje_activos: total > 0 ? Math.round((activos / total) * 100) : 0,
    };
  }, [tiposCliente]);

  // Load client types on component mount
  useEffect(() => {
    let mounted = true;

    const loadTiposCliente = async () => {
      if (tiposCliente.length === 0 && mounted && !isLoading) {
        await fetchTiposCliente();
      }
    };

    loadTiposCliente();

    return () => {
      mounted = false;
    };
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
    searchTiposCliente,
    getTiposClienteActivos,
    getEstadisticasTiposCliente,
    refetch: fetchTiposCliente,
  };
};

export default useTiposCliente;
