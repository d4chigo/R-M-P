"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TendenciaChartProps {
  data: Array<Record<string, any>>;
}

export function TendenciaChart({ data }: TendenciaChartProps) {
  const chartData = data.map(item => ({
    mes: item.Mes,
    monto: Number(item.Monto_Total ?? item.monto ?? 0) || 0,
    cantidad: Number(item.Cantidad_Registros ?? item.Cantidad ?? 0) || 0
  }));

  return (
    <Card className="w-full h-[400px]">
      <CardHeader>
        <CardTitle>Tendencia Mensual de Gastos</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis yAxisId="left" orientation="left" stroke="#82ca9d" />
            <YAxis yAxisId="right" orientation="right" stroke="#8884d8" />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="monto" name="Monto Total" stroke="#82ca9d" />
            <Line yAxisId="right" type="monotone" dataKey="cantidad" name="Cantidad" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}