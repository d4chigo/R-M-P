"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Cookies from "js-cookie";

export function SaldoCard() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [saldo, setSaldo] = useState<number | null>(null);
  const [updatedBy, setUpdatedBy] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
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
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    fetchSaldo();
  }, []);

  useEffect(() => {
    const handler = () => {
      fetchSaldo();
    };
    window.addEventListener("tesoreria:saldo-changed", handler);
    return () =>
      window.removeEventListener("tesoreria:saldo-changed", handler);
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
          description: "El saldo de la tarjeta fue actualizado",
        });
        setSaldo(parseFloat(String(value)));
        setEditing(false);
        try {
          window.dispatchEvent(new Event("tesoreria:saldo-changed"));
        } catch (e) {}
      } else {
        toast({
          title: "Error",
          description: json.message || "No se pudo actualizar saldo",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Error de conexión",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Tarjeta de Tesorería</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">Saldo disponible</div>
            <div className="text-2xl font-semibold">
              {saldo != null
                ? new Intl.NumberFormat("es-PE", {
                    style: "currency",
                    currency: "PEN",
                  }).format(saldo)
                : "Cargando..."}
            </div>
          </div>
          {isAdmin && (
            <div>
              <Button
                size="sm"
                onClick={() => {
                  setValue(Number(saldo ?? 0));
                  setEditing(true);
                }}
              >
                Editar +
              </Button>
            </div>
          )}
        </div>

        {(isAdmin || updatedBy || updatedAt) && (
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            {updatedAt && (
              <div>
                Última actualización:{" "}
                {new Date(updatedAt).toLocaleString("es-PE")}
              </div>
            )}
            {updatedBy && <div>Actualizado por: {updatedBy}</div>}
          </div>
        )}

        {/* Modal */}
        {editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-gray-900 rounded p-6 w-full max-w-md shadow-lg">
              <h3 className="text-lg font-bold mb-4 dark:text-gray-100">
                Editar Saldo
              </h3>
              <div className="mb-4">
                <Input
                  type="number"
                  step="0.01"
                  value={value}
                  onChange={(e) =>
                    setValue(parseFloat(e.target.value) || 0)
                  }
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setEditing(false)}>
                  Cancelar
                </Button>
                <Button onClick={save}>Guardar</Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
