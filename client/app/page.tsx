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
  Route,
  Users,
  MapPin,
  Calendar,
  FileText,
  UserCheck,
  Package,
} from "lucide-react";
import { BarChart3, TrendingUp, Users2, Clock, Settings } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function HomePage() {
  const modules = [
    {
      title: "Vehículos",
      description: "Gestión de vehículos de transporte",
      icon: Truck,
      href: "/vehiculos",
      color: "bg-blue-500",
    },

    {
      title: "Rutas",
      description: "Administración de rutas de transporte",
      icon: Route,
      href: "/rutas",
      color: "bg-purple-500",
    },
    {
      title: "Clientes",
      description: "Gestión de clientes y contactos",
      icon: Users,
      href: "/clientes",
      color: "bg-orange-500",
    },
    {
      title: "Tipos de Cliente",
      description: "Configuración de tipos de cliente",
      icon: UserCheck,
      href: "/tipos-cliente",
      color: "bg-cyan-500",
    },
    {
      title: "Zonas",
      description: "Gestión de zonas geográficas",
      icon: MapPin,
      href: "/zonas",
      color: "bg-red-500",
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

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-4 sm:py-8">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Sistema de Gestión de Transporte
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Plataforma integral para la administración de vehículos, rutas,
              clientes y operaciones logísticas
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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

          <div className="mt-8 sm:mt-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6 text-center">
              Reportes y Análisis
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <Link href="/reportes/resumen-rutas">
                <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer h-full dark:bg-gray-800 dark:border-gray-700 dark:hover:shadow-gray-700/25">
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BarChart3 className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-lg dark:text-gray-100">
                      Resumen de Rutas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center dark:text-gray-300">
                      Análisis completo de rutas por fecha y vehículo
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/reportes/rutas-por-viaje">
                <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer h-full dark:bg-gray-800 dark:border-gray-700 dark:hover:shadow-gray-700/25">
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-lg dark:text-gray-100">
                      Rutas por Viaje
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center dark:text-gray-300">
                      Detalle de capacidad y rendimiento por viaje
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/reportes/clientes-multiples-rutas">
                <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer h-full dark:bg-gray-800 dark:border-gray-700 dark:hover:shadow-gray-700/25">
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users2 className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-lg dark:text-gray-100">
                      Clientes Múltiples Rutas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center dark:text-gray-300">
                      Clientes atendidos en múltiples rutas
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/reportes/cumplimiento-vh">
                <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer h-full dark:bg-gray-800 dark:border-gray-700 dark:hover:shadow-gray-700/25">
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-violet-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-lg dark:text-gray-100">
                      Cumplimiento VH
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center dark:text-gray-300">
                      Análisis de ventanas horarias de clientes
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>

          <div className="mt-12 sm:mt-16 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8 dark:border dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Resumen del Sistema
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">
                  8
                </div>
                <div className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                  Módulos Principales
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-emerald-600 mb-2">
                  4
                </div>
                <div className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                  Reportes Avanzados
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">
                  100%
                </div>
                <div className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                  Funcionalidad Completa
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-2">
                  24/7
                </div>
                <div className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                  Disponibilidad
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
