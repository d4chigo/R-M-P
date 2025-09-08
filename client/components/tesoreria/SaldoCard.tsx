"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Cookies from "js-cookie";
import { Wallet, Edit, Plus } from "lucide-react";

export function SaldoCard() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [saldo, setSaldo] = useState<number | null>(null);
  const [updatedBy, setUpdatedBy] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
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
    </>
  );
}
