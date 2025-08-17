"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Truck, AlertCircle, User } from "lucide-react";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkingUsers, setCheckingUsers] = useState(true);

  const { login, isAuthenticated, isLoading, checkUsersExist } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  // Verificar si existen usuarios al cargar la página
  useEffect(() => {
    const checkSystemUsers = async () => {
      try {
        const result = await checkUsersExist();
        if (!result.usersExist) {
          // Si no hay usuarios, redirigir al setup
          router.push("/setup");
        }
      } catch (error) {
        console.error("Error verificando usuarios:", error);
        // En caso de error, continuar con el login normal
      } finally {
        setCheckingUsers(false);
      }
    };

    if (!isLoading && !isAuthenticated) {
      checkSystemUsers();
    } else {
      setCheckingUsers(false);
    }
  }, [isLoading, isAuthenticated, checkUsersExist, router]);

  if (isLoading || checkingUsers) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700">
            {isLoading ? "Cargando..." : "Verificando sistema..."}
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (!email || !password) {
      setError("Por favor, complete todos los campos");
      setIsSubmitting(false);
      return;
    }

    if (!email.includes("@")) {
      setError("Por favor, ingrese un email válido");
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await login(email, password);
      if (result.success) {
        router.push("/");
      } else {
        setError(result.message || "Error en el login");
      }
    } catch {
      setError("Error de conexión con el servidor");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-gray-100">
      {/* Columna Izquierda */}
      <div className="flex flex-col justify-center items-center px-4 lg:px-12">
        <div className="w-full max-w-md">
          <Card className="bg-white border border-gray-300 shadow-lg">
            <CardHeader className="text-center">
              <img
                src="/logo_empresa.png"
                alt="Logo Empresa"
                className="mx-auto h-16 w-auto object-contain mb-3"
              />
              <CardTitle className="text-2xl text-gray-900">
                Iniciar Sesión
              </CardTitle>
              <CardDescription className="text-gray-600">
                Ingrese sus credenciales para acceder al sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-800">
                    Email
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="Ingrese su email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSubmitting}
                      className="bg-gray-50 border-gray-300 text-gray-900 pl-10"
                      autoComplete="email"
                      required
                    />
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  </div>
                  <p className="text-xs text-gray-500">
                    Credenciales de prueba: admin@rmp.com / demo@rmp.com
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-800">
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isSubmitting}
                      className="bg-gray-50 border-gray-300 text-gray-900 pr-10"
                      autoComplete="current-password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isSubmitting}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Contraseñas de prueba: admin123 / demo123
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Iniciando sesión...
                    </>
                  ) : (
                    "Iniciar Sesión"
                  )}
                </Button>
              </form>

              <div className="mt-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 text-sm mb-2">
                    Credenciales de Prueba:
                  </h4>
                  <div className="space-y-1 text-xs text-blue-800">
                    <p>
                      <strong>Administrador:</strong> admin@rmp.com / admin123
                    </p>
                    <p>
                      <strong>Usuario Demo:</strong> demo@rmp.com / demo123
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <ForgotPasswordForm
                  trigger={
                    <span className="text-blue-600 cursor-pointer hover:underline text-sm">
                      ¿Olvidaste tu contraseña?
                    </span>
                  }
                />
                <p className="text-sm text-gray-600 mt-2">
                  ¿Otros problemas para acceder?{" "}
                  <span className="text-blue-600 cursor-pointer hover:underline">
                    Contacte al administrador
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Columna Derecha - Imagen */}
      <div className="hidden lg:block relative">
        <img
          src="/imagen_login.jpg"
          alt="Imagen decorativa"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      </div>
    </div>
  );
}
