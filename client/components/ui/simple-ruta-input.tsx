"use client";

import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Ruta } from "@/hooks/use-rutas";

interface SimpleRutaInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  rutas: Ruta[];
  placeholder?: string;
  isLoading?: boolean;
  className?: string;
}

export function SimpleRutaInput({
  id,
  label,
  value,
  onChange,
  rutas,
  placeholder = "Escribir código de ruta...",
  isLoading = false,
  className = "",
}: SimpleRutaInputProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filtrar rutas activas
  const rutasActivas = rutas.filter((ruta) => ruta.estado === "Activo");

  // Filtrar rutas por término de búsqueda
  const rutasFiltradas = searchTerm.trim()
    ? rutasActivas.filter((ruta) => {
        const term = searchTerm.toLowerCase();
        return (
          ruta.codigo.toLowerCase().includes(term) ||
          ruta.nombre.toLowerCase().includes(term) ||
          ruta.origen.toLowerCase().includes(term) ||
          ruta.destino.toLowerCase().includes(term)
        );
      })
    : rutasActivas;

  // Manejar cambio en el input principal
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  // Seleccionar una ruta
  const selectRuta = (ruta: Ruta) => {
    const rutaText = `${ruta.codigo} - ${ruta.nombre}`;
    onChange(rutaText);
    setShowDropdown(false);
    setSearchTerm("");

    // Enfocar el input después de seleccionar
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  // Toggle dropdown
  const toggleDropdown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDropdown(!showDropdown);
    setSearchTerm("");
  };

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={id}>{label}</Label>

      <div className="flex gap-2 relative">
        {/* Input Principal */}
        <div className="flex-1">
          <Input
            ref={inputRef}
            id={id}
            type="text"
            value={value || ""}
            onChange={handleInputChange}
            placeholder={placeholder}
            disabled={isLoading}
            autoComplete="off"
            className="w-full"
          />
        </div>

        {/* Botón Dropdown */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={toggleDropdown}
          disabled={isLoading}
          className="h-10 w-10 shrink-0"
          tabIndex={-1}
        >
          {showDropdown ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>

        {/* Dropdown de Rutas */}
        {showDropdown && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-50 max-h-80 overflow-hidden"
          >
            {/* Header con búsqueda */}
            <div className="p-3 border-b border-border">
              <Input
                type="text"
                placeholder="Buscar rutas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-sm"
                autoComplete="off"
              />
              <div className="text-xs text-muted-foreground mt-1">
                {rutasFiltradas.length} de {rutasActivas.length} rutas activas
              </div>
            </div>

            {/* Lista de Rutas */}
            <div className="max-h-64 overflow-y-auto">
              {rutasFiltradas.length > 0 ? (
                rutasFiltradas.slice(0, 10).map((ruta) => (
                  <div
                    key={ruta.id}
                    className="p-3 hover:bg-accent cursor-pointer border-b border-border/50 last:border-0 transition-colors"
                    onClick={() => selectRuta(ruta)}
                  >
                    <div className="font-medium text-sm">
                      {ruta.codigo} - {ruta.nombre}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      📍 {ruta.origen} → {ruta.destino}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      🚛 {ruta.distancia_km} km • ⏱️ {ruta.duracion_aproximada}{" "}
                      • 🏷️ {ruta.tipo_ruta}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  {searchTerm ? (
                    <>No se encontraron rutas con "{searchTerm}"</>
                  ) : (
                    <>No hay rutas activas disponibles</>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-2 border-t border-border text-xs text-muted-foreground bg-muted/30">
              💡 Haz clic en una ruta para seleccionarla
            </div>
          </div>
        )}
      </div>

      {/* Ayuda contextual */}
      <div className="text-xs text-muted-foreground">
        Escribe el código de ruta manualmente o selecciona una existente.
        {value && <span className="ml-2">• {value.length} caracteres</span>}
      </div>
    </div>
  );
}
