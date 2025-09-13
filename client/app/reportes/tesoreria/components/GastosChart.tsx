"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GastosChartProps {
  data: Array<{
    categoria?: string;
    nombre?: string;
    Monto_Total: number;
    Cantidad_Registros: number;
  }>;
  type: 'categoria' | 'persona';
  title: string;
}

export function GastosChart({ data, type, title }: GastosChartProps) {
  const chartData = data.map(item => ({
    name: item[type === 'categoria' ? 'categoria' : 'nombre'] || 'N/A',
    monto: item.Monto_Total,
    cantidad: item.Cantidad_Registros
  }));

  return (
    <Card className="w-full h-[400px]">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" orientation="left" stroke="#82ca9d" />
            <YAxis yAxisId="right" orientation="right" stroke="#8884d8" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="monto" name="Monto Total" fill="#82ca9d" />
            <Bar yAxisId="right" dataKey="cantidad" name="Cantidad" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}