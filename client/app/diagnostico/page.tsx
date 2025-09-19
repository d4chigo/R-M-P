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
  const { isAuthenticated } = useAuth();
  const [refreshTime, setRefreshTime] = useState(new Date());

  // El contenido de la página se ha simplificado para mostrar solo el mensaje de que la
  // herramienta de diagnóstico fue retirada, según el código que proporcionaste.

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold">Diagnóstico (Removido)</h1>
      <p className="mt-2 text-muted-foreground">
        La herramienta de diagnóstico fue retirada. Para análisis y verificación, utiliza los módulos de{" "}
        <strong>Vehículos</strong> y <strong>Viajes</strong>.
      </p>
      <div className="mt-4 flex gap-4">
        <Link href="/vehiculos">Vehículos</Link>
        <Link href="/viajes">Viajes</Link>
      </div>
    </div>
  );
}
