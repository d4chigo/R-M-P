"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import Link from "next/link";
import { useReportes } from "@/hooks/use-reportes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Calendar, Download, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CumplimientoVHVisitaRow {
  Fecha: string; // YYYY-MM-DD
  Placa: string;
  Codigo_Cliente: string;
  Cliente: string;
  OpenDT: string | null; // datetime
  CloseDT: string | null; // datetime
  ArriveDT: string | null; // datetime
  LeaveDT: string | null; // datetime
  IDR_Min: number | null; // minutos: 0 dentro, negativo temprano, positivo tarde
  Fuera_VH: 0 | 1 | null;
}

export default function CumplimientoVHPage() {
  const { getCumplimientoVHVisitas, loading } = useReportes();
  const { toast } = useToast();

  const [filtros, setFiltros] = useState({
    tipoReporte: "dia" as "dia" | "rango",
    fecha: new Date().toISOString().split("T")[0],
    fechaInicio: "",
    fechaFin: "",
    placa: "",
    cliente: "",
  });

  const [data, setData] = useState<CumplimientoVHVisitaRow[]>([]);

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargar = async (): Promise<void> => {
    try {
      const args: any = {};
      if (filtros.tipoReporte === "dia" && filtros.fecha) args.fecha = filtros.fecha;
      if (filtros.tipoReporte === "rango" && filtros.fechaInicio && filtros.fechaFin) {
        args.fechaInicio = filtros.fechaInicio;
        args.fechaFin = filtros.fechaFin;
      }
      if (filtros.placa) args.placa = filtros.placa.trim();
      if (filtros.cliente) args.cliente = filtros.cliente.trim();

      const rows = await getCumplimientoVHVisitas(args);
      setData(rows as CumplimientoVHVisitaRow[]);
    } catch (e) {
      toast({ title: "Error", description: "No se pudo cargar datos", variant: "destructive" });
    }
  };

  const formatDate = (v?: string | null): string => {
    if (!v) return "-";
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
      const [y, m, d] = v.split("-");
      return `${d}/${m}/${y}`;
    }
    try {
      const dt = new Date(v);
      return dt.toLocaleDateString("es-PE");
    } catch {
      return v as string;
    }
  };

  const formatTime = (v?: string | null): string => {
    if (!v) return "-";
    try {
      const dt = new Date(v);
      const hh = dt.getHours().toString().padStart(2, "0");
      const mm = dt.getMinutes().toString().padStart(2, "0");
      return `${hh}:${mm}`;
    } catch {
      // fallback si viene como HH:mm:ss
      if (/^\d{2}:\d{2}(:\d{2})?$/.test(v as string)) return (v as string).slice(0,5);
      return v as string;
    }
  };

  const exportarCSV = (): void => {
    const headers = [
      "Fecha",
      "Placa",
      "Codigo_Cliente",
      "Cliente",
      "Open",
      "Close",
      "Arrive",
      "Leave",
      "IDR_Min",
      "Fuera_de_VH"
    ];
    const csv = [
      headers.join(','),
      ...data.map((r) => [
        r.Fecha,
        r.Placa,
        r.Codigo_Cliente,
        `"${r.Cliente?.replaceAll('"', '""') || ''}"`,
        formatTime(r.OpenDT),
        formatTime(r.CloseDT),
        formatTime(r.ArriveDT),
        formatTime(r.LeaveDT),
        r.IDR_Min ?? "",
        r.Fuera_VH === null ? "" : r.Fuera_VH ? "SI" : "NO"
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `cumplimiento_vh_visitas_${
      filtros.tipoReporte === "dia" ? filtros.fecha : `${filtros.fechaInicio}_${filtros.fechaFin}`
    }.csv`;
    link.click();
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Cumplimiento de VH (Visitas)</h1>
            <p className="text-muted-foreground">Ventana horaria por visita</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={exportarCSV} disabled={loading || data.length === 0}>
            <Download className="h-4 w-4 mr-2" /> Exportar CSV
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" /> Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-2">
              <Label>Tipo</Label>
              <div className="flex gap-2">
                <Button
                  variant={filtros.tipoReporte === "dia" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFiltros((f: typeof filtros) => ({ ...f, tipoReporte: "dia" }))}
                >
                  Por Día
                </Button>
                <Button
                  variant={filtros.tipoReporte === "rango" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFiltros((f: typeof filtros) => ({ ...f, tipoReporte: "rango" }))}
                >
                  Por Rango
                </Button>
              </div>
            </div>

            {filtros.tipoReporte === "dia" ? (
              <>
                <div>
                  <Label>Fecha</Label>
                  <Input
                    type="date"
                    value={filtros.fecha}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFiltros({ ...filtros, fecha: e.target.value })}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={cargar} disabled={loading}>
                    <Calendar className="h-4 w-4 mr-2" /> {loading ? "Cargando..." : "Filtrar"}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label>Fecha Inicio</Label>
                  <Input
                    type="date"
                    value={filtros.fechaInicio}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFiltros({ ...filtros, fechaInicio: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Fecha Fin</Label>
                  <Input
                    type="date"
                    value={filtros.fechaFin}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFiltros({ ...filtros, fechaFin: e.target.value })}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={cargar} disabled={loading}>
                    <Calendar className="h-4 w-4 mr-2" /> {loading ? "Cargando..." : "Filtrar"}
                  </Button>
                </div>
              </>
            )}

            <div>
              <Label>Placa</Label>
              <Input
                placeholder="ABC-123"
                value={filtros.placa}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFiltros({ ...filtros, placa: e.target.value })}
              />
            </div>
            <div>
              <Label>Código/Cliente</Label>
              <Input
                placeholder="C001 o nombre"
                value={filtros.cliente}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFiltros({ ...filtros, cliente: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle de visitas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  {[
                    "Fecha",
                    "Placa",
                    "Código Cliente",
                    "Cliente",
                    "Open",
                    "Close",
                    "Arrive",
                    "Leave",
                    "IDR (min)",
                    "Fuera de VH?",
                  ].map((h) => (
                    <th key={h} className="py-2 pr-4 font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((r: CumplimientoVHVisitaRow, idx: number) => (
                  <tr key={idx} className="border-b hover:bg-muted/40">
                    <td className="py-2 pr-4">{formatDate(r.Fecha)}</td>
                    <td className="py-2 pr-4">{r.Placa}</td>
                    <td className="py-2 pr-4">{r.Codigo_Cliente}</td>
                    <td className="py-2 pr-4">{r.Cliente}</td>
                    <td className="py-2 pr-4">{formatTime(r.OpenDT)}</td>
                    <td className="py-2 pr-4">{formatTime(r.CloseDT)}</td>
                    <td className="py-2 pr-4">{formatTime(r.ArriveDT)}</td>
                    <td className="py-2 pr-4">{formatTime(r.LeaveDT)}</td>
                    <td className="py-2 pr-4">{r.IDR_Min ?? "-"}</td>
                    <td className="py-2 pr-4">{r.Fuera_VH === null ? "-" : r.Fuera_VH ? "Sí" : "No"}</td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td colSpan={10} className="py-6 text-center text-muted-foreground">
                      {loading ? "Cargando..." : "Sin resultados"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
