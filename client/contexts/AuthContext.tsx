"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import SessionTimeoutDialog from "@/components/SessionTimeoutDialog";

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
  must_change_password?: boolean;
}

interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  userRoles: string[];
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string; must_change_password?: boolean; attemptsLeft?: number | null; lockedUntil?: string | null }>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
  hasRole: (role: string) => boolean;
  checkUsersExist: () => Promise<{ usersExist: boolean; totalUsers: number }>;
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

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

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
  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string; must_change_password?: boolean; attemptsLeft?: number | null; lockedUntil?: string | null }> => {
    try {
      setIsLoading(true);

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const { usuario: userData, token: userToken } = data.data;

        // Guardar en estado
        setUsuario(userData);
        setToken(userToken);

        // Guardar token en cookies (expira en 24 horas)
        Cookies.set("auth_token", userToken, { expires: 1, secure: process.env.NODE_ENV === "production", sameSite: "strict" });

        // Dispatch user-activity to reset session timers
        window.dispatchEvent(new Event('user-activity'));

        return { success: true, must_change_password: !!userData.must_change_password };
      } else {
        // If backend provides attemptsLeft and lockedUntil, propagate them to the caller
        const attemptsLeft = data.attemptsLeft ?? (data.data && data.data.attemptsLeft) ?? null;
        const lockedUntil = data.lockedUntil ?? (data.data && data.data.lockedUntil) ?? null;
        return { success: false, message: data.message || 'Error en el login', attemptsLeft, lockedUntil };
      }
    } catch (error) {
      console.error("AuthContext: Error en login:", error);
      return { success: false, message: "Error de conexión con el servidor" };
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

  // Función usada por el diálogo de timeout forzado
  const handleForcedLogout = () => {
    logout();
  };

  // Función para verificar autenticación
  const checkAuth = async (): Promise<boolean> => {
    try {
      const savedToken = Cookies.get("auth_token");
      if (!savedToken) { setIsLoading(false); return false; }

      const response = await fetch(`${API_BASE_URL}/auth/me`, { method: 'GET', headers: { Authorization: `Bearer ${savedToken}`, 'Content-Type': 'application/json' } });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data && data.data.usuario) {
          const userWithRoles = data.data.usuario;
          setUsuario(userWithRoles);
          setToken(savedToken);
          setIsLoading(false);
          return true;
        }
      }

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

  // Función para obtener roles del usuario (placeholder)
  const getUserRoles = async (userData: Usuario, authToken: string) => {
    return userData;
  };

  // Función para verificar si existen usuarios en el sistema
  const checkUsersExist = async (): Promise<{ usersExist: boolean; totalUsers: number }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/check-users`);
      const data = await response.json();
      if (data.success) return { usersExist: data.data.usersExist, totalUsers: data.data.totalUsers };
      return { usersExist: true, totalUsers: 0 };
    } catch (error) {
      return { usersExist: true, totalUsers: 0 };
    }
  };

  // Verificar autenticación al cargar
  useEffect(() => { let mounted = true; const initAuth = async () => { if (mounted) await checkAuth(); }; initAuth(); return () => { mounted = false; }; }, []);

  // Manejo de actividad del usuario para timer de sesión
  useEffect(() => {
    const handleActivity = () => window.dispatchEvent(new Event('user-activity'));
    const events = ['mousemove','keydown','mousedown','touchstart','scroll'];
    events.forEach(e => window.addEventListener(e, handleActivity));
    return () => events.forEach(e => window.removeEventListener(e, handleActivity));
  }, []);

  const value: AuthContextType = { usuario, token, isLoading, isAuthenticated, isAdmin, userRoles, login, logout, checkAuth, hasRole, checkUsersExist };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <SessionTimeoutDialog timeoutMs={60 * 60 * 1000} warningMs={10 * 1000} onLogout={handleForcedLogout} />
    </AuthContext.Provider>
  );
};
