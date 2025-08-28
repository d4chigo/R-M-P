"use client";

import { useEffect, useRef, useState } from "react";

// Tipos para Leaflet
declare global {
  interface Window {
    L: any;
  }
}

interface LeafletMap {
  setView: (coords: [number, number], zoom: number) => LeafletMap;
  addLayer: (layer: any) => LeafletMap;
  removeLayer: (layer: any) => LeafletMap;
  fitBounds: (bounds: any, options?: any) => LeafletMap;
  remove: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
}

interface LeafletTileLayer {
  addTo: (map: LeafletMap) => LeafletTileLayer;
}

interface LeafletMarker {
  addTo: (map: LeafletMap) => LeafletMarker;
  bindPopup: (content: any) => LeafletMarker;
  on: (event: string, handler: Function) => LeafletMarker;
  setIcon: (icon: any) => LeafletMarker;
}

interface LeafletControl {
  addTo: (map: LeafletMap) => LeafletControl;
}

interface LeafletDivIcon {
  className: string;
  html: string;
  iconSize: [number, number];
  iconAnchor: [number, number];
}
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Layers, ZoomIn, ZoomOut, Crosshair } from "lucide-react";
import type { CentroDistribucion } from "@/hooks/use-centro-distribucion";

interface CentroDistribucionMapaProps {
  centros: CentroDistribucion[];
  onCentroSelect?: (centro: CentroDistribucion) => void;
  selectedCentro?: CentroDistribucion | null;
}

export function CentroDistribucionMapa({
  centros,
  onCentroSelect,
  selectedCentro,
}: CentroDistribucionMapaProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapLayers, setMapLayers] = useState({
    satellite: false,
    terrain: false,
    traffic: false,
  });

  useEffect(() => {
    // Cargar Leaflet dinámicamente
    const loadLeaflet = async () => {
      if (typeof window !== "undefined" && !window.L) {
        // Cargar CSS de Leaflet
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);

        // Cargar JavaScript de Leaflet
        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.onload = () => {
          initializeMap();
        };
        document.head.appendChild(script);
      } else if (window.L) {
        initializeMap();
      }
    };

    loadLeaflet();

    return () => {
      // Cleanup
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, []);

  const initializeMap = () => {
    if (!mapRef.current || !window.L) return;

    // Coordenadas por defecto (México)
    const defaultLat = 19.4326;
    const defaultLng = -99.1332;

    // Crear mapa
    const map = window.L.map(mapRef.current).setView([defaultLat, defaultLng], 10);

    // Capa base de OpenStreetMap
    const baseLayer = window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    });

    baseLayer.addTo(map);
    mapInstanceRef.current = map;

    // Agregar controles
    addMapControls(map);
    
    // Centrar en el primer centro si existe
    if (centros.length > 0) {
      centerMapOnCentros();
    }

    setIsMapLoaded(true);
  };

  const addMapControls = (map: any) => {
    // Control de capas
    const baseMaps = {
      "OpenStreetMap": window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }),
      "Satellite": window.L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
        attribution: '© <a href="https://www.esri.com/">Esri</a>',
      }),
      "Terrain": window.L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://opentopomap.org/">OpenTopoMap</a> contributors',
      }),
    };

    window.L.control.layers(baseMaps).addTo(map);

    // Control de escala
    window.L.control.scale().addTo(map);

    // Botón de ubicación actual
    const locationButton = window.L.Control.extend({
      options: {
        position: "topleft",
      },
      onAdd: function () {
        const container = window.L.DomUtil.create("div", "leaflet-bar leaflet-control");
        const button = window.L.DomUtil.create("a", "leaflet-control-zoom-in", container);
        button.innerHTML = '<i class="fas fa-crosshairs"></i>';
        button.style.width = "30px";
        button.style.height = "30px";
        button.style.lineHeight = "30px";
        button.style.textAlign = "center";
        button.style.fontSize = "16px";
        button.title = "Mi ubicación";
        
        button.onclick = function () {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const { latitude, longitude } = position.coords;
                map.setView([latitude, longitude], 15);
                window.L.marker([latitude, longitude])
                  .addTo(map)
                  .bindPopup("Tu ubicación actual")
                  .openPopup();
              },
              (error) => {
                console.error("Error obteniendo ubicación:", error);
              }
            );
          }
        };
        
        return container;
      },
    });

    locationButton().addTo(map);
  };

  const centerMapOnCentros = () => {
    if (!mapInstanceRef.current || centros.length === 0) return;

    const bounds = window.L.latLngBounds([]);
    centros.forEach((centro) => {
      if (centro.latitud && centro.longitud) {
        bounds.extend([centro.latitud, centro.longitud]);
      }
    });

    if (!bounds.isEmpty()) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [20, 20] });
    }
  };

  useEffect(() => {
    if (!isMapLoaded || !mapInstanceRef.current) return;

    // Limpiar marcadores existentes
    markersRef.current.forEach((marker) => {
      mapInstanceRef.current.removeLayer(marker);
    });
    markersRef.current = [];

    // Agregar marcadores para cada centro
    centros.forEach((centro) => {
      if (centro.latitud && centro.longitud) {
        const marker = window.L.marker([centro.latitud, centro.longitud])
          .addTo(mapInstanceRef.current)
          .bindPopup(createPopupContent(centro));

        // Evento de clic en marcador
        marker.on("click", () => {
          if (onCentroSelect) {
            onCentroSelect(centro);
          }
        });

        // Resaltar marcador seleccionado
        if (selectedCentro && selectedCentro.id_centro === centro.id_centro) {
          marker.setIcon(
            window.L.divIcon({
              className: "custom-div-icon",
              html: `<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>`,
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            })
          );
        }

        markersRef.current.push(marker);
      }
    });

    // Centrar mapa en los centros
    centerMapOnCentros();
  }, [centros, selectedCentro, isMapLoaded, onCentroSelect]);

  const createPopupContent = (centro: CentroDistribucion) => {
    const div = document.createElement("div");
    div.className = "centro-popup";
    div.innerHTML = `
      <div style="min-width: 200px;">
        <h3 style="margin: 0 0 8px 0; color: #1f2937; font-weight: 600;">
          ${centro.nombre}
        </h3>
        <p style="margin: 4px 0; color: #6b7280; font-size: 14px;">
          <strong>Código:</strong> ${centro.codigo}
        </p>
        <p style="margin: 4px 0; color: #6b7280; font-size: 14px;">
          <strong>Ciudad:</strong> ${centro.ciudad}
        </p>
        <p style="margin: 4px 0; color: #6b7280; font-size: 14px;">
          <strong>Estado:</strong> ${centro.estado}
        </p>
        ${centro.capacidad_almacen ? `<p style="margin: 4px 0; color: #6b7280; font-size: 14px;"><strong>Capacidad:</strong> ${centro.capacidad_almacen.toLocaleString()} m³</p>` : ''}
        ${centro.personal_asignado ? `<p style="margin: 4px 0; color: #6b7280; font-size: 14px;"><strong>Personal:</strong> ${centro.personal_asignado} empleados</p>` : ''}
        <div style="margin-top: 12px;">
          <button class="centro-select-btn" style="background: #3b82f6; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">
            Seleccionar Centro
          </button>
        </div>
      </div>
    `;

    // Agregar evento al botón
    const button = div.querySelector(".centro-select-btn");
    if (button && onCentroSelect) {
      button.addEventListener("click", () => {
        onCentroSelect(centro);
      });
    }

    return div;
  };

  const toggleMapLayer = (layerType: keyof typeof mapLayers) => {
    if (!mapInstanceRef.current) return;

    setMapLayers(prev => {
      const newLayers = { ...prev, [layerType]: !prev[layerType] };
      
      // Aquí podrías implementar la lógica para cambiar capas del mapa
      // Por ahora solo actualizamos el estado
      
      return newLayers;
    });
  };

  const zoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const zoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  const resetView = () => {
    if (mapInstanceRef.current && centros.length > 0) {
      centerMapOnCentros();
    }
  };

  if (!isMapLoaded) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Mapa de Centros de Distribución
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-muted-foreground">Cargando mapa...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Mapa de Centros de Distribución
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Controles del mapa */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={zoomIn}
              className="flex items-center gap-2"
            >
              <ZoomIn className="w-4 h-4" />
              Zoom +
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={zoomOut}
              className="flex items-center gap-2"
            >
              <ZoomOut className="w-4 h-4" />
              Zoom -
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetView}
              className="flex items-center gap-2"
            >
              <Crosshair className="w-4 h-4" />
              Centrar Vista
            </Button>
            <Button
              variant={mapLayers.satellite ? "default" : "outline"}
              size="sm"
              onClick={() => toggleMapLayer("satellite")}
              className="flex items-center gap-2"
            >
              <Layers className="w-4 h-4" />
              Satélite
            </Button>
          </div>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
              <div className="font-semibold text-blue-600">{centros.length}</div>
              <div className="text-blue-600/70">Total Centros</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
              <div className="font-semibold text-green-600">
                {centros.filter(c => c.estado === 'activo').length}
              </div>
              <div className="text-green-600/70">Activos</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded">
              <div className="font-semibold text-orange-600">
                {centros.filter(c => c.estado === 'mantenimiento').length}
              </div>
              <div className="text-orange-600/70">Mantenimiento</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/20 p-2 rounded">
              <div className="font-semibold text-gray-600">
                {centros.filter(c => c.latitud && c.longitud).length}
              </div>
              <div className="text-gray-600/70">Con Coordenadas</div>
            </div>
          </div>

          {/* Mapa */}
          <div className="relative">
            <div
              ref={mapRef}
              className="w-full h-96 rounded-lg border border-gray-200 dark:border-gray-700"
              style={{ zIndex: 1 }}
            />
            
            {/* Overlay de información */}
            {selectedCentro && (
              <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-w-xs">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">{selectedCentro.codigo}</Badge>
                  <Badge variant={selectedCentro.estado === 'activo' ? 'default' : 'secondary'}>
                    {selectedCentro.estado}
                  </Badge>
                </div>
                <h4 className="font-semibold text-sm mb-1">{selectedCentro.nombre}</h4>
                <p className="text-xs text-muted-foreground mb-2">{selectedCentro.ciudad}</p>
                <div className="text-xs space-y-1">
                  {selectedCentro.capacidad_almacen && (
                    <div>Capacidad: {selectedCentro.capacidad_almacen.toLocaleString()} m³</div>
                  )}
                  {selectedCentro.personal_asignado && (
                    <div>Personal: {selectedCentro.personal_asignado} empleados</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Leyenda */}
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Centros de Distribución</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow"></div>
              <span>Centro Seleccionado</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 