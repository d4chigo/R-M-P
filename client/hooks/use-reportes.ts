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
  Territorio: number;
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
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
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

  return {
    loading,
    error,
    getResumenRutas,
    getResumenRutasRango,
    getMetricasDiarias,
    getPerformanceVehiculos,
    getPerformanceRepartidores,
    getMetricasCumplimiento,
    getResumenRutasProcedimiento,
    getMetricasDiaProcedimiento,
  };
}
