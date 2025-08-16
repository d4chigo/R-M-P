"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Download,
  Filter,
  BarChart3,
  TrendingUp,
  Users,
  Truck,
  Info,
  X,
  ArrowLeft,
} from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Link from "next/link";

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
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [filtros, setFiltros] = useState({
    fecha: new Date().toISOString().split("T")[0],
    fechaInicio: "",
    fechaFin: "",
    tipoReporte: "dia", // "dia" | "rango"
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
      const resumen = await getResumenRutasRango(
        filtros.fechaInicio,
        filtros.fechaFin,
      );
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
      "Fecha",
      "Placa",
      "Vehiculo",
      "Repartidor",
      "Nro de viajes",
      "Zona",
      "Distancia",
      "Salida del CD",
      "Llegada al CD",
      "Tiempo",
      "Nro de clientes",
      "Nro de pedidos",
      "Entrega (CF)",
      "Recojo (CF)",
      "Peso (Kg)",
    ];

    const csvContent = [
      headers.join(","),
      ...resumenData.map((row) =>
        [
          new Date(row.Fecha).toLocaleDateString("es-PE"),
          row.Placa,
          `"${row.Vehiculo}"`,
          `"${row.Repartidor}"`,
          row["Nro de viajes"],
          row.Zona,
          row.Distancia,
          row["Salida del CD"],
          row["Llegada al CD"],
          row.Tiempo,
          row["Nro de clientes"],
          row["Nro de pedidos"],
          row["Entrega (CF)"],
          row["Recojo (CF)"],
          row["Peso (Kg)"],
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `resumen_rutas_${filtros.fecha || "rango"}.csv`;
    link.click();
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return "-";

    // Si es un valor TIME de MySQL (formato HH:MM:SS)
    if (
      typeof timeString === "string" &&
      timeString.match(/^\d{1,2}:\d{2}:\d{2}$/)
    ) {
      // Retornar solo HH:MM
      return timeString.substring(0, 5);
    }

    // Si es un timestamp completo, intentar parsearlo
    try {
      return new Date(timeString).toLocaleTimeString("es-PE", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "America/Lima",
      });
    } catch {
      return timeString;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("es-PE", {
        timeZone: "America/Lima",
      });
    } catch {
      return dateString;
    }
  };

  const formatNumber = (value: number) => {
    if (value === null || value === undefined) return "-";
    return typeof value === "number" ? value.toLocaleString() : value;
  };

  const formatZonasVisitadas = (zonasString: string) => {
    if (!zonasString || zonasString.trim() === "") return "-";
    return zonasString;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Reportes - Resumen de Rutas</h1>
            <p className="text-muted-foreground">
              Dashboard principal con métricas de rutas y performance
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={showInfoDialog} onOpenChange={setShowInfoDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Info className="h-4 w-4 mr-2" />
                Ayuda Métricas
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Guía de Métricas Operacionales
                </DialogTitle>
                <DialogDescription>
                  Comprende el significado y utilidad de cada métrica del
                  dashboard
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Cumplimiento Temporal */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                      Cumplimiento Temporal
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p>
                        <strong>¿Qué mide?</strong> El porcentaje de viajes que
                        tienen horarios completos registrados (salida y llegada
                        al CD).
                      </p>
                      <p>
                        <strong>¿Por qué es importante?</strong> Indica la
                        disciplina operacional y calidad de los datos del
                        sistema.
                      </p>
                      <p>
                        <strong>Cálculo:</strong> (Viajes con horarios completos
                        ÷ Total de viajes) × 100
                      </p>
                      <p>
                        <strong>Meta:</strong> 90% - Un valor alto indica buena
                        organización y control operacional.
                      </p>
                      <p>
                        <strong>Interpretación:</strong>
                      </p>
                      <ul className="list-disc list-inside ml-4 space-y-1">
                        <li>90-100%: Excelente control operacional</li>
                        <li>70-89%: Bueno, pero puede mejorar el registro</li>
                        <li>
                          &lt;70%: Necesita mejorar disciplina de registro
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Utilización de Flota */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Truck className="h-5 w-5 text-green-600" />
                      Utilización de Flota
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p>
                        <strong>¿Qué mide?</strong> El porcentaje de vehículos
                        activos que realmente trabajaron en el día.
                      </p>
                      <p>
                        <strong>¿Por qué es importante?</strong> Mide la
                        eficiencia en el uso de los activos de la empresa.
                      </p>
                      <p>
                        <strong>Cálculo:</strong> (Vehículos que trabajaron ÷
                        Total vehículos activos) × 100
                      </p>
                      <p>
                        <strong>Meta:</strong> 75% - Balance entre
                        disponibilidad y utilización.
                      </p>
                      <p>
                        <strong>Interpretación:</strong>
                      </p>
                      <ul className="list-disc list-inside ml-4 space-y-1">
                        <li>75-90%: Utilización óptima</li>
                        <li>60-74%: Aceptable, revisar planificación</li>
                        <li>
                          &lt;60%: Baja utilización, revisar demanda y
                          mantenimiento
                        </li>
                        <li>
                          &gt;90%: Muy alta, considerar más vehículos de reserva
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Eficiencia de Ruta */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                      Eficiencia de Ruta
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p>
                        <strong>¿Qué mide?</strong> Los kilómetros promedio
                        recorridos por cada cliente atendido.
                      </p>
                      <p>
                        <strong>¿Por qué es importante?</strong> Indica qué tan
                        optimizadas están las rutas, afectando costos de
                        combustible y tiempo.
                      </p>
                      <p>
                        <strong>Cálculo:</strong> Distancia total recorrida ÷
                        Número total de clientes atendidos
                      </p>
                      <p>
                        <strong>Meta:</strong> ≤10 km/cliente - Menor valor =
                        mayor eficiencia.
                      </p>
                      <p>
                        <strong>Interpretación:</strong>
                      </p>
                      <ul className="list-disc list-inside ml-4 space-y-1">
                        <li>&lt;8 km/cliente: Excelente optimización</li>
                        <li>8-12 km/cliente: Buena eficiencia</li>
                        <li>
                          12-15 km/cliente: Regular, revisar planificación de
                          rutas
                        </li>
                        <li>
                          &gt;15 km/cliente: Ineficiente, necesita optimización
                          urgente
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Productividad */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5 text-orange-600" />
                      Productividad
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p>
                        <strong>¿Qué mide?</strong> La cantidad de cajas físicas
                        (CF) entregadas por vehículo y clientes atendidos por
                        vehículo.
                      </p>
                      <p>
                        <strong>¿Por qué es importante?</strong> Mide la carga
                        de trabajo y eficiencia operativa de cada unidad.
                      </p>
                      <p>
                        <strong>Cálculo:</strong> Total CF entregadas ÷ Número
                        de vehículos utilizados
                      </p>
                      <p>
                        <strong>Meta:</strong> 40 CF/vehículo - Ajustable según
                        tipo de operación.
                      </p>
                      <p>
                        <strong>Interpretación:</strong>
                      </p>
                      <ul className="list-disc list-inside ml-4 space-y-1">
                        <li>&gt;50 CF/veh: Alta productividad</li>
                        <li>40-50 CF/veh: Productividad objetivo</li>
                        <li>30-39 CF/veh: Por debajo del objetivo</li>
                        <li>
                          &lt;30 CF/veh: Baja productividad, revisar cargas y
                          rutas
                        </li>
                      </ul>
                      <p className="text-sm text-muted-foreground mt-2">
                        <strong>Nota:</strong> También se muestra
                        clientes/vehículo para evaluar la cobertura del
                        servicio.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            onClick={exportarExcel}
            disabled={loading || resumenData.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar Excel
          </Button>
        </div>
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
                onValueChange={(value) =>
                  setFiltros({ ...filtros, tipoReporte: value })
                }
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
                    onChange={(e) =>
                      setFiltros({ ...filtros, fecha: e.target.value })
                    }
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
                    onChange={(e) =>
                      setFiltros({ ...filtros, fechaInicio: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="fechaFin">Fecha Fin</Label>
                  <Input
                    id="fechaFin"
                    type="date"
                    value={filtros.fechaFin}
                    onChange={(e) =>
                      setFiltros({ ...filtros, fechaFin: e.target.value })
                    }
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
                  <p className="text-sm font-medium text-muted-foreground">
                    Cumplimiento Temporal
                  </p>
                  <div className="flex items-center space-x-2">
                    <p className="text-2xl font-bold">
                      {cumplimiento.cumplimiento_temporal.real}%
                    </p>
                    <Badge
                      variant={
                        cumplimiento.cumplimiento_temporal.porcentaje >= 95
                          ? "default"
                          : "destructive"
                      }
                    >
                      {cumplimiento.cumplimiento_temporal.porcentaje.toFixed(0)}
                      %
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Meta: {cumplimiento.cumplimiento_temporal.meta}%
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Utilización Flota
                  </p>
                  <div className="flex items-center space-x-2">
                    <p className="text-2xl font-bold">
                      {cumplimiento.utilizacion_flota.real.toFixed(1)}%
                    </p>
                    <Badge
                      variant={
                        cumplimiento.utilizacion_flota.porcentaje >= 90
                          ? "default"
                          : "secondary"
                      }
                    >
                      {cumplimiento.utilizacion_flota.porcentaje.toFixed(1)}%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Meta: {cumplimiento.utilizacion_flota.meta}%
                  </p>
                </div>
                <Truck className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Eficiencia Ruta
                  </p>
                  <div className="flex items-center space-x-2">
                    <p className="text-2xl font-bold">
                      {cumplimiento.eficiencia_ruta.real} km/cliente
                    </p>
                    <Badge
                      variant={
                        cumplimiento.eficiencia_ruta.porcentaje >= 80
                          ? "default"
                          : "outline"
                      }
                    >
                      {cumplimiento.eficiencia_ruta.porcentaje.toFixed(0)}%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Meta: ≤{cumplimiento.eficiencia_ruta.meta} km/cliente
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Productividad
                  </p>
                  <div className="flex items-center space-x-2">
                    <p className="text-2xl font-bold">
                      {cumplimiento.productividad.cf_por_vehiculo} CF/veh
                    </p>
                    <Badge
                      variant={
                        cumplimiento.productividad.porcentaje_cf >= 100
                          ? "default"
                          : "secondary"
                      }
                    >
                      {cumplimiento.productividad.porcentaje_cf.toFixed(0)}%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {cumplimiento.productividad.clientes_por_vehiculo.toFixed(
                      1,
                    )}{" "}
                    clientes/veh
                  </p>
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
            <CardTitle>
              Resumen de Métricas - {formatDate(metricas.Fecha)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {metricas.Total_Vehiculos}
                </p>
                <p className="text-sm text-muted-foreground">Vehículos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {metricas.Total_Viajes}
                </p>
                <p className="text-sm text-muted-foreground">Viajes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {metricas.Total_Clientes}
                </p>
                <p className="text-sm text-muted-foreground">Clientes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {formatNumber(metricas.Total_Entrega_CF)}
                </p>
                <p className="text-sm text-muted-foreground">Entrega CF</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {formatNumber(metricas.Total_Peso_Kg)} kg
                </p>
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
                    <TableHead className="text-center">Zona</TableHead>
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
                      <TableCell>{formatDate(row.Fecha)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{row.Placa}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {row.Vehiculo}
                      </TableCell>
                      <TableCell>{row.Repartidor}</TableCell>
                      <TableCell className="text-center">
                        {row["Nro de viajes"]}
                      </TableCell>
                      <TableCell className="text-center">
                        {row.Zona || 0}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(row.Distancia)} km
                      </TableCell>
                      <TableCell>{formatTime(row["Salida del CD"])}</TableCell>
                      <TableCell>{formatTime(row["Llegada al CD"])}</TableCell>
                      <TableCell>{formatTime(row.Tiempo)}</TableCell>
                      <TableCell className="text-center">
                        {row["Nro de clientes"]}
                      </TableCell>
                      <TableCell className="text-center">
                        {row["Nro de pedidos"]}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(row["Entrega (CF)"])}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(row["Recojo (CF)"])}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(row["Peso (Kg)"])}
                      </TableCell>
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
