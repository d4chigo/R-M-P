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
import { ArrowLeft, BarChart3, Download, Filter } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useReportes } from "@/hooks/use-reportes";
import { useToast } from "@/hooks/use-toast";

interface ResumenRuta {
  Fecha: string;
  Placa: string;
  Vehiculo: string;
  Repartidor: string;
  "Nro de viajes": number;
  Zona: number;
  "Zonas Visitadas": string;
  Distancia: number;
  "Salida del CD": string;
  "Llegada al CD": string;
  Tiempo: string;
  "Nro de clientes": number;
  "Nro de pedidos": number;
  "Entrega (CF)": number;
  "Recojo (CF)": number;
  "Peso (Kg)": number;
}

export default function ResumenRutasPage() {
  const { loading, getResumenRutas, getResumenRutasRango } = useReportes();
  const { toast } = useToast();

  const [filtroFecha, setFiltroFecha] = useState(new Date().toISOString().split("T")[0]);
  const [filtroPlaca, setFiltroPlaca] = useState("");
  const [filtroFechaFin, setFiltroFechaFin] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState<"dia" | "rango">("dia");
  const [resumenRutas, setResumenRutas] = useState<ResumenRuta[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setIsLoadingData(true);
    try {
      const datos = await getResumenRutas(filtroFecha);
      setResumenRutas(datos);
    } catch (error) {
      console.error("Error cargando datos:", error);
      toast({
        title: "Error",
        description: "Error al cargar los datos",
        variant: "destructive",
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleFiltrar = async () => {
    if (tipoFiltro === "dia") {
      if (!filtroFecha) {
        toast({
          title: "Error",
          description: "Selecciona una fecha",
          variant: "destructive",
        });
        return;
      }
      setIsLoadingData(true);
      try {
        const datos = await getResumenRutas(filtroFecha);
        setResumenRutas(datos);
        toast({
          title: "Datos actualizados",
          description: `Resumen cargado para ${formatDate(filtroFecha)}`,
        });
      } catch (error) {
        console.error("Error filtrando por día:", error);
        toast({
          title: "Error",
          description: "Error al cargar los datos",
          variant: "destructive",
        });
      } finally {
        setIsLoadingData(false);
      }
    } else {
      handleFiltrarPorRango();
    }
  };

  const handleFiltrarPorRango = async () => {
    if (!filtroFecha || !filtroFechaFin) {
      toast({
        title: "Error",
        description: "Selecciona ambas fechas",
        variant: "destructive",
      });
      return;
    }

    if (new Date(filtroFecha) > new Date(filtroFechaFin)) {
      toast({
        title: "Error",
        description: "La fecha de inicio debe ser anterior a la fecha fin",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingData(true);
    try {
      const datos = await getResumenRutasRango(filtroFecha, filtroFechaFin);
      setResumenRutas(datos);
      toast({
        title: "Datos actualizados",
        description: `Resumen cargado del ${formatDate(filtroFecha)} al ${formatDate(filtroFechaFin)}`,
      });
    } catch (error) {
      console.error("Error filtrando por rango:", error);
      toast({
        title: "Error",
        description: "Error al cargar los datos del rango",
        variant: "destructive",
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const rutasFiltradas = resumenRutas.filter((ruta) => {
    const matchPlaca =
      !filtroPlaca ||
      ruta.Placa.toLowerCase().includes(filtroPlaca.toLowerCase());
    return matchPlaca;
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return "";

    // Backend now consistently sends dates in YYYY-MM-DD format
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split("-");
      return `${day}/${month}/${year}`;
    }

    // Fallback for any other format (shouldn't happen with current backend)
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return "-";
    if (typeof timeString === "string" && timeString.match(/^\d{1,2}:\d{2}:\d{2}$/)) {
      return timeString.substring(0, 5);
    }
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

  const formatNumber = (value: number) => {
    if (value === null || value === undefined) return "-";
    return typeof value === "number" ? value.toLocaleString() : value;
  };



  const exportarExcel = () => {
    if (rutasFiltradas.length === 0) {
      toast({
        title: "No hay datos",
        description: "No hay datos para exportar",
        variant: "destructive",
      });
      return;
    }

    const headers = [
      "Fecha",
      "Placa",
      "Vehículo",
      "Repartidor",
      "Nro de viajes",
      "Zona/Territorio",
      "Distancia (km)",
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
      ...rutasFiltradas.map((row) =>
        [
          formatDate(row.Fecha),
          row.Placa,
          `"${row.Vehiculo}"`,
          `"${row.Repartidor}"`,
          row["Nro de viajes"],
          `"${row.Zona || row["Zonas Visitadas"] || "-"}"`,
          row.Distancia,
          formatTime(row["Salida del CD"]),
          formatTime(row["Llegada al CD"]),
          formatTime(row.Tiempo),
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
    const fileName = tipoFiltro === "dia"
      ? `resumen_rutas_${filtroFecha}.csv`
      : `resumen_rutas_${filtroFecha}_${filtroFechaFin}.csv`;
    link.download = fileName;
    link.click();

    toast({
      title: "Exportación exitosa",
      description: `Se exportaron ${rutasFiltradas.length} registros`,
    });
  };

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
              <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Resumen de Rutas
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Análisis completo de rutas - {tipoFiltro === "dia" ? formatDate(filtroFecha) : `${formatDate(filtroFecha)} - ${formatDate(filtroFechaFin)}`}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button onClick={exportarExcel} disabled={loading || rutasFiltradas.length === 0}>
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <Label htmlFor="tipo-filtro" className="dark:text-gray-300">
                  Tipo de Filtro
                </Label>
                <select
                  id="tipo-filtro"
                  value={tipoFiltro}
                  onChange={(e) => setTipoFiltro(e.target.value as "dia" | "rango")}
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                >
                  <option value="dia">Por Día</option>
                  <option value="rango">Por Rango</option>
                </select>
              </div>
              <div>
                <Label htmlFor="filtro-fecha" className="dark:text-gray-300">
                  {tipoFiltro === "dia" ? "Fecha" : "Fecha Inicio"}
                </Label>
                <Input
                  id="filtro-fecha"
                  type="date"
                  value={filtroFecha}
                  onChange={(e) => setFiltroFecha(e.target.value)}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                />
              </div>
              {tipoFiltro === "rango" && (
                <div>
                  <Label htmlFor="filtro-fecha-fin" className="dark:text-gray-300">
                    Fecha Fin
                  </Label>
                  <Input
                    id="filtro-fecha-fin"
                    type="date"
                    value={filtroFechaFin}
                    onChange={(e) => setFiltroFechaFin(e.target.value)}
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  />
                </div>
              )}
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
              <div className="flex items-end gap-2">
                <Button
                  onClick={handleFiltrar}
                  disabled={loading || isLoadingData}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoadingData ? "Cargando..." : "Filtrar"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setFiltroFecha(new Date().toISOString().split("T")[0]);
                    setFiltroPlaca("");
                    setFiltroFechaFin("");
                  }}
                  className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Limpiar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumen de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {rutasFiltradas.reduce((sum, ruta) => sum + (ruta["Nro de viajes"] || 0), 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Total Viajes
              </div>
            </CardContent>
          </Card>
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {rutasFiltradas.reduce(
                  (sum, ruta) => sum + (ruta["Nro de clientes"] || 0),
                  0,
                )}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Total Clientes
              </div>
            </CardContent>
          </Card>
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">
                {rutasFiltradas
                  .reduce((sum, ruta) => sum + (ruta.Distancia || 0), 0)
                  .toFixed(1)}{" "}
                km
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Distancia Total
              </div>
            </CardContent>
          </Card>
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">
                {rutasFiltradas
                  .reduce((sum, ruta) => sum + (ruta["Peso (Kg)"] || 0), 0)
                  .toLocaleString()}{" "}
                kg
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Peso Total
              </div>
            </CardContent>
          </Card>
        </div>
</parameter>

<old_text line=250>
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-gray-100">
              Resumen Detallado de Rutas
            </CardTitle>
            <CardDescription className="dark:text-gray-300">
              {rutasFiltradas.length} registro
              {rutasFiltradas.length !== 1 ? "s" : ""} encontrado
              {rutasFiltradas.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-gray-100">
              Resumen Detallado de Rutas
            </CardTitle>
            <CardDescription className="dark:text-gray-300">
              {rutasFiltradas.length} registro
              {rutasFiltradas.length !== 1 ? "s" : ""} encontrado
              {rutasFiltradas.length !== 1 ? "s" : ""}
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
                      Vehículo
                    </TableHead>
                    <TableHead className="dark:text-gray-300">
                      Repartidor
                    </TableHead>
                    <TableHead className="dark:text-gray-300">
                      Nro Viajes
                    </TableHead>
                    <TableHead className="dark:text-gray-300">
                      Territorio
                    </TableHead>
                    <TableHead className="dark:text-gray-300">
                      Distancia
                    </TableHead>
                    <TableHead className="dark:text-gray-300">
                      Salida CD
                    </TableHead>
                    <TableHead className="dark:text-gray-300">
                      Llegada CD
                    </TableHead>
                    <TableHead className="dark:text-gray-300">Tiempo</TableHead>
                    <TableHead className="dark:text-gray-300">
                      Nro Clientes
                    </TableHead>
                    <TableHead className="dark:text-gray-300">
                      Nro Pedidos
                    </TableHead>
                    <TableHead className="dark:text-gray-300">
                      Entrega (CF)
                    </TableHead>
                    <TableHead className="dark:text-gray-300">
                      Recojo (CF)
                    </TableHead>
                    <TableHead className="dark:text-gray-300">
                      Peso (Kg)
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(loading || isLoadingData) ? (
                    <TableRow>
                      <TableCell colSpan={15} className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                        <p className="mt-2">Cargando datos...</p>
                      </TableCell>
                    </TableRow>
                  ) : rutasFiltradas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={15} className="text-center py-8">
                        <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          No se encontraron datos para el período seleccionado
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {tipoFiltro === "dia"
                            ? `Fecha consultada: ${formatDate(filtroFecha)}`
                            : `Rango consultado: ${formatDate(filtroFecha)} - ${formatDate(filtroFechaFin)}`
                          }
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    rutasFiltradas.map((ruta, index) => (
                      <TableRow
                        key={index}
                        className="dark:border-gray-700 dark:hover:bg-gray-800"
                      >
                        <TableCell className="dark:text-gray-300">
                          {formatDate(ruta.Fecha)}
                        </TableCell>
                        <TableCell className="font-semibold dark:text-gray-100">
                          {ruta.Placa}
                        </TableCell>
                        <TableCell className="dark:text-gray-300">
                          {ruta.Vehiculo}
                        </TableCell>
                        <TableCell className="dark:text-gray-300">
                          {ruta.Repartidor}
                        </TableCell>
                        <TableCell className="text-center dark:text-gray-300">
                          {ruta["Nro de viajes"]}
                        </TableCell>
                        <TableCell className="dark:text-gray-300">
                          {ruta.Zona || ruta["Zonas Visitadas"] || "-"}
                        </TableCell>
                        <TableCell className="dark:text-gray-300">
                          {formatNumber(ruta.Distancia)} km
                        </TableCell>
                        <TableCell className="dark:text-gray-300">
                          {formatTime(ruta["Salida del CD"])}
                        </TableCell>
                        <TableCell className="dark:text-gray-300">
                          {formatTime(ruta["Llegada al CD"])}
                        </TableCell>
                        <TableCell className="dark:text-gray-300">
                          {formatTime(ruta.Tiempo)}
                        </TableCell>
                        <TableCell className="text-center dark:text-gray-300">
                          {ruta["Nro de clientes"]}
                        </TableCell>
                        <TableCell className="text-center dark:text-gray-300">
                          {ruta["Nro de pedidos"]}
                        </TableCell>
                        <TableCell className="text-green-600 dark:text-green-400 font-medium">
                          {formatNumber(ruta["Entrega (CF)"])}
                        </TableCell>
                        <TableCell className="text-blue-600 dark:text-blue-400 font-medium">
                          {formatNumber(ruta["Recojo (CF)"])}
                        </TableCell>
                        <TableCell className="font-medium dark:text-gray-300">
                          {formatNumber(ruta["Peso (Kg)"])}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
