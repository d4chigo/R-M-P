"use client";
import { useState } from "react";
import { useToast } from "./use-toast";
import Cookies from "js-cookie";

interface ResumenRuta {
  Fecha: string;
  Placa: string;
  Vehiculo: string;
  Repartidor: string;
  "Nro de viajes": number;
  Zona: number;
  Distancia: number;
  "Salida del CD": string;
  "Llegada al CD": string;
  Tiempo: string;
  "Nro de clientes": number;
  "Nro de pedidos": number;
  "Entrega (CF)": number;
  "Recojo (CF)": number;
  "Peso (Kg)": number;
}

interface MetricaDiaria {
  Fecha: string;
  Total_Vehiculos: number;
  Total_Viajes: number;
  Distancia_Promedio: number;
  Total_Clientes: number;
  Total_Pedidos: number;
  Total_Entrega_CF: number;
  Total_Recojo_CF: number;
  Total_Peso_Kg: number;
  Tiempo_Promedio_Min: number;
}

interface PerformanceVehiculo {
  Placa: string;
  Vehiculo: string;
  Dias_Trabajados: number;
  Promedio_Viajes_Dia: number;
  Distancia_Promedio: number;
  Clientes_Promedio: number;
  Total_Peso_Transportado: number;
  Total_Entrega_CF: number;
  Total_Recojo_CF: number;
}

// V2 views
interface PerformanceVehiculoV2 {
  Fecha: string; // YYYY-MM-DD
  Placa: string;
  Vehiculo: string;
  Nro_viajes: number;
  Km: number;
  Litros: number;
  Km_por_Litro: number;
  Costo_por_Km: number;
  Pedidos: number;
  PesoKg: number;
  Utilizacion_Prom: number;
  Min_Manejo: number;
  Min_Servicio: number;
  Min_Espera: number;
  Paradas_No_Plan: number;
  Incidencias: number;
  Costo_Incidencias: number;
}

interface PerformanceRepartidor {
  Repartidor: string;
  Dias_Trabajados: number;
  Vehiculos_Utilizados: number;
  Distancia_Promedio: number;
  Clientes_Promedio: number;
  Total_Entrega_CF: number;
  Total_Recojo_CF: number;
  Total_Peso_Transportado: number;
}

interface PerformanceRepartidorV2 {
  Fecha: string; // YYYY-MM-DD
  Repartidor: string;
  Nro_viajes: number;
  Km: number;
  Pedidos: number;
  Pedidos_Entregados: number;
  Tasa_Entrega: number;
  Visitas_Puntuales: number;
  Visitas: number;
  Puntualidad: number;
  Min_Totales: number;
  Pedidos_por_Hora: number;
}

// Cumplimiento por vehículo (vista v_cumplimiento_vehiculo)
interface CumplimientoVehiculo {
  Placa: string;
  Vehiculo: string;
  Docs_Vigentes: number;
  Docs_Vencidos: number;
  Dias_Prox_Venc: number | null;
  Ult_Mant_Fecha: string | null; // YYYY-MM-DD
  Ult_Mant_Odo: number | null;
  Ult_Odo_Registrado: number | null;
  Intervalo_KM: number | null;
  Intervalo_Dias: number | null;
  Dias_desde_ult_mant: number | null;
  Km_desde_ult_mant: number | null;
  Km_para_prox_mant: number | null;
  Dias_para_prox_mant: number | null;
}

interface MetricasCumplimiento {
  fecha: string;
  cumplimiento_vh: {
    meta: number;
    real: number;
    porcentaje: number;
  };
  utilizacion_flota: {
    meta: number;
    real: number;
    porcentaje: number;
  };
  distancia_promedio: {
    meta: number;
    real: number;
    porcentaje: number;
  };
  tiempo_mercado: {
    meta: number;
    real: number;
    porcentaje: number;
  };
  productividad_camion: number;
  eficiencia_ruta: number;
  resumen: any;
}

interface UseReportesReturn {
  loading: boolean;
  error: string | null;
  getResumenRutas: (fecha?: string) => Promise<ResumenRuta[]>;
  getResumenRutasRango: (
    fechaInicio: string,
    fechaFin: string,
  ) => Promise<ResumenRuta[]>;
  getResumenRutasPorViaje: (args?: {
    fecha?: string;
    fechaInicio?: string;
    fechaFin?: string;
    placa?: string;
    repartidor?: string;
  }) => Promise<any[]>;
  getMetricasDiarias: (fecha?: string) => Promise<MetricaDiaria[]>;
  getPerformanceVehiculos: (dias?: number) => Promise<PerformanceVehiculo[]>;
  getPerformanceRepartidores: (
    dias?: number,
  ) => Promise<PerformanceRepartidor[]>;
  getMetricasCumplimiento: (
    fecha?: string,
  ) => Promise<MetricasCumplimiento | null>;
  getResumenRutasProcedimiento: (fecha: string) => Promise<ResumenRuta[]>;
  getMetricasDiaProcedimiento: (fecha: string) => Promise<MetricaDiaria | null>;
  getPerformanceVehiculosV2: (args?: {
    fechaInicio?: string;
    fechaFin?: string;
    placa?: string;
  }) => Promise<PerformanceVehiculoV2[]>;
  getPerformanceRepartidoresV2: (args?: {
    fechaInicio?: string;
    fechaFin?: string;
    repartidor?: string;
  }) => Promise<PerformanceRepartidorV2[]>;
  getCumplimientoVehiculo: (placa?: string) => Promise<CumplimientoVehiculo[]>;
  // getCumplimientoVHVisitas removed (endpoint and view deleted)
  // Tesorería
  getTesoreriaPorCategoria: (args?: { fechaInicio?: string; fechaFin?: string; idCentro?: string; categoria?: string; persona?: string }) => Promise<any[]>;
  getTesoreriaPorPersona: (args?: { fechaInicio?: string; fechaFin?: string; idCentro?: string; persona?: string }) => Promise<any[]>;
  getTesoreriaPorVehiculo: (args?: { placa?: string; fechaInicio?: string; fechaFin?: string }) => Promise<any[]>;
  getTesoreriaPorCentro: (args?: { idCentro?: string; fechaInicio?: string; fechaFin?: string }) => Promise<any[]>;
  getTesoreriaTendenciaMensual: (args?: { meses?: number; fechaInicio?: string; fechaFin?: string; idCentro?: string; categoria?: string }) => Promise<any[]>;
  getTesoreriaSummary: (args?: { fechaInicio?: string; fechaFin?: string }) => Promise<any>;
  getTesoreriaDaily: (args?: { fechaInicio?: string; fechaFin?: string }) => Promise<any[]>;
}

export function useReportes(): UseReportesReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

  const getAuthHeader = () => {
    const token = Cookies.get("auth_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handleRequest = async <T>(
    url: string,
    successMessage?: string,
  ): Promise<T> => {
    setLoading(true);
    setError(null);
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      };

      // Debug: log request URL and headers (token omitted)
      try {
        console.log('[useReportes] GET', url);
      } catch {}

      const response = await fetch(url, {
        headers,
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      // Debug: log server result summary
      try {
        console.log('[useReportes] response', { url, ok: response.ok, status: response.status, success: result?.success, count: result?.count });
      } catch {}
      if (result.success) {
        if (successMessage) {
          toast({
            title: "Éxito",
            description: successMessage,
          });
        }
        return result.data;
      } else {
        throw new Error(result.message || "Error en la consulta");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getResumenRutas = async (fecha?: string): Promise<ResumenRuta[]> => {
    const params = new URLSearchParams();
    if (fecha) {
      params.append("fecha", fecha);
    }
    const url = `${API_BASE}/reportes/resumen-rutas${params.toString() ? `?${params}` : ""}`;
    return handleRequest<ResumenRuta[]>(url);
  };

  const getResumenRutasPorViaje = async (
    args?: {
      fecha?: string;
      fechaInicio?: string;
      fechaFin?: string;
      placa?: string;
      repartidor?: string;
    },
  ): Promise<any[]> => {
    const params = new URLSearchParams();
    if (args?.fecha) params.append("fecha", args.fecha);
    if (args?.fechaInicio) params.append("fechaInicio", args.fechaInicio);
    if (args?.fechaFin) params.append("fechaFin", args.fechaFin);
    if (args?.placa) params.append("placa", args.placa);
    if (args?.repartidor) params.append("repartidor", args.repartidor);
    const qs = params.toString();
    const url = `${API_BASE}/reportes/resumen-rutas/viajes${qs ? `?${qs}` : ""}`;
    return handleRequest<any[]>(url);
  };

  const getResumenRutasRango = async (
    fechaInicio: string,
    fechaFin: string,
  ): Promise<ResumenRuta[]> => {
    const params = new URLSearchParams({
      fechaInicio,
      fechaFin,
    });
    const url = `${API_BASE}/reportes/resumen-rutas/rango?${params}`;
    return handleRequest<ResumenRuta[]>(url);
  };

  const getMetricasDiarias = async (
    fecha?: string,
  ): Promise<MetricaDiaria[]> => {
    const params = new URLSearchParams();
    if (fecha) {
      params.append("fecha", fecha);
    }
    const url = `${API_BASE}/reportes/metricas-diarias${params.toString() ? `?${params}` : ""}`;
    return handleRequest<MetricaDiaria[]>(url);
  };

  const getPerformanceVehiculos = async (
    dias: number = 30,
  ): Promise<PerformanceVehiculo[]> => {
    const params = new URLSearchParams({
      dias: dias.toString(),
    });
    const url = `${API_BASE}/reportes/performance/vehiculos?${params}`;
    return handleRequest<PerformanceVehiculo[]>(url);
  };

  const getPerformanceRepartidores = async (
    dias: number = 30,
  ): Promise<PerformanceRepartidor[]> => {
    const params = new URLSearchParams({
      dias: dias.toString(),
    });
    const url = `${API_BASE}/reportes/performance/repartidores?${params}`;
    return handleRequest<PerformanceRepartidor[]>(url);
  };

  const getMetricasCumplimiento = async (
    fecha?: string,
  ): Promise<MetricasCumplimiento | null> => {
    const params = new URLSearchParams();
    if (fecha) {
      params.append("fecha", fecha);
    }
    const url = `${API_BASE}/reportes/cumplimiento${params.toString() ? `?${params}` : ""}`;
    try {
      return await handleRequest<MetricasCumplimiento>(url);
    } catch (err) {
      return null;
    }
  };

  const getResumenRutasProcedimiento = async (
    fecha: string,
  ): Promise<ResumenRuta[]> => {
    const url = `${API_BASE}/reportes/sp/resumen-rutas/${fecha}`;
    return handleRequest<ResumenRuta[]>(url);
  };

  const getMetricasDiaProcedimiento = async (
    fecha: string,
  ): Promise<MetricaDiaria | null> => {
    const url = `${API_BASE}/reportes/sp/metricas-dia/${fecha}`;
    try {
      return await handleRequest<MetricaDiaria>(url);
    } catch (err) {
      return null;
    }
  };

  // -------- V2 endpoints (direct views) --------
  const getPerformanceVehiculosV2 = async (
    args?: {
      fechaInicio?: string;
      fechaFin?: string;
      placa?: string;
    },
  ): Promise<PerformanceVehiculoV2[]> => {
    const params = new URLSearchParams();
    if (args?.fechaInicio) params.append("fechaInicio", args.fechaInicio);
    if (args?.fechaFin) params.append("fechaFin", args.fechaFin);
    if (args?.placa) params.append("placa", args.placa);
    const qs = params.toString();
    const url = `${API_BASE}/reportes/performance/vehiculos/v2${qs ? `?${qs}` : ""}`;
    return handleRequest<PerformanceVehiculoV2[]>(url);
  };

  const getPerformanceRepartidoresV2 = async (
    args?: {
      fechaInicio?: string;
      fechaFin?: string;
      repartidor?: string;
    },
  ): Promise<PerformanceRepartidorV2[]> => {
    const params = new URLSearchParams();
    if (args?.fechaInicio) params.append("fechaInicio", args.fechaInicio);
    if (args?.fechaFin) params.append("fechaFin", args.fechaFin);
    if (args?.repartidor) params.append("repartidor", args.repartidor);
    const qs = params.toString();
    const url = `${API_BASE}/reportes/performance/repartidores/v2${qs ? `?${qs}` : ""}`;
    return handleRequest<PerformanceRepartidorV2[]>(url);
  };

  // ------- Tesorería API calls -------
  const getTesoreriaPorCategoria = async (args?: { fechaInicio?: string; fechaFin?: string; idCentro?: string; categoria?: string; persona?: string }): Promise<any[]> => {
    const params = new URLSearchParams();
    if (args?.fechaInicio) params.append('fechaInicio', args.fechaInicio);
    if (args?.fechaFin) params.append('fechaFin', args.fechaFin);
    if (args?.idCentro) params.append('idCentro', args.idCentro);
    if (args?.persona) params.append('persona', args.persona);
    if (args?.categoria) params.append('categoria', args.categoria);
    const qs = params.toString();
    const url = `${API_BASE}/reportes/tesoreria/categoria${qs ? `?${qs}` : ''}`;
    return handleRequest<any[]>(url);
  };

  const getTesoreriaPorPersona = async (args?: { fechaInicio?: string; fechaFin?: string; idCentro?: string; persona?: string }): Promise<any[]> => {
    const params = new URLSearchParams();
    if (args?.fechaInicio) params.append('fechaInicio', args.fechaInicio);
    if (args?.fechaFin) params.append('fechaFin', args.fechaFin);
    if (args?.idCentro) params.append('idCentro', args.idCentro);
    if (args?.persona) params.append('persona', args.persona);
    const qs = params.toString();
    const url = `${API_BASE}/reportes/tesoreria/persona${qs ? `?${qs}` : ''}`;
    return handleRequest<any[]>(url);
  };

  const getTesoreriaPorVehiculo = async (args?: { placa?: string; fechaInicio?: string; fechaFin?: string }): Promise<any[]> => {
    const params = new URLSearchParams();
    if (args?.placa) params.append('placa', args.placa);
    if (args?.fechaInicio) params.append('fechaInicio', args.fechaInicio);
    if (args?.fechaFin) params.append('fechaFin', args.fechaFin);
    const url = `${API_BASE}/reportes/tesoreria/vehiculo${params.toString() ? `?${params}` : ''}`;
    return handleRequest<any[]>(url);
  };

  const getTesoreriaPorCentro = async (args?: { idCentro?: string; fechaInicio?: string; fechaFin?: string }): Promise<any[]> => {
    const params = new URLSearchParams();
    if (args?.idCentro) params.append('idCentro', args.idCentro);
    if (args?.fechaInicio) params.append('fechaInicio', args.fechaInicio);
    if (args?.fechaFin) params.append('fechaFin', args.fechaFin);
    const url = `${API_BASE}/reportes/tesoreria/centro${params.toString() ? `?${params}` : ''}`;
    return handleRequest<any[]>(url);
  };

  const getTesoreriaTendenciaMensual = async (args?: { meses?: number; fechaInicio?: string; fechaFin?: string; idCentro?: string; categoria?: string; persona?: string }): Promise<any[]> => {
    const params = new URLSearchParams();
    if (args?.meses) params.append('meses', String(args.meses));
    if (args?.fechaInicio) params.append('fechaInicio', args.fechaInicio);
    if (args?.fechaFin) params.append('fechaFin', args.fechaFin);
    if (args?.idCentro) params.append('idCentro', args.idCentro);
    if (args?.persona) params.append('persona', args.persona);
    if (args?.categoria) params.append('categoria', args.categoria);
    const url = `${API_BASE}/reportes/tesoreria/tendencia${params.toString() ? `?${params}` : ''}`;
    return handleRequest<any[]>(url);
  };

  const getTesoreriaSummary = async (args?: { fechaInicio?: string; fechaFin?: string }) : Promise<any> => {
    const params = new URLSearchParams();
    if (args?.fechaInicio) params.append('fechaInicio', args.fechaInicio);
    if (args?.fechaFin) params.append('fechaFin', args.fechaFin);
    const url = `${API_BASE}/reportes/tesoreria/summary${params.toString() ? `?${params}` : ''}`;
    return handleRequest<any>(url);
  };

  const getTesoreriaDaily = async (args?: { fechaInicio?: string; fechaFin?: string }) : Promise<any[]> => {
    const params = new URLSearchParams();
    if (args?.fechaInicio) params.append('fechaInicio', args.fechaInicio);
    if (args?.fechaFin) params.append('fechaFin', args.fechaFin);
    const url = `${API_BASE}/reportes/tesoreria/daily${params.toString() ? `?${params}` : ''}`;
    return handleRequest<any[]>(url);
  };

  const getCumplimientoVehiculo = async (
    placa?: string,
  ): Promise<CumplimientoVehiculo[]> => {
    const params = new URLSearchParams();
    if (placa) params.append("placa", placa);
    const qs = params.toString();
    const url = `${API_BASE}/reportes/cumplimiento/vh${qs ? `?${qs}` : ""}`;
    return handleRequest<CumplimientoVehiculo[]>(url);
  };

  // Cumplimiento VH visitas: removido (la vista y endpoint fueron eliminados)

  return {
    loading,
    error,
    getResumenRutas,
    getResumenRutasRango,
    getResumenRutasPorViaje,
    getMetricasDiarias,
    getPerformanceVehiculos,
    getPerformanceRepartidores,
    getMetricasCumplimiento,
    getResumenRutasProcedimiento,
    getMetricasDiaProcedimiento,
    // v2
    getPerformanceVehiculosV2,
    getPerformanceRepartidoresV2,
    getCumplimientoVehiculo,
    // getCumplimientoVHVisitas removed
    // Tesorería
    getTesoreriaPorCategoria,
    getTesoreriaPorPersona,
    getTesoreriaPorVehiculo,
    getTesoreriaPorCentro,
    getTesoreriaTendenciaMensual,
    getTesoreriaSummary,
    getTesoreriaDaily,
  };
}
