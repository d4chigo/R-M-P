"use client";

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
  Users,
  MapPin,
  Calendar,
  FileText,
  UserCheck,
  BarChart3,
  TrendingUp,
  Users2,
  Clock,
  Settings,
  Package,
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function HomePage() {
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
      title: "Zonas",
      description: "Gestión de zonas geográficas",
      icon: MapPin,
      href: "/zonas",
      color: "bg-red-500",
    },
    {
      title: "Clientes",
      description: "Gestión de clientes y contactos",
      icon: Users,
      href: "/clientes",
      color: "bg-orange-500",
    },
    {
      title: "Viajes",
      description: "Programación y seguimiento de viajes",
      icon: Calendar,
      href: "/viajes",
      color: "bg-indigo-500",
    },
    {
      title: "Visitas",
      description: "Registro de visitas a clientes",
      icon: FileText,
      href: "/visitas",
      color: "bg-pink-500",
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
    {
      title: "Performance Vehículos",
      description: "Análisis de rendimiento por vehículo",
      icon: TrendingUp,
      href: "/rutas-por-viaje",
      color: "bg-teal-500",
    },
    {
      title: "Performance Repartidores",
      description: "Análisis de rendimiento por repartidor",
      icon: Users2,
      href: "/clientes-multiples-rutas",
      color: "bg-amber-500",
    },
    {
      title: "Métricas de Cumplimiento",
      description: "KPIs y métricas de cumplimiento",
      icon: Clock,
      href: "/cumplimiento-vh",
      color: "bg-violet-500",
    },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-4 sm:py-8">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Sistema R-M-P v2.0
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Plataforma de Gestión de Rutas - Sistema integral para la gestión de
              rutas, vehículos y logística
            </p>
          </div>

          {/* Módulos Principales */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Módulos Principales
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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

          {/* Reportes y Analytics */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Reportes y Análisis
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  🔧
                </div>
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

          {/* Estadísticas del Sistema */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-lg shadow-sm p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6 text-center">
              Sistema R-M-P v2.0
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">
                  6
                </div>
                <div className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                  Entidades Principales
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-emerald-600 mb-2">
                  15+
                </div>
                <div className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                  Endpoints de Reportes
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">
                  1
                </div>
                <div className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                  Vista Principal
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-2">
                  2
                </div>
                <div className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                  Procedimientos
                </div>
              </div>
            </div>
          </div>

          {/* Botón flotante de diagnóstico */}
          <Link href="/diagnostico">
            <div className="fixed bottom-6 right-6 z-50">
              <div className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer group">
                <Settings className="w-6 h-6" />
                <span className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-3 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  Diagnóstico del Sistema
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </ProtectedRoute>
  );
}
