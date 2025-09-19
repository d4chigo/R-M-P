"use client";

import Link from "next/link";

export default function PerformanceVehiculosV2Page() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold">Performance Vehículos (Removido)</h1>
      <p className="mt-2 text-muted-foreground">Este reporte fue removido del proyecto. Si necesitas restaurarlo, revisa el control de versiones.</p>
      <div className="mt-4">
        <Link href="/reportes">Volver a Reportes</Link>
      </div>
    </div>
  );
}
