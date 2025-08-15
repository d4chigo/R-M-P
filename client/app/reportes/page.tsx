"use client";

import { useState, useEffect } from "react";
import { Calendar, Download, Filter, BarChart3, TrendingUp, Users, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useReportes } from "@/hooks/use-reportes";
import { useToast } from "@/hooks/use-toast";

export default function ReportesPage() {
  const {
    loading,
    getResumenRutas,
    getResumenRutasRango,
    getMetricasDiarias,
    getMetricasCumplimiento,
  } = useReportes();

  const { toast } = useToast();
  const [resumenData, setResumenData] = useState<any[]>([]);
  const [metricas, setMetricas] = useState<any>(null);
  const [cumplimiento, setCumplimiento] = useState<any>(null);
  const [filtros, setFiltros] = useState({
    fecha: new Date().toISOString().split('T')[0],
    fechaInicio: "",
    fechaFin: "",
    tipoReporte: "dia" // "dia" | "rango"
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      // Cargar resumen de rutas del día actual
      const resumen = await getResumenRutas(filtros.fecha);
      setResumenData(resumen);

      // Cargar métricas diarias
      const metricasDia = await getMetricasDiarias(filtros.fecha);
      if (metricasDia && metricasDia.length > 0) {
        setMetricas(metricasDia[0]);
      }

      // Cargar métricas de cumplimiento
      const cumplimientoData = await getMetricasCumplimiento(filtros.fecha);
      setCumplimiento(cumplimientoData);
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  };

  const handleFiltrarPorDia = async () => {
    if (!filtros.fecha) {
      toast({
        title: "Error",
        description: "Selecciona una fecha",
        variant: "destructive",
      });
      return;
    }

    try {
      const resumen = await getResumenRutas(filtros.fecha);
      setResumenData(resumen);

      const metricasDia = await getMetricasDiarias(filtros.fecha);
      if (metricasDia && metricasDia.length > 0) {
        setMetricas(metricasDia[0]);
      }

      const cumplimientoData = await getMetricasCumplimiento(filtros.fecha);
      setCumplimiento(cumplimientoData);
    } catch (error) {
      console.error("Error filtrando por día:", error);
    }
  };

  const handleFiltrarPorRango = async () => {
    if (!filtros.fechaInicio || !filtros.fechaFin) {
      toast({
        title: "Error",
        description: "Selecciona ambas fechas",
        variant: "destructive",
      });
      return;
    }

    try {
      const resumen = await getResumenRutasRango(filtros.fechaInicio, filtros.fechaFin);
      setResumenData(resumen);

      // Para rango, calcular métricas agregadas
      const metricasRango = await getMetricasDiarias();
      setMetricas(null); // Reset individual metrics for range view
    } catch (error) {
      console.error("Error filtrando por rango:", error);
    }
  };

  const exportarExcel = () => {
    // Crear CSV simple
    const headers = [
      "Fecha", "Placa", "Vehiculo", "Repartidor", "Nro de viajes",
      "Territorio", "Distancia", "Salida del CD", "Llegada al CD",
      "Tiempo", "Nro de clientes", "Nro de pedidos", "Entrega (CF)",
      "Recojo (CF)", "Peso (Kg)"
    ];

    const csvContent = [
      headers.join(","),
      ...resumenData.map(row => [
        row.Fecha,
        row.Placa,
        `"${row.Vehiculo}"`,
        `"${row.Repartidor}"`,
        row["Nro de viajes"],
        row.Territorio,
        row.Distancia,
        row["Salida del CD"],
        row["Llegada al CD"],
        row.Tiempo,
        row["Nro de clientes"],
        row["Nro de pedidos"],
        row["Entrega (CF)"],
        row["Recojo (CF)"],
        row["Peso (Kg)"]
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `resumen_rutas_${filtros.fecha || 'rango'}.csv`;
    link.click();
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return "-";
    return timeString;
  };

  const formatNumber = (value: number) => {
    if (value === null || value === undefined) return "-";
    return typeof value === 'number' ? value.toLocaleString() : value;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reportes - Resumen de Rutas</h1>
          <p className="text-muted-foreground">
            Dashboard principal con métricas de rutas y performance
          </p>
        </div>
        <Button onClick={exportarExcel} disabled={loading || resumenData.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Exportar Excel
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Consulta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="tipoReporte">Tipo de Reporte</Label>
              <Select
                value={filtros.tipoReporte}
                onValueChange={(value) => setFiltros({...filtros, tipoReporte: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dia">Por Día</SelectItem>
                  <SelectItem value="rango">Por Rango</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filtros.tipoReporte === "dia" ? (
              <>
                <div>
                  <Label htmlFor="fecha">Fecha</Label>
                  <Input
                    id="fecha"
                    type="date"
                    value={filtros.fecha}
                    onChange={(e) => setFiltros({...filtros, fecha: e.target.value})}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleFiltrarPorDia} disabled={loading}>
                    <Calendar className="h-4 w-4 mr-2" />
                    {loading ? "Cargando..." : "Filtrar"}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label htmlFor="fechaInicio">Fecha Inicio</Label>
                  <Input
                    id="fechaInicio"
                    type="date"
                    value={filtros.fechaInicio}
                    onChange={(e) => setFiltros({...filtros, fechaInicio: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="fechaFin">Fecha Fin</Label>
                  <Input
                    id="fechaFin"
                    type="date"
                    value={filtros.fechaFin}
                    onChange={(e) => setFiltros({...filtros, fechaFin: e.target.value})}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleFiltrarPorRango} disabled={loading}>
                    <Calendar className="h-4 w-4 mr-2" />
                    {loading ? "Cargando..." : "Filtrar Rango"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Métricas de Cumplimiento */}
      {cumplimiento && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cumplimiento VH</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-2xl font-bold">{cumplimiento.cumplimiento_vh.real}</p>
                    <Badge variant={cumplimiento.cumplimiento_vh.porcentaje >= 95 ? "default" : "destructive"}>
                      {cumplimiento.cumplimiento_vh.porcentaje}%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Meta: {cumplimiento.cumplimiento_vh.meta}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Utilización Flota</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-2xl font-bold">{cumplimiento.utilizacion_flota.real.toFixed(1)}%</p>
                    <Badge variant={cumplimiento.utilizacion_flota.porcentaje >= 80 ? "default" : "secondary"}>
                      {cumplimiento.utilizacion_flota.porcentaje.toFixed(1)}%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Meta: {cumplimiento.utilizacion_flota.meta}%</p>
                </div>
                <Truck className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Distancia Promedio</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-2xl font-bold">{cumplimiento.distancia_promedio.real} km</p>
                    <Badge variant="outline">
                      {cumplimiento.distancia_promedio.porcentaje.toFixed(0)}%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Meta: {cumplimiento.distancia_promedio.meta} km</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Productividad</p>
                  <p className="text-2xl font-bold">{cumplimiento.productividad_camion} CF/camión</p>
                  <p className="text-xs text-muted-foreground">Eficiencia: {cumplimiento.eficiencia_ruta} km/cliente</p>
                </div>
                <Users className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Métricas Totales del Día/Rango */}
      {metricas && (
        <Card>
          <CardHeader>
            <CardTitle>Resumen de Métricas - {metricas.Fecha}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{metricas.Total_Vehiculos}</p>
                <p className="text-sm text-muted-foreground">Vehículos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{metricas.Total_Viajes}</p>
                <p className="text-sm text-muted-foreground">Viajes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{metricas.Total_Clientes}</p>
                <p className="text-sm text-muted-foreground">Clientes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{formatNumber(metricas.Total_Entrega_CF)}</p>
                <p className="text-sm text-muted-foreground">Entrega CF</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{formatNumber(metricas.Total_Peso_Kg)} kg</p>
                <p className="text-sm text-muted-foreground">Peso Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabla de Resumen de Rutas */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Rutas Detallado</CardTitle>
          <p className="text-sm text-muted-foreground">
            {resumenData.length} registros encontrados
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2">Cargando datos...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Placa</TableHead>
                    <TableHead>Vehículo</TableHead>
                    <TableHead>Repartidor</TableHead>
                    <TableHead className="text-center">Viajes</TableHead>
                    <TableHead className="text-center">Territorio</TableHead>
                    <TableHead className="text-right">Distancia</TableHead>
                    <TableHead>Salida CD</TableHead>
                    <TableHead>Llegada CD</TableHead>
                    <TableHead>Tiempo</TableHead>
                    <TableHead className="text-center">Clientes</TableHead>
                    <TableHead className="text-center">Pedidos</TableHead>
                    <TableHead className="text-right">Entrega (CF)</TableHead>
                    <TableHead className="text-right">Recojo (CF)</TableHead>
                    <TableHead className="text-right">Peso (Kg)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resumenData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.Fecha}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{row.Placa}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{row.Vehiculo}</TableCell>
                      <TableCell>{row.Repartidor}</TableCell>
                      <TableCell className="text-center">{row["Nro de viajes"]}</TableCell>
                      <TableCell className="text-center">{row.Territorio}</TableCell>
                      <TableCell className="text-right">{formatNumber(row.Distancia)} km</TableCell>
                      <TableCell>{formatTime(row["Salida del CD"])}</TableCell>
                      <TableCell>{formatTime(row["Llegada al CD"])}</TableCell>
                      <TableCell>{formatTime(row.Tiempo)}</TableCell>
                      <TableCell className="text-center">{row["Nro de clientes"]}</TableCell>
                      <TableCell className="text-center">{row["Nro de pedidos"]}</TableCell>
                      <TableCell className="text-right">{formatNumber(row["Entrega (CF)"])}</TableCell>
                      <TableCell className="text-right">{formatNumber(row["Recojo (CF)"])}</TableCell>
                      <TableCell className="text-right">{formatNumber(row["Peso (Kg)"])}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {!loading && resumenData.length === 0 && (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No se encontraron datos para el período seleccionado
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
