"use client";

import { ResponsiveContainer, BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GastosChartProps {
  data: Array<Record<string, any>>;
  type: 'categoria' | 'persona';
  title: string;
}

export function GastosChart({ data, type, title }: GastosChartProps) {
  const chartData = data.map(item => {
    // Normalizar clave del nombre (varias vistas usan mayúsculas)
    const name = (type === 'categoria'
      ? (item.categoria ?? item.Categoria ?? item.Categoría ?? item.Categoria ?? 'N/A')
      : (item.nombre ?? item.Nombre ?? item.Persona ?? item.persona ?? 'N/A')
    );

    const monto = Number(item.Monto_Total ?? item.monto ?? 0) || 0;
    const cantidad = Number(item.Cantidad_Registros ?? item.Cantidad ?? 0) || 0;

    return { name, monto, cantidad };
  });

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
            {/* Mostrar 'cantidad' como línea sobre el gráfico de barras para mejor lectura */}
            <Line yAxisId="right" type="monotone" dataKey="cantidad" name="Cantidad" stroke="#8884d8" dot={{ r: 3 }} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}