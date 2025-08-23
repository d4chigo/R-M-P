import { useState, useEffect } from 'react';
import { useApi } from './use-api';

export interface Tesoreria {
  id: number;
  fecha: string; // YYYY-MM-DD
  placa?: string | null;
  nombre: string;
  cargo?: string | null;
  categoria: string;
  detalle?: string | null;
  reembolso?: string | null;
  distrito?: string | null;
  turno?: number | null; // 0/1 or any small int per backend
  encargado?: string | null;
  monto: number;
  created_at: string;
  updated_at: string;
}

export interface TesoreriaFormData {
  fecha: string;
  placa?: string | null;
  nombre: string;
  cargo?: string | null;
  categoria: string;
  detalle?: string | null;
  reembolso?: string | null;
  distrito?: string | null;
  turno?: number | null;
  encargado?: string | null;
  monto: number;
}

export interface SearchParams {
  q?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  categoria?: string;
  reembolso?: string;
  turno?: number;
  distrito?: string;
  encargado?: string;
}

export const useTesoreria = () => {
  const [tesoreria, setTesoreria] = useState<Tesoreria[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // useApi baseUrl already points to http://.../api, so pass resource paths without the /api prefix
  const { request } = useApi<any>("");

  // Obtener todos los registros
  const fetchTesoreria = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await request('/tesoreria');
      if (response.success) {
        setTesoreria(response.data);
      } else {
        setError(response.message || 'Error al obtener registros de tesorería');
      }
    } catch (err) {
      setError('Error de conexión al obtener registros de tesorería');
      console.error('Error fetching tesoreria:', err);
    } finally {
      setLoading(false);
    }
  };

  // Obtener un registro por ID
  const fetchTesoreriaById = async (id: number): Promise<Tesoreria | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await request(`/tesoreria/${id}`);
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || 'Error al obtener el registro');
        return null;
      }
    } catch (err) {
      setError('Error de conexión al obtener el registro');
      console.error('Error fetching tesoreria by id:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Crear nuevo registro
  const createTesoreria = async (data: TesoreriaFormData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await request('/tesoreria', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (response.success) {
        await fetchTesoreria(); // Recargar la lista
        return true;
      } else {
        setError(response.message || 'Error al crear el registro');
        return false;
      }
    } catch (err) {
      setError('Error de conexión al crear el registro');
      console.error('Error creating tesoreria:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar registro
  const updateTesoreria = async (id: number, data: Partial<TesoreriaFormData>): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await request(`/tesoreria/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (response.success) {
        await fetchTesoreria(); // Recargar la lista
        return true;
      } else {
        setError(response.message || 'Error al actualizar el registro');
        return false;
      }
    } catch (err) {
      setError('Error de conexión al actualizar el registro');
      console.error('Error updating tesoreria:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar registro
  const deleteTesoreria = async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await request(`/tesoreria/${id}`, {
        method: 'DELETE',
      });
      if (response.success) {
        await fetchTesoreria(); // Recargar la lista
        return true;
      } else {
        setError(response.message || 'Error al eliminar el registro');
        return false;
      }
    } catch (err) {
      setError('Error de conexión al eliminar el registro');
      console.error('Error deleting tesoreria:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Buscar registros
  const searchTesoreria = async (params: SearchParams): Promise<Tesoreria[]> => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const response = await request(`/tesoreria/search?${queryParams.toString()}`);
      if (response.success) {
        setTesoreria(response.data);
        return response.data;
      } else {
        setError(response.message || 'Error en la búsqueda');
        return [];
      }
    } catch (err) {
      setError('Error de conexión en la búsqueda');
      console.error('Error searching tesoreria:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchTesoreria();
  }, []);

  return {
    tesoreria,
    loading,
    error,
    fetchTesoreria,
    fetchTesoreriaById,
    createTesoreria,
    updateTesoreria,
    deleteTesoreria,
    searchTesoreria,
  };
}; 