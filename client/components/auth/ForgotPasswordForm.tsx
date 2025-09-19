"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";

interface ForgotPasswordFormProps {
  trigger?: React.ReactNode;
  isDialog?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ForgotPasswordForm({
  trigger,
  isDialog = true,
  onSuccess,
  onCancel,
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const { requestPasswordReset } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (!email) {
      setError("Por favor, ingrese su email");
      setIsSubmitting(false);
      return;
    }

    if (!email.includes("@")) {
      setError("Por favor, ingrese un email válido");
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await requestPasswordReset(email);

      if (result.success) {
        setIsSuccess(true);
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 3000);
        }
      } else {
        setError(result.message || "Error al solicitar restablecimiento");
      }
    } catch {
      setError("Error de conexión con el servidor");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setEmail("");
    setError("");
    setIsSuccess(false);
    setIsSubmitting(false);
  };

  const FormContent = () => (
    <div className="space-y-6">
      {!isSuccess ? (
        <>
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              ¿Olvidaste tu contraseña?
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Ingresa tu email y te enviaremos una nueva contraseña temporal
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="reset-email" className="text-gray-800">
                Email
              </Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="Ingrese su email registrado"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="bg-gray-50 border-gray-300 text-gray-900"
                autoComplete="email"
                required
              />
            </div>

            <div className="flex space-x-3">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              )}
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Enviar Nueva Contraseña
                  </>
                )}
              </Button>
            </div>
          </form>
        </>
      ) : (
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              ¡Solicitud Enviada!
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Si el email <strong>{email}</strong> está registrado en nuestro sistema,
              recibirás una nueva contraseña temporal en unos minutos.
            </p>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p><strong>Importante:</strong></p>
                <ul className="text-sm list-disc list-inside space-y-1">
                  <li>Revisa también tu carpeta de spam</li>
                  <li>La contraseña es temporal, cámbiala después de iniciar sesión</li>
                  <li>Si no recibes el email, contacta al administrador</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex-1"
            >
              Enviar a Otro Email
            </Button>
            {onCancel && (
              <Button
                onClick={onCancel}
                className="flex-1"
              >
                Entendido
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );

  if (isDialog) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button variant="link" className="text-blue-600 hover:underline">
              ¿Olvidaste tu contraseña?
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="sr-only">
            <DialogTitle>Recuperar Contraseña</DialogTitle>
            <DialogDescription>
              Solicitar nueva contraseña temporal
            </DialogDescription>
          </DialogHeader>
          <FormContent />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Recuperar Contraseña</CardTitle>
        <CardDescription>
          Solicitar nueva contraseña temporal
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FormContent />
      </CardContent>
    </Card>
  );
}
