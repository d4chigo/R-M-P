"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SimpleBarChartProps {
  data: Array<{
    label: string;
    value: number;
    color?: string;
  }>;
  title: string;
  maxValue?: number;
}

export function SimpleBarChart({ data, title, maxValue }: SimpleBarChartProps) {
  const calculatedMax = maxValue || Math.max(...data.map(d => d.value));

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{item.label}</span>
                <span>{item.value.toFixed(2)}</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${item.color || 'bg-primary'} transition-all`}
                  style={{
                    width: `${(item.value / calculatedMax) * 100}%`
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}