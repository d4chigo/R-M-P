"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "./use-toast";
import Cookies from "js-cookie";

export interface Zona {
  id_zona?: number;
  codigo: string;
  descripcion: string;
  latitud?: number;
  longitud?: number;
  created_at?: string;
  updated_at?: string;
}

export const useZonas = () => {
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

  // Función simplificada para obtener zonas
  const fetchZonas = useCallback(async () => {
    if (isLoading) {
      console.log("🔄 useZonas: Ya hay una carga en progreso, saltando...");
      return;
    }

    console.log("🔍 useZonas: Iniciando carga de zonas...");
    setIsLoading(true);
    setError(null);

    try {
      // Obtener token de autenticación
      const authToken = Cookies.get("auth_token");

      if (!authToken) {
        console.warn("⚠️ useZonas: No hay token de autenticación");
        setError("No se ha iniciado sesión");
        return;
      }

      console.log("🔑 useZonas: Token encontrado, haciendo request...");

      const response = await fetch(`${API_BASE_URL}/zonas`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      console.log("📡 useZonas: Response status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("📊 useZonas: Respuesta del servidor:", data);

      if (data.success && data.data) {
        console.log(
          `✅ useZonas: ${data.data.length} zonas cargadas exitosamente`,
        );
        setZonas(data.data);
      } else {
        console.error("❌ useZonas: Error en respuesta:", data.message);
        setError(data.message || "Error al cargar zonas");
      }
    } catch (err) {
      console.error("❌ useZonas: Error de conexión:", err);
      setError("Error de conexión al cargar zonas");
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL, isLoading]);

  // Crear zona
  const createZona = useCallback(
    async (zona: Omit<Zona, "id_zona">) => {
      try {
        const authToken = Cookies.get("auth_token");
        if (!authToken) {
          return { success: false, error: "No se ha iniciado sesión" };
        }

        const response = await fetch(`${API_BASE_URL}/zonas`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(zona),
        });

        const data = await response.json();

        if (data.success) {
          if (data.data) {
            setZonas((prev) => [data.data as Zona, ...prev]);
          } else {
            await fetchZonas();
          }
          toast({
            title: "Éxito",
            description: "Zona creada exitosamente",
          });
          return { success: true, data: data.data };
        } else {
          const errorMessage = data.message || "Error al crear zona";
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
          return { success: false, error: data.message };
        }
      } catch (err) {
        const errorMessage = "Error de conexión al crear zona";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        return { success: false, error: "Error de conexión" };
      }
    },
    [API_BASE_URL, fetchZonas],
  );

  // Actualizar zona
  const updateZona = useCallback(
    async (id: number, zona: Partial<Zona>) => {
      try {
        const authToken = Cookies.get("auth_token");
        if (!authToken) {
          return { success: false, error: "No se ha iniciado sesión" };
        }

        const response = await fetch(`${API_BASE_URL}/zonas/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(zona),
        });

        const data = await response.json();

        if (data.success) {
          setZonas((prev) =>
            prev.map((z) =>
              z.id_zona === id ? ({ ...z, ...zona } as Zona) : z,
            ),
          );
          toast({
            title: "Éxito",
            description: "Zona actualizada exitosamente",
          });
          return { success: true, data: data.data };
        } else {
          const errorMessage = data.message || "Error al actualizar zona";
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
          return { success: false, error: data.message };
        }
      } catch (err) {
        const errorMessage = "Error de conexión al actualizar zona";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        return { success: false, error: "Error de conexión" };
      }
    },
    [API_BASE_URL],
  );

  // Eliminar zona
  const deleteZona = useCallback(
    async (id: number) => {
      try {
        const authToken = Cookies.get("auth_token");
        if (!authToken) {
          return { success: false, error: "No se ha iniciado sesión" };
        }

        const response = await fetch(`${API_BASE_URL}/zonas/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        const data = await response.json();

        if (data.success) {
          setZonas((prev) => prev.filter((z) => z.id_zona !== id));
          toast({
            title: "Éxito",
            description: "Zona eliminada exitosamente",
          });
          return { success: true };
        } else {
          const errorMessage = data.message || "Error al eliminar zona";
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
          return { success: false, error: data.message };
        }
      } catch (err) {
        const errorMessage = "Error de conexión al eliminar zona";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        return { success: false, error: "Error de conexión" };
      }
    },
    [API_BASE_URL],
  );

  // Obtener zona por ID
  const getZonaById = useCallback(
    async (id: number) => {
      try {
        const authToken = Cookies.get("auth_token");
        if (!authToken) {
          return { success: false, error: "No se ha iniciado sesión" };
        }

        const response = await fetch(`${API_BASE_URL}/zonas/${id}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        const data = await response.json();

        if (data.success) {
          return { success: true, data: data.data };
        } else {
          return { success: false, error: data.message };
        }
      } catch (err) {
        return { success: false, error: "Error de conexión" };
      }
    },
    [API_BASE_URL],
  );

  // Buscar zonas
  const searchZonas = useCallback(
    async (query: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const searchParams = new URLSearchParams();
        if (query.trim()) {
          searchParams.append("q", query.trim());
        }

        const authToken = Cookies.get("auth_token");
        if (!authToken) {
          throw new Error("No se ha iniciado sesión");
        }

        const response = await fetch(
          `${API_BASE_URL}/zonas/search?${searchParams}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        if (result.success) {
          setZonas(result.data || []);
        } else {
          throw new Error(result.message || "Error en la búsqueda");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error desconocido";
        setError(errorMessage);
        toast({
          title: "Error",
          description: "Error en la búsqueda de zonas",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [API_BASE_URL, toast],
  );

  // Buscar zonas por descripción
  const searchByDescripcion = useCallback(
    (descripcion: string) => {
      return zonas.filter((zona) =>
        zona.descripcion.toLowerCase().includes(descripcion.toLowerCase()),
      );
    },
    [zonas],
  );

  // Buscar zonas por código
  const searchByCodigo = useCallback(
    (codigo: string) => {
      return zonas.filter((zona) =>
        zona.codigo.toLowerCase().includes(codigo.toLowerCase()),
      );
    },
    [zonas],
  );

  // Cargar zonas automáticamente
  useEffect(() => {
    console.log("🚀 useZonas: useEffect ejecutándose");
    console.log("   Zonas actuales:", zonas.length);
    console.log("   IsLoading:", isLoading);
    console.log("   Error:", error);

    // Solo cargar si no hay zonas, no está cargando y no hay error
    if (zonas.length === 0 && !isLoading && !error) {
      console.log("🎯 useZonas: Condiciones cumplidas, iniciando carga...");
      fetchZonas();
    }
  }, []); // Dependencias vacías para que solo se ejecute al montar

  // Log cuando cambien las zonas
  useEffect(() => {
    if (zonas.length > 0) {
      console.log(`📋 useZonas: Estado actualizado con ${zonas.length} zonas`);
    }
  }, [zonas]);

  return {
    zonas,
    isLoading,
    error,
    fetchZonas,
    createZona,
    updateZona,
    deleteZona,
    getZonaById,
    searchZonas,
    searchByDescripcion,
    searchByCodigo,
    refetch: fetchZonas,
  };
};

export default useZonas;
