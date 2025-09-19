"use client";

import React, { useState, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, X, Plus } from "lucide-react";
import type { Ruta } from "@/hooks/use-rutas";

interface RutaInputHybridProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  rutas: Ruta[];
  placeholder?: string;
  isLoading?: boolean;
  className?: string;
}

export function RutaInputHybrid({
  id,
  label,
  value,
  onChange,
  rutas,
  placeholder = "Escribir ruta personalizada o seleccionar existente...",
  isLoading = false,
  className = "",
}: RutaInputHybridProps) {
  const [showRutaSelector, setShowRutaSelector] = useState(false);
  const [filteredRutas, setFilteredRutas] = useState<Ruta[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const selectorRef = useRef<HTMLDivElement>(null);

  // Filtrar rutas basado en el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = rutas.filter((ruta) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          ruta.estado === "Activo" &&
          (ruta.codigo.toLowerCase().includes(searchLower) ||
            ruta.nombre.toLowerCase().includes(searchLower) ||
            ruta.origen.toLowerCase().includes(searchLower) ||
            ruta.destino.toLowerCase().includes(searchLower))
        );
      });
      setFilteredRutas(filtered.slice(0, 8)); // Limitar a 8 resultados
    } else {
      // Mostrar rutas activas por defecto
      setFilteredRutas(rutas.filter(ruta => ruta.estado === "Activo").slice(0, 8));
    }
  }, [searchTerm, rutas]);

  // Manejar cambios en el textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  // Seleccionar una ruta de las opciones
  const selectRuta = (ruta: Ruta) => {
    const rutaText = `${ruta.codigo} - ${ruta.nombre} (${ruta.origen} → ${ruta.destino})`;

    // Si ya hay contenido, agregar en nueva línea, sino reemplazar
    const newValue = value.trim()
      ? `${value}\n${rutaText}`
      : rutaText;

    onChange(newValue);
    setShowRutaSelector(false);
    setSearchTerm("");

    // Enfocar el textarea
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Cerrar selector al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectorRef.current &&
        !selectorRef.current.contains(event.target as Node) &&
        textareaRef.current &&
        !textareaRef.current.contains(event.target as Node)
      ) {
        setShowRutaSelector(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Limpiar el contenido
  const clearContent = () => {
    onChange("");
    setShowRutaSelector(false);
    setSearchTerm("");
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Mostrar/ocultar selector de rutas
  const toggleRutaSelector = () => {
    setShowRutaSelector(!showRutaSelector);
    setSearchTerm("");
    if (!showRutaSelector) {
      setFilteredRutas(rutas.filter(ruta => ruta.estado === "Activo").slice(0, 8));
    }
  };

  // Manejar búsqueda en el selector
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <Label htmlFor={id}>{label}</Label>
        <div className="flex gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={toggleRutaSelector}
            className="h-7 px-2 text-xs"
            disabled={isLoading}
          >
            <Search className="w-3 h-3 mr-1" />
            Rutas
          </Button>
          {value && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearContent}
              className="h-7 px-2 text-xs"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      <Textarea
        ref={textareaRef}
        id={id}
        value={value}
        onChange={handleTextareaChange}
        placeholder={placeholder}
        className="min-h-[100px] resize-y"
        disabled={isLoading}
      />

      {/* Selector de Rutas */}
      {showRutaSelector && (
        <Card
          ref={selectorRef}
          className="absolute z-50 w-full mt-1 border shadow-lg bg-background max-h-96 overflow-hidden"
        >
          <div className="p-3 border-b">
            <div className="flex items-center gap-2 mb-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por código, nombre, origen o destino..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="flex-1 text-sm bg-transparent border-none outline-none placeholder:text-muted-foreground"
                autoFocus
              />
            </div>
            <div className="text-xs text-muted-foreground">
              {filteredRutas.length} ruta(s) encontrada(s)
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {filteredRutas.length > 0 ? (
              <div className="p-2 space-y-1">
                {filteredRutas.map((ruta) => (
                  <div
                    key={ruta.id}
                    className="p-3 rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors border border-transparent hover:border-border"
                    onClick={() => selectRuta(ruta)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm">
                        {ruta.codigo} - {ruta.nombre}
                      </div>
                      <Plus className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {ruta.origen} → {ruta.destino}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {ruta.distancia_km} km • {ruta.duracion_aproximada} • {ruta.tipo_ruta}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">
                {searchTerm ? (
                  <>No se encontraron rutas que coincidan con "{searchTerm}"</>
                ) : (
                  <>No hay rutas activas disponibles</>
                )}
              </div>
            )}
          </div>

          <div className="p-2 border-t text-xs text-muted-foreground bg-muted/30">
            💡 Tip: Puedes seleccionar múltiples rutas y también escribir texto personalizado
          </div>
        </Card>
      )}

      {/* Indicador de carga */}
      {isLoading && (
        <div className="absolute top-8 right-2 text-xs text-muted-foreground">
          Cargando rutas...
        </div>
      )}

      {/* Ayuda contextual */}
      <div className="mt-1 text-xs text-muted-foreground">
        Puedes escribir texto libre o usar el botón "Rutas" para seleccionar rutas registradas.
        {value && (
          <span className="ml-1 text-xs">
            • {value.split('\n').length} línea(s) • {value.length} caracteres
          </span>
        )}
      </div>
    </div>
  );
}
