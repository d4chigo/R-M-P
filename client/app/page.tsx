"use client";

import { useState } from "react";
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
import ProtectedRoute from "@/components/ProtectedRoute";

export default function HomePage() {
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Tutorial
  const tutorialSteps = [
    {
      title: "Bienvenido al Sistema R-M-P ",
      description:
        "Esta es la página principal del Sistema de Gestión de Rutas. Aquí encontrarás acceso a todos los módulos y reportes para gestionar tu operación logística. Vamos a explorar cada sección paso a paso.",
      icon: <BookOpen className="w-14 h-14 text-blue-500" />,
    },
    {
      title: "Módulos Principales",
      description:
        "Esta sección contiene los módulos principales para gestionar vehículos, repartidores, centros de distribución y viajes. Haz clic en cada tarjeta para acceder a funciones como agregar vehículos, gestionar centros o asignar repartidores.",
      icon: <Truck className="w-14 h-14 text-green-500" />,
    },
    {
      title: "Módulo de Tesorería",
      description:
        "El módulo de Tesorería te permite gestionar los ingresos y egresos de tu operación. Accede a esta sección para controlar los aspectos financieros de la logística.",
      icon: <DollarSign className="w-14 h-14 text-emerald-500" />,
    },
    {
      title: "Reportes y Análisis",
      description:
        "Aquí encontrarás reportes detallados como Resumen de Rutas, Performance de Vehículos y Repartidores, y métricas de cumplimiento. Usa estas herramientas para analizar el rendimiento y tomar decisiones informadas.",
      icon: <BarChart3 className="w-14 h-14 text-indigo-500" />,
    },
    {
      title: "Características Principales",
      description:
        "Esta sección destaca las funcionalidades clave del sistema, como reportes automáticos, índices optimizados, procedimientos almacenados y métricas en tiempo real para un control eficiente.",
      icon: <FileText className="w-14 h-14 text-purple-500" />,
    },
    {
      title: "Diagnóstico del Sistema",
      description:
        "El botón flotante en la esquina inferior derecha te lleva a la herramienta de diagnóstico del sistema, donde puedes verificar el estado y solucionar problemas.",
      icon: <Settings className="w-14 h-14 text-orange-500" />,
    },
    {
      title: "¡Listo para empezar!",
      description:
        "Ahora que conoces las secciones principales, explora cada módulo y utiliza los reportes para optimizar tu operación. ¡Cierra este tutorial y comienza a gestionar tus rutas!",
      icon: <CheckCircle2 className="w-14 h-14 text-green-600" />,
    },
  ];

  const handleNextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsTutorialOpen(false);
      setCurrentStep(0);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

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

          {/* Tutorial Button */}
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setIsTutorialOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 transform hover:scale-105 hover:shadow-md"
            >
              <BookOpen className="w-5 h-5 animate-pulse" />
              Iniciar Tutorial
            </button>
          </div>

          {/* Tutorial Modal Pro */}
          {isTutorialOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
              <div className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-3xl shadow-2xl w-full max-w-xl mx-4 p-8 animate-scaleUp">
                
                {/* Icono principal */}
                <div className="flex justify-center mb-6">
                  <div className="p-4 rounded-full bg-white dark:bg-gray-800 shadow-lg">
                    {tutorialSteps[currentStep].icon}
                  </div>
                </div>

                {/* Título */}
                <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-3">
                  {tutorialSteps[currentStep].title}
                </h2>

                {/* Descripción */}
                <p className="text-gray-600 dark:text-gray-300 text-center mb-8 leading-relaxed">
                  {tutorialSteps[currentStep].description}
                </p>

                {/* Progreso circular */}
                <div className="flex justify-center mb-8">
                  <div className="relative w-20 h-20">
                    <svg className="w-20 h-20 transform -rotate-90">
                      <circle
                        cx="40"
                        cy="40"
                        r="36"
                        stroke="currentColor"
                        strokeWidth="6"
                        className="text-gray-300 dark:text-gray-700"
                        fill="transparent"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="36"
                        stroke="url(#gradient)"
                        strokeWidth="6"
                        strokeDasharray={2 * Math.PI * 36}
                        strokeDashoffset={
                          2 * Math.PI * 36 -
                          (progress / 100) * (2 * Math.PI * 36)
                        }
                        className="transition-all duration-500"
                        fill="transparent"
                      />
                      <defs>
                        <linearGradient
                          id="gradient"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="0%"
                        >
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#6366f1" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center font-semibold text-gray-800 dark:text-white">
                      {currentStep + 1}/{tutorialSteps.length}
                    </span>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex justify-between">
                  <button
                    onClick={handlePrevStep}
                    disabled={currentStep === 0}
                    className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                      currentStep === 0
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 shadow"
                    }`}
                  >
                    ← Anterior
                  </button>

                  <button
                    onClick={handleNextStep}
                    className="px-6 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-90 shadow-lg transition-all"
                  >
                    {currentStep === tutorialSteps.length - 1
                      ? "Finalizar"
                      : "Siguiente →"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Módulos Principales */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Módulos Principales
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
              {modules.map((module) => {
                const IconComponent = module.icon;
                return (
                  <Link key={module.href} href={module.href}>
                    <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer h-full dark:bg-gray-800 dark:border-gray-700 dark:hover:shadow-gray-700/25">
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

          {/* Módulo de Tesorería */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Módulo de Tesorería
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
              {financeModules.map((module) => {
                const IconComponent = module.icon;
                return (
                  <Link key={module.href} href={module.href}>
                    <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer h-full dark:bg-gray-800 dark:border-gray-700 dark:hover:shadow-gray-700/25">
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

          {/* Reportes y Analytics */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Reportes y Análisis
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
              {reportes.map((reporte) => {
                const IconComponent = reporte.icon;
                return (
                  <Link key={reporte.href} href={reporte.href}>
                    <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer h-full dark:bg-gray-800 dark:border-gray-700 dark:hover:shadow-gray-700/25">
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
        </div>
      </div>
    </ProtectedRoute>
  );
}