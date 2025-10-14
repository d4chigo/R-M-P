"use client";

import type { ReactNode, FormEvent } from "react";
import { useState, useEffect } from "react";
import Cookies from 'js-cookie';
import { useForm } from "react-hook-form";
import { getAPIBase } from "@/lib/api-config";
import type { TesoreriaVehiculo, TesoreriaRepartidor } from "@/hooks/use-tesoreria";
import { Combobox } from "@/components/ui/combobox";
import { zodResolver } from "@hookform/resolvers/zod";

import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, DollarSign, FileText, Calendar } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Tesoreria, TesoreriaFormData } from "@/hooks/use-tesoreria";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getTodayLimaYMD, formatDateForPeru, peruDateToYMD } from "@/lib/utils/date-lima";

interface FormRenderProps {
  field: {
    value: string | number;
    onChange: (value: string | number) => void;
    onBlur: () => void;
    name: string;
  }
}

const tesoreriaSchema = z.object({
  fecha: z.string().min(1, "La fecha es requerida"),
  placa: z.string().optional(), // PLACA T2: texto libre, puede ser CD, placa, etc. Ahora opcional
  nombre: z.string().min(1, "El nombre es requerido"),
  id_centro: z.preprocess((val) => {
    // preserve the key and normalize empty strings to null so downstream code
    // can detect explicit clearing intent
    if (val === undefined) return null;
    if (val === '') return null;
    if (typeof val === 'string') {
      const n = Number(val);
      return isNaN(n) ? null : n;
    }
    return val;
  }, z.number().nullable()),
  cargo: z.string().optional(), // Opcional
  categoria: z.string().min(1, "La categoría es requerida"),
  detalle: z.string().optional(),
  reembolso: z.enum(["Si", "No"]).optional(), // Opcional
  distrito: z.string().min(1, "El distrito es requerido"),
  turno: z.string().min(1, "El turno es requerido"),
  encargado: z.string().min(1, "El encargado es requerido"),
  // Monto: keep as number in the schema to avoid runtime transform issues.
  // We validate positivity in the submit handler to provide clear UX and
  // avoid zod runtime errors with chained transforms in the current bundle.
  monto: z.number(),
});

interface TesoreriaFormProps {
  tesoreria?: Tesoreria;
  onSubmit: (data: TesoreriaFormData) => Promise<boolean>;
  onCancel: () => void;
  loading?: boolean;
}

const categorias = [
  "Combustible",
  "Mantenimiento",
  "Salarios",
  "Peajes",
  "Viáticos",
  "Seguros",
  "Licencias",
  "Impuestos",
  "Servicios",
  "Ventas",
  "Adelantos",
  "Comisiones",
  "Otros",
];

const cargos = [
  "Liquidador",
  "Conductor",
  "Asistente",
  "Auxiliar",
  "Supervisor",
];

const reembolsos = ["Si", "No"];

const turnos = [
  { value: 1, label: "1 - Mañana" },
  { value: 2, label: "2 - Tarde" },
  { value: 3, label: "3 - Noche" },
];

const subcategorias = {
  Combustible: ["Gasolina", "Diesel", "Gas Natural"],
  Mantenimiento: ["Aceite", "Frenos", "Neumáticos", "Reparaciones"],
  Salarios: ["Conductores", "Personal Administrativo", "Bonificaciones"],
  Peajes: ["Autopistas", "Puentes", "Túneles"],
  Seguros: ["Vehículos", "Personal", "Carga"],
  Licencias: ["Municipales", "Provinciales", "Nacionales"],
  Impuestos: ["IGV", "Renta", "Municipales"],
  Servicios: ["Luz", "Agua", "Internet", "Teléfono"],
  Ventas: ["Productos", "Servicios", "Comisiones"],
  Comisiones: ["Ventas", "Servicios", "Referidos"],
  Otros: ["Gastos Varios", "Emergencias", "Donaciones"],
};

export function TesoreriaForm({ tesoreria, onSubmit, onCancel, loading }: TesoreriaFormProps) {
  const { isAdmin } = useAuth();
  
  // Formateador de números con 2 decimales sin símbolo (mostramos prefijo S/ aparte)
  const formatNumberPretty = (n: number) =>
    new Intl.NumberFormat("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
      isNaN(n) ? 0 : n
    );
  const [selectedCategoria, setSelectedCategoria] = useState<string>(
    tesoreria?.categoria || ""
  );
  const [showConfirm, setShowConfirm] = useState(false);
  const [centros, setCentros] = useState<Array<{
    id: string;
    codigo: string;
    nombre: string;
    ciudad?: string;
    id_centro: number;
  }>>([]);
  
  interface FieldRenderProps {
    field: {
      value: any;
      onChange: (value: any) => void;
      name: string;
    };
  }
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const API_BASE = getAPIBase();
        const token = Cookies.get('auth_token');
        if (!token) {
          setCentros([]);
          return;
        }
        const res = await fetch(`${API_BASE}/centros-distribucion`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        const json = await res.json();
        if (mounted && json && json.success) setCentros(json.data || []);
      } catch (err) {
        // ignore
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  // Hooks para datos de dropdowns
  const [vehiculos, setVehiculos] = useState<TesoreriaVehiculo[]>([]);
  const [repartidores, setRepartidores] = useState<TesoreriaRepartidor[]>([]);
  const [loadingVehiculos, setLoadingVehiculos] = useState(true);
  const [loadingRepartidores, setLoadingRepartidores] = useState(true);

  // Type for ComboBox field props
  interface ComboBoxFieldProps {
    field: {
      value: string;
      onChange: (value: string) => void;
      name: string;
    };
  }

  // Fetch vehicle and employee data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const API_BASE = getAPIBase();
        const token = Cookies.get('auth_token');

        // Fetch vehicles
        setLoadingVehiculos(true);
        const resVehiculos = await fetch(`${API_BASE}/tesoreria/dropdown/vehiculos`, {
          headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' }
        });
        const jsonVehiculos = await resVehiculos.json();
        if (jsonVehiculos.success) {
          setVehiculos(jsonVehiculos.data);
        }
        setLoadingVehiculos(false);

        // Fetch employees
        setLoadingRepartidores(true);
        const resRepartidores = await fetch(`${API_BASE}/tesoreria/dropdown/repartidores`, {
          headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' }
        });
        const jsonRepartidores = await resRepartidores.json();
        if (jsonRepartidores.success) {
          setRepartidores(jsonRepartidores.data);
        }
        setLoadingRepartidores(false);
      } catch (err) {
        console.error('Error fetching dropdown data:', err);
        setLoadingVehiculos(false);
        setLoadingRepartidores(false);
      }
    };

    fetchData();
  }, []);

  // Using any here to avoid strict generic resolver/control mismatches
  // between react-hook-form generics and our Form wrapper types.
  // We still validate with zodResolver at runtime.
  const form = useForm<any>({
    resolver: zodResolver(tesoreriaSchema),
    defaultValues: {
  fecha: (function () {
    const f = tesoreria?.fecha;
    if (!f) return getTodayLimaYMD();
    if (/^\d{4}-\d{2}-\d{2}$/.test(f)) return f; // already YYYY-MM-DD
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(f)) return peruDateToYMD(f); // convert DD/MM/YYYY
    // fallback: try to parse ISO-ish and extract YYYY-MM-DD
    try {
      return new Date(f).toISOString().split('T')[0];
    } catch (e) {
      return getTodayLimaYMD();
    }
  })(),
  placa: tesoreria?.placa || "",
      nombre: tesoreria?.nombre || "",
      cargo: tesoreria?.cargo || "",
      categoria: tesoreria?.categoria || "",
      detalle: tesoreria?.detalle || "",
  reembolso: (tesoreria && (tesoreria.reembolso === 'Si' || tesoreria.reembolso === 'No')) ? tesoreria.reembolso : undefined,
  distrito: tesoreria?.distrito || "",
  turno: tesoreria?.turno ? String(tesoreria.turno) : "",
  encargado: tesoreria?.encargado || "",
      // Prefer centro id from record (id_centro) but also accept centro_id for older records
      id_centro: (tesoreria?.id_centro ?? (tesoreria as any)?.centro_id) ?? null,
      monto: tesoreria?.monto || 0,
    },
  });
  // Estado visual del monto (sin símbolo, ya que mostramos prefijo S/)
  const [montoInput, setMontoInput] = useState<string>(
    formatNumberPretty(tesoreria?.monto ?? 0)
  );
  useEffect(() => {
    setMontoInput(formatNumberPretty(form.getValues("monto") || 0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tesoreria?.monto]);

  // Cuando la prop `tesoreria` cambia (abrir modal editar), resetear el formulario
  useEffect(() => {
    if (!tesoreria) return;
    const normalizeFecha = (f: any) => {
      if (!f) return getTodayLimaYMD();
      if (/^\d{4}-\d{2}-\d{2}$/.test(f)) return f;
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(f)) return peruDateToYMD(f);
      try { return new Date(f).toISOString().split('T')[0]; } catch { return getTodayLimaYMD(); }
    };

      const vals: any = {
      fecha: normalizeFecha(tesoreria.fecha),
      placa: tesoreria.placa || "",
      nombre: tesoreria.nombre || "",
      cargo: tesoreria.cargo || "",
      categoria: tesoreria.categoria || "",
      detalle: tesoreria.detalle || "",
      reembolso: tesoreria.reembolso || undefined,
      distrito: tesoreria.distrito || "",
      turno: tesoreria.turno ? String(tesoreria.turno) : "",
      encargado: tesoreria.encargado || "",
        id_centro: tesoreria.id_centro ?? null,
      monto: tesoreria.monto || 0,
    };

    form.reset(vals);
    setMontoInput(formatNumberPretty(vals.monto || 0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tesoreria]);

  const handleSubmit = async (data: z.infer<typeof tesoreriaSchema>) => {
    // Require centro selection when creating a new record
    if (!tesoreria) {
      const centroVal: any = (data as any).id_centro;
      if (centroVal === null || centroVal === undefined || (typeof centroVal === 'string' && centroVal === '')) {
        toast({ title: 'Seleccione un centro', description: 'Debe seleccionar el centro de distribución para este registro.', variant: 'destructive' });
        return false;
      }
    }
    // Normalizar payload (turno como número, reembolso vacío a undefined)
    const payload: any = {
      ...data,
      turno: data.turno ? Number(data.turno) : undefined,
      reembolso: data.reembolso || undefined,
    };
    // Ensure monto is a number (defensive)
    if (typeof payload.monto === 'string') {
      const parsed = parseFloat(String(payload.monto).replace(/,/g, '.'));
      payload.monto = isNaN(parsed) ? 0 : parsed;
    }
    // Normalize id_centro: '' -> undefined, string -> number
  // Normalize id_centro to number or null
  // Normalize id_centro: empty string or undefined -> null, string -> number
  if (typeof payload.id_centro === 'string' && payload.id_centro === '') payload.id_centro = null;
  if (payload.id_centro === undefined) payload.id_centro = null;
  if (typeof payload.id_centro === 'string' && payload.id_centro !== '') payload.id_centro = Number(payload.id_centro);
  // If creating (no tesoreria), validate saldo for all users (admins included).
  if (!tesoreria) {
      try {
        const API_BASE = getAPIBase();
        const res = await fetch(`${API_BASE}/tesoreria/saldo/actual`);
        const json = await res.json();
        const saldoActual = parseFloat(json?.data?.saldo || 0);
        if (payload.monto > saldoActual) {
          toast({ title: 'Saldo insuficiente', description: 'El monto excede el saldo disponible en la tarjeta de tesorería', variant: 'destructive' });
          return false;
        }
      } catch (err) {
        console.warn('No se pudo validar saldo:', err);
        // continue — allow submission to proceed to confirmation
      }
      // For non-admins, show confirmation modal; for admins proceed immediately
      if (!isAdmin) {
        setShowConfirm(true);
        return false;
      }
    }

    // If editing, prevent increasing the monto (only allow equal or smaller amounts)
    if (tesoreria) {
      const oldMonto = tesoreria.monto || 0;
      if (data.monto > oldMonto) {
        toast({ title: 'Edición inválida', description: 'No está permitido aumentar el monto al editar. Para sumar nuevo gasto cree un nuevo registro.', variant: 'destructive' });
        return false;
      }
    }

    // Ensure monto is positive
    if (typeof payload.monto !== 'number' || Number(payload.monto) <= 0) {
      toast({ title: 'Monto inválido', description: 'El monto debe ser mayor a 0', variant: 'destructive' });
      return false;
    }

    // For admins or when editing, proceed to submit directly
    try {
      // If we're editing (tesoreria exists) always include the id_centro key in the payload
      // so the server can detect the client's intent to clear it (send null) or set it.
      if (tesoreria) {
        if (!Object.prototype.hasOwnProperty.call(payload, 'id_centro')) {
          payload.id_centro = null;
        } else {
          // normalize values consistently
          if (typeof payload.id_centro === 'string' && payload.id_centro === '') payload.id_centro = null;
          if (typeof payload.id_centro === 'string' && payload.id_centro !== '') payload.id_centro = Number(payload.id_centro);
        }
      }

      const success = await onSubmit(payload as any);
      if (success) {
        form.reset();
        try { window.dispatchEvent(new Event('tesoreria:refresh')); } catch {}
      }
      return success;
    } catch (err) {
      console.error('Error on submit:', err);
      return false;
    }
  };

  const handleCategoriaChange = (categoria: string) => {
    setSelectedCategoria(categoria);
    form.setValue("categoria", categoria);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto pt-5">
      <CardContent>
        <Form {...(form as any)}>
          <form noValidate onSubmit={(e: FormEvent) => {
            e.preventDefault();
            const values = form.getValues();
            // Coerce monto to number if needed before validation
            if (typeof values.monto === 'string') {
              const p = parseFloat(String(values.monto).replace(/,/g, '.'));
              form.setValue('monto', isNaN(p) ? 0 : p);
            }
            // Normalize undefined centro to null so schema transform can pick it up
            if (values.id_centro === undefined) form.setValue('id_centro', null as any);
            // Now run react-hook-form submit (this will call zodResolver)
            form.handleSubmit(handleSubmit)();
          }} className="space-y-6">
      {/* Campos obligatorios */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fecha"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
          Fecha *
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

      {/* PLACA T2 y Nombre (obligatorios) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="placa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PLACA T2 / CD (opcional)</FormLabel>
                    <FormControl>
                      <Combobox
                        options={[
                          { label: '(Vacío)', value: '' },
                          { label: 'CD - Centro de Distribución', value: 'CD' },
                          ...vehiculos.map((v: TesoreriaVehiculo) => ({ label: `${v.placa} - ${v.descripcion}`, value: v.placa }))
                        ]}
                        value={field.value || ''}
                        onChange={(value) => field.onChange(value === '' ? '' : value)}
                        placeholder="Seleccione o ingrese placa..."
                        emptyText="No se encontraron vehículos"
                        searchPlaceholder="Buscar placa o descripción..."
                        disabled={loadingVehiculos}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre *</FormLabel>
                    <FormControl>
                      <Combobox
                        options={repartidores.map((r: TesoreriaRepartidor) => ({
                          label: r.descripcion,
                          value: r.nombre
                        }))}
                        value={field.value}
                        onChange={(value) => {
                          const repartidor = repartidores.find((r: TesoreriaRepartidor) => r.nombre === value);
                          field.onChange(value);
                        }}
                        placeholder="Buscar repartidor..."
                        emptyText="No se encontraron repartidores."
                        searchPlaceholder="Buscar por nombre o código..."
                        disabled={loadingRepartidores}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Centro de distribución */}
            <FormField
              control={form.control}
              name="id_centro"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Centro de distribución {tesoreria ? "(opcional)" : "*"}</FormLabel>
                  <FormControl>
                    <Combobox
                      options={[{ label: '(Vacío)', value: '' }, ...centros.map(c => ({
                        label: `${c.codigo} - ${c.nombre}${c.ciudad ? ` (${c.ciudad})` : ''}`,
                        // store numeric id as string value for the combobox, but keep semantics numeric on submit
                        value: String(c.id_centro ?? (c as any).id ?? '')
                      }))]}
                      // Show numeric id if present
                      value={field.value !== null && field.value !== undefined ? String(field.value) : ""}
                      onChange={(value) => {
                        // When the user selects an option we convert to number (or '' for empty)
                        if (value === '') return field.onChange('');
                        const n = Number(value);
                        if (!isNaN(n)) field.onChange(n);
                        else field.onChange('');
                      }}
                      placeholder="Buscar centro de distribución..."
                      emptyText="No se encontraron centros."
                      searchPlaceholder="Buscar por código o nombre..."
                    />
                  </FormControl>
                  {/* If creating and centro not selected, show inline hint */}
                  {!tesoreria && (form.getValues('id_centro') === null || form.getValues('id_centro') === undefined || form.getValues('id_centro') === '') && (
                    <p className="text-sm text-red-600 mt-1">El centro es obligatorio al crear un registro.</p>
                  )}
                </FormItem>
              )}
            />

            {/* Categoría (obligatoria) y Cargo (opcional) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="categoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría *</FormLabel>
                    <Select onValueChange={handleCategoriaChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categorias.map((categoria) => (
                          <SelectItem key={categoria} value={categoria}>
                            {categoria}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cargo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo</FormLabel>
                    <Select
                      onValueChange={(val: string) => field.onChange(val === 'none' ? '' : val)}
                      value={field.value === '' ? 'none' : field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="(Vacío o seleccione)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">(Vacío)</SelectItem>
                        {cargos.map((cargo) => (
                          <SelectItem key={cargo} value={cargo}>{cargo}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* Distrito y Turno (ambos obligatorios) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="distrito"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Distrito *</FormLabel>
                    <FormControl>
                      <Input placeholder="Distrito" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="turno"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Turno *</FormLabel>
                    <Select
                      onValueChange={(val: string) => field.onChange(val)}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione turno" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {turnos.map((t) => (
                          <SelectItem key={t.value} value={String(t.value)}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Detalle */}
            <FormField
              control={form.control}
              name="detalle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Detalle
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detalle del registro..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Monto (obligatorio) — entrada simple y bonita con prefijo S/ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="monto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-3 flex items-center text-gray-500 select-none">
                          S/
                        </span>
                        <Input
                          type="text"
                          inputMode="decimal"
                          placeholder="0.00"
                          className="pl-10"
                          value={montoInput}
                          onChange={(e) => {
                            const raw = e.target.value;
                            // Permitir números, coma o punto. Normalizar a punto para cálculo.
                            const cleaned = raw.replace(/[^0-9,\.]/g, "");
                            const normalized = cleaned.replace(/,/g, ".");
                            setMontoInput(cleaned);
                            const num = parseFloat(normalized);
                            field.onChange(isNaN(num) ? 0 : num);
                          }}
                          onFocus={(e) => e.currentTarget.select()}
                          onBlur={() => {
                            const n = form.getValues("monto") || 0;
                            setMontoInput(formatNumberPretty(n));
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* espacio para layout */}
            </div>

            {/* Encargado (obligatorio) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="encargado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Encargado *</FormLabel>
                    <FormControl>
                      <Input placeholder="Encargado" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Reembolso (opcional): Solo Sí o No */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="reembolso"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reembolso (opcional)</FormLabel>
                    <Select
                      onValueChange={(val: string) => field.onChange(val)}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Si">Si</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancelar
              </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Guardando..." : tesoreria ? "Actualizar" : "Crear"}
                </Button>
            </div>
          </form>
        </Form>
          {/* Confirmación para usuarios no-admin antes de crear */}
          {!isAdmin && !tesoreria && (
            <div>
              {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="bg-black bg-opacity-50 absolute inset-0"></div>
                  <div className="bg-white rounded shadow p-6 z-10 max-w-lg w-full">
                    <h3 className="text-lg font-medium mb-2">Confirmar creación</h3>
                    <p className="text-sm text-gray-600 mb-4">Estás a punto de crear un nuevo registro de tesorería. ¿Deseas continuar?</p>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowConfirm(false)}>Cancelar</Button>
                      <Button
                        onClick={async () => {
                          // Leer los valores actuales del formulario y enviar
                          const values = form.getValues();
                          // Coerce monto to number and normalize id_centro before sending
                          if (typeof values.monto === 'string') {
                            const p = parseFloat(String(values.monto).replace(/,/g, '.'));
                            values.monto = isNaN(p) ? 0 : p;
                          }
                          if (values.id_centro === '' || values.id_centro === undefined) values.id_centro = null;
                          if (typeof values.id_centro === 'string') values.id_centro = Number(values.id_centro);
                          const success = await onSubmit({ ...values, turno: values.turno ? Number(values.turno) : undefined } as any);
                          if (success) {
                            form.reset();
                            setShowConfirm(false);
                            try { window.dispatchEvent(new Event('tesoreria:refresh')); } catch {}
                          }
                        }}
                      >
                        Confirmar y crear
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
      </CardContent>
    </Card>
  );
} 