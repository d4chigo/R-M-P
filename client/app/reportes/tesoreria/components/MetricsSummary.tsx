"use client";
import React from "react";

interface Props {
  summary: any | null;
}

export default function MetricsSummary({ summary }: Props) {
  if (!summary) return null;
  const s = summary;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="p-4 border rounded-lg bg-white/50">
        <div className="text-sm text-muted-foreground">Gasto total</div>
        <div className="text-2xl font-semibold">{Number(s.gasto_total).toLocaleString()}</div>
      </div>
      <div className="p-4 border rounded-lg bg-white/50">
        <div className="text-sm text-muted-foreground">Promedio diario</div>
        <div className="text-2xl font-semibold">{Number(s.promedio_diario).toFixed(2)}</div>
      </div>
      <div className="p-4 border rounded-lg bg-white/50">
        <div className="text-sm text-muted-foreground">Mediana diaria</div>
        <div className="text-2xl font-semibold">{Number(s.mediana_diaria).toFixed(2)}</div>
      </div>
      <div className="p-4 border rounded-lg bg-white/50">
        <div className="text-sm text-muted-foreground">Máx diario</div>
        <div className="text-2xl font-semibold">{Number(s.max_diario).toFixed(2)}</div>
      </div>
      <div className="p-4 border rounded-lg bg-white/50">
        <div className="text-sm text-muted-foreground">Mín diario</div>
        <div className="text-2xl font-semibold">{Number(s.min_diario).toFixed(2)}</div>
      </div>
      <div className="p-4 border rounded-lg bg-white/50">
        <div className="text-sm text-muted-foreground">Días con datos</div>
        <div className="text-2xl font-semibold">{s.count_days}</div>
      </div>
    </div>
  );
}
