"use client";

import { TesoreriaTable } from "@/components/tables/tesoreria-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, TrendingDown, Wallet, ArrowLeft } from "lucide-react";
import { useTesoreria } from "@/hooks/use-tesoreria";
import { useEffect, useState } from "react";

export default function TesoreriaPage() {
  const { tesoreria, loading } = useTesoreria();
  const [stats, setStats] = useState({
    totalIngresos: 0,
    totalEgresos: 0,
    balance: 0,
    totalRegistros: 0,
  });

  useEffect(() => {
    // Con el nuevo esquema no existe 'tipo'. Mostramos métricas básicas.
    const totalMonto = tesoreria.reduce((sum, item) => sum + (item.monto || 0), 0);
    setStats({
      totalIngresos: 0,
      totalEgresos: 0,
      balance: totalMonto,
      totalRegistros: tesoreria.length,
    });
  }, [tesoreria]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
    }).format(amount);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.history.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Regresar
          </Button>
          <div>
          <h1 className="text-3xl font-bold tracking-tight">Tesorería</h1>
          <p className="text-muted-foreground">
            Gestión de ingresos y egresos financieros
          </p>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registros</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRegistros}</div>
            <p className="text-xs text-muted-foreground">
              Registros en el sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ingresos</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalIngresos)}
            </div>
            <p className="text-xs text-muted-foreground">
              Ingresos totales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Egresos</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(stats.totalEgresos)}
            </div>
            <p className="text-xs text-muted-foreground">
              Egresos totales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(stats.balance)}
            </div>
            <p className="text-xs text-muted-foreground">
              Balance actual
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de registros */}
      <TesoreriaTable />
    </div>
  );
} 