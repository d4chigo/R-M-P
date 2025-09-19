"use client";
import { useSearchParams } from "next/navigation";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
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