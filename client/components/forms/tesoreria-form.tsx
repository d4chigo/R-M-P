"use client";

import type { ReactNode } from "react";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useForm } from "react-hook-form";
import { getAPIBase } from "@/lib/api-config";
import type {
  TesoreriaVehiculo,
  TesoreriaRepartidor,
} from "@/hooks/use-tesoreria";
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
import {
  CalendarIcon,
  DollarSign,
  FileText,
  Calendar,
  Eye,
} from "lucide-react";
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
import {
  getTodayLimaYMD,
  formatDateForPeru,
  peruDateToYMD,
} from "@/lib/utils/date-lima";

interface FormRenderProps {
  field: {
    value: string | number;
    onChange: (value: string | number) => void;
    onBlur: () => void;
    name: string;
  };
}

const tesoreriaSchema = z.object({
  fecha: z.string().min(1, "La fecha es requerida"),
  placa: z.string().optional(), // PLACA T2: texto libre, puede ser CD, placa, etc. Ahora opcional
  nombre: z.string().min(1, "El nombre es requerido"),
  id_centro: z.preprocess(
    (val) => {
      // Convertir valores vacíos o inválidos en undefined para que falle la validación
      if (val === undefined || val === "" || val === null) return undefined;
      if (typeof val === "string") {
        const n = Number(val);
        return isNaN(n) ? undefined : n;
      }
      return val;
    },
    z
      .number({ required_error: "El centro de distribución es requerido" })
      .positive("Debe seleccionar un centro de distribución"),
  ),
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
  "Trasbordo",
  "Cochera",
  "Viaticos",
  "Peajes",
  "Gastos Administrativos",
  "Movilidad",
  "Urea",
  "Extintores",
  "Combustible",
  "Revision Tecnica",
  "Producto",
  "Adelanto",
  "Prestamo Personal",
  "Pago de Personal",
  "Pago Feriado",
  "Pago Dominical",
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
  Trasbordo: ["Local", "Nacional", "Internacional"],
  Cochera: ["Alquiler", "Mantenimiento", "Limpieza"],
  Viaticos: ["Hospedaje", "Alimentación", "Transporte"],
  Peajes: ["Autopista", "Puente", "Túnel"],
  "Gastos Administrativos": ["Oficina", "Servicios", "Suministros"],
  Movilidad: ["Transporte", "Gasolina", "Estacionamiento"],
  Urea: ["Unidad 1", "Unidad 2", "Unidad 3"],
  Extintores: ["Recarga", "Mantenimiento", "Reemplazo"],
  Combustible: ["Gasolina", "Diesel", "Gas Natural"],
  "Revision Tecnica": ["Inspección", "Reparación", "Certificado"],
  Producto: ["Materia Prima", "Productos Terminados", "Suministros"],
  Adelanto: ["Efectivo", "Voucher", "Transferencia"],
  "Prestamo Personal": ["Efectivo", "Descuento Nómina", "Otros"],
  "Pago de Personal": ["Salarios", "Bonificaciones", "Comisiones"],
  "Pago Feriado": ["Feriado Nacional", "Feriado Regional", "Otros"],
  "Pago Dominical": ["Domingo", "Festivo", "Extraordinario"],
};

export function TesoreriaForm({
  tesoreria,
  onSubmit,
  onCancel,
  loading,
}: TesoreriaFormProps) {
  const { isAdmin } = useAuth();

  // Formateador de números con 2 decimales sin símbolo (mostramos prefijo S/ aparte)
  const formatNumberPretty = (n: number) =>
    new Intl.NumberFormat("es-PE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(isNaN(n) ? 0 : n);
  const [selectedCategoria, setSelectedCategoria] = useState<string>(
    tesoreria?.categoria || "",
  );
  const [showConfirm, setShowConfirm] = useState(false);
  const [centros, setCentros] = useState<
    Array<{
      id: string;
      codigo: string;
      nombre: string;
      ciudad?: string;
      id_centro: number;
    }>
  >([]);
  const [saldoCentro, setSaldoCentro] = useState<number | null>(null);
  const [loadingSaldo, setLoadingSaldo] = useState(false);

  interface FieldRenderProps {
    field: {
      value: any;
      onChange: (value: any) => void;
      name: string;
    };
  }
  const { toast } = useToast();

  // Función para obtener el saldo de un centro
  const fetchSaldoCentro = async (idCentro: number) => {
    if (!idCentro) {
      setSaldoCentro(null);
      return;
    }

    setLoadingSaldo(true);
    try {
      const API_BASE = getAPIBase();
      const token = Cookies.get("auth_token");
      if (!token) {
        setSaldoCentro(null);
        return;
      }

      const res = await fetch(`${API_BASE}/tesoreria/saldo/por-centro`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      if (json && json.success) {
        const centro = json.data.find(
          (c: any) => Number(c.id_centro) === Number(idCentro),
        );
        if (centro) {
          const saldoParsed = parseFloat(String(centro.saldo));
          setSaldoCentro(saldoParsed);
        } else {
          setSaldoCentro(null);
        }
      }
    } catch (err) {
      console.error("Error al obtener saldo del centro:", err);
      setSaldoCentro(null);
    } finally {
      setLoadingSaldo(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const API_BASE = getAPIBase();
        const token = Cookies.get("auth_token");
        if (!token) {
          setCentros([]);
          return;
        }
        const res = await fetch(`${API_BASE}/centros-distribucion`, {
          headers: {
            "Content-Type": "application/json",
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
    return () => {
      mounted = false;
    };
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
        const token = Cookies.get("auth_token");

        // Fetch vehicles
        setLoadingVehiculos(true);
        const resVehiculos = await fetch(
          `${API_BASE}/tesoreria/dropdown/vehiculos`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
          },
        );
        const jsonVehiculos = await resVehiculos.json();
        if (jsonVehiculos.success) {
          setVehiculos(jsonVehiculos.data);
        }
        setLoadingVehiculos(false);

        // Fetch employees
        setLoadingRepartidores(true);
        const resRepartidores = await fetch(
          `${API_BASE}/tesoreria/dropdown/repartidores`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
          },
        );
        const jsonRepartidores = await resRepartidores.json();
        if (jsonRepartidores.success) {
          setRepartidores(jsonRepartidores.data);
        }
        setLoadingRepartidores(false);
      } catch (err) {
        console.error("Error fetching dropdown data:", err);
        setLoadingVehiculos(false);
        setLoadingRepartidores(false);
      }
    };

    fetchData();
  }, []);

  const form = useForm<z.infer<typeof tesoreriaSchema>>({
    resolver: zodResolver(tesoreriaSchema),
    defaultValues: {
      fecha: (function () {
        const f = tesoreria?.fecha;
        if (!f) return getTodayLimaYMD();
        if (/^\d{4}-\d{2}-\d{2}$/.test(f)) return f; // already YYYY-MM-DD
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(f)) return peruDateToYMD(f); // convert DD/MM/YYYY
        // fallback: try to parse ISO-ish and extract YYYY-MM-DD
        try {
          return new Date(f).toISOString().split("T")[0];
        } catch (e) {
          return getTodayLimaYMD();
        }
      })(),
      placa: tesoreria?.placa || "",
      nombre: tesoreria?.nombre || "",
      cargo: tesoreria?.cargo || "",
      categoria: tesoreria?.categoria || "",
      detalle: tesoreria?.detalle || "",
      reembolso: tesoreria?.reembolso || undefined,
      distrito: tesoreria?.distrito || "",
      turno: tesoreria?.turno ? String(tesoreria.turno) : "",
      encargado: tesoreria?.encargado || "",
      id_centro: tesoreria?.id_centro ? String(tesoreria.id_centro) : "",
      monto: tesoreria?.monto || 0,
    },
  });
  // Estado visual del monto (sin símbolo, ya que mostramos prefijo S/)
  const [montoInput, setMontoInput] = useState<string>(
    formatNumberPretty(tesoreria?.monto ?? 0),
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
      try {
        return new Date(f).toISOString().split("T")[0];
      } catch {
        return getTodayLimaYMD();
      }
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
      id_centro: tesoreria.id_centro
        ? String((tesoreria as any).id_centro)
        : "",
      monto: tesoreria.monto || 0,
    };

    form.reset(vals);
    setMontoInput(formatNumberPretty(vals.monto || 0));

    // Cargar saldo del centro al editar
    if (vals.id_centro) {
      fetchSaldoCentro(Number(vals.id_centro));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tesoreria]);

  const handleSubmit = async (data: z.infer<typeof tesoreriaSchema>) => {
    // Validar que el monto sea positivo
    const montoNumerico = parseFloat(String(data.monto));
    if (montoNumerico <= 0 || isNaN(montoNumerico)) {
      toast({
        title: "Error",
        description: "El monto debe ser mayor a 0",
        variant: "destructive",
      });
      return;
    }

    // Validar que el monto no exceda el saldo disponible (solo para gastos)
    if (!tesoreria && saldoCentro !== null) {
      const saldoNumerico = parseFloat(String(saldoCentro));

      if (montoNumerico > saldoNumerico) {
        toast({
          title: "Saldo insuficiente",
          description: `El monto S/ ${formatNumberPretty(montoNumerico)} excede el saldo disponible de S/ ${formatNumberPretty(saldoNumerico)}`,
          variant: "destructive",
        });
        return;
      }
    }
    // Normalizar payload (turno como número, reembolso vacío a undefined)
    const payload: any = {
      ...data,
      turno: data.turno ? Number(data.turno) : undefined,
      reembolso:
        !data.reembolso || data.reembolso === "none" || data.reembolso === ""
          ? undefined
          : data.reembolso,
    };
    // Ensure monto is a number (defensive)
    if (typeof payload.monto === "string") {
      const parsed = parseFloat(String(payload.monto).replace(/,/g, "."));
      payload.monto = isNaN(parsed) ? 0 : parsed;
    }
    // Normalize id_centro: '' -> undefined, string -> number
    if (payload.id_centro === "") payload.id_centro = null; // send explicit null to indicate clearing
    if (typeof payload.id_centro === "string" && payload.id_centro !== "")
      payload.id_centro = Number(payload.id_centro);

    // La validación de saldo ya se realizó arriba usando el saldo del centro específico
    // For non-admins, show confirmation modal; for admins proceed immediately
    if (!tesoreria && !isAdmin) {
      setShowConfirm(true);
      return false;
    }

    // If editing, prevent increasing the monto (only allow equal or smaller amounts)
    if (tesoreria) {
      const oldMonto = tesoreria.monto || 0;
      if (data.monto > oldMonto) {
        toast({
          title: "Edición inválida",
          description:
            "No está permitido aumentar el monto al editar. Para sumar nuevo gasto cree un nuevo registro.",
          variant: "destructive",
        });
        return false;
      }
    }

    // Ensure monto is positive
    if (typeof payload.monto !== "number" || Number(payload.monto) <= 0) {
      toast({
        title: "Monto inválido",
        description: "El monto debe ser mayor a 0",
        variant: "destructive",
      });
      return false;
    }

    // For admins or when editing, proceed to submit directly
    try {
      // If we're editing (tesoreria exists) always include the id_centro key in the payload
      // so the server can detect the client's intent to clear it (send null) or set it.
      if (tesoreria) {
        if (!Object.prototype.hasOwnProperty.call(payload, "id_centro")) {
          payload.id_centro = null;
        } else {
          // normalize values consistently
          if (payload.id_centro === "") payload.id_centro = null;
          if (
            typeof payload.id_centro === "string" &&
            payload.id_centro !== null
          )
            payload.id_centro = Number(payload.id_centro);
        }
      }

      const success = await onSubmit(payload as any);
      if (success) {
        form.reset();
        try {
          window.dispatchEvent(new Event("tesoreria:refresh"));
        } catch {}
      }
      return success;
    } catch (err) {
      console.error("Error on submit:", err);
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
        <Form {...form}>
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              const values = form.getValues();
              // Coerce monto to number if needed before validation
              if (typeof values.monto === "string") {
                const p = parseFloat(String(values.monto).replace(/,/g, "."));
                form.setValue("monto", isNaN(p) ? 0 : p);
              }
              // Normalize empty centro to '' so schema transform can pick it up as undefined
              if (values.id_centro === undefined)
                form.setValue("id_centro", "");
              // Now run react-hook-form submit (this will call zodResolver)
              form.handleSubmit(handleSubmit)();
            }}
            className="space-y-6"
          >
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
                      <Input type="date" {...field} className="w-full" />
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
                          { label: "(Vacío)", value: "" },
                          { label: "CD - Centro de Distribución", value: "CD" },
                          ...vehiculos.map((v: TesoreriaVehiculo) => ({
                            label: v.descripcion,
                            value: v.placa,
                          })),
                        ]}
                        value={field.value || ""}
                        onChange={(value) =>
                          field.onChange(value === "" ? "" : value)
                        }
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
                          value: r.nombre,
                        }))}
                        value={field.value}
                        onChange={(value) => {
                          const repartidor = repartidores.find(
                            (r: TesoreriaRepartidor) => r.nombre === value,
                          );
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

            {/* Centro de distribución (obligatorio) y Saldo del Centro */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="id_centro"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Centro de distribución *</FormLabel>
                    <FormControl>
                      <Combobox
                        options={centros.map((c) => ({
                          label: `${c.codigo} - ${c.nombre}${c.ciudad ? ` (${c.ciudad})` : ""}`,
                          value: String(c.id_centro),
                        }))}
                        value={field.value ? String(field.value) : ""}
                        onChange={(value) => {
                          field.onChange(value || "");
                          // Obtener el saldo del centro seleccionado
                          if (value) {
                            fetchSaldoCentro(Number(value));
                          } else {
                            setSaldoCentro(null);
                          }
                        }}
                        placeholder="Seleccione un centro de distribución..."
                        emptyText="No se encontraron centros."
                        searchPlaceholder="Buscar por código o nombre..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Saldo del Centro (campo visual no editable) */}
              <FormItem>
                <FormLabel>Saldo disponible del centro</FormLabel>
                <div className="relative">
                  <Input
                    value={
                      loadingSaldo
                        ? "Cargando..."
                        : saldoCentro !== null
                          ? `S/ ${formatNumberPretty(saldoCentro)}`
                          : "Seleccione un centro"
                    }
                    disabled
                    className={cn(
                      "bg-gray-50 text-gray-700 font-semibold",
                      saldoCentro !== null && saldoCentro > 0
                        ? "text-emerald-600"
                        : saldoCentro === 0
                          ? "text-yellow-600"
                          : "",
                    )}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Eye className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                {saldoCentro !== null && saldoCentro === 0 && (
                  <p className="text-xs text-yellow-600 mt-1">
                    ⚠️ Este centro no tiene saldo disponible
                  </p>
                )}
              </FormItem>
            </div>

            {/* Categoría (obligatoria) y Cargo (opcional) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="categoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría *</FormLabel>
                    <Select
                      onValueChange={handleCategoriaChange}
                      value={field.value}
                    >
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
                      onValueChange={(val: string) =>
                        field.onChange(val === "none" ? "" : val)
                      }
                      value={field.value === "" ? "none" : field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="(Vacío o seleccione)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">(Vacío)</SelectItem>
                        {cargos.map((cargo) => (
                          <SelectItem key={cargo} value={cargo}>
                            {cargo}
                          </SelectItem>
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
                          <SelectItem key={t.value} value={String(t.value)}>
                            {t.label}
                          </SelectItem>
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
                  <h3 className="text-lg font-medium mb-2">
                    Confirmar creación
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Estás a punto de crear un nuevo registro de tesorería.
                    ¿Deseas continuar?
                  </p>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowConfirm(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={async () => {
                        // Leer los valores actuales del formulario y enviar
                        const values = form.getValues();
                        // Coerce monto to number and normalize id_centro before sending
                        if (typeof values.monto === "string") {
                          const p = parseFloat(
                            String(values.monto).replace(/,/g, "."),
                          );
                          values.monto = isNaN(p) ? 0 : p;
                        }
                        if (values.id_centro === "") values.id_centro = null;
                        if (
                          typeof values.id_centro === "string" &&
                          values.id_centro !== ""
                        )
                          values.id_centro = Number(values.id_centro);
                        const success = await onSubmit({
                          ...values,
                          turno: values.turno
                            ? Number(values.turno)
                            : undefined,
                        } as any);
                        if (success) {
                          form.reset();
                          setShowConfirm(false);
                          try {
                            window.dispatchEvent(
                              new Event("tesoreria:refresh"),
                            );
                          } catch {}
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
