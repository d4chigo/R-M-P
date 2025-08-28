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
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Efecto para actualizar marcadores cuando cambien los centros
  useEffect(() => {
    if (isMapLoaded && mapInstanceRef.current) {
      updateMarkers();
    }
  }, [centros, isMapLoaded]);

  // Efecto para centrar el mapa cuando cambia el centro seleccionado
  useEffect(() => {
    if (!isMapLoaded || !mapInstanceRef.current || !selectedCentro) return;

    const lat = selectedCentro.latitud != null ? Number(selectedCentro.latitud) : NaN;
    const lng = selectedCentro.longitud != null ? Number(selectedCentro.longitud) : NaN;

    if (!isNaN(lat) && !isNaN(lng)) {
      try {
        mapInstanceRef.current.setView([lat, lng], 15);

        // intentar abrir popup del marcador correspondiente
        const marker = markersRef.current.find((m: any) => {
          try {
            const ll = m.getLatLng && m.getLatLng();
            return ll && ll.lat === lat && ll.lng === lng;
          } catch (e) {
            return false;
          }
        });

        if (marker && marker.openPopup) {
          marker.openPopup();
        }
      } catch (err) {
        console.error("Error centrando en centro seleccionado:", err);
      }
    }
  }, [selectedCentro, isMapLoaded]);

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

  const updateMarkers = () => {
    if (!mapInstanceRef.current) return;

    // Limpiar marcadores existentes
    markersRef.current.forEach(marker => {
      if (marker && marker.remove) {
        marker.remove();
      }
    });
    markersRef.current = [];

    // Agregar nuevos marcadores
    centros.forEach((centro) => {
      if (centro.latitud != null && centro.longitud != null) {
        const lat = Number(centro.latitud);
        const lng = Number(centro.longitud);
        if (isNaN(lat) || isNaN(lng)) return;

        const marker = window.L.marker([lat, lng])
          .addTo(mapInstanceRef.current)
          .bindPopup(createPopupContent(centro));

        // Resaltar marcador seleccionado
  if (selectedCentro && selectedCentro.id_centro === centro.id_centro) {
          marker.setIcon(window.L.divIcon({
            className: 'custom-marker selected',
            html: `<div style="background-color: #3b82f6; color: white; padding: 8px; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-weight: bold;">📍</div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          }));
        }

        // Evento click en marcador
        marker.on('click', () => {
          if (onCentroSelect) {
            onCentroSelect(centro);
          }
        });

        markersRef.current.push(marker);
      }
    });

    // Centrar mapa en los centros si hay marcadores
    if (markersRef.current.length > 0) {
      centerMapOnCentros();
    }
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

  new locationButton().addTo(map);
  };

  const centerMapOnCentros = () => {
    if (!mapInstanceRef.current || centros.length === 0) return;

    const bounds = window.L.latLngBounds([]);
    centros.forEach((centro) => {
      if (centro.latitud != null && centro.longitud != null) {
        const lat = Number(centro.latitud);
        const lng = Number(centro.longitud);
        if (!isNaN(lat) && !isNaN(lng)) {
          bounds.extend([lat, lng]);
        }
      }
    });
    // Validar que los bounds contengan coordenadas numéricas válidas.
    let hasBounds = false;
    if (typeof bounds.isValid === 'function') {
      try {
        hasBounds = bounds.isValid();
      } catch (e) {
        hasBounds = false;
      }
    } else {
      try {
        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();
        hasBounds = Number.isFinite(ne.lat) && Number.isFinite(ne.lng) && Number.isFinite(sw.lat) && Number.isFinite(sw.lng);
      } catch (e) {
        hasBounds = false;
      }
    }

    if (hasBounds) {
      try {
        mapInstanceRef.current.fitBounds(bounds, { padding: [20, 20] });
      } catch (err) {
        console.error("fitBounds falló con bounds:", bounds, err);
      }
    }
  };

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

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Mapa de Centros de Distribución
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative w-full h-[600px]">
          {/* Estilos CSS inline para Leaflet (globales porque Leaflet inyecta DOM fuera del scope) */}
          <style jsx>{`
            :global(.leaflet-container) {
              height: 100%;
              width: 100%;
              z-index: 1;
            }
            :global(.custom-marker.selected) {
              z-index: 1000;
            }
            :global(.leaflet-popup-content) {
              margin: 8px 12px;
              font-size: 14px;
            }
            :global(.leaflet-popup-content h3) {
              margin: 0 0 8px 0;
              color: #1f2937;
              font-weight: 600;
            }
            :global(.leaflet-popup-content p) {
              margin: 4px 0;
              color: #6b7280;
            }
            :global(.leaflet-popup-content .badge) {
              display: inline-block;
              padding: 2px 8px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 500;
              text-transform: uppercase;
            }
            :global(.leaflet-popup-content .badge.activo) {
              background-color: #10b981;
              color: white;
            }
            :global(.leaflet-popup-content .badge.inactivo) {
              background-color: #ef4444;
              color: white;
            }
            :global(.leaflet-popup-content .badge.mantenimiento) {
              background-color: #f59e0b;
              color: white;
            }
          `}</style>

          {/* Renderizamos siempre el contenedor del mapa para que mapRef.current exista
              (evita que Leaflet se inicialice antes de que exista el div cuando el script
              carga rápidamente). Mostramos un overlay de carga mientras se inicializa. */}
          <div
            ref={mapRef}
            className="w-full h-full relative"
            style={{ minHeight: '600px' }}
          >
            {!isMapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-50">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Cargando mapa...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 