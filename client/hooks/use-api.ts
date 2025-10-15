"use client";

import { useState, useCallback } from "react";
import Cookies from "js-cookie";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface UseApiOptions {
  baseUrl?: string;
}

export const useApi = <T>(endpoint: string, options: UseApiOptions = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseUrl =
    options.baseUrl ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:4000/api";

  const getAuthHeaders = () => {
    const token = Cookies.get("auth_token");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  const handleRequest = useCallback(
    async <R = T>(
      url: string,
      options: RequestInit = {},
    ): Promise<ApiResponse<R>> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${baseUrl}${url}`, {
          ...options,
          headers: {
            ...getAuthHeaders(),
            ...options.headers,
          },
        });
        // Debug: log outgoing request bodies for tesoreria endpoints (temporary)
        try {
          const method = (options.method || 'GET').toUpperCase();
          if (String(url).includes('/tesoreria') && (method === 'PUT' || method === 'POST')) {
          }
        } catch (e) {}

        if (!response.ok) {
          if (response.status === 401) {
            // Token expirado o inválido
            Cookies.remove("auth_token");
            window.location.href = "/login";
            throw new Error("Sesión expirada");
          }
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return {
          success: true,
          data: data.data || data,
          message: data.message,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error desconocido";
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setLoading(false);
      }
    },
    [baseUrl],
  );

  // GET - Obtener todos los elementos
  const getAll = useCallback(async (): Promise<ApiResponse<T[]>> => {
    return handleRequest<T[]>(`/api${endpoint}`);
  }, [endpoint, handleRequest]);

  // GET - Obtener por ID
  const getById = useCallback(
    async (id: number): Promise<ApiResponse<T>> => {
      return handleRequest<T>(`/api${endpoint}/${id}`);
    },
    [endpoint, handleRequest],
  );

  // POST - Crear nuevo elemento
  const create = useCallback(
    async (data: Omit<T, "id">): Promise<ApiResponse<T>> => {
      return handleRequest<T>(`/api${endpoint}`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    [endpoint, handleRequest],
  );

  // PUT - Actualizar elemento
  const update = useCallback(
    async (id: number, data: Partial<T>): Promise<ApiResponse<T>> => {
      return handleRequest<T>(`/api${endpoint}/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    [endpoint, handleRequest],
  );

  // DELETE - Eliminar elemento
  const remove = useCallback(
    async (id: number): Promise<ApiResponse<boolean>> => {
      return handleRequest<boolean>(`/api${endpoint}/${id}`, {
        method: "DELETE",
      });
    },
    [endpoint, handleRequest],
  );

  // PATCH - Actualización parcial
  const patch = useCallback(
    async (id: number, data: Partial<T>): Promise<ApiResponse<T>> => {
      return handleRequest<T>(`/api${endpoint}/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    [endpoint, handleRequest],
  );

  return {
    loading,
    error,
    getAll,
    getById,
    create,
    update,
    remove,
    patch,
    request: handleRequest,
  };
};

export default useApi;
