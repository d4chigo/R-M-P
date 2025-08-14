"use client";

import { useState, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Cookies from "js-cookie";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export const useSimpleCrud = <T = any>(resourceEndpoint: string) => {
  const { token, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

  const makeRequest = useCallback(
    async <R = any>(
      endpoint: string,
      method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
      body?: any,
    ): Promise<ApiResponse<R>> => {
      setLoading(true);
      setError(null);

      try {
        // Always get fresh token from cookies
        const authToken = Cookies.get("auth_token");

        if (!authToken) {
          console.warn("⚠️ No token available for request:", endpoint);
          return {
            success: false,
            error: "No se ha iniciado sesión",
          };
        }

        const requestHeaders: Record<string, string> = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        };

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method,
          headers: requestHeaders,
          body: body ? JSON.stringify(body) : undefined,
        });

        let data;
        try {
          data = await response.json();
        } catch {
          data = { success: false, error: "Error parsing response" };
        }

        if (!response.ok) {
          const errorMessage =
            data.message || data.error || `Error ${response.status}`;

          if (response.status === 401) {
            console.warn("🔐 Authentication required for:", endpoint);
            // Remove invalid token
            Cookies.remove("auth_token");
            // Reload page to trigger authentication check
            window.location.href = "/login";
          } else {
            console.error("❌ API Error:", {
              status: response.status,
              endpoint,
              error: errorMessage,
            });
          }

          setError(errorMessage);
          return {
            success: false,
            error: errorMessage,
          };
        }

        return data;
      } catch (err) {
        const errorMessage = "Error de conexión con el servidor";
        console.error("❌ Network Error for", endpoint, ":", err);
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setLoading(false);
      }
    },
    [API_BASE_URL, token],
  );

  const methods = useMemo(
    () => ({
      getAll: () => makeRequest<T[]>(resourceEndpoint),
      getById: (id: number | string) =>
        makeRequest<T>(`${resourceEndpoint}/${id}`),
      create: (data: Partial<T>) =>
        makeRequest<T>(resourceEndpoint, "POST", data),
      update: (id: number | string, data: Partial<T>) =>
        makeRequest<T>(`${resourceEndpoint}/${id}`, "PUT", data),
      remove: (id: number | string) =>
        makeRequest(`${resourceEndpoint}/${id}`, "DELETE"),
    }),
    [makeRequest, resourceEndpoint],
  );

  return useMemo(
    () => ({
      loading,
      error,
      ...methods,
    }),
    [loading, error, methods],
  );
};

export default useSimpleCrud;
