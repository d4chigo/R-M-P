"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Ruta } from "@/hooks/use-rutas";

interface TestRutaInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  rutas: Ruta[];
  placeholder?: string;
  isLoading?: boolean;
}

export function TestRutaInput({
  id,
  label,
  value,
  onChange,
  rutas,
  placeholder = "Escribir código de ruta...",
  isLoading = false,
}: TestRutaInputProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  console.log("TestRutaInput render:", { id, value, rutas: rutas?.length });

  // Manejar cambio en el input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.log("Input changed:", newValue);
    onChange(newValue);
  };

  // Filtrar rutas
  const rutasActivas = rutas?.filter((ruta) => ruta.estado === "Activo") || [];
  const rutasFiltradas = searchTerm.trim()
    ? rutasActivas.filter((ruta) => {
        const term = searchTerm.toLowerCase();
        return (
          ruta.codigo?.toLowerCase().includes(term) ||
          ruta.nombre?.toLowerCase().includes(term)
        );
      })
    : rutasActivas;

  // Seleccionar ruta
  const selectRuta = (ruta: Ruta) => {
    const rutaText = `${ruta.codigo} - ${ruta.nombre}`;
    console.log("Selecting ruta:", rutaText);
    onChange(rutaText);
    setShowDropdown(false);
    setSearchTerm("");
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>

      <div className="flex gap-2 relative">
        {/* Input principal */}
        <Input
          id={id}
          type="text"
          value={value || ""}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={isLoading}
          className="flex-1"
        />

        {/* Botón dropdown */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => {
            console.log("Toggle dropdown clicked");
            setShowDropdown(!showDropdown);
          }}
          disabled={isLoading}
          className="h-10 w-10"
        >
          {showDropdown ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>

        {/* Dropdown */}
        {showDropdown && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-50 max-h-60 overflow-hidden">
            <div className="p-2 border-b">
              <Input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-sm"
              />
              <div className="text-xs text-muted-foreground mt-1">
                {rutasFiltradas.length} rutas encontradas
              </div>
            </div>

            <div className="max-h-40 overflow-y-auto">
              {rutasFiltradas.length > 0 ? (
                rutasFiltradas.slice(0, 5).map((ruta) => (
                  <div
                    key={ruta.id}
                    className="p-2 hover:bg-accent cursor-pointer border-b last:border-0"
                    onClick={() => selectRuta(ruta)}
                  >
                    <div className="font-medium text-sm">
                      {ruta.codigo} - {ruta.nombre}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {ruta.origen} → {ruta.destino}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 text-center text-sm text-muted-foreground">
                  No hay rutas disponibles
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Debug info */}
      <div className="text-xs text-muted-foreground">
        Debug: value="{value}" | rutas={rutas?.length || 0} | loading={isLoading ? 'true' : 'false'}
      </div>
    </div>
  );
}
