"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import FirstAdminSetup from "@/components/auth/FirstAdminSetup";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

export default function SetupPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [usersExist, setUsersExist] = useState(false);
  const [error, setError] = useState("");
  const [checkComplete, setCheckComplete] = useState(false);

  const { checkUsersExist, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Si el usuario ya está autenticado, redirigir al dashboard
    if (!authLoading && isAuthenticated) {
      console.log("Usuario autenticado, redirigiendo al dashboard");
      router.push("/");
      return;
    }

    // Verificar si ya existen usuarios en el sistema
    const checkSystemStatus = async () => {
      try {
        console.log("Iniciando verificación del sistema...");
        setIsLoading(true);
        setError("");

        console.log("Llamando a checkUsersExist...");
        const result = await checkUsersExist();
        console.log("Resultado de checkUsersExist:", result);
        setUsersExist(result.usersExist);
        setCheckComplete(true);

        // Si ya existen usuarios, redirigir al login después de un momento
        if (result.usersExist) {
          setTimeout(() => {
            router.push("/login");
          }, 3000);
        }
      } catch (err) {
        console.error("Error verificando estado del sistema:", err);
        setError("Error al verificar el estado del sistema");
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      checkSystemStatus();
    }
  }, [isAuthenticated, authLoading, checkUsersExist, router]);

  // Mostrar loading mientras se verifica autenticación
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
              <p className="text-gray-600">Verificando autenticación...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mostrar loading mientras se verifica el estado del sistema
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
              <p className="text-gray-600">Verificando estado del sistema...</p>
              <p className="text-sm text-gray-500">
                Comprobando si existen usuarios registrados
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mostrar error si hubo problemas
  if (error && !checkComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertCircle className="h-8 w-8 mx-auto text-red-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Error de Conexión
                </h3>
                <p className="text-sm text-gray-600 mt-2">{error}</p>
              </div>
              <Button
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Reintentar
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/login")}
                className="w-full"
              >
                Ir al Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Si ya existen usuarios, mostrar mensaje y redirigir
  if (usersExist && checkComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle className="h-8 w-8 mx-auto text-green-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Sistema Ya Configurado
                </h3>
                <p className="text-sm text-gray-600 mt-2">
                  El sistema ya tiene usuarios registrados.
                  Redirigiendo al login...
                </p>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Si necesita crear el primer administrador nuevamente,
                  contacte al soporte técnico.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Button
                  onClick={() => router.push("/login")}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Ir al Login Ahora
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="w-full"
                >
                  Verificar Nuevamente
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Si no existen usuarios, mostrar el formulario de configuración inicial
  return <FirstAdminSetup />;
}
