"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const passwordStrongRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

export default function ForcedChangePasswordPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

  useEffect(() => {
    // If no forced flag, redirect home
    const forced = sessionStorage.getItem("forced_change_user");
    if (!forced) {
      router.push("/");
    }
  }, [router]);

  const validate = () => {
    if (!passwordStrongRegex.test(newPassword)) {
      toast({ title: "Contraseña insegura", description: "La nueva contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo.", variant: "destructive" });
      return false;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "No coinciden", description: "La confirmación no coincide con la nueva contraseña.", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const token = sessionStorage.getItem('auth_token') || null;
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        toast({ title: 'Contraseña actualizada', description: 'Se actualizó la contraseña correctamente.', variant: 'default' });
        sessionStorage.removeItem('forced_change_user');
        router.push('/');
      } else {
        toast({ title: 'Error', description: data.message || 'No se pudo actualizar la contraseña.', variant: 'destructive' });
      }
    } catch (err) {
      console.error('Error cambiando contraseña:', err);
      toast({ title: 'Error de conexión', description: 'No se pudo conectar al servidor.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Cambiar contraseña (obligatorio)</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Contraseña actual</label>
              <Input value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} type="password" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nueva contraseña</label>
              <Input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirmar nueva contraseña</label>
              <Input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" required />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={submitting}>{submitting ? 'Guardando...' : 'Cambiar contraseña'}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
