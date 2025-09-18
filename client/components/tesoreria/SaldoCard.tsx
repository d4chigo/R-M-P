"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Cookies from "js-cookie";
import { Wallet, Edit, Plus, Eye } from "lucide-react";

export function SaldoCard() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [saldo, setSaldo] = useState<number | null>(null);
  const [updatedBy, setUpdatedBy] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [histOpen, setHistOpen] = useState(false);
  const [histLoading, setHistLoading] = useState(false);
  const [histData, setHistData] = useState<any | null>(null);
  const [mode, setMode] = useState<'set' | 'add'>('set'); // 'set' para establecer, 'add' para agregar
  const [value, setValue] = useState(0);
  const [motivo, setMotivo] = useState("");

  const API_BASE =
    (typeof window !== "undefined" &&
      (window as any).__env &&
      (window as any).__env.NEXT_PUBLIC_API_URL) ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:4000/api";

  const fetchSaldo = async () => {
    try {
      const res = await fetch(`${API_BASE}/tesoreria/saldo/actual`);
      const json = await res.json();
      if (json && json.success) {
        setSaldo(parseFloat(json.data?.saldo || 0));
        setUpdatedBy(json.data?.updated_by_nombre || null);
        setUpdatedAt(json.data?.updated_at || null);
      }
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    fetchSaldo();
  }, []);

  useEffect(() => {
    const handler = () => fetchSaldo();
    window.addEventListener("tesoreria:saldo-changed", handler);
    return () => window.removeEventListener("tesoreria:saldo-changed", handler);
  }, []);

  const save = async () => {
    try {
      const token = Cookies.get("auth_token");
      if (!motivo || !motivo.trim()) {
        toast({ title: "Motivo requerido", description: "Ingrese un motivo para el ajuste del saldo", variant: "destructive" });
        return;
      }

      let res, json;
      
      if (mode === 'set') {
        // Establecer saldo específico (funcionalidad original)
        res = await fetch(`${API_BASE}/tesoreria/saldo/actual`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ saldo: parseFloat(String(value)), motivo: String(motivo).trim() }),
        });
      } else {
        // Agregar dinero al saldo existente (incremento)
        res = await fetch(`${API_BASE}/tesoreria/saldo/ajustes`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ 
            tipo: 'incremento', 
            monto: parseFloat(String(value)), 
            motivo: String(motivo).trim() 
          }),
        });
      }
      
      json = await res.json();
      if (json && json.success) {
        toast({
          title: mode === 'set' ? "Saldo establecido" : "Dinero agregado",
          description: mode === 'set' 
            ? "El saldo fue establecido correctamente"
            : `Se agregaron S/ ${value} al saldo disponible`,
        });
        if (mode === 'set') {
          setSaldo(parseFloat(String(value)));
        } else {
          // Para incremento, actualizar el saldo con el nuevo valor del servidor
          setSaldo(json.data?.saldo || saldo);
        }
        setOpen(false);
        setMotivo("");
        setValue(0);
        window.dispatchEvent(new Event("tesoreria:saldo-changed"));
      } else {
        toast({
          title: "Error",
          description: json.message || "No se pudo actualizar saldo",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Error de conexión",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card className="w-full max-w-md shadow-sm rounded-lg">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Wallet className="h-5 w-5 text-emerald-600" />
            Tesorería
          </CardTitle>
          {isAdmin && (
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={async () => {
                  setHistOpen(true);
                  setHistLoading(true);
                  try {
                    const res = await fetch(`${API_BASE}/tesoreria/saldo/historial`);
                    const json = await res.json();
                    if (json && json.success) setHistData(json.data);
                  } catch (e) {
                    // ignore
                  } finally {
                    setHistLoading(false);
                  }
                }}
                title="Ver historial diario"
              >
                <Eye className="h-4 w-4 text-slate-600" />
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setMode('add');
                  setValue(0);
                  setOpen(true);
                }}
                className="text-emerald-600 hover:text-emerald-700"
              >
                <Plus className="h-3 w-3 mr-1" />
                Agregar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setMode('set');
                  setValue(Number(saldo ?? 0));
                  setOpen(true);
                }}
              >
                <Edit className="h-3 w-3 mr-1" />
                Editar
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Saldo disponible</p>
              <p className="text-xl font-bold text-emerald-700">
                {saldo != null
                  ? new Intl.NumberFormat("es-PE", {
                      style: "currency",
                      currency: "PEN",
                    }).format(saldo)
                  : "Cargando..."}
              </p>
            </div>
          </div>

          {(isAdmin || updatedBy || updatedAt) && (
            <div className="mt-2 text-xs text-muted-foreground space-y-1">
              {updatedAt && (
                <div>
                  Última actualización: {new Date(updatedAt).toLocaleString("es-PE")}
                </div>
              )}
              {updatedBy && <div>Actualizado por: {updatedBy}</div>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal flotante de edición */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {mode === 'set' ? 'Establecer Saldo' : 'Agregar Dinero'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {mode === 'add' && saldo != null && (
              <div className="text-sm text-muted-foreground bg-gray-50 p-2 rounded">
                <span className="font-medium">Saldo actual:</span>{" "}
                {new Intl.NumberFormat("es-PE", {
                  style: "currency",
                  currency: "PEN",
                }).format(saldo)}
              </div>
            )}
            <Input
              type="number"
              step="0.01"
              min="0"
              value={value}
              onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
              placeholder={mode === 'set' ? 'Nuevo saldo total' : 'Cantidad a agregar'}
            />
            <Input
              placeholder={mode === 'set' 
                ? "Motivo para establecer saldo (requerido)" 
                : "Motivo para agregar dinero (requerido)"}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
            />
            {mode === 'add' && value > 0 && saldo != null && (
              <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                <span className="font-medium">Nuevo saldo será:</span>{" "}
                {new Intl.NumberFormat("es-PE", {
                  style: "currency",
                  currency: "PEN",
                }).format(saldo + value)}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button size="sm" onClick={save}>
                {mode === 'set' ? 'Establecer' : 'Agregar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Historial diario modal */}
      <Dialog open={histOpen} onOpenChange={setHistOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Historial diario de Tesorería</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {histLoading && <div>Cargando historial...</div>}
            {!histLoading && histData && (
              <div>
                <div className="mb-2 font-medium">Fecha: {histData.fecha}</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold">Movimientos</h4>
                    <ul className="mt-2 space-y-2">
                      {histData.movimientos.length === 0 && <li className="text-sm text-muted-foreground">Sin movimientos</li>}
                      {histData.movimientos.map((m: any) => (
                        <li key={m.id} className="text-sm">
                          <div className="font-medium">{m.nombre} — {m.categoria} — S/ {Number(m.monto).toFixed(2)}</div>
                          <div className="text-xs text-muted-foreground">Creado: {new Date(m.created_at).toLocaleString()}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold">Ajustes</h4>
                    <ul className="mt-2 space-y-2">
                      {histData.ajustes.length === 0 && <li className="text-sm text-muted-foreground">Sin ajustes</li>}
                      {histData.ajustes.map((a: any) => (
                        <li key={a.id} className="text-sm">
                          <div className="font-medium">{a.tipo} — S/ {Number(a.monto).toFixed(2)}</div>
                          <div className="text-xs text-muted-foreground">Motivo: {a.motivo}</div>
                        </li>
                      ))}
                    </ul>
                    <h4 className="mt-4 font-semibold">Auditoría</h4>
                    <ul className="mt-2 space-y-2 text-xs text-muted-foreground">
                      {histData.audits.length === 0 && <li>Sin eventos de auditoría</li>}
                      {histData.audits.map((ev: any) => (
                        <li key={ev.id}>
                          <div>{new Date(ev.fecha_evento).toLocaleString()} — {ev.evento} — {ev.entidad} — {ev.entity_id}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            {!histLoading && !histData && <div>No se pudo cargar el historial</div>}
            <div className="flex justify-end mt-4">
              <Button size="sm" variant="ghost" onClick={() => setHistOpen(false)}>Cerrar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
