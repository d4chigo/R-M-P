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
  deleted_at?: string | null;
  // Optional audit display names returned by the backend for admins
  created_by_nombre?: string | null;
  updated_by_nombre?: string | null;
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
  scope?: 'active' | 'history' | 'trash';
  fecha?: string; // soporte para filtrar por un día puntual
}

export const useTesoreria = () => {
  const [tesoreria, setTesoreria] = useState<Tesoreria[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // useApi baseUrl already points to http://.../api, so pass resource paths without the /api prefix
  const { request } = useApi<any>("");

  // Obtener registros por scope y filtros opcionales
  const fetchTesoreria = async (params?: Partial<SearchParams>) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            queryParams.append(key, String(value));
          }
        });
      }
      const qp = queryParams.toString();
      const response = await request(`/tesoreria${qp ? `?${qp}` : ''}`);
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

  // Helpers para scopes
  const fetchActive = async () => {
    // Asumimos que backend aplica scope=active (hoy) si se envía scope
    return fetchTesoreria({ scope: 'active' });
  };

  const fetchHistory = async (opts?: { fecha?: string; fecha_inicio?: string; fecha_fin?: string }) => {
    return fetchTesoreria({ scope: 'history', ...opts });
  };

  const fetchTrash = async () => {
    return fetchTesoreria({ scope: 'trash' });
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
  // Notificar otros componentes (p. ej. SaldoCard) que el saldo puede haber cambiado
  try { window.dispatchEvent(new Event('tesoreria:saldo-changed')); } catch(e) {}
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

  // Obtener saldo actual de la tarjeta
  const fetchSaldoActual = async (): Promise<number> => {
    try {
      const response = await request('/tesoreria/saldo/actual');
      if (response && response.success) {
        return parseFloat(response.data?.saldo || 0);
      }
      return 0;
    } catch (err) {
      console.error('Error fetching saldo actual:', err);
      return 0;
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
  try { window.dispatchEvent(new Event('tesoreria:saldo-changed')); } catch(e) {}
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

  // Eliminar registro (Soft delete en backend)
  const deleteTesoreria = async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await request(`/tesoreria/${id}`, {
        method: 'DELETE',
      });
      if (response.success) {
        // No conocemos el scope actual desde aquí, pero recargar activos por defecto ayuda a mantener en sincronía
  await fetchActive();
  try { window.dispatchEvent(new Event('tesoreria:saldo-changed')); } catch(e) {}
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

  // Restaurar un registro desde la papelera
  const restoreTesoreria = async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await request(`/tesoreria/${id}/restore`, {
        method: 'POST',
      });
      if (response.success) {
        await fetchTrash();
  try { window.dispatchEvent(new Event('tesoreria:saldo-changed')); } catch(e) {}
        return true;
      } else {
        setError(response.message || 'Error al restaurar el registro');
        return false;
      }
    } catch (err) {
      setError('Error de conexión al restaurar el registro');
      console.error('Error restoring tesoreria:', err);
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
    // Por defecto, cargar "Hoy" (scope=active)
    fetchActive();
  }, []);

  return {
    tesoreria,
    loading,
    error,
    fetchTesoreria,
    fetchActive,
    fetchHistory,
    fetchTrash,
    fetchTesoreriaById,
    createTesoreria,
    updateTesoreria,
    deleteTesoreria,
    restoreTesoreria,
    searchTesoreria,
  };
};