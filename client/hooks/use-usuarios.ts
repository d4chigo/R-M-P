"use client";

import { useState, useCallback, useEffect } from "react";
import { useSimpleCrud } from "./use-simple-api";

export interface Usuario {
  id?: number;
  nombre: string;
  email: string;
  contrasena?: string;
  estado: string;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const crud = useSimpleCrud<Usuario>("/usuarios");

  // Cargar todos los usuarios
  const fetchUsuarios = useCallback(async () => {
    if (isLoading) return; // Prevenir múltiples llamadas simultáneas

    setIsLoading(true);
    setError(null);

    try {
      const response = await crud.getAll();
      if (response.success && response.data) {
        setUsuarios(response.data);
      } else {
        setError(response.error || "Error al cargar usuarios");
      }
    } catch (err) {
      setError("Error de conexión");
      console.error("Error fetching usuarios:", err);
    } finally {
      setIsLoading(false);
    }
  }, [crud.getAll, isLoading]);

  // Crear usuario
  const createUsuario = useCallback(
    async (usuario: Omit<Usuario, "id">) => {
      setError(null);

      try {
        const response = await crud.create(usuario);
        if (response.success) {
          // Agregar el nuevo usuario al estado sin recargar toda la lista
          if (response.data) {
            setUsuarios((prev) => [...prev, response.data as Usuario]);
          }
          return { success: true, data: response.data };
        } else {
          setError(response.error || "Error al crear usuario");
          return { success: false, error: response.error };
        }
      } catch (err) {
        const errorMessage = "Error de conexión al crear usuario";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [crud.create],
  );

  // Actualizar usuario
  const updateUsuario = useCallback(
    async (id: number, usuario: Partial<Usuario>) => {
      setError(null);

      try {
        const response = await crud.update(id, usuario);
        if (response.success) {
          // Actualizar solo el usuario modificado en el estado
          setUsuarios((prev) =>
            prev.map((u) => (u.id === id ? { ...u, ...usuario } : u)),
          );
          return { success: true, data: response.data };
        } else {
          setError(response.error || "Error al actualizar usuario");
          return { success: false, error: response.error };
        }
      } catch (err) {
        const errorMessage = "Error de conexión al actualizar usuario";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [crud.update],
  );

  // Eliminar usuario
  const deleteUsuario = useCallback(
    async (id: number) => {
      setError(null);

      try {
        const response = await crud.remove(id);
        if (response.success) {
          // Remover el usuario del estado sin recargar toda la lista
          setUsuarios((prev) => prev.filter((u) => u.id !== id));
          return { success: true };
        } else {
          setError(response.error || "Error al eliminar usuario");
          return { success: false, error: response.error };
        }
      } catch (err) {
        const errorMessage = "Error de conexión al eliminar usuario";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [crud.remove],
  );

  // Obtener usuario por ID
  const getUsuarioById = useCallback(
    async (id: number) => {
      setError(null);

      try {
        const response = await crud.getById(id);
        if (response.success) {
          return { success: true, data: response.data };
        } else {
          setError(response.error || "Error al obtener usuario");
          return { success: false, error: response.error };
        }
      } catch (err) {
        const errorMessage = "Error de conexión al obtener usuario";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [crud.getById],
  );

  // Cambiar estado del usuario (activar/desactivar)
  const toggleUsuarioEstado = useCallback(
    async (id: number, currentEstado: string) => {
      const newEstado = currentEstado === "1" ? "0" : "1";
      return await updateUsuario(id, { estado: newEstado });
    },
    [updateUsuario],
  );

  // Efecto para cargar usuarios al montar el componente
  useEffect(() => {
    let mounted = true;

    const loadUsuarios = async () => {
      if (usuarios.length === 0 && mounted && !isLoading) {
        await fetchUsuarios();
      }
    };

    loadUsuarios();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    usuarios,
    isLoading: isLoading || crud.loading,
    error: error || crud.error,
    fetchUsuarios,
    createUsuario,
    updateUsuario,
    deleteUsuario,
    getUsuarioById,
    toggleUsuarioEstado,
    refetch: fetchUsuarios,
  };
};

export default useUsuarios;
