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
import { useViajes } from "@/hooks/use-viajes";
import { useVisitas } from "@/hooks/use-visitas";
import { useTiposCliente } from "@/hooks/use-tipos-cliente";
import { useZonas } from "@/hooks/use-zonas";
import { useRepartidores } from "@/hooks/use-repartidores";

interface ModuleStatus {
  name: string;
  endpoint: string;
  isLoading: boolean;
  error: string | null;
  dataCount: number;
  status: "success" | "error" | "loading" | "warning";
}

export default function DiagnosticoPage() {
  "use client";

  import Link from "next/link";

  export default function DiagnosticoPage() {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold">Diagnóstico (Removido)</h1>
        <p className="mt-2 text-muted-foreground">La herramienta de diagnóstico fue retirada. Para análisis y verificación, utiliza los módulos de <strong>Vehículos</strong> y <strong>Viajes</strong>.</p>
        <div className="mt-4 flex gap-4">
          <Link href="/vehiculos">Vehículos</Link>
          <Link href="/viajes">Viajes</Link>
        </div>
      </div>
    );
  }
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
