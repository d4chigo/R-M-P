"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Ruta } from "@/hooks/use-rutas";

interface RutaTextInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  rutas: Ruta[];
  placeholder?: string;
  isLoading?: boolean;
  className?: string;
}

export function RutaTextInput({
  id,
  label,
  value,
  onChange,
  rutas,
  placeholder = "Escribir código de ruta...",
  isLoading = false,
  className = "",
}: RutaTextInputProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredRutas, setFilteredRutas] = useState<Ruta[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Obtener rutas activas de forma memoizada
  const rutasActivas = useCallback(() => {
    return rutas.filter((ruta) => ruta.estado === "Activo");
  }, [rutas]);

  // Filtrar rutas basado en búsqueda
  useEffect(() => {
    const activas = rutasActivas();
    if (searchTerm.trim()) {
      const filtered = activas.filter((ruta) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          ruta.codigo.toLowerCase().includes(searchLower) ||
          ruta.nombre.toLowerCase().includes(searchLower) ||
          ruta.origen.toLowerCase().includes(searchLower) ||
          ruta.destino.toLowerCase().includes(searchLower)
        );
      });
      setFilteredRutas(filtered.slice(0, 10));
    } else {
      setFilteredRutas(activas.slice(0, 10));
    }
  }, [searchTerm, rutasActivas]);

  // Manejar cambios en el input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  // Seleccionar una ruta del dropdown
  const selectRuta = (ruta: Ruta) => {
    const rutaText = `${ruta.codigo} - ${ruta.nombre}`;
    onChange(rutaText);
    setShowDropdown(false);
    setSearchTerm("");

    // Enfocar input después de seleccionar
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    const newShowState = !showDropdown;
    setShowDropdown(newShowState);
    setSearchTerm("");
    if (newShowState) {
      const activas = rutasActivas();
      setFilteredRutas(activas.slice(0, 10));
    }
  };

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
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

      <div className="flex gap-2">
        {/* Input Principal */}
        <div className="flex-1">
          <Input
            ref={inputRef}
            id={id}
            value={value}
            onChange={handleInputChange}
            placeholder={placeholder}
            disabled={isLoading}
            className="h-10"
          />
        </div>

        {/* Botón Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={toggleDropdown}
            disabled={isLoading}
            className="h-10 w-10"
          >
            {showDropdown ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>

          {/* Dropdown de Rutas */}
          {showDropdown && (
            <div className="absolute right-0 top-full mt-1 w-80 bg-background border border-border rounded-md shadow-lg z-50 max-h-96 overflow-hidden">
              {/* Header con búsqueda */}
              <div className="p-3 border-b border-border">
                <input
                  type="text"
                  placeholder="Buscar rutas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  autoFocus
                />
                <div className="text-xs text-muted-foreground mt-1">
                  {filteredRutas.length} de {rutasActivas.length} rutas activas
                </div>
              </div>

              {/* Lista de Rutas */}
              <div className="max-h-64 overflow-y-auto">
                {filteredRutas.length > 0 ? (
                  filteredRutas.map((ruta) => (
                    <div
                      key={ruta.id}
                      className="p-3 hover:bg-accent cursor-pointer border-b border-border/50 last:border-0"
                      onClick={() => selectRuta(ruta)}
                    >
                      <div className="font-medium text-sm">
                        {ruta.codigo} - {ruta.nombre}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        📍 {ruta.origen} → {ruta.destino}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        🚛 {ruta.distancia_km} km • ⏱️{" "}
                        {ruta.duracion_aproximada} • 🏷️ {ruta.tipo_ruta}
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
                💡 Haz clic en una ruta para agregarla al campo
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ayuda contextual */}
      <div className="text-xs text-muted-foreground">
        Escribe el código de ruta o usa el botón desplegable para seleccionar.
        {value && <span className="ml-2">• {value.length} caracteres</span>}
      </div>
    </div>
  );
}
