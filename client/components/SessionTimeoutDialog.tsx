"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  timeoutMs?: number; // inactividad total antes de logout
  warningMs?: number; // tiempo antes de timeout para mostrar advertencia
  onLogout: () => void;
}

export default function SessionTimeoutDialog({ timeoutMs = 3600000, warningMs = 10000, onLogout }: Props) {
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    const update = () => setLastActivity(Date.now());
    const events = ["mousemove", "keydown", "mousedown", "touchstart", "scroll"];
    events.forEach(e => window.addEventListener(e, update));
    return () => events.forEach(e => window.removeEventListener(e, update));
  }, []);

  useEffect(() => {
    const checkInterval = setInterval(() => {
      const idle = Date.now() - lastActivity;
      const timeToTimeout = timeoutMs - idle;
      if (timeToTimeout <= warningMs && timeToTimeout > 0) {
        if (!showWarning) setShowWarning(true);
      }
      if (timeToTimeout <= 0) {
        // logout inmediatamente
        onLogout();
      }
    }, 1000);
    return () => clearInterval(checkInterval);
  }, [lastActivity, timeoutMs, warningMs, onLogout, showWarning]);

  useEffect(() => {
    let countdownTimer: NodeJS.Timeout | null = null;
    if (showWarning) {
      setCountdown(30);
      countdownTimer = setInterval(() => {
        setCountdown(c => {
          if (c <= 1) {
            // finalizar sesión
            onLogout();
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    }
    return () => {
      if (countdownTimer) clearInterval(countdownTimer);
    };
  }, [showWarning, onLogout]);

  if (!showWarning) return null;

  return (
    <Dialog open={showWarning} onOpenChange={() => {}}>
      <DialogContent className="max-w-lg backdrop-blur-sm bg-white/60">
        <DialogHeader>
          <DialogTitle>Su sesión expirará pronto</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <p className="mb-3">Por inactividad, su sesión se cerrará en <strong>{countdown} segundos</strong>.</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              // reset activity by dispatching an event
              window.dispatchEvent(new Event('user-activity'));
              setShowWarning(false);
            }}>Cancelar</Button>
            <Button onClick={() => onLogout()} className="bg-red-600">Cerrar ahora</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
