"use client";

import { useState, useCallback, useEffect } from "react";
import { useSimpleCrud } from "./use-simple-api";

export interface Cliente {
  id?: number;
  nombre: string;
  codigo: string;
  id_tipo_cliente: number;
  codigo_zona_pvta_manual?: string;
  codigo_zona_tvta_manual?: string;
  ruc: string;
  ciudad: string;
  telefono: string;
  email: string;
  contacto_nombre: string;
  horario: string;
  estado: string;
  latitud: number;
  longitud: number;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
  // Campos relacionados desde joins
  tipo_cliente_nombre?: string;
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
              c.id === id ? ({ ...c, ...cliente } as Cliente) : c,
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
          setClientes((prev) => prev.filter((c) => c.id !== id));
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

  // Cambiar estado del cliente
  const toggleClienteEstado = useCallback(
    async (id: number, currentEstado: string) => {
      const newEstado = currentEstado === "Activo" ? "Inactivo" : "Activo";
      return await updateCliente(id, { estado: newEstado });
    },
    [updateCliente],
  );

  // Obtener clientes por estado
  const getClientesByEstado = useCallback(
    (estado: string) => {
      return clientes.filter((cliente) => cliente.estado === estado);
    },
    [clientes],
  );

  // Buscar clientes por RUC
  const searchByRuc = useCallback(
    (ruc: string) => {
      return clientes.filter((cliente) => cliente.ruc.includes(ruc));
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

  // Obtener clientes por tipo
  const getClientesByTipo = useCallback(
    (tipoId: number) => {
      return clientes.filter((cliente) => cliente.id_tipo_cliente === tipoId);
    },
    [clientes],
  );

  // Obtener clientes por zona
  const getClientesByZona = useCallback(
    (codigoZona: string, tipoZona: "pvta" | "tvta" = "pvta") => {
      return clientes.filter((cliente) =>
        tipoZona === "pvta"
          ? cliente.codigo_zona_pvta_manual === codigoZona
          : cliente.codigo_zona_tvta_manual === codigoZona,
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
    toggleClienteEstado,
    getClientesByEstado,
    getClientesByTipo,
    getClientesByZona,
    searchByRuc,
    searchByNombre,
    refetch: fetchClientes,
  };
};

export default useClientes;
