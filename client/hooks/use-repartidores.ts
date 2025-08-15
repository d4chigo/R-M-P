"use client";
import { useState, useEffect } from "react";
import { useToast } from "./use-toast";
import Cookies from "js-cookie";

interface Repartidor {
  id_repartidor: number;
  codigo: string;
  nombre: string;
  dni?: string;
  licencia_conducir?: string;
  telefono?: string;
  activo: number | boolean;
  created_at: string;
  updated_at: string;
}

interface CreateRepartidorData {
  codigo: string;
  nombre: string;
  dni?: string;
  licencia_conducir?: string;
  telefono?: string;
  activo?: boolean;
}

interface UpdateRepartidorData extends Partial<CreateRepartidorData> {}

interface UseRepartidoresReturn {
  repartidores: Repartidor[];
  loading: boolean;
  error: string | null;
  fetchRepartidores: () => Promise<void>;
  createRepartidor: (data: CreateRepartidorData) => Promise<boolean>;
  updateRepartidor: (
    id: number,
    data: UpdateRepartidorData,
  ) => Promise<boolean>;
  deleteRepartidor: (
    id: number,
  ) => Promise<{ success: boolean; type?: string; message?: string }>;
  searchRepartidores: (query: string) => Promise<void>;
  getRepartidorById: (id: number) => Promise<Repartidor | null>;
}

export function useRepartidores(): UseRepartidoresReturn {
  const [repartidores, setRepartidores] = useState<Repartidor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

  const getAuthHeader = (): Record<string, string> => {
    const token = Cookies.get("auth_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchRepartidores = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/repartidores`, {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.success) {
        setRepartidores(result.data || []);
      } else {
        throw new Error(result.message || "Error al obtener repartidores");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      console.error("Error fetching repartidores:", err);
      toast({
        title: "Error",
        description: "No se pudieron cargar los repartidores",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createRepartidor = async (
    data: CreateRepartidorData,
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/repartidores`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Error ${response.status}`);
      }

      if (result.success) {
        toast({
          title: "Éxito",
          description: "Repartidor creado exitosamente",
        });
        await fetchRepartidores(); // Recargar la lista
        return true;
      } else {
        throw new Error(result.message || "Error al crear repartidor");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateRepartidor = async (
    id: number,
    data: UpdateRepartidorData,
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/repartidores/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Error ${response.status}`);
      }

      if (result.success) {
        toast({
          title: "Éxito",
          description: "Repartidor actualizado exitosamente",
        });
        await fetchRepartidores(); // Recargar la lista
        return true;
      } else {
        throw new Error(result.message || "Error al actualizar repartidor");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteRepartidor = async (
    id: number,
  ): Promise<{ success: boolean; type?: string; message?: string }> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/repartidores/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Error ${response.status}`);
      }

      if (result.success) {
        const toastTitle =
          result.type === "soft_delete" ? "Repartidor Desactivado" : "Éxito";
        const toastVariant =
          result.type === "soft_delete" ? "default" : undefined;

        toast({
          title: toastTitle,
          description: result.message || "Operación completada exitosamente",
          variant: toastVariant,
        });
        await fetchRepartidores(); // Recargar la lista
        return { success: true, type: result.type, message: result.message };
      } else {
        throw new Error(result.message || "Error al eliminar repartidor");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const searchRepartidores = async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const searchParams = new URLSearchParams();
      if (query.trim()) {
        searchParams.append("q", query.trim());
      }

      const response = await fetch(
        `${API_BASE}/repartidores/search?${searchParams}`,
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
        setRepartidores(result.data || []);
      } else {
        throw new Error(result.message || "Error en la búsqueda");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      toast({
        title: "Error",
        description: "Error en la búsqueda de repartidores",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRepartidorById = async (id: number): Promise<Repartidor | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/repartidores/${id}`, {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || "Error al obtener repartidor");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      toast({
        title: "Error",
        description: "No se pudo obtener el repartidor",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Cargar repartidores al montar el componente
  useEffect(() => {
    fetchRepartidores();
  }, []);

  return {
    repartidores,
    loading,
    error,
    fetchRepartidores,
    createRepartidor,
    updateRepartidor,
    deleteRepartidor,
    searchRepartidores,
    getRepartidorById,
  };
}
