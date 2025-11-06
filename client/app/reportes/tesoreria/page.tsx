"use client";

import { useState, useEffect, type ChangeEvent } from "react";
import Cookies from 'js-cookie';
import { getAPIBase } from '@/lib/api-config';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Download, Filter } from "lucide-react";
import { useReportes } from "@/hooks/use-reportes";
import { Combobox } from "@/components/ui/combobox";
import { Badge } from "@/components/ui/badge";
import { GastosChart } from "./components/GastosChart";
import { TendenciaChart } from "./components/TendenciaChart";
import { GastosAnomalos } from "./components/GastosAnomalos";
import MetricsSummary from "./components/MetricsSummary";
import { getTodayLimaYMD, formatDateForPeru } from "@/lib/utils/date-lima";

export default function TesoreriaReportPage() {
  const { getTesoreriaPorCategoria, getTesoreriaPorPersona, getTesoreriaPorVehiculo, getTesoreriaTendenciaMensual, getTesoreriaSummary } = useReportes();

  // Inicializar fechas con rango del mes actual en Lima
  const todayLima = getTodayLimaYMD();
  const firstDayOfMonth = todayLima.substring(0, 8) + '01'; // YYYY-MM-01
  
  const [fechaInicio, setFechaInicio] = useState(firstDayOfMonth);
  const [fechaFin, setFechaFin] = useState(todayLima);
  const [placa, setPlaca] = useState('');
  const [repartidor, setRepartidor] = useState('');
  const [categoria, setCategoria] = useState('');

  // Options for dropdowns
  const [placaOptions, setPlacaOptions] = useState<string[]>([]);
  const [repartidorOptions, setRepartidorOptions] = useState<Array<{ id?: string; label: string; value?: string }>>([]);
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

  const [categoriaRows, setCategoriaRows] = useState<any[]>([]);
  const [personaRows, setPersonaRows] = useState<any[]>([]);
  const [vehiculoRows, setVehiculoRows] = useState<any[]>([]);
  const [tendenciaRows, setTendenciaRows] = useState<any[]>([]);
  const [summary, setSummary] = useState<any | null>(null);

  useEffect(() => {
    cargarResumenes();
  }, []);

  useEffect(() => {
    // Fetch options for placas and repartidores (include auth token)
    const loadOptions = async () => {
      try {
        const API_BASE = getAPIBase();
        const token = Cookies.get('auth_token');
        const headers: Record<string,string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        // vehiculos
        try {
          const resV = await fetch(`${API_BASE}/tesoreria/dropdown/vehiculos`, { headers });
          const jv = await resV.json();
          if (jv && jv.success && Array.isArray(jv.data)) {
            setPlacaOptions(jv.data.map((v: any) => v.placa).filter(Boolean));
          }
        } catch (err) {
          // ignore vehicle load error
        }

        // repartidores
        try {
          const resR = await fetch(`${API_BASE}/tesoreria/dropdown/repartidores`, { headers });
          const jr = await resR.json();
          if (jr && jr.success && Array.isArray(jr.data)) {
            setRepartidorOptions(jr.data.map((r: any) => ({ id: r.id || undefined, label: r.descripcion || r.nombre || String(r.id), value: r.nombre || r.id })));
          }
        } catch (err) {
          // ignore repartidor load error
        }
      } catch (err) {
        // ignore
      }
    };
    loadOptions();
  }, []);

  const cargarResumenes = async () => {
    try {
  const cat = await getTesoreriaPorCategoria({ fechaInicio: fechaInicio || undefined, fechaFin: fechaFin || undefined, categoria: categoria || undefined, persona: repartidor || undefined });
      setCategoriaRows(cat || []);
  const per = await getTesoreriaPorPersona({ fechaInicio: fechaInicio || undefined, fechaFin: fechaFin || undefined, persona: repartidor || undefined });
      setPersonaRows(per || []);
      const veh = await getTesoreriaPorVehiculo({ placa: placa || undefined, fechaInicio: fechaInicio || undefined, fechaFin: fechaFin || undefined });
      setVehiculoRows(veh || []);
  const ten = await getTesoreriaTendenciaMensual({ meses: 12, fechaInicio: fechaInicio || undefined, fechaFin: fechaFin || undefined, categoria: categoria || undefined, persona: repartidor || undefined });
      setTendenciaRows(ten || []);
      // summary
      try {
        const s = await getTesoreriaSummary({ fechaInicio: fechaInicio || undefined, fechaFin: fechaFin || undefined });
        setSummary(s || null);
      } catch (err) {
        setSummary(null);
      }
    } catch (e) {
      // Optionally handle errors
    }
  };

  const exportCsv = (rows: any[], filename = 'tesoreria_report.csv') => {
    if (!rows || rows.length === 0) return;
    const headers = Object.keys(rows[0]);
    const csv = [headers.join(','), ...rows.map(r => headers.map(h => `"${(r[h] ?? '').toString().replaceAll('"', '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.history.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold">Reportes de Tesorería</h1>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => exportCsv(categoriaRows, 'tesoreria_categoria.csv')}>
            <Download className="w-4 h-4 mr-2" />Exportar Categoría
          </Button>
          <Button onClick={() => exportCsv(personaRows, 'tesoreria_persona.csv')}>
            <Download className="w-4 h-4 mr-2" />Exportar Persona
          </Button>
        </div>
      </div>

      {/* Result summary */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">Resultados: Categorías {categoriaRows.length} — Personas {personaRows.length} — Tendencia {tendenciaRows.length}</div>
        <div className="text-sm text-gray-500">Consejo: si los gráficos aparecen vacíos intente ampliar el rango de fechas o limpiar filtros.</div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-4 h-4" />Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <Label>Fecha inicio</Label>
              <Input type="date" value={fechaInicio} onChange={(e: ChangeEvent<HTMLInputElement>) => setFechaInicio(e.target.value)} />
            </div>
            <div>
              <Label>Fecha fin</Label>
              <Input type="date" value={fechaFin} onChange={(e: ChangeEvent<HTMLInputElement>) => setFechaFin(e.target.value)} />
            </div>
            <div>
              <Label>Placa</Label>
              <Combobox
                options={placaOptions.map(p => ({ label: p, value: p }))}
                value={placa}
                onChange={(v: string) => setPlaca(v)}
                placeholder="Seleccione placa"
                emptyText="No hay placas disponibles"
              />
            </div>
            <div>
              <Label>Repartidor</Label>
              <Combobox
                options={repartidorOptions.map(r => ({ label: r.label, value: r.value ?? r.id ?? r.label }))}
                value={repartidor}
                onChange={(v: string) => setRepartidor(v)}
                placeholder="Seleccione repartidor"
                emptyText="No hay repartidores disponibles"
              />
            </div>
            <div>
              <Label>Categoría</Label>
              <Combobox
                options={categorias.map(c => ({ label: c, value: c }))}
                value={categoria}
                onChange={(v: string) => setCategoria(v)}
                placeholder="Ej: Combustible"
                emptyText="No hay categorías"
              />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={cargarResumenes}>Filtrar</Button>
              <Button variant="ghost" onClick={() => { setFechaInicio(''); setFechaFin(''); setPlaca(''); setRepartidor(''); setCategoria(''); setCategoriaRows([]); setPersonaRows([]); setVehiculoRows([]); setTendenciaRows([]); cargarResumenes(); }}>
                Limpiar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Indicador de filtros aplicados */}
  {(fechaInicio || fechaFin || placa || repartidor || categoria) && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Filtros aplicados:</span>
          {fechaInicio && <Badge variant="secondary">Desde: {fechaInicio}</Badge>}
          {fechaFin && <Badge variant="secondary">Hasta: {fechaFin}</Badge>}
          {placa && <Badge variant="secondary">Placa: {placa}</Badge>}
          {repartidor && <Badge variant="secondary">Repartidor: {repartidor}</Badge>}
          {categoria && <Badge variant="secondary">Categoría: {categoria}</Badge>}
        </div>
      )}

      {/* Gastos Anómalos */}
      <GastosAnomalos data={[...categoriaRows, ...personaRows]} threshold={50} />

      {/* Metrics summary */}
      {summary && (
        <div className="mt-4">
          <MetricsSummary summary={summary} />
        </div>
      )}

      {/* Gráficas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {categoriaRows.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Gasto por Categoría</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-6 text-center text-sm text-gray-600">No se encontraron datos para las categorías con los filtros seleccionados.</div>
            </CardContent>
          </Card>
        ) : (
          <GastosChart data={categoriaRows} type="categoria" title="Gasto por Categoría" />
        )}

        {personaRows.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Gasto por Persona</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-6 text-center text-sm text-gray-600">No se encontraron datos por persona con los filtros seleccionados.</div>
            </CardContent>
          </Card>
        ) : (
          <GastosChart data={personaRows} type="persona" title="Gasto por Persona" />
        )}
      </div>

      {/* Tendencia mensual (gráfico) */}
      {tendenciaRows.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Tendencia mensual (últimos 12 meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-6 text-center text-sm text-gray-600">No hay datos de tendencia para los filtros aplicados. Intente ampliar el rango de fechas.</div>
          </CardContent>
        </Card>
      ) : (
        <TendenciaChart data={tendenciaRows} />
      )}

      {/* Tabla: Detalle de Gastos */}
      <div className="grid grid-cols-1 gap-4 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Detalle de Gastos</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b bg-muted/50">
                  <th className="p-2">Categoría/Persona</th>
                  <th className="p-2">Monto Total</th>
                  <th className="p-2">Promedio</th>
                  <th className="p-2">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                  {categoriaRows.length === 0 && personaRows.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-sm text-gray-600">No se encontraron registros con los filtros aplicados.</td>
                    </tr>
                  ) : (
                    <>
                      <tr className="border-b font-semibold bg-muted/30">
                        <td colSpan={4} className="p-2">Por Categoría</td>
                      </tr>
                      {categoriaRows.map((r, i) => (
                        <tr key={`cat-${i}`} className="border-b hover:bg-muted/20">
                          <td className="p-2">{r.Categoria}</td>
                          <td className="p-2">S/{(typeof r.Monto_Total === 'number' ? r.Monto_Total : parseFloat(r.Monto_Total) || 0).toFixed(2)}</td>
                          <td className="p-2">S/{(typeof r.Monto_Promedio === 'number' ? r.Monto_Promedio : parseFloat(r.Monto_Promedio) || 0).toFixed(2)}</td>
                          <td className="p-2">{r.Cantidad_Registros}</td>
                        </tr>
                      ))}
                      <tr className="border-b font-semibold bg-muted/30">
                        <td colSpan={4} className="p-2">Por Persona</td>
                      </tr>
                      {personaRows.map((r, i) => (
                        <tr key={`per-${i}`} className="border-b hover:bg-muted/20">
                          <td className="p-2">{r.Persona}</td>
                          <td className="p-2">S/{(typeof r.Monto_Total === 'number' ? r.Monto_Total : parseFloat(r.Monto_Total) || 0).toFixed(2)}</td>
                          <td className="p-2">S/{(typeof r.Monto_Promedio === 'number' ? r.Monto_Promedio : parseFloat(r.Monto_Promedio) || 0).toFixed(2)}</td>
                          <td className="p-2">{r.Cantidad_Registros}</td>
                        </tr>
                      ))}
                    </>
                  )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* Tabla: Tendencia mensual */}
      <Card>
        <CardHeader>
          <CardTitle>Tendencia mensual (últimos 12 meses)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th>Mes</th>
                  <th>Monto_Total</th>
                  <th>Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {tendenciaRows.map((r, i) => (
                  <tr key={i} className="border-b">
                    <td>{r.Mes}</td>
                    <td>{r.Monto_Total}</td>
                    <td>{r.Cantidad_Registros}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}