"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

// Tipos actualizados para la nueva estructura
interface Usuario {
  id_usuario: number;
  username: string;
  nombre_completo: string;
  email: string;
  telefono?: string;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

// Crear contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};

// Provider del contexto
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

  // Verificar si está autenticado
  const isAuthenticated = !!usuario && !!token;

  // Función para hacer login
  const login = async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true);

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const { usuario: userData, token: userToken } = data.data;

        // Guardar en estado
        setUsuario(userData);
        setToken(userToken);

        // Guardar token en cookies (expira en 24 horas)
        Cookies.set("auth_token", userToken, {
          expires: 1, // 1 día
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });

        return { success: true };
      } else {
        return {
          success: false,
          message: data.message || "Error en el login",
        };
      }
    } catch (error) {
      console.error("Error en login:", error);
      return {
        success: false,
        message: "Error de conexión con el servidor",
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Función para hacer logout
  const logout = () => {
    setUsuario(null);
    setToken(null);
    Cookies.remove("auth_token");
    router.push("/login");
  };

  // Función para verificar autenticación
  const checkAuth = async (): Promise<boolean> => {
    try {
      const savedToken = Cookies.get("auth_token");

      if (!savedToken) {
        setIsLoading(false);
        return false;
      }

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${savedToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();

        if (data.success && data.data && data.data.usuario) {
          setUsuario(data.data.usuario);
          setToken(savedToken);
          setIsLoading(false);
          return true;
        }
      }

      // Si llegamos aquí, el token no es válido
      Cookies.remove("auth_token");
      setUsuario(null);
      setToken(null);
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error("Error verificando autenticación:", error);
      Cookies.remove("auth_token");
      setUsuario(null);
      setToken(null);
      setIsLoading(false);
      return false;
    }
  };

  // Verificar autenticación al cargar
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      if (mounted) {
        await checkAuth();
      }
    };

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const value: AuthContextType = {
    usuario,
    token,
    isLoading,
    isAuthenticated,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
