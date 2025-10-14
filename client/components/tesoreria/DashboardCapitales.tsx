"use client";

import React, { useEffect, useState } from "react";
import SaldoCardLocal from "./SaldoCardLocal";
import { useToast } from "@/hooks/use-toast";

const DashboardCapitales = () => {
  const { toast } = useToast();
  const [centros, setCentros] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const API_BASE =
    (typeof window !== "undefined" && (window as any).__env && (window as any).__env.NEXT_PUBLIC_API_URL) ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:4000/api";

  const fetchCentros = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/centros-distribucion`);
      const json = await res.json();
      if (json && json.success) {
        setCentros(json.data || []);
      } else {
        toast({ title: 'Error', description: json?.message || 'No se pudieron cargar centros', variant: 'destructive' });
      }
    } catch (e) {
      toast({ title: 'Error', description: 'Error cargando centros', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCentros();
    const handler = () => fetchCentros();
    window.addEventListener('centros:refresh', handler);
    return () => window.removeEventListener('centros:refresh', handler);
  }, []);

  if (loading) return <div>Cargando centros...</div>;

  return (
    <div className="p-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {centros.map((centro) => (
        // centro can have id_centro from backend; SaldoCardLocal will normalize
        <SaldoCardLocal key={centro.id_centro ?? centro.id} centro={centro} />
      ))}
    </div>
  );
};

export default DashboardCapitales;
