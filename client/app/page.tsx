"use client";

import { useState, useEffect, type FC } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Truck,
  MapPin,
  Calendar,
  UserCheck,
  BarChart3,
  TrendingUp,
  Users2,
  Clock,
  Settings,
  DollarSign,
  BookOpen,
  FileText,
  CheckCircle2,
  Warehouse,
} from "lucide-react";
// NOTE: node_modules may not be available in this environment; provide a small local spotlight
// fallback so the tutorial button always funciona. The project already lists react-spotlight-tour,
// but to guarantee behavior we implement a tiny tour here.
import type { FC } from "react";

type TourStepLocal = { selector: string; title: string; description?: string };

const SimpleSpotlightTour: FC<{
  steps: TourStepLocal[];
  isOpen: boolean;
  initialStep?: number;
  onClose: () => void;
  onStepChange?: (s: number) => void;
}> = ({ steps, isOpen, initialStep = 0, onClose, onStepChange }) => {
  const [step, setStep] = useState(initialStep);

  useEffect(() => {
    setStep(initialStep);
  }, [initialStep]);

  if (!isOpen) return null;

  const current = steps[step];
  if (!current) return null;

  // Try to find element
  const el = typeof window !== "undefined" ? document.querySelector(current.selector) as HTMLElement | null : null;

  const next = () => {
    if (step >= steps.length - 1) {
      // last step -> close the tour
      close();
      return;
    }
    const ns = step + 1;
    setStep(ns);
    onStepChange?.(ns);
  };

  const prev = () => {
    const ns = Math.max(0, step - 1);
    setStep(ns);
    onStepChange?.(ns);
  };

  const close = () => {
    onClose();
    setStep(0);
    onStepChange?.(0);
  };

  // Compute position
  const rect = el?.getBoundingClientRect();

  // Highlight target element by applying temporary inline styles and restore on cleanup
  useEffect(() => {
    if (!isOpen) return;
    const target = typeof window !== "undefined" ? document.querySelector(current.selector) as HTMLElement | null : null;
    if (!target) return;

    const original = {
      boxShadow: target.style.boxShadow || "",
      zIndex: target.style.zIndex || "",
      position: target.style.position || "",
      transition: target.style.transition || "",
      background: target.style.background || "",
    };

  // Ensure element is on top and get a visible highlight in dark or light mode
    try {
      if (getComputedStyle(document.documentElement).getPropertyValue("background-color") || document.documentElement.classList.contains("dark")) {
        // dark mode-ish
        target.style.boxShadow = "0 8px 30px rgba(99,102,241,0.45), 0 0 0 3px rgba(99,102,241,0.12)";
      } else {
        target.style.boxShadow = "0 8px 30px rgba(59,130,246,0.25), 0 0 0 3px rgba(59,130,246,0.08)";
      }
  // keep highlight zIndex lower than tooltip container (tooltip container will use zIndex 100000)
  target.style.zIndex = "9990";
      if (getComputedStyle(target).position === "static") target.style.position = "relative";
      target.style.transition = "box-shadow 200ms ease, transform 200ms ease";
    } catch (e) {
      // ignore
    }

    return () => {
      try {
        target.style.boxShadow = original.boxShadow;
        target.style.zIndex = original.zIndex;
        target.style.position = original.position;
        target.style.transition = original.transition;
        target.style.background = original.background;
      } catch (e) {}
    };
  }, [isOpen, step, current.selector]);

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 100000 }}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto" onClick={close} />
      {el && rect ? (
        <div
          style={{ left: rect.left + window.scrollX, top: rect.top + window.scrollY }}
          className="absolute pointer-events-auto"
        >
          <div className="rounded-md border bg-white dark:bg-gray-800 dark:border-gray-700 shadow-lg p-4 max-w-xs">
            <div className="font-semibold text-gray-900 dark:text-gray-100">{current.title}</div>
            {current.description && (
              <div className="text-sm text-gray-600 dark:text-gray-300 mt-2">{current.description}</div>
            )}
            <div className="flex justify-between gap-2 mt-3">
              <button onClick={prev} className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50" disabled={step===0}>Anterior</button>
              <div className="flex gap-2">
                <button onClick={close} className="px-3 py-1 bg-red-100 rounded">Cerrar</button>
                <button onClick={next} className="px-3 py-1 bg-blue-600 text-white rounded">{step === steps.length - 1 ? 'Finalizar' : 'Siguiente'}</button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="fixed bottom-28 right-6 pointer-events-auto">
          <div className="rounded-md border bg-white dark:bg-gray-800 dark:border-gray-700 shadow-lg p-4 max-w-xs">
            <div className="font-semibold text-gray-900 dark:text-gray-100">{current.title}</div>
            {current.description && (
              <div className="text-sm text-gray-600 dark:text-gray-300 mt-2">{current.description}</div>
            )}
            <div className="flex justify-between gap-2 mt-3">
              <button onClick={prev} className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50" disabled={step===0}>Anterior</button>
              <div className="flex gap-2">
                <button onClick={close} className="px-3 py-1 bg-red-100 rounded">Cerrar</button>
                <button onClick={next} className="px-3 py-1 bg-blue-600 text-white rounded">{step === steps.length - 1 ? 'Finalizar' : 'Siguiente'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
import ProtectedRoute from "@/components/ProtectedRoute";

export default function HomePage() {
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Tour steps (local type)
  const tourSteps: TourStepLocal[] = [
    { selector: "#card-vehiculos", title: "Vehículos", description: "Gestión de flota de vehículos." },
    { selector: "#card-repartidores", title: "Repartidores", description: "Gestión de conductores y asignaciones." },
    { selector: "#card-centro-distribucion", title: "Centro de Distribución", description: "Gestión y mapa de centros de distribución." },
    { selector: "#card-viajes", title: "Viajes", description: "Programación y seguimiento de viajes." },
    { selector: "#card-tesoreria", title: "Tesorería", description: "Gestión de ingresos y egresos." },
    { selector: "#card-resumen-rutas", title: "Resumen de Rutas", description: "Reporte principal con métricas de rutas diarias." },
    { selector: "#card-reportes-cumplimiento-vh", title: "Cumplimiento VH", description: "Visitas: ventana horaria, IDR y puntualidad." },
  ];

  const handleNextStep = () => setCurrentStep((s) => s + 1);
  const handlePrevStep = () => setCurrentStep((s) => Math.max(0, s - 1));

  // Tus módulos
  const modules = [
    {
      title: "Vehículos",
      description: "Gestión de flota de vehículos",
      icon: Truck,
      href: "/vehiculos",
      color: "bg-blue-500",
    },
    {
      title: "Repartidores",
      description: "Gestión de conductores y repartidores",
      icon: UserCheck,
      href: "/repartidores",
      color: "bg-green-500",
    },

    {
      title: "Centro de Distribución",
      description: "Gestión de centros de distribución y almacenes",
      icon: Warehouse,
      href: "/centro-distribucion",
      color: "bg-orange-500",
    },
    {
      title: "Viajes",
      description: "Programación y seguimiento de viajes",
      icon: Calendar,
      href: "/viajes",
      color: "bg-indigo-500",
    },
  ];

  const financeModules = [
    {
      title: "Tesorería",
      description: "Gestión de ingresos y egresos",
      icon: DollarSign,
      href: "/tesoreria",
      color: "bg-green-600",
    },
  ];

  // Combine modules so Tesorería appears within Módulos Principales
  const allModules = [...modules, ...financeModules];

  const reportes = [
    {
      title: "Resumen de Rutas",
      description: "Reporte principal con métricas de rutas diarias",
      icon: BarChart3,
      href: "/resumen-rutas",
      color: "bg-emerald-500",
    },
  // Removed: resumen por viaje, performance vehiculos, performance repartidores
    {
      title: "Cumplimiento VH",
      description: "Visitas: ventana horaria, IDR y puntualidad",
      icon: Clock,
      href: "/reportes/cumplimiento-vh",
      color: "bg-violet-500",
    },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-4 sm:py-8">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12 bg-gradient-to-r from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 py-6 sm:py-8">
            <div className="flex justify-center items-center mb-4">
              <span className="text-4xl sm:text-5xl font-bold text-blue-600 mr-2">
                📦
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 inline">
                Sistema R-M-P
              </h1>
            </div>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
              Plataforma de Gestión de Rutas - Sistema integral para la gestión
              de rutas, vehículos y logística
            </p>
          </div>

          {/* header tutorial button removed; use floating button */}

          {/* Spotlight tour */}
          {isTutorialOpen && (
            <SimpleSpotlightTour
              steps={tourSteps}
              isOpen={isTutorialOpen}
              initialStep={currentStep}
              onClose={() => setIsTutorialOpen(false)}
              onStepChange={(s) => setCurrentStep(s)}
            />
          )}

          {/* Módulos Principales */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Módulos de Gestión y Finanzas
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 w-full">
              {allModules.map((module) => {
                const IconComponent = module.icon;
                return (
                  <Link key={module.href} href={module.href}>
                    <Card id={`card-${module.href.replace("/", "").replace("-", "-")}`}
                      className="hover:shadow-lg transition-shadow duration-200 cursor-pointer h-full dark:bg-gray-800 dark:border-gray-700 dark:hover:shadow-gray-700/25">
                      <CardHeader className="text-center pb-4">
                        <div
                          className={`w-16 h-16 ${module.color} rounded-full flex items-center justify-center mx-auto mb-4`}
                        >
                          <IconComponent className="w-8 h-8 text-white" />
                        </div>
                        <CardTitle className="text-lg dark:text-gray-100">
                          {module.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-center dark:text-gray-300">
                          {module.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Tesorería integrado dentro de Módulos Principales */}

          {/* Reportes y Analytics */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Modulos de Reportes y Análisis
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 sm:gap-6">
              {reportes.map((reporte) => {
                const IconComponent = reporte.icon;
                return (
                  <Link key={reporte.href} href={reporte.href}>
                    <Card id={`card-${reporte.href.replace(/\//g, "-").replace(/^-/, "")}`} className="hover:shadow-lg transition-shadow duration-200 cursor-pointer h-full dark:bg-gray-800 dark:border-gray-700 dark:hover:shadow-gray-700/25">
                      <CardHeader className="text-center pb-4">
                        <div
                          className={`w-16 h-16 ${reporte.color} rounded-full flex items-center justify-center mx-auto mb-4`}
                        >
                          <IconComponent className="w-8 h-8 text-white" />
                        </div>
                        <CardTitle className="text-lg dark:text-gray-100">
                          {reporte.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-center dark:text-gray-300">
                          {reporte.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Características del Sistema */}
          <div className="mb-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8 dark:border dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Características Principales
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">📊</div>
                <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Vista Resumen Automática
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Reportes generados automáticamente desde la vista
                  v_resumen_rutas
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">⚡</div>
                <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Índices Optimizados
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  15+ índices estratégicos para consultas rápidas
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">🗃️</div>
                <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Procedimientos Almacenados
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  sp_resumen_rutas_fecha y sp_metricas_dia
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  📈
                </div>
                <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Métricas en Tiempo Real
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  KPIs de cumplimiento y performance
                </div>
              </div>
            </div>
          </div>

          {/* Botón flotante de diagnóstico: eliminado */}
          {/* Botón flotante del tutorial (estilo diagnóstico) */}
          <div className="fixed bottom-6 right-6 z-40">
            <button
              aria-label="Abrir tutorial"
              onClick={() => setIsTutorialOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full flex items-center gap-3 shadow-lg"
            >
              <BookOpen className="w-5 h-5" />
              <span className="hidden sm:inline">Iniciar Tutorial</span>
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}