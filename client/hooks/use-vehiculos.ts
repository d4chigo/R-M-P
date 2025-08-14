"use client";

import { useState, useCallback, useEffect } from "react";
import { useSimpleCrud } from "./use-simple-api";

export interface Vehiculo {
  id?: number;
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  tipo: string;
  capacidad_carga_kg: number;
  tipo_carga: string;
  estado: string;
  fecha_adquisicion: string;
  vin: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export const useVehiculos = () => {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      console.error("Error fetching vehiculos:", err);
    } finally {
      setIsLoading(false);
    }
  }, [crud.getAll, isLoading]);

  // Crear vehículo
  const createVehiculo = useCallback(
    async (vehiculo: Omit<Vehiculo, "id">) => {
      setError(null);

      try {
        const response = await crud.create(vehiculo);
        if (response.success) {
          // Agregar el nuevo vehículo al estado sin recargar toda la lista
          if (response.data) {
            setVehiculos((prev) => [...prev, response.data]);
          }
          return { success: true, data: response.data };
        } else {
          setError(response.error || "Error al crear vehículo");
          return { success: false, error: response.error };
        }
      } catch (err) {
        const errorMessage = "Error de conexión al crear vehículo";
        setError(errorMessage);
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
            prev.map((v) => (v.id === id ? { ...v, ...vehiculo } : v)),
          );
          return { success: true, data: response.data };
        } else {
          setError(response.error || "Error al actualizar vehículo");
          return { success: false, error: response.error };
        }
      } catch (err) {
        const errorMessage = "Error de conexión al actualizar vehículo";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [crud.update],
  );

  // Eliminar vehículo
  const deleteVehiculo = useCallback(
    async (id: number) => {
      console.log(`🗑️ Iniciando eliminación de vehículo ID: ${id}`);
      setError(null);

      try {
        const response = await crud.remove(id);
        console.log(`📡 Respuesta del servidor para eliminación:`, response);

        if (response.success) {
          // Remover el vehículo del estado sin recargar toda la lista
          setVehiculos((prev) => prev.filter((v) => v.id !== id));
          console.log(`✅ Vehículo ${id} eliminado del estado local`);
          return { success: true };
        } else {
          const errorMsg =
            response.error || response.message || "Error al eliminar vehículo";
          console.error(
            `❌ Error del servidor al eliminar vehículo ${id}:`,
            errorMsg,
          );
          setError(errorMsg);
          return { success: false, error: errorMsg };
        }
      } catch (err) {
        console.error(`❌ Error de conexión al eliminar vehículo ${id}:`, err);
        const errorMessage = "Error de conexión al eliminar vehículo";
        setError(errorMessage);
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

  // Cambiar estado del vehículo
  const toggleVehiculoEstado = useCallback(
    async (id: number, currentEstado: string) => {
      const newEstado = currentEstado === "Activo" ? "Inactivo" : "Activo";
      return await updateVehiculo(id, { estado: newEstado });
    },
    [updateVehiculo],
  );

  // Obtener vehículos por estado
  const getVehiculosByEstado = useCallback(
    (estado: string) => {
      return vehiculos.filter((vehiculo) => vehiculo.estado === estado);
    },
    [vehiculos],
  );

  // Buscar vehículos por placa
  const searchByPlaca = useCallback(
    (placa: string) => {
      return vehiculos.filter((vehiculo) =>
        vehiculo.placa.toLowerCase().includes(placa.toLowerCase()),
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

  return {
    vehiculos,
    isLoading: isLoading || crud.loading,
    error: error || crud.error,
    fetchVehiculos,
    createVehiculo,
    updateVehiculo,
    deleteVehiculo,
    getVehiculoById,
    toggleVehiculoEstado,
    getVehiculosByEstado,
    searchByPlaca,
    refetch: fetchVehiculos,
  };
};

export default useVehiculos;
