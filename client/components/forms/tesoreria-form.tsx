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

const tesoreriaSchema = z.object({
  fecha: z.string().min(1, "La fecha es requerida"),
  placa: z.string().optional().or(z.literal("")).transform((v) => v || undefined),
  nombre: z.string().min(1, "El nombre es requerido"),
  id_centro: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => (v === undefined || v === "" ? undefined : Number(v))),
  cargo: z.string().optional(),
  categoria: z.string().min(1, "La categoría es requerida"),
  detalle: z.string().optional(),
  reembolso: z.string().optional(),
  distrito: z.string().optional(),
  turno: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => (v === undefined || v === "" ? undefined : Number(v))),
  encargado: z.string().optional(),
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
  "Seguros",
  "Licencias",
  "Impuestos",
  "Servicios",
  "Ventas",
  "Comisiones",
  "Otros",
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

export function TesoreriaForm({
  tesoreria,
  onSubmit,
  onCancel,
  loading = false,
}: TesoreriaFormProps) {
  const [selectedCategoria, setSelectedCategoria] = useState<string>(
    tesoreria?.categoria || ""
  );
  const [centros, setCentros] = useState<Array<any>>([]);
  const [searchCentro, setSearchCentro] = useState("");
  const [showCentros, setShowCentros] = useState(false);

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

  const form = useForm<z.infer<typeof tesoreriaSchema>>({
    resolver: zodResolver(tesoreriaSchema),
    defaultValues: {
      fecha: tesoreria?.fecha || new Date().toISOString().split("T")[0],
      placa: tesoreria?.placa || "",
      nombre: tesoreria?.nombre || "",
      cargo: tesoreria?.cargo || "",
      categoria: tesoreria?.categoria || "",
      detalle: tesoreria?.detalle || "",
      reembolso: tesoreria?.reembolso || "",
      distrito: tesoreria?.distrito || "",
      turno: tesoreria?.turno ?? undefined,
      encargado: tesoreria?.encargado || "",
      monto: tesoreria?.monto || 0,
    },
  });

  const handleSubmit = async (data: z.infer<typeof tesoreriaSchema>) => {
    const success = await onSubmit(data);
    if (success) {
      form.reset();
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
            {/* Fecha */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fecha"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Fecha
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

            {/* Placa y Nombre */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="placa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Placa</FormLabel>
                    <FormControl>
                      <Input placeholder="ABC-123" {...field} />
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
                    <FormLabel>Nombre</FormLabel>
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
                  <div className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto border rounded bg-white shadow-lg">
                    {centros.length > 0 ? (
                      centros.map((c) => (
                        <div key={c.id_centro} className="p-2 cursor-pointer hover:bg-gray-100" onMouseDown={(e) => { e.preventDefault(); form.setValue('id_centro', c.id_centro); setSearchCentro(`${c.codigo} - ${c.nombre}`); setShowCentros(false); }}>
                          <div className="font-medium">{c.codigo}</div>
                          <div className="text-sm text-gray-600">{c.nombre} {c.ciudad ? `(${c.ciudad})` : ''}</div>
                        </div>
                      ))
                    ) : (
                      <div className="p-2 text-gray-500">No se encontraron centros</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Cargo y Categoría */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="categoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <Select onValueChange={handleCategoriaChange} defaultValue={field.value}>
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
                    <FormControl>
                      <Input placeholder="Cargo" {...field} />
                    </FormControl>
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

            {/* Monto */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="monto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* espacio para layout */}
            </div>

            {/* Reembolso y Distrito */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="reembolso"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reembolso</FormLabel>
                    <FormControl>
                      <Input placeholder="Reembolso" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="distrito"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Distrito</FormLabel>
                    <FormControl>
                      <Input placeholder="Distrito" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Turno y Encargado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="turno"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Turno</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="encargado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Encargado</FormLabel>
                    <FormControl>
                      <Input placeholder="Encargado" {...field} />
                    </FormControl>
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
      </CardContent>
    </Card>
  );
} 