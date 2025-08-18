"use client";

import { useState, useCallback, useEffect } from "react";
import { useSimpleCrud } from "./use-simple-api";
import { useToast } from "./use-toast";

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
  const { toast } = useToast();

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

          toast({
            title: "Cliente creado",
            description: `Se registró exitosamente ${cliente.nombre}`,
            variant: "default",
          });

          return { success: true, data: response.data };
        } else {
          // Manejar errores específicos
          if (
            response.error?.includes("código") ||
            response.error?.includes("duplicado") ||
            response.error?.includes("existe")
          ) {
            toast({
              title: "Código duplicado",
              description: `El código "${cliente.codigo}" ya está en uso. Por favor, utilice un código diferente.`,
              variant: "destructive",
            });
          } else {
            toast({
              title: "Error al crear cliente",
              description: response.error || "No se pudo crear el cliente",
              variant: "destructive",
            });
          }
          setError(response.error || "Error al crear cliente");
          return { success: false, error: response.error };
        }
      } catch (err) {
        const errorMessage = "Error de conexión al crear cliente";
        toast({
          title: "Error de conexión",
          description: "No se pudo conectar con el servidor",
          variant: "destructive",
        });
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [crud.create, toast],
  );

  // Actualizar cliente
  const updateCliente = useCallback(
    async (id: number, cliente: Partial<Cliente>) => {
      setError(null);

      try {
        const response = await crud.update(id, cliente);
        if (response.success) {
          // Usar la respuesta del servidor si está disponible, sino usar merge inteligente
          setClientes((prev) =>
            prev.map((c) => {
              if (c.id_cliente === id) {
                if (response.data) {
                  // Si el servidor devuelve el cliente actualizado, usarlo
                  return response.data as Cliente;
                } else {
                  // Solo actualizar campos que se enviaron explícitamente
                  const updatedCliente = { ...c };
                  Object.keys(cliente).forEach((key) => {
                    const value = cliente[key as keyof Cliente];
                    // Solo actualizar si el valor está presente en el objeto enviado
                    if (cliente.hasOwnProperty(key)) {
                      (updatedCliente as any)[key] = value;
                    }
                  });
                  return updatedCliente;
                }
              }
              return c;
            }),
          );

          toast({
            title: "Cliente actualizado",
            description: `Se actualizó la información del cliente`,
            variant: "default",
          });

          return { success: true, data: response.data };
        } else {
          toast({
            title: "Error al actualizar",
            description: response.error || "No se pudo actualizar el cliente",
            variant: "destructive",
          });
          setError(response.error || "Error al actualizar cliente");
          return { success: false, error: response.error };
        }
      } catch (err) {
        const errorMessage = "Error de conexión al actualizar cliente";
        toast({
          title: "Error de conexión",
          description: "No se pudo conectar con el servidor",
          variant: "destructive",
        });
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [crud.update, toast],
  );

  // Eliminar cliente
  const deleteCliente = useCallback(
    async (id: number) => {
      setError(null);

      try {
        const response = await crud.remove(id);
        if (response.success) {
          // Determinar el tipo de eliminación basado en el mensaje de respuesta
          const isDeactivated = response.message?.includes("desactivado");
          const isDeleted = response.message?.includes("eliminado");

          if (isDeactivated) {
            // Si fue desactivado, actualizar el estado del cliente en lugar de eliminarlo
            setClientes((prev) =>
              prev.map((c) =>
                c.id_cliente === id ? { ...c, activo: false } : c,
              ),
            );

            toast({
              title: "Cliente desactivado",
              description:
                "El cliente tenía visitas registradas, por lo que se desactivó en lugar de eliminarse",
              variant: "default",
            });
          } else {
            // Si fue eliminado completamente, removerlo del estado
            setClientes((prev) => prev.filter((c) => c.id_cliente !== id));

            toast({
              title: "Cliente eliminado",
              description:
                "Se eliminó completamente del sistema al no tener visitas registradas",
              variant: "default",
            });
          }

          return {
            success: true,
            isDeactivated,
            isDeleted,
            message: response.message,
          };
        } else {
          toast({
            title: "Error al eliminar",
            description: response.error || "No se pudo eliminar el cliente",
            variant: "destructive",
          });
          setError(response.error || "Error al eliminar cliente");
          return { success: false, error: response.error };
        }
      } catch (err) {
        const errorMessage = "Error de conexión al eliminar cliente";
        toast({
          title: "Error de conexión",
          description: "No se pudo conectar con el servidor",
          variant: "destructive",
        });
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [crud.remove, toast],
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
    getClientesByActivo,
    getClientesByZonaId,
    searchByCodigo,
    searchByNombre,
    searchByDireccion,
    refetch: fetchClientes,
  };
};

export default useClientes;
