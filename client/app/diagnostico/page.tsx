"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
  Wifi,
} from "lucide-react";
import Link from "next/link";

// Importar todos los hooks
import { useVehiculos } from "@/hooks/use-vehiculos";

import { useClientes } from "@/hooks/use-clientes";
import { useRutas } from "@/hooks/use-rutas";
import { useUsuarios } from "@/hooks/use-usuarios";
import { useViajes } from "@/hooks/use-viajes";
import { useVisitas } from "@/hooks/use-visitas";
import { useTiposCliente } from "@/hooks/use-tipos-cliente";
import { useZonas } from "@/hooks/use-zonas";

interface ModuleStatus {
  name: string;
  endpoint: string;
  isLoading: boolean;
  error: string | null;
  dataCount: number;
  status: "success" | "error" | "loading" | "warning";
}

export default function DiagnosticoPage() {
  const { usuario, token, isAuthenticated, isLoading: authLoading } = useAuth();
  const [refreshTime, setRefreshTime] = useState<Date>(new Date());
  const [connectivityTest, setConnectivityTest] = useState<any>(null);
  const [testingConnectivity, setTestingConnectivity] = useState(false);

  // Hooks de todos los módulos
  const vehiculos = useVehiculos();

  const clientes = useClientes();
  const rutas = useRutas();
  const usuarios = useUsuarios();
  const viajes = useViajes();
  const visitas = useVisitas();
  const tiposCliente = useTiposCliente();
  const zonas = useZonas();

  const modules: ModuleStatus[] = [
    {
      name: "Vehículos",
      endpoint: "/api/vehiculos",
      isLoading: vehiculos.isLoading,
      error: vehiculos.error,
      dataCount: vehiculos.vehiculos.length,
      status: vehiculos.error
        ? "error"
        : vehiculos.isLoading
          ? "loading"
          : "success",
    },

    {
      name: "Clientes",
      endpoint: "/api/clientes",
      isLoading: clientes.isLoading,
      error: clientes.error,
      dataCount: clientes.clientes.length,
      status: clientes.error
        ? "error"
        : clientes.isLoading
          ? "loading"
          : "success",
    },
    {
      name: "Rutas",
      endpoint: "/api/rutas",
      isLoading: rutas.isLoading,
      error: rutas.error,
      dataCount: rutas.rutas.length,
      status: rutas.error ? "error" : rutas.isLoading ? "loading" : "success",
    },
    {
      name: "Usuarios",
      endpoint: "/api/usuarios",
      isLoading: usuarios.isLoading,
      error: usuarios.error,
      dataCount: usuarios.usuarios.length,
      status: usuarios.error
        ? "error"
        : usuarios.isLoading
          ? "loading"
          : "success",
    },
    {
      name: "Viajes",
      endpoint: "/api/viajes",
      isLoading: viajes.isLoading,
      error: viajes.error,
      dataCount: viajes.viajes.length,
      status: viajes.error ? "error" : viajes.isLoading ? "loading" : "success",
    },
    {
      name: "Visitas",
      endpoint: "/api/visitas",
      isLoading: visitas.isLoading,
      error: visitas.error,
      dataCount: visitas.visitas.length,
      status: visitas.error
        ? "error"
        : visitas.isLoading
          ? "loading"
          : "success",
    },
    {
      name: "Tipos de Cliente",
      endpoint: "/api/tipos-cliente",
      isLoading: tiposCliente.isLoading,
      error: tiposCliente.error,
      dataCount: tiposCliente.tiposCliente.length,
      status: tiposCliente.error
        ? "error"
        : tiposCliente.isLoading
          ? "loading"
          : "success",
    },
    {
      name: "Zonas",
      endpoint: "/api/zonas",
      isLoading: zonas.isLoading,
      error: zonas.error,
      dataCount: zonas.zonas.length,
      status: zonas.error ? "error" : zonas.isLoading ? "loading" : "success",
    },
  ];

  const testConnectivity = async () => {
    setTestingConnectivity(true);
    try {
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
      const response = await fetch(`${API_BASE_URL}/test`);
      const data = await response.json();
      setConnectivityTest(data);
    } catch (error) {
      setConnectivityTest({
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      });
    } finally {
      setTestingConnectivity(false);
    }
  };

  const handleRefresh = () => {
    setRefreshTime(new Date());
    // Refrescar todos los módulos
    vehiculos.refetch();

    clientes.refetch();
    rutas.refetch();
    usuarios.refetch();
    viajes.refetch();
    visitas.refetch();
    tiposCliente.refetch();
    zonas.refetch();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "loading":
        return <Clock className="w-5 h-5 text-blue-500 animate-spin" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Activo
          </Badge>
        );
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      case "loading":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Cargando
          </Badge>
        );
      case "warning":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Advertencia
          </Badge>
        );
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  const successCount = modules.filter((m) => m.status === "success").length;
  const errorCount = modules.filter((m) => m.status === "error").length;
  const loadingCount = modules.filter((m) => m.status === "loading").length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Diagnóstico del Sistema
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Estado de todos los módulos y conexiones API
              </p>
            </div>
          </div>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
        </div>

        {/* Resumen de autenticación */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Estado de Autenticación
              {isAuthenticated ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Estado</p>
                <p className="font-medium">
                  {authLoading
                    ? "Verificando..."
                    : isAuthenticated
                      ? "Autenticado"
                      : "No autenticado"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Usuario</p>
                <p className="font-medium">{usuario?.nombre || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{usuario?.email || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Token</p>
                <p className="font-medium text-xs">
                  {token ? `${token.substring(0, 20)}...` : "Sin token"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test de conectividad */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Test de Conectividad
              <Wifi className="w-5 h-5" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <Button
                onClick={testConnectivity}
                disabled={testingConnectivity}
                variant="outline"
              >
                {testingConnectivity ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Probando...
                  </>
                ) : (
                  <>
                    <Wifi className="w-4 h-4 mr-2" />
                    Probar Conectividad
                  </>
                )}
              </Button>
            </div>

            {connectivityTest && (
              <div className="mt-4 p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {connectivityTest.success ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className="font-medium">
                    {connectivityTest.success
                      ? "Conectividad exitosa"
                      : "Error de conectividad"}
                  </span>
                </div>

                {connectivityTest.success && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-sm">
                    <div>
                      <p>
                        <strong>Base de datos:</strong>{" "}
                        {connectivityTest.database}
                      </p>
                      <p>
                        <strong>Host:</strong> {connectivityTest.host}
                      </p>
                    </div>
                    <div>
                      <p>
                        <strong>Tablas:</strong>{" "}
                        {connectivityTest.tables?.length || 0}
                      </p>
                      <p>
                        <strong>Timestamp:</strong>{" "}
                        {new Date(
                          connectivityTest.timestamp,
                        ).toLocaleTimeString()}
                      </p>
                    </div>
                    {connectivityTest.tableCounts && (
                      <div className="md:col-span-2">
                        <p>
                          <strong>Registros por tabla:</strong>
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                          {Object.entries(connectivityTest.tableCounts).map(
                            ([table, count]) => (
                              <div
                                key={table}
                                className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded"
                              >
                                <div className="font-medium">{table}</div>
                                <div>{(count as number).toString()}</div>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {!connectivityTest.success && (
                  <div className="mt-2 text-sm text-red-600">
                    <p>
                      <strong>Error:</strong> {connectivityTest.error}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumen general */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Módulos Activos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {successCount}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Con Errores</p>
                  <p className="text-2xl font-bold text-red-600">
                    {errorCount}
                  </p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Cargando</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {loadingCount}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Módulos</p>
                  <p className="text-2xl font-bold">{modules.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Estado de módulos */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de Módulos</CardTitle>
            <CardDescription>
              Última actualización: {refreshTime.toLocaleTimeString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {modules.map((module) => (
                <div
                  key={module.name}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(module.status)}
                    <div>
                      <h3 className="font-medium">{module.name}</h3>
                      <p className="text-sm text-gray-500">{module.endpoint}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {module.dataCount} registros
                      </p>
                      {module.error && (
                        <p className="text-xs text-red-500 max-w-xs truncate">
                          {module.error}
                        </p>
                      )}
                    </div>
                    {getStatusBadge(module.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alertas */}
        {errorCount > 0 && (
          <Alert className="mt-6" variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Se detectaron {errorCount} módulo(s) con errores. Revisa la
              conexión con el backend y verifica que todos los endpoints estén
              funcionando correctamente.
            </AlertDescription>
          </Alert>
        )}

        {!isAuthenticated && (
          <Alert className="mt-6" variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              Usuario no autenticado. Algunos módulos pueden no funcionar
              correctamente.{" "}
              <Link href="/login" className="underline">
                Ir a iniciar sesión
              </Link>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
