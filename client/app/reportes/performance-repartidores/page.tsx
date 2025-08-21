"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useReportes } from "@/hooks/use-reportes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Calendar, Filter, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

type FiltrosRepartidor = {
  fechaInicio: string;
  fechaFin: string;
  repartidor: string;
};

export default function PerformanceRepartidoresV2Page() {
  const { loading, getPerformanceRepartidoresV2 } = useReportes();
  const [data, setData] = useState<any[]>([]);
  const [filtros, setFiltros] = useState<FiltrosRepartidor>({
    fechaInicio: "",
    fechaFin: "",
    repartidor: "",
  });

  // Defaults: últimos 7 días
  useEffect(() => {
    const hoy = new Date();
    const hace7 = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
    const pad = (n: number) => String(n).padStart(2, "0");
    const toYMD = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    setFiltros({ fechaInicio: toYMD(hace7), fechaFin: toYMD(hoy), repartidor: "" });
  }, []);

  const cargar = async () => {
    const { fechaInicio, fechaFin, repartidor } = filtros;
    if (fechaInicio && fechaFin && new Date(fechaInicio) > new Date(fechaFin)) {
      return; // invalid range
    }
    const res = await getPerformanceRepartidoresV2({ fechaInicio, fechaFin, repartidor });
    setData(res || []);
  };

  useEffect(() => {
    if (filtros.fechaInicio && filtros.fechaFin) cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros.fechaInicio, filtros.fechaFin]);

  const totalizadores = useMemo(() => {
    if (!data || data.length === 0) return null;
    const sum = <T extends keyof any>(k: T) => data.reduce((acc: number, r: any) => acc + (Number(r[k]) || 0), 0);
    const viajes = sum("Nro_viajes");
    const km = sum("Km");
    const pedidos = sum("Pedidos");
    const entregados = sum("Pedidos_Entregados");
    const visitas = sum("Visitas");
    return { viajes, km, pedidos, entregados, visitas };
  }, [data]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Performance Repartidores (v2)</h1>
            <p className="text-muted-foreground">Vista de `v_performance_repartidor`</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Filter className="h-5 w-5"/> Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="fi">Fecha Inicio</Label>
              <Input id="fi" type="date" value={filtros.fechaInicio} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFiltros({ ...filtros, fechaInicio: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="ff">Fecha Fin</Label>
              <Input id="ff" type="date" value={filtros.fechaFin} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFiltros({ ...filtros, fechaFin: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="rep">Repartidor</Label>
              <Input id="rep" placeholder="Nombre" value={filtros.repartidor} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFiltros({ ...filtros, repartidor: e.target.value })} />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={cargar} disabled={loading}>
                <Calendar className="w-4 h-4 mr-2" /> {loading ? "Cargando..." : "Consultar"}
              </Button>
              <Button variant="outline" onClick={() => setFiltros({ ...filtros, repartidor: "" })} disabled={loading}>
                <RefreshCw className="w-4 h-4 mr-2" /> Limpiar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {totalizadores && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Viajes</p><p className="text-2xl font-bold">{totalizadores.viajes}</p></CardContent></Card>
          <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Km</p><p className="text-2xl font-bold">{totalizadores.km.toFixed(1)}</p></CardContent></Card>
          <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Pedidos</p><p className="text-2xl font-bold">{totalizadores.pedidos}</p></CardContent></Card>
          <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Entregados</p><p className="text-2xl font-bold">{totalizadores.entregados}</p></CardContent></Card>
          <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Visitas</p><p className="text-2xl font-bold">{totalizadores.visitas}</p></CardContent></Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Resultados ({data.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Repartidor</TableHead>
                <TableHead>Viajes</TableHead>
                <TableHead>Km</TableHead>
                <TableHead>Pedidos</TableHead>
                <TableHead>Entregados</TableHead>
                <TableHead>Tasa Entrega (%)</TableHead>
                <TableHead>Visitas Puntuales</TableHead>
                <TableHead>Visitas</TableHead>
                <TableHead>Puntualidad (%)</TableHead>
                <TableHead>Min Totales</TableHead>
                <TableHead>Pedidos/Hora</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((r, idx) => (
                <TableRow key={idx}>
                  <TableCell>{r.Fecha}</TableCell>
                  <TableCell>{r.Repartidor}</TableCell>
                  <TableCell>{r.Nro_viajes}</TableCell>
                  <TableCell>{Number(r.Km).toFixed(1)}</TableCell>
                  <TableCell>{r.Pedidos}</TableCell>
                  <TableCell>{r.Pedidos_Entregados}</TableCell>
                  <TableCell>{Number(r.Tasa_Entrega).toFixed(1)}</TableCell>
                  <TableCell>{r.Visitas_Puntuales}</TableCell>
                  <TableCell>{r.Visitas}</TableCell>
                  <TableCell>{Number(r.Puntualidad).toFixed(1)}</TableCell>
                  <TableCell>{r.Min_Totales}</TableCell>
                  <TableCell>{Number(r.Pedidos_por_Hora).toFixed(2)}</TableCell>
                </TableRow>
              ))}
              {data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={12} className="text-center text-muted-foreground">Sin resultados</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
