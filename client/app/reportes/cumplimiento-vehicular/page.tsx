"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  useCumplimientoVehiculo,
  useCumplimientoDetalle,
  CumplimientoRow,
  CumplimientoDetalleResponse,
} from "@/hooks/use-cumplimiento";

export default function CumplimientoVehicularPage() {
  const { list, loading, error } = useCumplimientoVehiculo();
  const { getDetalle } = useCumplimientoDetalle();

  const [placa, setPlaca] = useState<string>("");
  const [umbralDias, setUmbralDias] = useState<number>(30);
  const [data, setData] = useState<CumplimientoRow[]>([]);
  const [detalle, setDetalle] = useState<CumplimientoDetalleResponse | null>(
    null,
  );
  const [detalleOpen, setDetalleOpen] = useState(false);

  const loadData = async () => {
    const res = await list({ placa: placa || undefined, umbralDias });
    if (res.success && Array.isArray(res.data)) setData(res.data);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totals = useMemo(() => {
    if (!data.length) return null;
    const docsOk = data.reduce((acc, r) => acc + (r.Docs_Vigentes || 0), 0);
    const docsBad = data.reduce((acc, r) => acc + (r.Docs_Vencidos || 0), 0);
    const atRisk = data.filter((r) => r.En_Riesgo_Documentos).length;
    const overdue = data.filter((r) => r.Mantenimiento_Overdue_KM || r.Mantenimiento_Overdue_Dias).length;
    const avgScore = Math.round((data.reduce((a, r) => a + (r.Score_Cumplimiento || 0), 0) / data.length) * 10) / 10;
    return { docsOk, docsBad, atRisk, overdue, avgScore };
  }, [data]);

  const openDetalle = async (placa: string) => {
    const res = await getDetalle(placa, { umbralDias });
    if (res.success && res.data) {
      setDetalle(res.data);
      setDetalleOpen(true);
    }
  };

  const exportCSV = () => {
    const headers = [
      "Placa",
      "Vehiculo",
      "Docs_Vigentes",
      "Docs_Vencidos",
      "Dias_Prox_Venc",
      "Km_para_prox_mant",
      "Dias_para_prox_mant",
      "Cumplimiento_Documentos_Pct",
      "Cumplimiento_Mantenimiento_Pct",
      "Score_Cumplimiento",
    ];
    const rows = data.map((r) => [
      r.Placa,
      r.Vehiculo,
      r.Docs_Vigentes ?? "",
      r.Docs_Vencidos ?? "",
      r.Dias_Prox_Venc ?? "",
      r.Km_para_prox_mant ?? "",
      r.Dias_para_prox_mant ?? "",
      r.Cumplimiento_Documentos_Pct ?? "",
      r.Cumplimiento_Mantenimiento_Pct ?? "",
      r.Score_Cumplimiento ?? "",
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cumplimiento_vehicular.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Métricas de Cumplimiento</h1>
        <div className="flex gap-2">
          <input
            className="border rounded px-3 py-2 text-sm"
            placeholder="Filtrar por placa"
            value={placa}
            onChange={(e) => setPlaca(e.target.value.toUpperCase())}
          />
          <input
            type="number"
            min={0}
            className="border rounded px-3 py-2 w-28 text-sm"
            value={umbralDias}
            onChange={(e) => setUmbralDias(Number(e.target.value))}
          />
          <button
            onClick={loadData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm"
          >
            Aplicar
          </button>
          <button
            onClick={exportCSV}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded text-sm"
            disabled={!data.length}
          >
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        <Card title="Docs Vigentes" value={totals?.docsOk ?? 0} color="bg-emerald-100 text-emerald-700" />
        <Card title="Docs Vencidos" value={totals?.docsBad ?? 0} color="bg-rose-100 text-rose-700" />
        <Card title="Docs por vencer" value={totals?.atRisk ?? 0} color="bg-amber-100 text-amber-800" />
        <Card title="Mant. vencido" value={totals?.overdue ?? 0} color="bg-red-100 text-red-700" />
        <Card title="Score Promedio" value={(totals?.avgScore ?? 0) + "%"} color="bg-indigo-100 text-indigo-700" />
      </div>

      {/* Table */}
      <div className="overflow-auto rounded border bg-white dark:bg-gray-900">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <Th>Placa</Th>
              <Th>Vehículo</Th>
              <Th className="text-center">Docs</Th>
              <Th className="text-center">Próx Doc</Th>
              <Th className="text-center">Mant. Próx</Th>
              <Th className="text-center">Cumpl. Docs</Th>
              <Th className="text-center">Cumpl. Mant.</Th>
              <Th className="text-center">Score</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={9} className="p-4 text-center">Cargando...</td>
              </tr>
            )}
            {!loading && data.length === 0 && (
              <tr>
                <td colSpan={9} className="p-4 text-center">Sin resultados</td>
              </tr>
            )}
            {data.map((r) => (
              <tr key={r.Placa} className="border-t">
                <Td className="font-medium">{r.Placa}</Td>
                <Td>{r.Vehiculo}</Td>
                <Td className="text-center">
                  <Badge color="emerald">{r.Docs_Vigentes ?? 0} OK</Badge>{" "}
                  <Badge color="rose">{r.Docs_Vencidos ?? 0} Venc</Badge>
                </Td>
                <Td className="text-center">
                  {r.Dias_Prox_Venc != null ? (
                    <span className={
                      r.Dias_Prox_Venc < 0
                        ? "text-rose-600 font-semibold"
                        : r.En_Riesgo_Documentos
                        ? "text-amber-600 font-semibold"
                        : "text-gray-700"
                    }>
                      {r.Dias_Prox_Venc} días
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </Td>
                <Td className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <span className={
                      r.Km_para_prox_mant != null && r.Km_para_prox_mant < 0 ? "text-rose-600 font-semibold" : "text-gray-700"
                    }>
                      {r.Km_para_prox_mant != null ? `${r.Km_para_prox_mant} km` : "—"}
                    </span>
                    <span className={
                      r.Dias_para_prox_mant != null && r.Dias_para_prox_mant < 0 ? "text-rose-600 font-semibold" : "text-gray-700"
                    }>
                      {r.Dias_para_prox_mant != null ? `${r.Dias_para_prox_mant} d` : "—"}
                    </span>
                  </div>
                </Td>
                <Td className="text-center">{r.Cumplimiento_Documentos_Pct != null ? `${r.Cumplimiento_Documentos_Pct}%` : "—"}</Td>
                <Td className="text-center">{r.Cumplimiento_Mantenimiento_Pct != null ? `${r.Cumplimiento_Mantenimiento_Pct}%` : "—"}</Td>
                <Td className="text-center font-semibold">{r.Score_Cumplimiento != null ? `${r.Score_Cumplimiento}%` : "—"}</Td>
                <Td className="text-right pr-2">
                  <button
                    className="px-2 py-1 text-sm border rounded hover:bg-gray-50"
                    onClick={() => openDetalle(r.Placa)}
                  >
                    Ver detalle
                  </button>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detalle Modal */}
      {detalleOpen && detalle && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[85vh] overflow-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Detalle de {detalle.vehiculo.placa} — {detalle.vehiculo.Vehiculo}</h3>
              <button className="text-gray-600 hover:text-gray-900" onClick={() => setDetalleOpen(false)}>✕</button>
            </div>
            <div className="p-4 space-y-6">
              <section>
                <h4 className="font-semibold mb-2">Documentos</h4>
                <div className="overflow-auto border rounded">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <Th>Tipo</Th>
                        <Th>Número</Th>
                        <Th>Emisión</Th>
                        <Th>Vencimiento</Th>
                        <Th>Días</Th>
                        <Th>Estado</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {detalle.documentos.map((d, idx) => (
                        <tr key={idx} className="border-t">
                          <Td className="font-medium">{d.tipo}</Td>
                          <Td>{d.numero || "—"}</Td>
                          <Td>{d.emision || "—"}</Td>
                          <Td>{d.vencimiento || "—"}</Td>
                          <Td>{d.Dias_para_vencer != null ? d.Dias_para_vencer : "—"}</Td>
                          <Td>
                            <span className={
                              d.Estado === "VENCIDO" ? "text-rose-600 font-semibold" :
                              d.Estado === "POR_VENCER" ? "text-amber-700 font-semibold" :
                              d.Estado === "VIGENTE" ? "text-emerald-700 font-semibold" : "text-gray-500"
                            }>
                              {d.Estado}
                            </span>
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h4 className="font-semibold mb-2">Mantenimiento</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <SmallCard label="Últ. Mant. Fecha" value={detalle.mantenimiento.Ult_Mant_Fecha || "—"} />
                  <SmallCard label="Últ. Mant. Odo" value={detalle.mantenimiento.Ult_Mant_Odo ?? "—"} />
                  <SmallCard label="Últ. Odo Reg." value={detalle.mantenimiento.Ult_Odo_Registrado ?? "—"} />
                  <SmallCard label="Intervalo KM" value={detalle.mantenimiento.Intervalo_KM ?? "—"} />
                  <SmallCard label="Intervalo Días" value={detalle.mantenimiento.Intervalo_Dias ?? "—"} />
                  <SmallCard label="KM desde Últ." value={detalle.mantenimiento.Km_desde_ult_mant ?? "—"} />
                  <SmallCard label="Días desde Últ." value={detalle.mantenimiento.Dias_desde_ult_mant ?? "—"} />
                  <SmallCard label="KM para Próx" value={detalle.mantenimiento.Km_para_prox_mant ?? "—"} highlight={detalle.mantenimiento.Overdue_KM === true} />
                  <SmallCard label="Días para Próx" value={detalle.mantenimiento.Dias_para_prox_mant ?? "—"} highlight={detalle.mantenimiento.Overdue_Dias === true} />
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ title, value, color }: { title: string; value: string | number; color: string }) {
  return (
    <div className={`rounded border p-3 ${color}`}>
      <div className="text-xs uppercase tracking-wide opacity-80">{title}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}

function SmallCard({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className={`rounded border p-3 ${highlight ? "bg-rose-50 border-rose-200" : ""}`}>
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className={`text-base font-semibold ${highlight ? "text-rose-700" : ""}`}>{value}</div>
    </div>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`text-left px-3 py-2 font-semibold text-gray-700 ${className}`}>{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-2 ${className}`}>{children}</td>;
}
function Badge({ children, color }: { children: React.ReactNode; color: "emerald" | "rose" | "amber" | "indigo" }) {
  const map: Record<string, string> = {
    emerald: "bg-emerald-100 text-emerald-700",
    rose: "bg-rose-100 text-rose-700",
    amber: "bg-amber-100 text-amber-800",
    indigo: "bg-indigo-100 text-indigo-700",
  };
  return <span className={`inline-block px-2 py-0.5 rounded text-xs ${map[color]}`}>{children}</span>;
}
