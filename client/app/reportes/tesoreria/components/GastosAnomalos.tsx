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
    const montoTotal = typeof item.Monto_Total === 'number' ? item.Monto_Total : parseFloat(item.Monto_Total as any) || 0;
    const montoPromedio = typeof item.Monto_Promedio === 'number' ? item.Monto_Promedio : parseFloat(item.Monto_Promedio as any) || 0;
    const diferenciaPorcentual = montoPromedio !== 0 ? ((montoTotal - montoPromedio) / montoPromedio) * 100 : 0;
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
        {anomalias.map((anomalia, index) => {
          const montoTotal = typeof anomalia.Monto_Total === 'number' ? anomalia.Monto_Total : parseFloat(anomalia.Monto_Total as any) || 0;
          const montoPromedio = typeof anomalia.Monto_Promedio === 'number' ? anomalia.Monto_Promedio : parseFloat(anomalia.Monto_Promedio as any) || 0;
          return (
            <Alert key={index} variant="warning">
              <AlertTitle>
                {anomalia.categoria || anomalia.nombre}
              </AlertTitle>
              <AlertDescription>
                Monto actual (S/{montoTotal.toFixed(2)}) supera significativamente
                el promedio histórico (S/{montoPromedio.toFixed(2)})
              </AlertDescription>
            </Alert>
          );
        })}
      </CardContent>
    </Card>
  );
}