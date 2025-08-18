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
  roles_list?: string[];
  role_ids?: number[];
}

interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  userRoles: string[];
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
  hasRole: (role: string) => boolean;
  checkUsersExist: () => Promise<{ usersExist: boolean; totalUsers: number }>;
  requestPasswordReset: (
    email: string,
  ) => Promise<{ success: boolean; message?: string }>;
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

  // Obtener roles del usuario (ahora ya vienen como array)
  const userRoles = Array.isArray(usuario?.roles_list) ? usuario.roles_list : [];

  // Verificar si es administrador
  const isAdmin = userRoles.includes('ADMINISTRADOR');

  // Función para verificar si tiene un rol específico
  const hasRole = (role: string): boolean => {
    return userRoles.includes(role.toUpperCase());
  };

  // Función para hacer login
  const login = async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      console.log("AuthContext: Iniciando login para usuario:", email);
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

      console.log("AuthContext: Respuesta del servidor:", response.status);
      const data = await response.json();
      console.log("AuthContext: Datos recibidos:", {
        success: data.success,
        hasData: !!data.data,
        message: data.message
      });

      if (response.ok && data.success) {
        const { usuario: userData, token: userToken } = data.data;
        console.log("AuthContext: Datos del usuario:", {
          id: userData.id_usuario,
          email: userData.email,
          roles: userData.roles_list
        });

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
        console.log("AuthContext: Login fallido:", data.message);
        return {
          success: false,
          message: data.message || "Error en el login",
        };
      }
    } catch (error) {
      console.error("AuthContext: Error en login:", error);
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
      console.log("AuthContext: Verificando autenticación...");
      const savedToken = Cookies.get("auth_token");

      if (!savedToken) {
        console.log("AuthContext: No se encontró token guardado");
        setIsLoading(false);
        return false;
      }

      console.log("AuthContext: Token encontrado, verificando con el servidor...");
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${savedToken}`,
          "Content-Type": "application/json",
        },
      });

      console.log("AuthContext: Respuesta del servidor:", response.status);
      if (response.ok) {
        const data = await response.json();
        console.log("AuthContext: Datos recibidos:", {
          success: data.success,
          hasData: !!data.data,
          hasUser: !!data.data?.usuario
        });

        if (data.success && data.data && data.data.usuario) {
          // Obtener roles del usuario
          console.log("AuthContext: Obteniendo roles del usuario...");
          const userWithRoles = await getUserRoles(
            data.data.usuario,
            savedToken,
          );
          console.log("AuthContext: Roles obtenidos:", userWithRoles.roles_list);
          setUsuario(userWithRoles);
          setToken(savedToken);
          setIsLoading(false);
          return true;
        }
      }

      console.log("AuthContext: Token inválido o expirado");
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

  // Función para obtener roles del usuario
  const getUserRoles = async (userData: Usuario, authToken: string) => {
    try {
      console.log("AuthContext: Obteniendo roles para usuario:", userData.email);
      // Aquí podrías hacer una llamada adicional para obtener roles
      // Por ahora, asumimos que vienen en la respuesta de verificación
      console.log("AuthContext: Roles del usuario:", {
        rolesList: userData.roles_list,
        roleIds: userData.role_ids
      });
      return userData;
    } catch (error) {
      console.error("AuthContext: Error obteniendo roles:", error);
      return userData;
    }
  };

  // Función para verificar si existen usuarios en el sistema
  const checkUsersExist = async (): Promise<{
    usersExist: boolean;
    totalUsers: number;
  }> => {
    try {
      console.log("AuthContext: Verificando existencia de usuarios...");
      const response = await fetch(`${API_BASE_URL}/admin/check-users`);
      console.log("AuthContext: Respuesta del servidor:", response.status);
      const data = await response.json();
      console.log("AuthContext: Datos recibidos:", data);

      if (data.success) {
        console.log("AuthContext: Usuarios encontrados:", data.data);
        return {
          usersExist: data.data.usersExist,
          totalUsers: data.data.totalUsers,
        };
      }

      console.log("AuthContext: Sin éxito, retornando valores por defecto");
      return { usersExist: true, totalUsers: 0 };
    } catch (error) {
      console.error("Error verificando usuarios:", error);
      return { usersExist: true, totalUsers: 0 };
    }
  };

  // Función para solicitar restablecimiento de contraseña
  const requestPasswordReset = async (
    email: string,
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      return {
        success: data.success,
        message: data.message,
      };
    } catch (error) {
      console.error("Error solicitando restablecimiento:", error);
      return {
        success: false,
        message: "Error de conexión con el servidor",
      };
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
    isAdmin,
    userRoles,
    login,
    logout,
    checkAuth,
    hasRole,
    checkUsersExist,
    requestPasswordReset,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
