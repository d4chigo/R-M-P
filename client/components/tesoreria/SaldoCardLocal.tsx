"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import Cookies from 'js-cookie';
import { getTodayLimaYMD } from "@/lib/utils/date-lima";

interface Centro {
  id: number | string;
  nombre: string;
  saldoInicial?: number;
}

export default function SaldoCardLocal({ centro }: { centro: Centro }) {
  const { toast } = useToast();
  // backend may return id_centro instead of id; normalize
  const centroId = (centro as any).id_centro ?? (centro as any).id ?? centro.id;
  const [saldo, setSaldo] = useState<number>(Number((centro as any).saldoInicial ?? 0));
  const [open, setOpen] = useState(false);
  const [monto, setMonto] = useState<string>("");
  const [motivo, setMotivo] = useState<string>("");
  const [tipoGasto, setTipoGasto] = useState<string>("Peaje");
  const [loading, setLoading] = useState(false);

  const API_BASE =
    (typeof window !== "undefined" && (window as any).__env && (window as any).__env.NEXT_PUBLIC_API_URL) ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:4000/api";

  const registrarGasto = async () => {
    const gasto = parseFloat(String(monto));
    if (isNaN(gasto) || gasto <= 0) {
      toast({ title: 'Monto inválido', description: 'Ingrese un monto mayor a 0', variant: 'destructive' });
      return;
    }
    if (gasto > saldo) {
      toast({ title: 'Fondos insuficientes', description: 'El monto supera el saldo disponible', variant: 'destructive' });
      return;
    }

    // Build payload compatible with server.createTesoreria
    const payload = {
      fecha: getTodayLimaYMD(),
      placa: null,
      nombre: `Gasto - ${tipoGasto}`,
      cargo: null,
      categoria: tipoGasto,
      detalle: motivo || `Gasto registrado en ${centro.nombre}`,
      reembolso: null,
      distrito: null,
  id_centro: centroId,
      turno: null,
      encargado: null,
      monto: gasto,
    } as any;

    setLoading(true);
    try {
      const token = Cookies.get('auth_token');
      const res = await fetch(`${API_BASE}/tesoreria`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.ok && json && json.success) {
        // Server will decrement the global TESORERIA_SALDO. We update local card saldo too.
        setSaldo((prev) => Number((prev - gasto).toFixed(2)));
        toast({ title: 'Gasto registrado', description: `S/ ${gasto} registrado en ${centro.nombre}` });
        setOpen(false);
        setMonto("");
        setMotivo("");
  // Notify other components (SaldoCard global, tables, centros list) to refresh
  window.dispatchEvent(new Event('tesoreria:saldo-changed'));
  window.dispatchEvent(new CustomEvent('tesoreria:refresh'));
  window.dispatchEvent(new CustomEvent('centros:refresh'));
      } else {
        toast({ title: 'Error', description: json?.message || 'No se pudo registrar gasto', variant: 'destructive' });
      }
    } catch (e) {
      toast({ title: 'Error', description: 'Error de conexión', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-lg border rounded-2xl">
      <CardHeader>
        <CardTitle>{centro.nombre}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-lg font-semibold mb-4">
          Saldo actual: <span className="text-green-600">S/. {saldo.toFixed(2)}</span>
        </p>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full">Registrar gasto</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Registrar gasto - {centro.nombre}</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-3 mt-3">
              <div>
                <label className="text-xs text-muted-foreground">Tipo de gasto</label>
                <select
                  className="w-full border rounded p-2 text-sm mt-1"
                  value={tipoGasto}
                  onChange={(e) => setTipoGasto(e.target.value)}
                >
                  <option>Peaje</option>
                  <option>Impuesto</option>
                  <option>Gasolina</option>
                  <option>Mantenimiento</option>
                  <option>Otros</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Monto (S/)</label>
                <Input
                  type="number"
                  placeholder="Ej: 100"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Motivo</label>
                <Input
                  type="text"
                  placeholder="Ej: Pago de peaje Panamericana"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={registrarGasto} disabled={loading}>{loading ? 'Guardando...' : 'Guardar gasto'}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
