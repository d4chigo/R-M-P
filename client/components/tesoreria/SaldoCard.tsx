"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Cookies from "js-cookie";
import { Wallet, Edit, Plus, Eye, Info } from "lucide-react";

interface CentroSaldo {
  id_centro: number;
  nombre_centro: string;
  saldo: number;
  codigo?: string;
  ciudad?: string;
  updated_at?: string;
  updated_by_nombre?: string;
}

export function SaldoCard() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [saldoTotal, setSaldoTotal] = useState<number | null>(null);
  const [centrosSaldos, setCentrosSaldos] = useState<CentroSaldo[]>([]);
  const [tableOpen, setTableOpen] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [selectedCentro, setSelectedCentro] = useState<CentroSaldo | null>(
    null,
  );
  const [mode, setMode] = useState<"set" | "add">("set");
  const [value, setValue] = useState(0);
  const [motivo, setMotivo] = useState("");

  const API_BASE =
    (typeof window !== "undefined" &&
      (window as any).__env &&
      (window as any).__env.NEXT_PUBLIC_API_URL) ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:4000/api";

  const fetchSaldos = async () => {
    try {
      const token = Cookies.get("auth_token");

      const res = await fetch(`${API_BASE}/tesoreria/saldo/por-centro`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      const json = await res.json();

      if (json && json.success) {
        const centros = json.data || [];
        setCentrosSaldos(centros);
        const total = centros.reduce(
          (acc: number, c: CentroSaldo) =>
            acc + parseFloat(String(c.saldo || 0)),
          0,
        );
        setSaldoTotal(total);
      } else {
        console.error("Error en respuesta:", json);
        toast({
          title: "Error",
          description: json.message || "No se pudieron cargar los saldos",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching saldos:", error);
      toast({
        title: "Error",
        description: "Error al cargar los saldos de los centros",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchSaldos();
  }, []);

  useEffect(() => {
    const handler = () => fetchSaldos();
    window.addEventListener("tesoreria:saldo-changed", handler);
    return () => window.removeEventListener("tesoreria:saldo-changed", handler);
  }, []);

  const handleOpenEdit = (centro: CentroSaldo, editMode: "set" | "add") => {
    setSelectedCentro(centro);
    setMode(editMode);
    setValue(editMode === "set" ? centro.saldo : 0);
    setMotivo("");
    setEditOpen(true);
  };

  const handleOpenInfo = (centro: CentroSaldo) => {
    setSelectedCentro(centro);
    setInfoOpen(true);
  };

  const saveSaldo = async () => {
    if (!selectedCentro) return;

    try {
      const token = Cookies.get("auth_token");
      if (!motivo || !motivo.trim()) {
        toast({
          title: "Motivo requerido",
          description: "Ingrese un motivo para el ajuste del saldo",
          variant: "destructive",
        });
        return;
      }

      if (value <= 0) {
        toast({
          title: "Valor inválido",
          description: "El valor debe ser mayor a 0",
          variant: "destructive",
        });
        return;
      }

      let res, json;

      if (mode === "set") {
        if (value > selectedCentro.saldo) {
          toast({
            title: "Acción no permitida",
            description: "Para aumentar el saldo use el botón Agregar",
            variant: "destructive",
          });
          return;
        }

        res = await fetch(
          `${API_BASE}/tesoreria/saldo/por-centro/${selectedCentro.id_centro}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
            body: JSON.stringify({
              saldo: parseFloat(String(value)),
              motivo: String(motivo).trim(),
            }),
          },
        );
      } else {
        res = await fetch(
          `${API_BASE}/tesoreria/saldo/por-centro/${selectedCentro.id_centro}/incrementar`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
            body: JSON.stringify({
              monto: parseFloat(String(value)),
              motivo: String(motivo).trim(),
            }),
          },
        );
      }

      json = await res.json();
      if (json && json.success) {
        toast({
          title: mode === "set" ? "Saldo establecido" : "Dinero agregado",
          description:
            mode === "set"
              ? `Saldo de ${selectedCentro.nombre_centro} establecido correctamente`
              : `Se agregaron S/ ${value} al saldo de ${selectedCentro.nombre_centro}`,
        });
        setEditOpen(false);
        setMotivo("");
        setValue(0);
        setSelectedCentro(null);
        fetchSaldos();
        window.dispatchEvent(new Event("tesoreria:saldo-changed"));
      } else {
        toast({
          title: "Error",
          description: json.message || "No se pudo actualizar saldo",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving saldo:", error);
      toast({
        title: "Error",
        description: "Error de conexión",
        variant: "destructive",
      });
    }
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("es-PE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "N/A";
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
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setTableOpen(true);
              setTableLoading(true);
              fetchSaldos().finally(() => setTableLoading(false));
            }}
            title="Ver montos por centro de distribución"
          >
            <Eye className="h-4 w-4 text-slate-600" />
            Ver
          </Button>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-xs text-muted-foreground">
                Saldo total disponible
              </p>
              <p className="text-xl font-bold text-emerald-700">
                {saldoTotal != null
                  ? new Intl.NumberFormat("es-PE", {
                      style: "currency",
                      currency: "PEN",
                    }).format(saldoTotal)
                  : "Cargando..."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal con tabla de centros */}
      <Dialog open={tableOpen} onOpenChange={setTableOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Montos por Centro de Distribución</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            {tableLoading ? (
              <p className="text-center py-8">Cargando...</p>
            ) : centrosSaldos && centrosSaldos.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">
                      Centro de Distribución
                    </TableHead>
                    <TableHead className="w-[30%] text-right">Monto</TableHead>
                    <TableHead className="w-[30%] text-center">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {centrosSaldos.map((centro) => (
                    <TableRow key={centro.id_centro}>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {centro.nombre_centro}
                          </p>
                          {centro.codigo && (
                            <p className="text-xs text-gray-500">
                              Código: {centro.codigo}
                            </p>
                          )}
                          {centro.ciudad && (
                            <p className="text-xs text-gray-500">
                              {centro.ciudad}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-lg font-bold text-emerald-700">
                          S/ {parseFloat(String(centro.saldo || 0)).toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-center">
                          {isAdmin && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenEdit(centro, "add")}
                                title="Agregar dinero"
                                className="h-8 px-3"
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Agregar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenEdit(centro, "set")}
                                title="Editar monto"
                                className="h-8 px-3"
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Editar
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenInfo(centro)}
                            title="Ver información de actualización"
                            className="h-8 px-3"
                          >
                            <Info className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                No hay datos disponibles.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de información de actualización */}
      <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Información de Actualización</DialogTitle>
          </DialogHeader>
          {selectedCentro && (
            <div className="space-y-3">
              <div className="bg-gray-50 dark:bg-background p-3 rounded border border-gray-200 dark:border-border">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Centro:</p>
                <p className="text-base font-semibold dark:text-foreground">
                  {selectedCentro.nombre_centro}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-background p-3 rounded border border-gray-200 dark:border-border">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Saldo actual:
                </p>
                <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                  {new Intl.NumberFormat("es-PE", {
                    style: "currency",
                    currency: "PEN",
                  }).format(selectedCentro.saldo)}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-background p-3 rounded border border-gray-200 dark:border-border">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Última actualización:
                </p>
                <p className="text-base dark:text-foreground">
                  {formatDateTime(selectedCentro.updated_at)}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-background p-3 rounded border border-gray-200 dark:border-border">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Actualizado por:
                </p>
                <p className="text-base dark:text-foreground">
                  {selectedCentro.updated_by_nombre || "Sistema"}
                </p>
              </div>
              <div className="flex justify-end pt-2">
                <Button
                  size="sm"
                  onClick={() => {
                    setInfoOpen(false);
                    setSelectedCentro(null);
                  }}
                >
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de edición/adición de saldo */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {mode === "set" ? "Establecer Saldo" : "Agregar Dinero"}
            </DialogTitle>
            {selectedCentro && (
              <p className="text-sm text-muted-foreground mt-1">
                Centro:{" "}
                <span className="font-medium">
                  {selectedCentro.nombre_centro}
                </span>
              </p>
            )}
          </DialogHeader>
          <div className="space-y-3">
            {selectedCentro && (
              <div className="text-sm text-muted-foreground bg-gray-50 p-3 rounded">
                <span className="font-medium">Saldo actual:</span>{" "}
                {new Intl.NumberFormat("es-PE", {
                  style: "currency",
                  currency: "PEN",
                }).format(selectedCentro.saldo)}
              </div>
            )}
            <div>
              <label className="text-sm font-medium mb-1 block">
                {mode === "set" ? "Nuevo saldo total" : "Cantidad a agregar"}
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={value}
                onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
                placeholder={
                  mode === "set" ? "Nuevo saldo total" : "Cantidad a agregar"
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                Motivo (requerido)
              </label>
              <Input
                placeholder={
                  mode === "set"
                    ? "Motivo para establecer saldo"
                    : "Motivo para agregar dinero"
                }
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
              />
            </div>
            {mode === "add" && value > 0 && selectedCentro && (
              <div className="text-sm text-green-600 bg-green-50 p-3 rounded">
                <span className="font-medium">Nuevo saldo será:</span>{" "}
                {new Intl.NumberFormat("es-PE", {
                  style: "currency",
                  currency: "PEN",
                }).format(selectedCentro.saldo + value)}
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditOpen(false);
                  setSelectedCentro(null);
                  setValue(0);
                  setMotivo("");
                }}
              >
                Cancelar
              </Button>
              <Button size="sm" onClick={saveSaldo}>
                {mode === "set" ? "Establecer" : "Agregar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
