"use client";

import { useState, useEffect } from "react";
import Cookies from 'js-cookie';
import { useForm } from "react-hook-form";
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

const tesoreriaSchema = z.object({
  fecha: z.string().min(1, "La fecha es requerida"),
  placa: z.string().min(1, "La PLACA T2 es requerida"), // PLACA T2: texto libre, puede ser CD, placa, etc
  nombre: z.string().min(1, "El nombre es requerido"),
  id_centro: z.union([z.string(), z.number()]).optional().transform((v) => (v === undefined || v === "" ? undefined : Number(v))),
  cargo: z.string().optional(), // Opcional
  categoria: z.string().min(1, "La categoría es requerida"),
  detalle: z.string().optional(),
  reembolso: z.enum(["Si", "No"]).optional(), // Opcional
  distrito: z.string().min(1, "El distrito es requerido"),
  turno: z.string().min(1, "El turno es requerido"),
  encargado: z.string().min(1, "El encargado es requerido"),
  monto: z.number().min(0.01, "El monto debe ser mayor a 0"),
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
  const formatPEN = (n: number) =>
    new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(isNaN(n) ? 0 : n);
  const parsePEN = (s: string) => {
    const cleaned = String(s || "").replace(/[^0-9,.-]/g, "");
    // Quitar separadores de miles y normalizar decimal coma->punto
    const normalized = cleaned.replace(/\./g, "").replace(/,/g, ".");
    const num = parseFloat(normalized);
    return isNaN(num) ? 0 : num;
  };
  const [selectedCategoria, setSelectedCategoria] = useState<string>(
    tesoreria?.categoria || ""
  );
  const [showConfirm, setShowConfirm] = useState(false);
  const [centros, setCentros] = useState<Array<any>>([]);
  const [vehiculos, setVehiculos] = useState<Array<any>>([]);
  const [searchPlaca, setSearchPlaca] = useState("");
  const [showPlacas, setShowPlacas] = useState(false);
  const [searchCentro, setSearchCentro] = useState("");
  const [showCentros, setShowCentros] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const API_BASE = (window && (window as any).__env && (window as any).__env.NEXT_PUBLIC_API_URL) || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
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

  // Cargar vehiculos activos para selector de placa
  useEffect(() => {
    let mounted = true;
    const loadVeh = async () => {
      try {
        const API_BASE = (window && (window as any).__env && (window as any).__env.NEXT_PUBLIC_API_URL) || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
        const token = Cookies.get('auth_token');
        const res = await fetch(`${API_BASE}/vehiculos`, {
          headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' }
        });
        const json = await res.json();
        if (mounted && json && json.success) setVehiculos(json.data || []);
      } catch (err) {
        // ignore
      }
    };
    loadVeh();
    return () => { mounted = false; };
  }, []);

  const form = useForm<z.infer<typeof tesoreriaSchema>>({
    resolver: zodResolver(tesoreriaSchema),
    defaultValues: {
      fecha: tesoreria?.fecha || new Date().toISOString().split("T")[0],
  placa: tesoreria?.placa || "",
      nombre: tesoreria?.nombre || "",
      cargo: tesoreria?.cargo || "",
      categoria: tesoreria?.categoria || "",
      detalle: tesoreria?.detalle || "",
      reembolso: tesoreria?.reembolso || undefined,
  distrito: tesoreria?.distrito || "",
  turno: tesoreria?.turno ? String(tesoreria.turno) : "",
  encargado: tesoreria?.encargado || "",
      monto: tesoreria?.monto || 0,
    },
  });
  const [montoInput, setMontoInput] = useState<string>(
    formatPEN(tesoreria?.monto ?? 0)
  );
  useEffect(() => {
    setMontoInput(formatPEN(form.getValues("monto") || 0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tesoreria?.monto]);

  const handleSubmit = async (data: z.infer<typeof tesoreriaSchema>) => {
    // Normalizar payload (turno como número, reembolso vacío a undefined)
    const payload: any = {
      ...data,
      turno: data.turno ? Number(data.turno) : undefined,
      reembolso: !data.reembolso || data.reembolso === 'none' || data.reembolso === '' ? undefined : data.reembolso,
    };
    // If creating (no tesoreria), validate saldo for all users (admins included).
    if (!tesoreria) {
      try {
        const API_BASE = (window && (window as any).__env && (window as any).__env.NEXT_PUBLIC_API_URL) || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
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

    // For admins or when editing, proceed to submit directly
    try {
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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          {tesoreria ? "Editar Registro de Tesorería" : "Nuevo Registro de Tesorería"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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
        <FormLabel>PLACA T2 / CD *</FormLabel>
                    <FormControl>
                      <Input placeholder="Placa, CD, etc" {...field} />
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
                      <Input placeholder="Nombre completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Centro de distribución (opcional) */}
            <div>
              <FormLabel className="mb-2">Centro de distribución (opcional)</FormLabel>
              <div className="relative">
                <Input
                  value={searchCentro}
                  onChange={(e) => { setSearchCentro(e.target.value); if (e.target.value === '') form.setValue('id_centro', undefined); }}
                  onFocus={() => setShowCentros(true)}
                  onBlur={() => setTimeout(() => setShowCentros(false), 200)}
                  placeholder="Buscar centro por código o nombre"
                />
               {showCentros && (
                    <div className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto border rounded bg-white dark:bg-gray-900 shadow-lg dark:shadow-lg">
                      {centros.length > 0 ? (
                        centros.map((c) => (
                          <div
                            key={c.id_centro}
                            className="p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              form.setValue("id_centro", c.id_centro);
                              setSearchCentro(`${c.codigo} - ${c.nombre}`);
                              setShowCentros(false);
                            }}
                          >
                            <div className="font-medium">{c.codigo}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                              {c.nombre} {c.ciudad ? `(${c.ciudad})` : ""}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-2 text-gray-500 dark:text-gray-400">
                          No se encontraron centros
                        </div>
                      )}
                    </div>
                  )}

              </div>
            </div>

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

            {/* Monto (obligatorio) — entrada formateada en moneda */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="monto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto *</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        inputMode="decimal"
                        placeholder="S/ 0.00"
                        value={montoInput}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMontoInput(val);
                          const num = parsePEN(val);
                          field.onChange(num);
                        }}
                        onBlur={() => setMontoInput(formatPEN(form.getValues("monto") || 0))}
                      />
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