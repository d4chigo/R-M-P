"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User, Settings, Truck, Shield } from "lucide-react";
import Link from "next/link";

export const Navbar: React.FC = () => {
  const { usuario, logout, isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated || !usuario) {
    return null;
  }

  const getInitials = (nombre: string) => {
    return nombre
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="backdrop-blur-md bg-white/70 dark:bg-gray-900/70 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo y título */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl flex items-center justify-center shadow-md">
                <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400">
                R-M-P
              </span>
            </Link>
          </div>

          {/* Información del usuario y acciones */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Toggle de tema */}
            <ThemeToggle />

            {/* Información del usuario */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="hidden sm:block text-right truncate max-w-[120px] md:max-w-[200px]">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {usuario.nombre_completo}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate hidden md:block">
                  {usuario.email}
                </p>
              </div>

              {/* Menú desplegable del usuario */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 sm:h-11 sm:w-11 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                  >
                    <Avatar className="h-10 w-10 sm:h-11 sm:w-11">
                      <AvatarFallback className="bg-gradient-to-r from-blue-600 to-blue-400 text-white font-bold">
                        {getInitials(usuario.nombre_completo)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 p-1 rounded-xl shadow-lg"
                  align="end"
                  forceMount
                >
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {usuario.nombre_completo}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {usuario.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {isAdmin && (
                    <DropdownMenuItem
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                      asChild
                    >
                      <Link href="/admin">
                        <Shield className="mr-2 h-4 w-4" />
                        <span>Administración</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
