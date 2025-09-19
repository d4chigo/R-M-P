"use client";

import { useMemo } from "react";
import { useApi } from "./use-api";

export interface CumplimientoRow {
  Placa: string;
  Vehiculo: string;
  Docs_Vigentes: number | null;
  Docs_Vencidos: number | null;
  Dias_Prox_Venc: number | null;
  Ult_Mant_Fecha: string | null;
  Ult_Mant_Odo: number | null;
  Ult_Odo_Registrado: number | null;
  Intervalo_KM: number | null;
  Intervalo_Dias: number | null;
  Dias_desde_ult_mant: number | null;
  Km_desde_ult_mant: number | null;
  Km_para_prox_mant: number | null;
  Dias_para_prox_mant: number | null;
  Cumplimiento_Documentos_Pct?: number | null;
  En_Riesgo_Documentos?: boolean;
  Mantenimiento_Overdue_KM?: boolean | null;
  Mantenimiento_Overdue_Dias?: boolean | null;
  Cumplimiento_Mantenimiento_Pct?: number;
  Score_Cumplimiento?: number;
}

export interface CumplimientoDetalleDoc {
  tipo: string;
  numero: string | null;
  emision: string | null;
  vencimiento: string | null;
  proveedor: string | null;
  archivo_url: string | null;
  Dias_para_vencer: number | null;
  Estado: "VIGENTE" | "POR_VENCER" | "VENCIDO" | "SIN_FECHA";
}

export interface CumplimientoDetalleResponse {
  vehiculo: { id_vehiculo: number; placa: string; Vehiculo: string };
  documentos: CumplimientoDetalleDoc[];
  mantenimiento: {
    Ult_Mant_Fecha: string | null;
    Ult_Mant_Odo: number | null;
    Ult_Odo_Registrado: number | null;
    Intervalo_KM: number | null;
    Intervalo_Dias: number | null;
    Dias_desde_ult_mant: number | null;
    Km_desde_ult_mant: number | null;
    Km_para_prox_mant: number | null;
    Dias_para_prox_mant: number | null;
    Overdue_KM: boolean | null;
    Overdue_Dias: boolean | null;
  };
  umbralDias: number;
}

export const useCumplimientoVehiculo = () => {
  const api = useApi<CumplimientoRow>("/reportes/cumplimiento/vh");

  const list = async (params?: { placa?: string; umbralDias?: number }) => {
    const qs = new URLSearchParams();
    if (params?.placa) qs.set("placa", params.placa);
    if (params?.umbralDias != null) qs.set("umbralDias", String(params.umbralDias));
    const url = `/api/reportes/cumplimiento/vh${qs.toString() ? `?${qs.toString()}` : ""}`;
    return api.request<CumplimientoRow[]>(url);
  };

  return { ...api, list };
};

export const useCumplimientoDetalle = () => {
  const api = useApi<CumplimientoDetalleResponse>("/reportes/cumplimiento/vh");

  const getDetalle = async (
    placa: string,
    params?: { umbralDias?: number },
  ) => {
    const qs = new URLSearchParams();
    if (params?.umbralDias != null) qs.set("umbralDias", String(params.umbralDias));
    const url = `/api/reportes/cumplimiento/vh/${encodeURIComponent(placa)}/detalle${qs.toString() ? `?${qs.toString()}` : ""}`;
    return api.request<CumplimientoDetalleResponse>(url);
  };

  return { ...api, getDetalle };
};
