"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "./use-toast";
import Cookies from "js-cookie";

export interface CentroDistribucion {
  id_centro?: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  direccion: string;
  ciudad: string;
  estado: 'activo' | 'inactivo' | 'mantenimiento';
  capacidad_almacen?: number;
  personal_asignado?: number;
  telefono?: string;
  email?: string;
  latitud?: number;
  longitud?: number;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}

export const useCentroDistribucion = () => {
  const [centros, setCentros] = useState<CentroDistribucion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const isLoadingRef = useRef(false);

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

  // Función simplificada para obtener centros
  const fetchCentros = useCallback(async () => {
    if (isLoadingRef.current) {
      console.log("🔄 useCentroDistribucion: Ya hay una carga en progreso, saltando...");
      return;
    }

    isLoadingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      // Obtener token de autenticación
      const authToken = Cookies.get("auth_token");

      if (!authToken) {
        setError("No se ha iniciado sesión");
        return;
      }

      console.log("🔑 useCentroDistribucion: Token encontrado, haciendo request...");

      const response = await fetch(`${API_BASE_URL}/centros-distribucion`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        setCentros(data.data);
      } else {
        console.error("❌ useCentroDistribucion: Error en respuesta:", data.message);
        setError(data.message || "Error al cargar centros");
      }
    } catch (err) {
      console.error("❌ useCentroDistribucion: Error de conexión:", err);
      setError("Error de conexión al cargar centros");
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [API_BASE_URL]);

  // Crear centro
  const createCentro = useCallback(
    async (centro: Omit<CentroDistribucion, "id_centro">) => {
      try {
        const authToken = Cookies.get("auth_token");
        if (!authToken) {
          return { success: false, error: "No se ha iniciado sesión" };
        }

        const response = await fetch(`${API_BASE_URL}/centros-distribucion`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(centro),
        });

        const data = await response.json();

        if (data.success) {
          // Actualizar la lista local
          setCentros(prev => [...prev, data.data]);
          return { success: true, data: data.data };
        } else {
          return { success: false, error: data.message || "Error al crear el centro" };
        }
      } catch (error) {
        console.error("Error al crear centro:", error);
        return { success: false, error: "Error de conexión" };
      }
    },
    [API_BASE_URL]
  );

  // Actualizar centro
  const updateCentro = useCallback(
    async (id: number, centro: Omit<CentroDistribucion, "id_centro">) => {
      try {
        const authToken = Cookies.get("auth_token");
        if (!authToken) {
          return { success: false, error: "No se ha iniciado sesión" };
        }

        const response = await fetch(`${API_BASE_URL}/centros-distribucion/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(centro),
        });

        const data = await response.json();

        if (data.success) {
          // Actualizar la lista local
          setCentros(prev => 
            prev.map(c => c.id_centro === id ? { ...data.data, id_centro: id } : c)
          );
          return { success: true, data: data.data };
        } else {
          return { success: false, error: data.message || "Error al actualizar el centro" };
        }
      } catch (error) {
        console.error("Error al actualizar centro:", error);
        return { success: false, error: "Error de conexión" };
      }
    },
    [API_BASE_URL]
  );

  // Eliminar centro
  const deleteCentro = useCallback(
    async (id: number) => {
      try {
        const authToken = Cookies.get("auth_token");
        if (!authToken) {
          return { success: false, error: "No se ha iniciado sesión" };
        }

        const response = await fetch(`${API_BASE_URL}/centros-distribucion/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });

        const data = await response.json();

        if (data.success) {
          // Actualizar la lista local
          setCentros(prev => prev.filter(c => c.id_centro !== id));
          return { success: true };
        } else {
          return { success: false, error: data.message || "Error al eliminar el centro" };
        }
      } catch (error) {
        console.error("Error al eliminar centro:", error);
        return { success: false, error: "Error de conexión" };
      }
    },
    [API_BASE_URL]
  );

  // Obtener centro por ID
  const getCentroById = useCallback(
    async (id: number) => {
      try {
        const authToken = Cookies.get("auth_token");
        if (!authToken) {
          return { success: false, error: "No se ha iniciado sesión" };
        }

        const response = await fetch(`${API_BASE_URL}/centros-distribucion/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });

        const data = await response.json();

        if (data.success) {
          return { success: true, data: data.data };
        } else {
          return { success: false, error: data.message || "Error al obtener el centro" };
        }
      } catch (error) {
        console.error("Error al obtener centro:", error);
        return { success: false, error: "Error de conexión" };
      }
    },
    [API_BASE_URL]
  );

  // Buscar centros por criterios
  const searchCentros = useCallback(
    async (searchTerm: string) => {
      try {
        const authToken = Cookies.get("auth_token");
        if (!authToken) {
          return { success: false, error: "No se ha iniciado sesión" };
        }

        const response = await fetch(`${API_BASE_URL}/centros-distribucion/search?q=${encodeURIComponent(searchTerm)}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });

        const data = await response.json();

        if (data.success) {
          return { success: true, data: data.data };
        } else {
          return { success: false, error: data.message || "Error en la búsqueda" };
        }
      } catch (error) {
        console.error("Error en búsqueda:", error);
        return { success: false, error: "Error de conexión" };
      }
    },
    [API_BASE_URL]
  );

  // Obtener centros por estado
  const getCentrosByEstado = useCallback(
    async (estado: string) => {
      try {
        const authToken = Cookies.get("auth_token");
        if (!authToken) {
          return { success: false, error: "No se ha iniciado sesión" };
        }

        const response = await fetch(`${API_BASE_URL}/centros-distribucion/estado/${estado}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });

        const data = await response.json();

        if (data.success) {
          return { success: true, data: data.data };
        } else {
          return { success: false, error: data.message || "Error al obtener centros por estado" };
        }
      } catch (error) {
        console.error("Error al obtener centros por estado:", error);
        return { success: false, error: "Error de conexión" };
      }
    },
    [API_BASE_URL]
  );

  // Cargar centros al montar el componente
  useEffect(() => {
    fetchCentros();
  }, []); // Solo se ejecuta una vez al montar

  return {
    centros,
    isLoading,
    error,
    fetchCentros,
    createCentro,
    updateCentro,
    deleteCentro,
    getCentroById,
    searchCentros,
    getCentrosByEstado,
  };
}; 