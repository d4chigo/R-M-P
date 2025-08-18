"use client";

import { useState, useCallback, useEffect } from "react";
import { useSimpleCrud } from "./use-simple-api";
import { useToast } from "./use-toast";
import Cookies from "js-cookie";

// Helper function para normalizar valores booleanos que vienen de la BD
// MySQL devuelve BOOLEAN como TINYINT(1) que puede ser 1/0 o true/false
export const normalizeBoolean = (value: any): boolean => {
  return value === true || value === 1;
};

export interface Vehiculo {
  id_vehiculo?: number;
  placa: string;
  marca: string;
  modelo: string;
  anio?: number;
  capacidad_kg?: number;
  capacidad_cajas?: number;
  activo?: boolean;
  created_at?: string;
  updated_at?: string;
}

export const useVehiculos = () => {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const crud = useSimpleCrud<Vehiculo>("/vehiculos");

  // Cargar todos los vehículos
  const fetchVehiculos = useCallback(async () => {
    if (isLoading) return; // Prevenir múltiples llamadas simultáneas

    setIsLoading(true);
    setError(null);

    try {
      const response = await crud.getAll();
      if (response.success && response.data) {
        setVehiculos(response.data);
      } else {
        setError(response.error || "Error al cargar vehículos");
      }
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  }, [crud.getAll, isLoading]);

  // Crear vehículo
  const createVehiculo = useCallback(
    async (vehiculo: Omit<Vehiculo, "id_vehiculo">) => {
      setError(null);

      try {
        const response = await crud.create(vehiculo);
        if (response.success) {
          // Agregar el nuevo vehículo al estado sin recargar toda la lista
          if (response.data) {
            setVehiculos((prev) => [...prev, response.data as Vehiculo]);
          }
          toast({
            title: "Éxito",
            description: "Vehículo creado exitosamente",
          });
          return { success: true, data: response.data };
        } else {
          const errorMessage = response.error || "Error al crear vehículo";
          setError(errorMessage);
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
          return { success: false, error: response.error };
        }
      } catch (err) {
        const errorMessage = "Error de conexión al crear vehículo";
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        return { success: false, error: errorMessage };
      }
    },
    [crud.create],
  );

  // Actualizar vehículo
  const updateVehiculo = useCallback(
    async (id: number, vehiculo: Partial<Vehiculo>) => {
      setError(null);

      try {
        const response = await crud.update(id, vehiculo);
        if (response.success) {
          // Actualizar solo el vehículo modificado en el estado
          setVehiculos((prev) =>
            prev.map((v) => (v.id_vehiculo === id ? { ...v, ...vehiculo } : v)),
          );
          toast({
            title: "Éxito",
            description: "Vehículo actualizado exitosamente",
          });
          return { success: true, data: response.data };
        } else {
          const errorMessage = response.error || "Error al actualizar vehículo";
          setError(errorMessage);
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
          return { success: false, error: response.error };
        }
      } catch (err) {
        const errorMessage = "Error de conexión al actualizar vehículo";
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        return { success: false, error: errorMessage };
      }
    },
    [crud.update],
  );

  // Eliminar vehículo
  const deleteVehiculo = useCallback(
    async (id: number) => {
      setError(null);

      try {
        const response = await crud.remove(id);
        if (response.success) {
          // Solo remover del estado si fue eliminado completamente
          // Si fue desactivado, mantenerlo pero actualizar el estado
          const responseType = (response as any).type;
          if (responseType === "deleted") {
            setVehiculos((prev) => prev.filter((v) => v.id_vehiculo !== id));
          } else if (responseType === "deactivated") {
            setVehiculos((prev) =>
              prev.map((v) =>
                v.id_vehiculo === id ? { ...v, activo: false } : v,
              ),
            );
          }

          const toastTitle =
            responseType === "deactivated" ? "Vehículo Desactivado" : "Éxito";
          const toastVariant =
            responseType === "deactivated" ? "default" : undefined;

          toast({
            title: toastTitle,
            description:
              response.message || "Operación completada exitosamente",
            variant: toastVariant,
          });

          return {
            success: true,
            type: responseType,
            message: response.message,
            details: (response as any).details,
            relatedCount: (response as any).relatedCount,
            hasRelatedRecords: (response as any).hasRelatedRecords,
          };
        } else {
          const errorMsg =
            response.error || response.message || "Error al eliminar vehículo";
          setError(errorMsg);
          toast({
            title: "Error",
            description: errorMsg,
            variant: "destructive",
          });
          return { success: false, error: errorMsg };
        }
      } catch (err) {
        const errorMessage = "Error de conexión al eliminar vehículo";
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        return { success: false, error: errorMessage };
      }
    },
    [crud.remove],
  );

  // Obtener vehículo por ID
  const getVehiculoById = useCallback(
    async (id: number) => {
      setError(null);

      try {
        const response = await crud.getById(id);
        if (response.success) {
          return { success: true, data: response.data };
        } else {
          setError(response.error || "Error al obtener vehículo");
          return { success: false, error: response.error };
        }
      } catch (err) {
        const errorMessage = "Error de conexión al obtener vehículo";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [crud.getById],
  );

  // Cambiar estado activo/inactivo del vehículo
  const toggleVehiculoActivo = useCallback(
    async (id: number) => {
      const vehiculo = vehiculos.find((v) => v.id_vehiculo === id);
      if (!vehiculo) return { success: false, error: "Vehículo no encontrado" };

      // Usar función helper para normalizar el valor booleano
      const isCurrentlyActive = normalizeBoolean(vehiculo.activo);
      const nuevoEstado = !isCurrentlyActive;
      return await updateVehiculo(id, { activo: nuevoEstado });
    },
    [vehiculos, updateVehiculo],
  );

  // Obtener vehículos activos
  const getVehiculosActivos = useCallback(() => {
    return vehiculos.filter((vehiculo) => normalizeBoolean(vehiculo.activo));
  }, [vehiculos]);

  // Obtener vehículos inactivos
  const getVehiculosInactivos = useCallback(() => {
    return vehiculos.filter((vehiculo) => !normalizeBoolean(vehiculo.activo));
  }, [vehiculos]);

  // Buscar vehículos por placa
  const searchByPlaca = useCallback(
    (placa: string) => {
      return vehiculos.filter((vehiculo) =>
        vehiculo.placa.toLowerCase().includes(placa.toLowerCase()),
      );
    },
    [vehiculos],
  );

  // Buscar vehículos por marca
  const searchByMarca = useCallback(
    (marca: string) => {
      return vehiculos.filter((vehiculo) =>
        vehiculo.marca.toLowerCase().includes(marca.toLowerCase()),
      );
    },
    [vehiculos],
  );

  // Efecto para cargar vehículos al montar el componente
  useEffect(() => {
    let mounted = true;

    const loadVehiculos = async () => {
      if (vehiculos.length === 0 && mounted && !isLoading) {
        await fetchVehiculos();
      }
    };

    loadVehiculos();

    return () => {
      mounted = false;
    };
  }, []);

  // Buscar vehículos
  const searchVehiculos = useCallback(
    async (query: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const searchParams = new URLSearchParams();
        if (query.trim()) {
          searchParams.append("q", query.trim());
        }

        const API_BASE =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

        // Get token from cookies
        const getAuthHeader = (): Record<string, string> => {
          const token = Cookies.get("auth_token");
          return token ? { Authorization: `Bearer ${token}` } : {};
        };

        const response = await fetch(
          `${API_BASE}/vehiculos/search?${searchParams}`,
          {
            headers: {
              "Content-Type": "application/json",
              ...getAuthHeader(),
            },
          },
        );

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        if (result.success) {
          setVehiculos(result.data || []);
        } else {
          throw new Error(result.message || "Error en la búsqueda");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error desconocido";
        setError(errorMessage);
        toast({
          title: "Error",
          description: "Error en la búsqueda de vehículos",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [toast],
  );

  return {
    vehiculos,
    isLoading: isLoading || crud.loading,
    error: error || crud.error,
    fetchVehiculos,
    createVehiculo,
    updateVehiculo,
    deleteVehiculo,
    getVehiculoById,
    toggleVehiculoActivo,
    getVehiculosActivos,
    getVehiculosInactivos,
    searchByPlaca,
    searchByMarca,
    searchVehiculos,
    refetch: fetchVehiculos,
  };
};

export default useVehiculos;
