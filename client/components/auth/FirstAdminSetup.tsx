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
import { Progress } from "@/components/ui/progress";
import {
  Shield,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Crown,
} from "lucide-react";

interface FormData {
  password: string;
  confirmPassword: string;
  nombre_completo: string;
  email: string;
  telefono: string;
}

interface FormErrors {
  username?: string;
  password?: string;
  confirmPassword?: string;
  nombre_completo?: string;
  email?: string;
  telefono?: string;
}

export default function FirstAdminSetup() {
  const [formData, setFormData] = useState<FormData>({
    password: "",
    confirmPassword: "",
    nombre_completo: "",
    email: "",
    telefono: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);

  const { checkAuth } = useAuth();
  const router = useRouter();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

  // Validación en tiempo real
  useEffect(() => {
    validateForm();
  }, [formData]);

  const validateForm = () => {
    const newErrors: FormErrors = {};

    // Validar nombre completo
    if (formData.nombre_completo) {
      const nombres = formData.nombre_completo.split(" ");
      if (nombres.length < 2) {
        newErrors.nombre_completo = "Ingrese al menos un nombre y un apellido";
      }
    }

    // Validar password
    if (formData.password) {
      if (formData.password.length < 6) {
        newErrors.password = "La contraseña debe tener al menos 6 caracteres";
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        newErrors.password = "Debe contener al menos una mayúscula, una minúscula y un número";
      }
    }

    // Validar confirmación de contraseña
    if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    // Validar email
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Formato de email inválido";
      }
    }

    // Validar nombre completo
    if (formData.nombre_completo && formData.nombre_completo.length < 2) {
      newErrors.nombre_completo = "El nombre debe tener al menos 2 caracteres";
    }

    setErrors(newErrors);
  };

  const handleInputChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    setSubmitError("");
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    let strength = 0;

    if (password.length >= 6) strength += 25;
    if (password.length >= 8) strength += 25;
    if (/(?=.*[a-z])(?=.*[A-Z])/.test(password)) strength += 25;
    if (/(?=.*\d)/.test(password)) strength += 25;

    return strength;
  };

  const getPasswordStrengthColor = () => {
    const strength = getPasswordStrength();
    if (strength < 50) return "bg-red-500";
    if (strength < 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    const strength = getPasswordStrength();
    if (strength < 50) return "Débil";
    if (strength < 75) return "Media";
    return "Fuerte";
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.nombre_completo && formData.email && !errors.nombre_completo && !errors.email;
      case 2:
        // Saltamos la validación de username ya que usaremos el email
        return true;
      case 3:
        return formData.password && formData.confirmPassword &&
               !errors.password && !errors.confirmPassword &&
               formData.password === formData.confirmPassword;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (currentStep < 3 && isStepValid(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setIsSubmitting(true);

    // Validación final
    if (Object.keys(errors).length > 0) {
      setSubmitError("Por favor, corrija los errores en el formulario");
      setIsSubmitting(false);
      return;
    }

    if (!formData.username || !formData.password || !formData.nombre_completo || !formData.email) {
      setSubmitError("Por favor, complete todos los campos obligatorios");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/first-admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: formData.nombre_completo.split(" ")[0],
          apellidos: formData.nombre_completo.split(" ").slice(1).join(" "),
          email: formData.email,
          password: formData.password,
          telefono: formData.telefono || null,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        setSubmitError(data.message || "Error al crear el administrador");
      }
    } catch (error) {
      console.error("Error:", error);
      setSubmitError("Error de conexión con el servidor");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  ¡Administrador Creado Exitosamente!
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  El primer administrador ha sido configurado correctamente.
                  Redirigiendo al login...
                </p>
              </div>
              <Progress value={100} className="w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 mb-4">
            <Crown className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl text-gray-900">
            Configuración Inicial del Sistema
          </CardTitle>
          <CardDescription className="text-gray-600">
            Configure el primer administrador para comenzar a usar RMP
          </CardDescription>

          {/* Progress indicator */}
          <div className="flex items-center justify-center space-x-2 mt-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                    step <= currentStep
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div
                    className={`w-12 h-1 ${
                      step < currentStep ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {submitError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            {/* Paso 1: Información Personal */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Información Personal
                  </h3>
                  <p className="text-sm text-gray-600">
                    Datos básicos del administrador
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nombre_completo" className="text-gray-800">
                    Nombre Completo *
                  </Label>
                  <div className="relative">
                    <Input
                      id="nombre_completo"
                      type="text"
                      placeholder="Ingrese su nombre completo"
                      value={formData.nombre_completo}
                      onChange={handleInputChange("nombre_completo")}
                      className={`pl-10 ${errors.nombre_completo ? "border-red-500" : ""}`}
                      required
                    />
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  </div>
                  {errors.nombre_completo && (
                    <p className="text-xs text-red-600">{errors.nombre_completo}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-800">
                    Email *
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@empresa.com"
                      value={formData.email}
                      onChange={handleInputChange("email")}
                      className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                      required
                    />
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-600">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefono" className="text-gray-800">
                    Teléfono (Opcional)
                  </Label>
                  <div className="relative">
                    <Input
                      id="telefono"
                      type="tel"
                      placeholder="+51 999 888 777"
                      value={formData.telefono}
                      onChange={handleInputChange("telefono")}
                      className="pl-10"
                    />
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  </div>
                </div>
              </div>
            )}

            {/* Paso 2: Credenciales de Acceso */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Credenciales de Acceso
                  </h3>
                  <p className="text-sm text-gray-600">
                    Configure su nombre de usuario
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username" className="text-gray-800">
                    Nombre de Usuario *
                  </Label>
                  <div className="relative">
                    <Input
                      id="username"
                      type="text"
                      placeholder="admin"
                      value={formData.username}
                      onChange={handleInputChange("username")}
                      className={`pl-10 ${errors.username ? "border-red-500" : ""}`}
                      required
                    />
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  </div>
                  {errors.username && (
                    <p className="text-xs text-red-600">{errors.username}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Solo letras, números y guiones bajos. Mínimo 3 caracteres.
                  </p>
                </div>
              </div>
            )}

            {/* Paso 3: Contraseña */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Contraseña Segura
                  </h3>
                  <p className="text-sm text-gray-600">
                    Configure una contraseña fuerte para su cuenta
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-800">
                    Contraseña *
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange("password")}
                      className={`pl-10 pr-10 ${errors.password ? "border-red-500" : ""}`}
                      required
                    />
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                  {formData.password && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${getPasswordStrengthColor()}`}
                            style={{ width: `${getPasswordStrength()}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">
                          {getPasswordStrengthText()}
                        </span>
                      </div>
                    </div>
                  )}
                  {errors.password && (
                    <p className="text-xs text-red-600">{errors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-800">
                    Confirmar Contraseña *
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleInputChange("confirmPassword")}
                      className={`pl-10 pr-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
                      required
                    />
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                Anterior
              </Button>

              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!isStepValid(currentStep)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Siguiente
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting || !isStepValid(currentStep)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creando Administrador...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Crear Administrador
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>

          {/* Security notice */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex">
              <Shield className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-semibold text-blue-900">Configuración Segura</p>
                <p className="text-blue-800 mt-1">
                  Esta cuenta tendrá privilegios completos de administrador.
                  Asegúrese de usar credenciales seguras y mantenerlas confidenciales.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
