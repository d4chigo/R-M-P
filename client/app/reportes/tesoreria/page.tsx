"use client";

import { useState, useEffect, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Filter } from "lucide-react";
import { useReportes } from "@/hooks/use-reportes";
import { GastosChart } from "./components/GastosChart";
import { TendenciaChart } from "./components/TendenciaChart";
import { GastosAnomalos } from "./components/GastosAnomalos";

export default function TesoreriaReportPage() {
  const { getTesoreriaPorCategoria, getTesoreriaPorPersona, getTesoreriaPorVehiculo, getTesoreriaTendenciaMensual } = useReportes();

  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [placa, setPlaca] = useState('');
  const [centro, setCentro] = useState('');
  const [categoria, setCategoria] = useState('');

  const [categoriaRows, setCategoriaRows] = useState<any[]>([]);
  const [personaRows, setPersonaRows] = useState<any[]>([]);
  const [vehiculoRows, setVehiculoRows] = useState<any[]>([]);
  const [tendenciaRows, setTendenciaRows] = useState<any[]>([]);

  useEffect(() => {
    cargarResumenes();
  }, []);

  const cargarResumenes = async () => {
    try {
      const cat = await getTesoreriaPorCategoria();
      setCategoriaRows(cat || []);
      const per = await getTesoreriaPorPersona();
      setPersonaRows(per || []);
      const veh = await getTesoreriaPorVehiculo({ placa: placa || undefined });
      setVehiculoRows(veh || []);
      const ten = await getTesoreriaTendenciaMensual({ meses: 12 });
      setTendenciaRows(ten || []);
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
        <h1 className="text-2xl font-bold">Reportes de Tesorería</h1>
        <div className="flex gap-2">
          <Button onClick={() => exportCsv(categoriaRows, 'tesoreria_categoria.csv')}>
            <Download className="w-4 h-4 mr-2" />Exportar Categoría
          </Button>
          <Button onClick={() => exportCsv(personaRows, 'tesoreria_persona.csv')}>
            <Download className="w-4 h-4 mr-2" />Exportar Persona
          </Button>
        </div>
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
              <Input value={placa} onChange={(e: ChangeEvent<HTMLInputElement>) => setPlaca(e.target.value)} placeholder="ABC-123" />
            </div>
            <div>
              <Label>Centro</Label>
              <Input value={centro} onChange={(e: ChangeEvent<HTMLInputElement>) => setCentro(e.target.value)} placeholder="ID centro" />
            </div>
            <div>
              <Label>Categoría</Label>
              <Input value={categoria} onChange={(e: ChangeEvent<HTMLInputElement>) => setCategoria(e.target.value)} placeholder="Ej: combustible" />
            </div>
            <div className="flex items-end">
              <Button onClick={cargarResumenes}>Filtrar</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gastos Anómalos */}
      <GastosAnomalos data={[...categoriaRows, ...personaRows]} threshold={50} />

      {/* Gráficas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <GastosChart data={categoriaRows} type="categoria" title="Gasto por Categoría" />
        <GastosChart data={personaRows} type="persona" title="Gasto por Persona" />
      </div>

      {/* Tendencia mensual (gráfico) */}
      <TendenciaChart data={tendenciaRows} />

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
                <tr className="border-b font-semibold bg-muted/30">
                  <td colSpan={4} className="p-2">Por Categoría</td>
                </tr>
                {categoriaRows.map((r, i) => (
                  <tr key={`cat-${i}`} className="border-b hover:bg-muted/20">
                    <td className="p-2">{r.Categoria}</td>
                    <td className="p-2">${r.Monto_Total.toFixed(2)}</td>
                    <td className="p-2">${r.Monto_Promedio.toFixed(2)}</td>
                    <td className="p-2">{r.Cantidad_Registros}</td>
                  </tr>
                ))}
                <tr className="border-b font-semibold bg-muted/30">
                  <td colSpan={4} className="p-2">Por Persona</td>
                </tr>
                {personaRows.map((r, i) => (
                  <tr key={`per-${i}`} className="border-b hover:bg-muted/20">
                    <td className="p-2">{r.Persona}</td>
                    <td className="p-2">${r.Monto_Total.toFixed(2)}</td>
                    <td className="p-2">${r.Monto_Promedio.toFixed(2)}</td>
                    <td className="p-2">{r.Cantidad_Registros}</td>
                  </tr>
                ))}
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
