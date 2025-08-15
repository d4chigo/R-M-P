"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Users, TrendingUp, RefreshCw } from "lucide-react";

interface ZonaConEstadisticas {
  id_zona: number;
  codigo: string;
  descripcion: string;
  latitud?: number;
  longitud?: number;
  total_clientes: number;
  clientes_activos: number;
  created_at: string;
  updated_at: string;
}

interface ZonaEstadisticasProps {
  className?: string;
}

export function ZonaEstadisticas({ className }: ZonaEstadisticasProps) {
  const [zonas, setZonas] = useState<ZonaConEstadisticas[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEstadisticas = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // First, try to get auth token from localStorage or session
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');

      if (!token) {
        // If no token, try to login first
        const loginResponse = await fetch("/api/auth/login", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: 'admin@rmp.com',
            password: 'admin123'
          })
        });

        const loginData = await loginResponse.json();

        if (!loginData.success) {
          setError("Error de autenticación: " + (loginData.message || "No se pudo iniciar sesión"));
          return;
        }

        // Store token for future requests
        sessionStorage.setItem('auth_token', loginData.data.token);
      }

      // Now make the authenticated request
      const currentToken = token || sessionStorage.getItem('auth_token');
      const response = await fetch("/api/zonas/estadisticas", {
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        // Token expired or invalid, clear it and try again
        sessionStorage.removeItem('auth_token');
        localStorage.removeItem('auth_token');
        setError("Sesión expirada. Por favor, recarga la página.");
        return;
      }

      const data = await response.json();

      if (data.success) {
        setZonas(data.data);
      } else {
        setError(data.message || "Error al cargar estadísticas");
      }
    } catch (err) {
      console.error("Error fetching estadísticas:", err);
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError("Error de conectividad - Verifica que el servidor esté funcionando");
      } else {
        setError("Error de conexión: " + (err instanceof Error ? err.message : 'Error desconocido'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEstadisticas();
  }, []);

  const totalZonas = zonas.length;
  const totalClientes = zonas.reduce((sum, zona) => sum + zona.total_clientes, 0);
  const totalClientesActivos = zonas.reduce((sum, zona) => sum + zona.clientes_activos, 0);
  const zonasConClientes = zonas.filter(zona => zona.total_clientes > 0).length;

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-red-600">Error al cargar estadísticas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">{error}</p>

            {error.includes("autenticación") && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                <p className="text-yellow-700 dark:text-yellow-400 text-sm">
                  💡 Sugerencia: Intenta hacer login primero en la aplicación principal.
                </p>
              </div>
            )}

            {error.includes("conectividad") && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                <p className="text-blue-700 dark:text-blue-400 text-sm">
                  🔍 Verifica que el servidor backend esté corriendo en http://localhost:4000
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={fetchEstadisticas} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reintentar
              </Button>

              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                size="sm"
                className="text-gray-600"
              >
                Recargar Página
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <MapPin className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{totalZonas}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Zonas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{totalClientes}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Clientes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-8 h-8 text-emerald-600" />
              <div>
                <p className="text-2xl font-bold">{totalClientesActivos}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Clientes Activos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <MapPin className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{zonasConClientes}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Zonas con Clientes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista detallada de zonas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Detalle por Zona</CardTitle>
            <CardDescription>
              Distribución de clientes por zona geográfica
            </CardDescription>
          </div>
          <Button
            onClick={fetchEstadisticas}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Cargando estadísticas...
                </p>
              </div>
            </div>
          ) : zonas.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No hay zonas registradas
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {zonas.map((zona) => (
                <div
                  key={zona.id_zona}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        {zona.codigo}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {zona.descripcion.length > 80
                          ? zona.descripcion.substring(0, 80) + "..."
                          : zona.descripcion}
                      </p>
                      {zona.latitud && zona.longitud && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                          📍 {Number(zona.latitud).toFixed(4)}, {Number(zona.longitud).toFixed(4)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {zona.total_clientes} clientes
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {zona.clientes_activos} activos
                      </p>
                    </div>

                    <div className="flex space-x-2">
                      {zona.total_clientes > 0 ? (
                        <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          Activa
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          Sin clientes
                        </Badge>
                      )}

                      {zona.clientes_activos === zona.total_clientes && zona.total_clientes > 0 && (
                        <Badge variant="default" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                          100% Activos
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ZonaEstadisticas;
