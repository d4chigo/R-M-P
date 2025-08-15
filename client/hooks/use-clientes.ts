"use client";

import { useState, useCallback, useEffect } from "react";
import { useSimpleCrud } from "./use-simple-api";

export interface Cliente {
  id_cliente?: number;
  codigo: string;
  nombre: string;
  direccion?: string;
  id_zona?: number;
  zona_nombre?: string; // Campo calculado del JOIN con ZONA
  zona_codigo?: string; // Campo calculado del JOIN con ZONA
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

export const useClientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const crud = useSimpleCrud<Cliente>("/clientes");

  // Cargar todos los clientes
  const fetchClientes = useCallback(async () => {
    if (isLoading) return; // Prevenir múltiples llamadas simultáneas

    setIsLoading(true);
    setError(null);

    try {
      const response = await crud.getAll();
      if (response.success && response.data) {
        setClientes(response.data);
      } else {
        setError(response.error || "Error al cargar clientes");
      }
    } catch (err) {
      setError("Error de conexión");
      console.error("Error fetching clientes:", err);
    } finally {
      setIsLoading(false);
    }
  }, [crud.getAll]);

  // Crear cliente
  const createCliente = useCallback(
    async (cliente: Omit<Cliente, "id">) => {
      setError(null);

      try {
        const response = await crud.create(cliente);
        if (response.success) {
          // Agregar el nuevo cliente al estado sin recargar toda la lista
          if (response.data) {
            setClientes((prev) => [...prev, response.data as Cliente]);
          }
          return { success: true, data: response.data };
        } else {
          setError(response.error || "Error al crear cliente");
          return { success: false, error: response.error };
        }
      } catch (err) {
        const errorMessage = "Error de conexión al crear cliente";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [crud.create],
  );

  // Actualizar cliente
  const updateCliente = useCallback(
    async (id: number, cliente: Partial<Cliente>) => {
      setError(null);

      try {
        const response = await crud.update(id, cliente);
        if (response.success) {
          // Actualizar solo el cliente modificado en el estado
          setClientes((prev) =>
            prev.map((c) =>
              c.id_cliente === id ? ({ ...c, ...cliente } as Cliente) : c,
            ),
          );
          return { success: true, data: response.data };
        } else {
          setError(response.error || "Error al actualizar cliente");
          return { success: false, error: response.error };
        }
      } catch (err) {
        const errorMessage = "Error de conexión al actualizar cliente";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [crud.update],
  );

  // Eliminar cliente
  const deleteCliente = useCallback(
    async (id: number) => {
      setError(null);

      try {
        const response = await crud.remove(id);
        if (response.success) {
          // Remover el cliente del estado sin recargar toda la lista
          setClientes((prev) => prev.filter((c) => c.id_cliente !== id));
          return { success: true };
        } else {
          setError(response.error || "Error al eliminar cliente");
          return { success: false, error: response.error };
        }
      } catch (err) {
        const errorMessage = "Error de conexión al eliminar cliente";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [crud.remove],
  );

  // Obtener cliente por ID
  const getClienteById = useCallback(
    async (id: number) => {
      setError(null);

      try {
        const response = await crud.getById(id);
        if (response.success) {
          return { success: true, data: response.data };
        } else {
          setError(response.error || "Error al obtener cliente");
          return { success: false, error: response.error };
        }
      } catch (err) {
        const errorMessage = "Error de conexión al obtener cliente";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [crud.getById],
  );

  // Cambiar estado del cliente (activo/inactivo)
  const toggleClienteActivo = useCallback(
    async (id: number, currentActivo: boolean) => {
      return await updateCliente(id, { activo: !currentActivo });
    },
    [updateCliente],
  );

  // Obtener clientes por estado activo
  const getClientesByActivo = useCallback(
    (activo: boolean) => {
      return clientes.filter((cliente) => cliente.activo === activo);
    },
    [clientes],
  );

  // Buscar clientes por código
  const searchByCodigo = useCallback(
    (codigo: string) => {
      return clientes.filter((cliente) =>
        cliente.codigo.toLowerCase().includes(codigo.toLowerCase()),
      );
    },
    [clientes],
  );

  // Buscar clientes por nombre
  const searchByNombre = useCallback(
    (nombre: string) => {
      return clientes.filter((cliente) =>
        cliente.nombre.toLowerCase().includes(nombre.toLowerCase()),
      );
    },
    [clientes],
  );

  // Obtener clientes por zona
  const getClientesByZonaId = useCallback(
    (zonaId: number) => {
      return clientes.filter((cliente) => cliente.id_zona === zonaId);
    },
    [clientes],
  );

  // Buscar clientes por dirección
  const searchByDireccion = useCallback(
    (direccion: string) => {
      return clientes.filter((cliente) =>
        cliente.direccion?.toLowerCase().includes(direccion.toLowerCase()),
      );
    },
    [clientes],
  );

  // Efecto para cargar clientes al montar el componente
  useEffect(() => {
    let mounted = true;

    const loadClientes = async () => {
      if (clientes.length === 0 && mounted && !isLoading) {
        await fetchClientes();
      }
    };

    loadClientes();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    clientes,
    isLoading: isLoading || crud.loading,
    error: error || crud.error,
    fetchClientes,
    createCliente,
    updateCliente,
    deleteCliente,
    getClienteById,
    toggleClienteActivo,
    getClientesByActivo,
    getClientesByZonaId,
    searchByCodigo,
    searchByNombre,
    searchByDireccion,
    refetch: fetchClientes,
  };
};

export default useClientes;
