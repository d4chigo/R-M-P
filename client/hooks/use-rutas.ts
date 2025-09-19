"use client";

import { useState, useCallback, useEffect } from "react";
import { useSimpleCrud } from "./use-simple-api";

export interface Ruta {
  id?: number;
  nombre: string;
  origen?: string;
  destino?: string;
  distancia_km?: number;
  tiempo_estimado_min?: number;
  activo?: boolean;
  created_at?: string;
  updated_at?: string;
}

export const useRutas = () => {
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Since there's no actual RUTA table in the database, we'll provide static data
  // This can be later replaced with actual API calls when RUTA table is created
  const staticRutas: Ruta[] = [
    {
      id: 1,
      nombre: "Lima Centro - Callao",
      origen: "Lima Centro",
      destino: "Callao",
      distancia_km: 15.5,
      tiempo_estimado_min: 45,
      activo: true,
    },
    {
      id: 2,
      nombre: "Lima Norte - San Juan de Lurigancho",
      origen: "Lima Norte",
      destino: "San Juan de Lurigancho",
      distancia_km: 25.8,
      tiempo_estimado_min: 60,
      activo: true,
    },
    {
      id: 3,
      nombre: "Lima Sur - Villa El Salvador",
      origen: "Lima Sur",
      destino: "Villa El Salvador",
      distancia_km: 35.2,
      tiempo_estimado_min: 75,
      activo: true,
    },
    {
      id: 4,
      nombre: "Lima Este - Ate Vitarte",
      origen: "Lima Este",
      destino: "Ate Vitarte",
      distancia_km: 20.1,
      tiempo_estimado_min: 50,
      activo: true,
    },
    {
      id: 5,
      nombre: "Cercado - Pueblo Libre",
      origen: "Cercado de Lima",
      destino: "Pueblo Libre",
      distancia_km: 12.3,
      tiempo_estimado_min: 35,
      activo: true,
    },
  ];

  // For future implementation when RUTA table exists
  const crud = useSimpleCrud<Ruta>("/rutas");

  // Load all routes (currently static data)
  const fetchRutas = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      // For now, use static data
      // TODO: Replace with actual API call when RUTA table exists
      // const response = await crud.getAll();

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      setRutas(staticRutas);
    } catch (err) {
      setError("Error de conexión");
      console.error("Error fetching rutas:", err);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  // Create route (placeholder for future implementation)
  const createRuta = useCallback(async (ruta: Omit<Ruta, "id">) => {
    setError(null);

    try {
      // TODO: Implement when RUTA table exists
      // const response = await crud.create(ruta);

      // For now, add to static data with new ID
      const newId = Math.max(...staticRutas.map((r) => r.id || 0)) + 1;
      const newRuta = { ...ruta, id: newId };
      setRutas((prev: Ruta[]) => [...prev, newRuta]);

      return { success: true, data: newRuta };
    } catch (err) {
      const errorMessage = "Error de conexión al crear ruta";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Update route (placeholder for future implementation)
  const updateRuta = useCallback(async (id: number, ruta: Partial<Ruta>) => {
    setError(null);

    try {
      // TODO: Implement when RUTA table exists
      // const response = await crud.update(id, ruta);

      // For now, update in static data
      setRutas((prev: Ruta[]) =>
        prev.map((r: Ruta) => (r.id === id ? { ...r, ...ruta } : r)),
      );

      return { success: true, data: ruta };
    } catch (err) {
      const errorMessage = "Error de conexión al actualizar ruta";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Delete route (placeholder for future implementation)
  const deleteRuta = useCallback(async (id: number) => {
    setError(null);

    try {
      // TODO: Implement when RUTA table exists
      // const response = await crud.remove(id);

      // For now, remove from static data
      setRutas((prev: Ruta[]) => prev.filter((r: Ruta) => r.id !== id));

      return { success: true };
    } catch (err) {
      const errorMessage = "Error de conexión al eliminar ruta";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Get route by ID
  const getRutaById = useCallback(
    async (id: number) => {
      setError(null);

      try {
        const ruta = rutas.find((r: Ruta) => r.id === id);
        if (ruta) {
          return { success: true, data: ruta };
        } else {
          setError("Ruta no encontrada");
          return { success: false, error: "Ruta no encontrada" };
        }
      } catch (err) {
        const errorMessage = "Error de conexión al obtener ruta";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [rutas],
  );

  // Search routes by name
  const searchRutas = useCallback(
    (searchTerm: string) => {
      return rutas.filter(
        (ruta: Ruta) =>
          ruta.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ruta.origen?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ruta.destino?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    },
    [rutas],
  );

  // Get active routes
  const getRutasActivas = useCallback(() => {
    return rutas.filter((ruta: Ruta) => ruta.activo !== false);
  }, [rutas]);

  // Get routes statistics
  const getEstadisticasRutas = useCallback(() => {
    const total = rutas.length;
    const activas = rutas.filter((r: Ruta) => r.activo !== false).length;
    const inactivas = total - activas;

    const distanciaTotal = rutas.reduce(
      (sum: number, r: Ruta) => sum + (r.distancia_km || 0),
      0,
    );
    const tiempoTotal = rutas.reduce(
      (sum: number, r: Ruta) => sum + (r.tiempo_estimado_min || 0),
      0,
    );

    return {
      total,
      activas,
      inactivas,
      distancia_total_km: Math.round(distanciaTotal * 100) / 100,
      tiempo_total_min: tiempoTotal,
      distancia_promedio_km:
        total > 0 ? Math.round((distanciaTotal / total) * 100) / 100 : 0,
      tiempo_promedio_min: total > 0 ? Math.round(tiempoTotal / total) : 0,
    };
  }, [rutas]);

  // Load routes on component mount
  useEffect(() => {
    let mounted = true;

    const loadRutas = async () => {
      if (rutas.length === 0 && mounted && !isLoading) {
        await fetchRutas();
      }
    };

    loadRutas();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    rutas,
    isLoading,
    error,
    fetchRutas,
    createRuta,
    updateRuta,
    deleteRuta,
    getRutaById,
    searchRutas,
    getRutasActivas,
    getEstadisticasRutas,
    refetch: fetchRutas,
  };
};

export default useRutas;
