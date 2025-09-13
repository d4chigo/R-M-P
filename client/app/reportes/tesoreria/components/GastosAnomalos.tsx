"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface GastoAnomaloProps {
  data: Array<{
    categoria?: string;
    nombre?: string;
    Monto_Total: number;
    Monto_Promedio: number;
  }>;
  threshold?: number; // Porcentaje sobre el promedio para considerar anómalo
}

export function GastosAnomalos({ data, threshold = 50 }: GastoAnomaloProps) {
  const anomalias = data.filter(item => {
    const diferenciaPorcentual = ((item.Monto_Total - item.Monto_Promedio) / item.Monto_Promedio) * 100;
    return diferenciaPorcentual > threshold;
  });

  if (anomalias.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          Gastos Atípicos Detectados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {anomalias.map((anomalia, index) => (
          <Alert key={index} variant="warning">
            <AlertTitle>
              {anomalia.categoria || anomalia.nombre}
            </AlertTitle>
            <AlertDescription>
              Monto actual (${anomalia.Monto_Total.toFixed(2)}) supera significativamente
              el promedio histórico (${anomalia.Monto_Promedio.toFixed(2)})
            </AlertDescription>
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
}