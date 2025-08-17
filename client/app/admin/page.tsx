"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import UserManagement from "@/components/admin/UserManagement";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle } from "lucide-react";

export default function AdminPage() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // El useEffect redirigirá al login
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto pt-20">
          <Card>
            <CardContent className="pt-6">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-semibold">Acceso Denegado</p>
                    <p>
                      No tienes permisos de administrador para acceder a esta sección.
                      Solo los usuarios con rol de administrador pueden gestionar usuarios del sistema.
                    </p>
                    <p className="text-sm">
                      Si necesitas acceso de administrador, contacta al administrador del sistema.
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
              <div className="mt-6 text-center">
                <button
                  onClick={() => router.push("/")}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Volver al Dashboard
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header con información de administrador */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center">
              <Shield className="h-8 w-8 mr-3" />
              <div>
                <h1 className="text-2xl font-bold">Panel de Administración</h1>
                <p className="text-blue-100 mt-1">
                  Gestiona usuarios, roles y configuraciones del sistema RMP
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <UserManagement />
      </div>
    </div>
  );
}
