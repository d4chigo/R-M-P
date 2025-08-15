"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import type { Zona } from "@/hooks/use-zonas";

interface ZonaMapaProps {
  zonas: Zona[];
  selectedZona?: Zona | null;
  onZonaSelect?: (zona: Zona) => void;
  className?: string;
}

declare global {
  interface Window {
    L: any;
  }
}

export function ZonaMapa({
  zonas,
  selectedZona,
  onZonaSelect,
  className,
}: ZonaMapaProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  const [mapReady, setMapReady] = useState(false);

  // Default map center (Lima, Peru)
  const DEFAULT_CENTER = { lat: -12.0464, lng: -77.0428 };
  const DEFAULT_ZOOM = 11;

  // Memoize zonas with valid coordinates
  const zonasConCoordenadas = useMemo(() => {
    return zonas.filter((zona) => {
      const lat = Number(zona.latitud);
      const lng = Number(zona.longitud);
      return (
        zona.latitud != null &&
        zona.longitud != null &&
        !isNaN(lat) &&
        !isNaN(lng) &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180
      );
    });
  }, [zonas]);

  // Load Leaflet library
  useEffect(() => {
    const loadLeaflet = async () => {
      if (typeof window === "undefined") return;

      // Check if Leaflet is already loaded
      if (window.L) {
        setMapLoaded(true);
        return;
      }

      try {
        // Load CSS
        const cssLink = document.createElement("link");
        cssLink.rel = "stylesheet";
        cssLink.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        cssLink.integrity =
          "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
        cssLink.crossOrigin = "";
        document.head.appendChild(cssLink);

        // Load JS
        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.integrity =
          "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
        script.crossOrigin = "";

        script.onload = () => {
          console.log("📍 Leaflet loaded successfully");
          setMapLoaded(true);
        };

        script.onerror = () => {
          console.error("❌ Failed to load Leaflet");
        };

        document.head.appendChild(script);
      } catch (error) {
        console.error("❌ Error loading Leaflet:", error);
      }
    };

    loadLeaflet();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current || mapRef.current) return;

    try {
      const L = window.L;

      const map = L.map(mapContainerRef.current, {
        center: [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng],
        zoom: DEFAULT_ZOOM,
        zoomControl: false,
        attributionControl: true,
      });

      // Add tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      mapRef.current = map;
      setMapReady(true);

      console.log("🗺️ Map initialized successfully");

      // Cleanup function
      return () => {
        if (mapRef.current) {
          console.log("🗑️ Cleaning up map");
          mapRef.current.remove();
          mapRef.current = null;
          setMapReady(false);
        }
      };
    } catch (error) {
      console.error("❌ Error initializing map:", error);
    }
  }, [mapLoaded]);

  // Clear markers helper
  const clearMarkers = useCallback(() => {
    if (mapRef.current && markersRef.current.length > 0) {
      markersRef.current.forEach((marker) => {
        mapRef.current.removeLayer(marker);
      });
      markersRef.current = [];
    }
  }, []);

  // Create marker for a zona
  const createMarker = useCallback(
    (zona: Zona) => {
      if (!mapRef.current || !window.L) return null;

      const L = window.L;
      const lat = Number(zona.latitud);
      const lng = Number(zona.longitud);

      if (isNaN(lat) || isNaN(lng)) return null;

      const isSelected = selectedZona?.id_zona === zona.id_zona;

      // Create custom icon
      const iconHtml = `
      <div style="
        background-color: ${isSelected ? "#ef4444" : "#22c55e"};
        width: 24px;
        height: 24px;
        border-radius: 50% 50% 50% 0;
        border: 2px solid white;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        cursor: pointer;
      ">
        <span style="
          color: white;
          font-weight: bold;
          font-size: 8px;
          transform: rotate(45deg);
        ">
          📍
        </span>
      </div>
    `;

      const customIcon = L.divIcon({
        html: iconHtml,
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        popupAnchor: [0, -24],
        className: "custom-leaflet-marker",
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      // Create popup content
      const descripcionCorta =
        zona.descripcion.length > 100
          ? zona.descripcion.substring(0, 100) + "..."
          : zona.descripcion;

      const popupContent = `
      <div style="max-width: 250px;">
        <h3 style="margin: 0 0 8px 0; color: #1f2937; font-weight: bold;">
          ${zona.codigo}
        </h3>
        <p style="margin: 0 0 8px 0; color: #4b5563; font-size: 14px; line-height: 1.4;">
          ${descripcionCorta}
        </p>
        <div style="font-size: 12px; color: #6b7280;">
          <div>📍 Lat: ${lat.toFixed(4)}</div>
          <div>📍 Lng: ${lng.toFixed(4)}</div>
        </div>
      </div>
    `;

      marker.bindPopup(popupContent);

      // Add click event
      marker.on("click", () => {
        if (onZonaSelect) {
          onZonaSelect(zona);
        }
      });

      return marker;
    },
    [selectedZona?.id_zona, onZonaSelect],
  );

  // Update markers when zonas or selection changes
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    console.log(`🔄 Updating markers for ${zonasConCoordenadas.length} zonas`);

    // Clear existing markers
    clearMarkers();

    // Add new markers
    const newMarkers: any[] = [];

    zonasConCoordenadas.forEach((zona) => {
      const marker = createMarker(zona);
      if (marker) {
        marker.addTo(mapRef.current);
        newMarkers.push(marker);
      }
    });

    markersRef.current = newMarkers;
    console.log(`✅ Added ${newMarkers.length} markers to map`);
  }, [
    mapReady,
    zonasConCoordenadas,
    selectedZona?.id_zona,
    createMarker,
    clearMarkers,
  ]);

  // Center map on selected zona
  useEffect(() => {
    if (!mapReady || !mapRef.current || !selectedZona) return;

    const lat = Number(selectedZona.latitud);
    const lng = Number(selectedZona.longitud);

    if (!isNaN(lat) && !isNaN(lng)) {
      console.log(`🎯 Centering map on zona ${selectedZona.codigo}`);
      mapRef.current.setView([lat, lng], 15);
    }
  }, [
    mapReady,
    selectedZona?.id_zona,
    selectedZona?.latitud,
    selectedZona?.longitud,
  ]);

  // Map control functions
  const zoomIn = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  }, []);

  const zoomOut = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  }, []);

  const resetView = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.setView(
        [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng],
        DEFAULT_ZOOM,
      );
    }
  }, []);

  const fitBounds = useCallback(() => {
    if (mapRef.current && zonasConCoordenadas.length > 0) {
      const L = window.L;
      if (L && markersRef.current.length > 0) {
        const group = new L.featureGroup(markersRef.current);
        mapRef.current.fitBounds(group.getBounds().pad(0.1));
      }
    }
  }, [zonasConCoordenadas.length]);

  // Handle window resize events
  useEffect(() => {
    const handleResize = () => {
      if (mapRef.current) {
        setTimeout(() => {
          mapRef.current.invalidateSize();
        }, 100);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  if (!mapLoaded) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-600" />
            Mapa de Zonas
          </CardTitle>
          <CardDescription>
            Visualización geográfica de las zonas registradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Cargando mapa...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-600" />
                Mapa de Zonas
                <Badge variant="secondary">
                  {zonasConCoordenadas.length} ubicaciones
                </Badge>
              </CardTitle>
              <CardDescription>
                Visualización geográfica de las zonas con coordenadas GPS
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative">
          {/* Map Controls */}
          <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={zoomIn}
              className="h-8 w-8 p-0 bg-white dark:bg-gray-800"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={zoomOut}
              className="h-8 w-8 p-0 bg-white dark:bg-gray-800"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetView}
              className="h-8 w-8 p-0 bg-white dark:bg-gray-800"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          {/* Selected Zone Info */}
          {selectedZona && (
            <div className="absolute top-4 left-4 z-[1000] max-w-sm">
              <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur">
                <CardContent className="p-4">
                  <h4 className="font-bold text-green-600 mb-2">
                    {selectedZona.codigo}
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 line-clamp-3">
                    {selectedZona.descripcion}
                  </p>
                  {selectedZona.latitud && selectedZona.longitud && (
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>
                        📍 Lat: {Number(selectedZona.latitud).toFixed(6)}
                      </div>
                      <div>
                        📍 Lng: {Number(selectedZona.longitud).toFixed(6)}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Map Statistics */}
          <div className="absolute bottom-4 left-4 z-[1000]">
            <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur">
              <CardContent className="p-3">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>{zonasConCoordenadas.length} zonas</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <span>
                      {zonas.length - zonasConCoordenadas.length} sin
                      coordenadas
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Fit Bounds Button */}
          {zonasConCoordenadas.length > 0 && (
            <div className="absolute bottom-4 right-4 z-[1000]">
              <Button
                variant="outline"
                size="sm"
                onClick={fitBounds}
                className="bg-white dark:bg-gray-800"
              >
                Ver todas las zonas
              </Button>
            </div>
          )}

          {/* Map Container */}
          <div
            ref={mapContainerRef}
            className="w-full rounded-lg h-96"
            style={{ zIndex: 1 }}
          />

          {/* No Coordinates Message */}
          {zonasConCoordenadas.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 dark:bg-gray-800/80 rounded-lg">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No hay zonas con coordenadas
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Agrega coordenadas GPS a las zonas para verlas en el mapa
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Custom Styles */}
      <style jsx global>{`
        .custom-leaflet-marker {
          background: transparent !important;
          border: none !important;
        }

        .leaflet-popup-content-wrapper {
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .leaflet-popup-tip {
          background: white;
        }

        .leaflet-container {
          font-family: inherit;
        }

        .leaflet-control-attribution {
          font-size: 10px;
          background: rgba(255, 255, 255, 0.8);
        }
      `}</style>
    </div>
  );
}

export default ZonaMapa;
