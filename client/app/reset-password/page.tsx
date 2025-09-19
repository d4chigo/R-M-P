"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

// Crea un componente que contiene la lógica que usa useSearchParams()
function ResetPasswordPageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  if (!token) {
    return <div className="p-4 text-red-600">Token inválido o faltante.</div>;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <ResetPasswordForm token={token} />
    </div>
  );
}

// Envuelve el componente de arriba en un Suspense Boundary
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ResetPasswordPageContent />
    </Suspense>
  );
}
