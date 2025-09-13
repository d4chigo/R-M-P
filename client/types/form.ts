import type { ControllerRenderProps } from "react-hook-form";

export interface FormFieldRenderProps {
  field: ControllerRenderProps<any, any>;
}

export interface TesoreriaFormState {
  fecha: string;
  placa: string;
  nombre: string;
  id_centro?: number;
  cargo?: string;
  categoria: string;
  detalle?: string;
  reembolso?: "Si" | "No";
  distrito: string;
  turno: string;
  encargado: string;
  monto: number;
}