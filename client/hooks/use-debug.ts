"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export const useDebug = () => {
  const { usuario, token, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    console.log("🔍 DEBUG - Estado de autenticación:", {
      isAuthenticated,
      isLoading,
      hasToken: !!token,
      hasUsuario: !!usuario,
      usuario: usuario
        ? {
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
          }
        : null,
      tokenLength: token ? token.length : 0,
      tokenPreview: token ? `${token.substring(0, 20)}...` : null,
    });
  }, [isAuthenticated, isLoading, token, usuario]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.warn("⚠️ Usuario no autenticado - redirigir a login");
    }
  }, [isAuthenticated, isLoading]);

  return {
    isAuthenticated,
    isLoading,
    usuario,
    token,
    debug: {
      hasToken: !!token,
      hasUsuario: !!usuario,
      tokenLength: token ? token.length : 0,
    },
  };
};

export default useDebug;
