"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface UseApiOptions {
  showToast?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export const useApi = () => {
  const { token, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

  const makeRequest = useCallback(
    async <T = any>(
      endpoint: string,
      options: {
        method?: "GET" | "POST" | "PUT" | "DELETE";
        body?: any;
        headers?: Record<string, string>;
      } = {},
      apiOptions: UseApiOptions = {},
    ): Promise<ApiResponse<T>> => {
      const { method = "GET", body, headers = {} } = options;
      const { onSuccess, onError } = apiOptions;

      setLoading(true);
      setError(null);

      try {
        const requestHeaders: Record<string, string> = {
          "Content-Type": "application/json",
          ...headers,
        };

        // Agregar token de autenticación si existe
        if (token) {
          requestHeaders.Authorization = `Bearer ${token}`;
        }

        const requestConfig: RequestInit = {
          method,
          headers: requestHeaders,
        };

        // Agregar body solo si no es GET
        if (body && method !== "GET") {
          requestConfig.body = JSON.stringify(body);
        }

        console.log(`🚀 API Request: ${method} ${API_BASE_URL}${endpoint}`, {
          headers: requestHeaders,
          body: body && method !== "GET" ? body : null,
        });

        const response = await fetch(
          `${API_BASE_URL}${endpoint}`,
          requestConfig,
        );

        console.log(
          `📡 API Response: ${response.status} ${response.statusText}`,
          {
            url: `${API_BASE_URL}${endpoint}`,
            ok: response.ok,
          },
        );

        // Si el token es inválido o expiró, hacer logout
        if (response.status === 401) {
          console.warn("🔒 Token inválido o expirado, cerrando sesión");
          logout();
          return {
            success: false,
            error: "Sesión expirada. Por favor, inicia sesión nuevamente.",
          };
        }

        let data: ApiResponse<T>;
        try {
          data = await response.json();
        } catch (jsonError) {
          console.error("❌ Error parsing JSON response:", jsonError);
          const errorMessage = `Error de formato en respuesta del servidor (${response.status})`;
          setError(errorMessage);
          if (onError) onError(errorMessage);
          return {
            success: false,
            error: errorMessage,
          };
        }

        if (!response.ok) {
          const errorMessage =
            data.message || data.error || `Error ${response.status}`;
          console.error(`❌ API Error (${response.status}):`, {
            url: `${API_BASE_URL}${endpoint}`,
            error: errorMessage,
            data,
          });
          setError(errorMessage);
          if (onError) onError(errorMessage);
          return {
            success: false,
            error: errorMessage,
          };
        }

        console.log("✅ API Success:", data);

        if (onSuccess && data.data) {
          onSuccess(data.data);
        }

        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Error de conexión con el servidor";
        console.error("❌ Network Error:", {
          url: `${API_BASE_URL}${endpoint}`,
          error: err,
          message: errorMessage,
        });
        setError(errorMessage);
        if (onError) onError(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setLoading(false);
      }
    },
    [token, logout, API_BASE_URL],
  );

  // Métodos específicos para cada tipo de petición
  const get = useCallback(
    <T = any>(endpoint: string, options?: UseApiOptions) => {
      return makeRequest<T>(endpoint, { method: "GET" }, options);
    },
    [makeRequest],
  );

  const post = useCallback(
    <T = any>(endpoint: string, body: any, options?: UseApiOptions) => {
      return makeRequest<T>(endpoint, { method: "POST", body }, options);
    },
    [makeRequest],
  );

  const put = useCallback(
    <T = any>(endpoint: string, body: any, options?: UseApiOptions) => {
      return makeRequest<T>(endpoint, { method: "PUT", body }, options);
    },
    [makeRequest],
  );

  const del = useCallback(
    <T = any>(endpoint: string, options?: UseApiOptions) => {
      return makeRequest<T>(endpoint, { method: "DELETE" }, options);
    },
    [makeRequest],
  );

  return {
    loading,
    error,
    get,
    post,
    put,
    delete: del,
    makeRequest,
  };
};

// Hook para CRUD genérico
export const useCrud = <T = any>(resourceEndpoint: string) => {
  const api = useApi();

  const getAll = useCallback(
    (options?: UseApiOptions) => {
      return api.get<T[]>(resourceEndpoint, options);
    },
    [api, resourceEndpoint],
  );

  const getById = useCallback(
    (id: number | string, options?: UseApiOptions) => {
      return api.get<T>(`${resourceEndpoint}/${id}`, options);
    },
    [api, resourceEndpoint],
  );

  const create = useCallback(
    (data: Partial<T>, options?: UseApiOptions) => {
      return api.post<T>(resourceEndpoint, data, options);
    },
    [api, resourceEndpoint],
  );

  const update = useCallback(
    (id: number | string, data: Partial<T>, options?: UseApiOptions) => {
      return api.put<T>(`${resourceEndpoint}/${id}`, data, options);
    },
    [api, resourceEndpoint],
  );

  const remove = useCallback(
    (id: number | string, options?: UseApiOptions) => {
      return api.delete(`${resourceEndpoint}/${id}`, options);
    },
    [api, resourceEndpoint],
  );

  return {
    loading: api.loading,
    error: api.error,
    getAll,
    getById,
    create,
    update,
    remove,
  };
};

export default useApi;
