"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Clock,
  Download,
  Filter,
  CheckCircle,
  XCircle,
  Moon,
  Sun,
} from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useReportes } from "@/hooks/use-reportes";
import { useVehiculos } from "@/hooks/use-vehiculos";
import { useViajes } from "@/hooks/use-viajes";
import { useToast } from "@/hooks/use-toast";

interface CumplimientoVH {
  fecha: string;
  placa: string;
  codigo_cliente: string;
  cliente: string;
  open: string;
  close: string;
  arrive: string;
  leave: string;
  idr: string;
  fuera_vh: boolean;
}

export default function CumplimientoVHPage() {
  const [filtroFecha, setFiltroFecha] = useState("");
  const [filtroPlaca, setFiltroPlaca] = useState("");
  const { theme, setTheme } = useTheme();
  const { getCumplimientoVHVisitas, loading: loadingReportes } = useReportes();
  const { vehiculos, fetchVehiculos } = useVehiculos();
  const { fetchViajes } = useViajes();
  const { toast } = useToast();

  const [cumplimientoVH, setCumplimientoVH] = useState<CumplimientoVH[]>([]);
  const [loading, setLoading] = useState(false);

  const cumplimientoFiltrado = cumplimientoVH.filter((item) => {
    const matchFecha = !filtroFecha || item.fecha.includes(filtroFecha);
    const matchPlaca =
      !filtroPlaca ||
      item.placa.toLowerCase().includes(filtroPlaca.toLowerCase());
    return matchFecha && matchPlaca;
  });

  const totalVisitas = cumplimientoFiltrado.length;
  const visitasDentroVH = cumplimientoFiltrado.filter(
    (item) => !item.fuera_vh,
  ).length;
  const visitasFueraVH = cumplimientoFiltrado.filter(
    (item) => item.fuera_vh,
  ).length;
  const porcentajeCumplimiento =
    totalVisitas > 0
      ? ((visitasDentroVH / totalVisitas) * 100).toFixed(1)
      : "0";

  const exportarExcel = () => {
    // Reuse existing CSV export in the other report or keep simple
    alert("Exportando a Excel... (usa Exportar CSV en la vista de visitas si necesita un CSV real)");
  };

  const formatTimeSafe = (v?: string | null) => {
    if (!v) return "-";
    if (/^\d{2}:\d{2}(:\d{2})?$/.test(v)) return v.slice(0, 5);
    try {
      const dt = new Date(v);
      const hh = dt.getHours().toString().padStart(2, "0");
      const mm = dt.getMinutes().toString().padStart(2, "0");
      return `${hh}:${mm}`;
    } catch {
      return v;
    }
  };

  const cargar = async () => {
    try {
      setLoading(true);
      // Ensure vehiculos/viajes are loaded for suggestions (best-effort)
      try {
        await fetchVehiculos();
        await fetchViajes();
      } catch {}

      const args: any = {};
      if (filtroFecha) args.fecha = filtroFecha;
      if (filtroPlaca) args.placa = filtroPlaca.trim();

      const rows = await getCumplimientoVHVisitas(args);
      const mapped: CumplimientoVH[] = (rows || []).map((r: any) => ({
        fecha: r.Fecha || r.fecha || "",
        placa: r.Placa || r.placa || r.vehiculo_placa || "",
        codigo_cliente: r.Codigo_Cliente || r.codigo_cliente || r.codigo || "",
        cliente: r.Cliente || r.cliente || r.repartidor_nombre || "",
        open: formatTimeSafe(r.OpenDT || r.Open || r.open),
        close: formatTimeSafe(r.CloseDT || r.Close || r.close),
        arrive: formatTimeSafe(r.ArriveDT || r.Arrive || r.arrive),
        leave: formatTimeSafe(r.LeaveDT || r.Leave || r.leave),
        idr: r.IDR_Min != null ? String(r.IDR_Min) : r.IDR || r.idr || "",
        fuera_vh: r.Fuera_VH === 1 || r.Fuera_VH === true || r.fuera_vh === true || false,
      }));

      setCumplimientoVH(mapped);
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "No se pudieron cargar las visitas", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial load (today)
    const hoy = new Date().toISOString().split("T")[0];
    setFiltroFecha(hoy);
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button
                variant="outline"
                size="sm"
                className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 bg-transparent"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-500 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Cumplimiento de Ventanas Horarias
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Análisis de cumplimiento de horarios de atención
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>
            <Button
              onClick={exportarExcel}
              className="dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar Excel
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <Card className="mb-6 dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-gray-100">
              <Filter className="w-5 h-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="filtro-fecha" className="dark:text-gray-300">
                  Fecha
                </Label>
                <Input
                  id="filtro-fecha"
                  type="date"
                  value={filtroFecha}
                  onChange={(e) => setFiltroFecha(e.target.value)}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="filtro-placa" className="dark:text-gray-300">
                  Placa
                </Label>
                <Input
                  id="filtro-placa"
                  value={filtroPlaca}
                  onChange={(e) => setFiltroPlaca(e.target.value)}
                  placeholder="Buscar por placa..."
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                />
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFiltroFecha("");
                    setFiltroPlaca("");
                  }}
                  className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Limpiar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Métricas de cumplimiento */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {totalVisitas}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Total Visitas
              </div>
            </CardContent>
          </Card>
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {visitasDentroVH}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Dentro de VH
              </div>
            </CardContent>
          </Card>
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {visitasFueraVH}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Fuera de VH
              </div>
            </CardContent>
          </Card>
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {porcentajeCumplimiento}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                % Cumplimiento
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Indicador visual de cumplimiento */}
        <Card className="mb-6 dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-gray-100">
              Indicador de Cumplimiento General
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full ${
                      Number.parseFloat(porcentajeCumplimiento) >= 90
                        ? "bg-green-500"
                        : Number.parseFloat(porcentajeCumplimiento) >= 70
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }`}
                    style={{ width: `${porcentajeCumplimiento}%` }}
                  />
                </div>
              </div>
              <div className="text-lg font-semibold dark:text-gray-100">
                {porcentajeCumplimiento}% de cumplimiento
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              {Number.parseFloat(porcentajeCumplimiento) >= 90
                ? "Excelente cumplimiento"
                : Number.parseFloat(porcentajeCumplimiento) >= 70
                  ? "Buen cumplimiento, puede mejorar"
                  : "Requiere atención inmediata"}
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-gray-100">
              Detalle de Cumplimiento de Ventanas Horarias
            </CardTitle>
            <CardDescription className="dark:text-gray-300">
              {cumplimientoFiltrado.length} visita
              {cumplimientoFiltrado.length !== 1 ? "s" : ""} encontrada
              {cumplimientoFiltrado.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="dark:border-gray-700">
                    <TableHead className="dark:text-gray-300">Fecha</TableHead>
                    <TableHead className="dark:text-gray-300">Placa</TableHead>
                    <TableHead className="dark:text-gray-300">
                      Código Cliente
                    </TableHead>
                    <TableHead className="dark:text-gray-300">
                      Cliente
                    </TableHead>
                    <TableHead className="dark:text-gray-300">
                      Ventana Horaria
                    </TableHead>
                    <TableHead className="dark:text-gray-300">
                      Horario Real
                    </TableHead>
                    <TableHead className="dark:text-gray-300">IDR</TableHead>
                    <TableHead className="dark:text-gray-300">Estado</TableHead>
                    <TableHead className="dark:text-gray-300">
                      Fuera de VH?
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cumplimientoFiltrado.map((item, index) => (
                    <TableRow
                      key={index}
                      className="dark:border-gray-700 dark:hover:bg-gray-800"
                    >
                      <TableCell className="dark:text-gray-300">
                        {item.fecha && item.fecha.match(/^\d{4}-\d{2}-\d{2}$/)
                          ? (() => {
                              const [year, month, day] = item.fecha.split("-");
                              return `${day}/${month}/${year}`;
                            })()
                          : item.fecha}
                      </TableCell>
                      <TableCell className="font-semibold dark:text-gray-100">
                        {item.placa}
                      </TableCell>
                      <TableCell className="font-mono text-sm dark:text-gray-300">
                        {item.codigo_cliente}
                      </TableCell>
                      <TableCell className="dark:text-gray-300">
                        {item.cliente}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm dark:text-gray-300">
                          <div className="font-medium">
                            {item.open} - {item.close}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm dark:text-gray-300">
                          <div>
                            Llegada:{" "}
                            <span className="font-medium">{item.arrive}</span>
                          </div>
                          <div>
                            Salida:{" "}
                            <span className="font-medium">{item.leave}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs dark:text-gray-300">
                        {item.idr}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {item.fuera_vh ? (
                            <XCircle className="w-5 h-5 text-red-500" />
                          ) : (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          )}
                          <span
                            className={`text-sm font-medium ${
                              item.fuera_vh
                                ? "text-red-600 dark:text-red-400"
                                : "text-green-600 dark:text-green-400"
                            }`}
                          >
                            {item.fuera_vh ? "Incumplido" : "Cumplido"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.fuera_vh
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                              : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          }`}
                        >
                          {item.fuera_vh ? "SÍ" : "NO"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
