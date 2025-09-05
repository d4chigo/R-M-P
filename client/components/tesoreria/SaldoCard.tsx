"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Cookies from "js-cookie";
import { Wallet } from "lucide-react";

export function SaldoCard() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [saldo, setSaldo] = useState<number | null>(null);
  const [updatedBy, setUpdatedBy] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(0);

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
      const res = await fetch(`${API_BASE}/tesoreria/saldo/actual`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ saldo: parseFloat(String(value)) }),
      });
      const json = await res.json();
      if (json && json.success) {
        toast({
          title: "Saldo actualizado",
          description: "El saldo fue actualizado correctamente",
        });
        setSaldo(parseFloat(String(value)));
        setOpen(false);
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
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setValue(Number(saldo ?? 0));
                setOpen(true);
              }}
            >
              Editar
            </Button>
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
            <DialogTitle>Editar Saldo</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              type="number"
              step="0.01"
              value={value}
              onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button size="sm" onClick={save}>
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
