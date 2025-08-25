"use client";

import { useEffect, useMemo, useState } from "react";
import { useReportes } from "@/hooks/use-reportes";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Calendar, Download, Filter } from "lucide-react";

interface ViajeDetalle {
  Fecha: string;
  Placa: string;
  Vehiculo: string;
  Capacidad_Kg: number | null;
  Capacidad_Cajas: number | null;
  CodRS: string;
  Repartidor: string;
  Nro_Viaje: number;
  Nro_clientes: number;
  Clientes?: string | null;
  Nro_pedidos: number;
  Entrega_CF: number;
  Recojo_CF: number;
  Peso_Kg: number;
  Capac_Kg: number | null;
  Porc_Capacidad_Kg: number | null;
  Uso_Kg: number | null;
  Capac_Cajas: number | null;
  Porc_Capacidad_Cajas: number | null;
  Uso_Cajas: number | null;
  Distancia_recorrida: number | null;
  Salida_del_CD: string | null;
  Llegada_al_CD: string | null;
  Tiempo_de_Viaje: string | null;
  Tipo_Viaje: string | null;
}

export default function ResumenRutasPorViajePage() {
  const { getResumenRutasPorViaje, loading } = useReportes();
  const { toast } = useToast();

  const [filtros, setFiltros] = useState({
    tipoReporte: "dia" as "dia" | "rango",
    fecha: new Date().toISOString().split("T")[0],
    fechaInicio: "",
    fechaFin: "",
    placa: "",
    repartidor: "",
  });

  const [data, setData] = useState<ViajeDetalle[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargar = async () => {
    try {
      const args: any = {};
      if (filtros.tipoReporte === "dia" && filtros.fecha) args.fecha = filtros.fecha;
      if (filtros.tipoReporte === "rango" && filtros.fechaInicio && filtros.fechaFin) {
        args.fechaInicio = filtros.fechaInicio;
        args.fechaFin = filtros.fechaFin;
      }
      if (filtros.placa) args.placa = filtros.placa;
      if (filtros.repartidor) args.repartidor = filtros.repartidor;

      const rows = await getResumenRutasPorViaje(args);
      setData(rows as ViajeDetalle[]);
      setLastUpdated(
        new Date().toLocaleString("es-PE", { timeZone: "America/Lima" })
      );
    } catch (e) {
      toast({ title: "Error", description: "No se pudo cargar datos", variant: "destructive" });
    }
  };

  const exportarCSV = () => {
    const headers = [
      "Fecha",
      "Placa",
      "Vehiculo",
      "CodRS",
      "Repartidor",
      "Nro_Viaje",
      "Nro_clientes",
      "Clientes",
      "Nro_pedidos",
      "Entrega_CF",
      "Recojo_CF",
      "Peso_Kg",
      "Capacidad_Kg",
      "%Cap_Kg",
      "Uso_Kg",
      "Capacidad_Cajas",
      "%Cap_Cajas",
      "Uso_Cajas",
      "Distancia_recorrida",
      "Salida_del_CD",
      "Llegada_al_CD",
  "Tiempo_de_Viaje",
  "Tipo_Viaje",
    ];
    const csv = [
      headers.join(","),
      ...data.map((r) =>
        [
          r.Fecha,
          r.Placa,
          `"${r.Vehiculo}"`,
          r.CodRS,
          `"${r.Repartidor}"`,
          r.Nro_Viaje,
          r.Nro_clientes,
          r.Clientes ? `"${r.Clientes}"` : "",
          r.Nro_pedidos,
          r.Entrega_CF,
          r.Recojo_CF,
          r.Peso_Kg,
          r.Capacidad_Kg ?? "",
          r.Porc_Capacidad_Kg ?? "",
          r.Uso_Kg ?? "",
          r.Capacidad_Cajas ?? "",
          r.Porc_Capacidad_Cajas ?? "",
          r.Uso_Cajas ?? "",
          r.Distancia_recorrida ?? "",
          r.Salida_del_CD ?? "",
          r.Llegada_al_CD ?? "",
          r.Tiempo_de_Viaje ?? "",
          r.Tipo_Viaje ?? "",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `resumen_rutas_por_viaje_${
      filtros.tipoReporte === "dia"
        ? filtros.fecha
        : `${filtros.fechaInicio}_${filtros.fechaFin}`
    }.csv`;
    link.click();
  };

  const formatDate = (v?: string | null) => {
    if (!v) return "-";
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
      const [y, m, d] = v.split("-");
      return `${d}/${m}/${y}`;
    }
    try {
      const dt = new Date(v);
      return dt.toLocaleDateString("es-PE");
    } catch {
      return v;
    }
  };

  const formatTime = (v?: string | null) => {
    if (!v) return "-";
    if (/^\d{2}:\d{2}:\d{2}$/.test(v)) return v.substring(0, 5);
    try {
      return new Date(v).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return v;
    }
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
            <h1 className="text-3xl font-bold">Resumen de Rutas por Viaje</h1>
            <p className="text-muted-foreground">Detalle por viaje con métricas operativas</p>
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
                  onClick={() => setFiltros((f) => ({ ...f, tipoReporte: "dia" }))}
                >
                  Por Día
                </Button>
                <Button
                  variant={filtros.tipoReporte === "rango" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFiltros((f) => ({ ...f, tipoReporte: "rango" }))}
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
                    onChange={(e) => setFiltros({ ...filtros, fecha: e.target.value })}
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
                    onChange={(e) => setFiltros({ ...filtros, fechaInicio: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Fecha Fin</Label>
                  <Input
                    type="date"
                    value={filtros.fechaFin}
                    onChange={(e) => setFiltros({ ...filtros, fechaFin: e.target.value })}
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
                onChange={(e) => setFiltros({ ...filtros, placa: e.target.value })}
              />
            </div>
            <div>
              <Label>Repartidor</Label>
              <Input
                placeholder="código o nombre"
                value={filtros.repartidor}
                onChange={(e) => setFiltros({ ...filtros, repartidor: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              {filtros.tipoReporte === "dia"
                ? `Detalle de viajes - ${formatDate(filtros.fecha)}`
                : filtros.fechaInicio && filtros.fechaFin
                ? `Detalle de viajes - ${formatDate(filtros.fechaInicio)} a ${formatDate(filtros.fechaFin)}`
                : "Selecciona un rango"}
            </span>
            {lastUpdated && (
              <span className="text-xs text-muted-foreground">Actualizado: {lastUpdated}</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  {[
                    "Fecha",
                    "Placa",
                    "Vehículo",
                    "Repartidor",
                    "Viaje",
                    "Clientes",
                    "Pedidos",
                    "Ent (CF)",
                    "Rec (CF)",
                    "Peso (Kg)",
                    "%Cap Kg",
                    "%Cap Cj",
                    "Km",
                    "Salida",
                    "Llegada",
                    "T. Viaje",
                    "Recarga",
                    "Refrig",
                    "Tipo",
                  ].map((h) => (
                    <th key={h} className="py-2 pr-4 font-medium text-muted-foreground">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((r, idx) => (
                  <tr key={idx} className="border-b hover:bg-muted/40">
                    <td className="py-2 pr-4">{formatDate(r.Fecha)}</td>
                    <td className="py-2 pr-4">{r.Placa}</td>
                    <td className="py-2 pr-4">{r.Vehiculo}</td>
                    <td className="py-2 pr-4">{r.Repartidor}</td>
                    <td className="py-2 pr-4">{r.Nro_Viaje}</td>
                    <td className="py-2 pr-4 max-w-xs whitespace-pre-wrap break-words">{r.Clientes || '-'}</td>
                    <td className="py-2 pr-4">{r.Nro_pedidos}</td>
                    <td className="py-2 pr-4">{r.Entrega_CF}</td>
                    <td className="py-2 pr-4">{r.Recojo_CF}</td>
                    <td className="py-2 pr-4">{r.Peso_Kg}</td>
                    <td className="py-2 pr-4">{r.Porc_Capacidad_Kg ?? "-"}</td>
                    <td className="py-2 pr-4">{r.Porc_Capacidad_Cajas ?? "-"}</td>
                    <td className="py-2 pr-4">{r.Distancia_recorrida ?? "-"}</td>
                    <td className="py-2 pr-4">{formatTime(r.Salida_del_CD)}</td>
                    <td className="py-2 pr-4">{formatTime(r.Llegada_al_CD)}</td>
                    <td className="py-2 pr-4">{r.Tiempo_de_Viaje ?? "-"}</td>
                    <td className="py-2 pr-4">{r.Tipo_Viaje ?? "-"}</td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td colSpan={19} className="py-6 text-center text-muted-foreground">
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
