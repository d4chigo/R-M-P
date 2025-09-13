"use client";

import { useState, useEffect } from "react";
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
  CheckCircle2,
  Warehouse,
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useTutorial } from "@/contexts/TutorialContext";

export default function HomePage() {
  const { hasSeenTutorial, startTutorial } = useTutorial();

  // Configuración del tutorial principal
  const mainTutorialConfig = {
    id: 'main-dashboard-tutorial',
    title: 'Tutorial del Dashboard Principal',
    description: 'Aprende a navegar por los módulos principales del sistema R-M-P',
    showProgress: true,
    allowSkip: true,
    steps: [
      {
        id: 'vehiculos',
        selector: '#card-vehiculos',
        title: 'Gestión de Vehículos',
        description: 'Aquí puedes administrar toda tu flota de vehículos, registrar nuevos vehículos, ver su estado y asignar conductores.',
        position: 'bottom' as const,
      },
      {
        id: 'repartidores',
        selector: '#card-repartidores',
        title: 'Gestión de Repartidores',
        description: 'Gestiona a tus conductores y repartidores, asigna vehículos y controla sus horarios de trabajo.',
        position: 'bottom' as const,
      },
      {
        id: 'centro-distribucion',
        selector: '#card-centro-distribucion',
        title: 'Centro de Distribución',
        description: 'Administra tus centros de distribución y almacenes, visualiza el mapa de ubicaciones y gestiona inventarios.',
        position: 'bottom' as const,
      },
      {
        id: 'viajes',
        selector: '#card-viajes',
        title: 'Programación de Viajes',
        description: 'Planifica y programa viajes, asigna rutas a vehículos y realiza seguimiento en tiempo real.',
        position: 'bottom' as const,
      },
      {
        id: 'tesoreria',
        selector: '#card-tesoreria',
        title: 'Tesorería',
        description: 'Gestiona los ingresos y egresos de la empresa, controla facturación y pagos.',
        position: 'bottom' as const,
      },
      {
        id: 'resumen-rutas',
        selector: '#card-resumen-rutas',
        title: 'Resumen de Rutas',
        description: 'Visualiza reportes detallados de las rutas diarias, métricas de rendimiento y estadísticas de cumplimiento.',
        position: 'bottom' as const,
      },
      // Cumplimiento VH eliminado
    ],
  };

  // Auto-iniciar tutorial para usuarios nuevos
  useEffect(() => {
    const hasSeenMainTutorial = hasSeenTutorial(mainTutorialConfig.id);
    if (!hasSeenMainTutorial) {
      // Pequeño delay para asegurar que la página esté completamente cargada
      const timer = setTimeout(() => {
        startTutorial(mainTutorialConfig);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []); // Remover dependencias para evitar reinicios

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
    {
      title: "Reportes de Tesorería",
      description: "Análisis de gastos, tendencias y métricas financieras",
      icon: TrendingUp,
      href: "/reportes/tesoreria",
      color: "bg-blue-500",
    },
  // Removed: Cumplimiento VH report (deleted)
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
        </div>
      </div>
    </ProtectedRoute>
  );
}