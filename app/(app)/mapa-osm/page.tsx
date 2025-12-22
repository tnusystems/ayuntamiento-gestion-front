"use client";

import { useEffect, useRef, useState } from "react";
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
  Navigation,
} from "lucide-react";
import Image from "next/image";
import "leaflet/dist/leaflet.css";

const center = {
  lat: 29.072967,
  lng: -110.955919,
};

const propiedades = [
  {
    id: "HMO-001",
    nombre: "Casa Centro",
    direccion: "Av. Rosales, Hermosillo",
    lat: 29.072967,
    lng: -110.955919,
    imagenes: [
      "/placeholder_location.jpg",
      "/placeholder_location.jpg",
      "/placeholder_location.jpg",
    ],
  },
  {
    id: "HMO-002",
    nombre: "Terreno Norte",
    direccion: "Col. Modelo",
    lat: 29.0981,
    lng: -110.9654,
    imagenes: [
      "/placeholder_location.jpg",
      "/placeholder_location.jpg",
      "/placeholder_location.jpg",
    ],
  },
  {
    id: "PUB-001",
    nombre: "Cerro de la Campana",
    direccion: "Cerro de la Campana, Hermosillo",
    lat: 29.080556,
    lng: -110.958889,
    imagenes: [
      "/placeholder_location.jpg",
      "/placeholder_location.jpg",
      "/placeholder_location.jpg",
    ],
  },
  {
    id: "PUB-002",
    nombre: "Parque Madero",
    direccion: "Blvd. Hidalgo y Rosales, Centro",
    lat: 29.0725,
    lng: -110.9558,
    imagenes: ["/park-trees.jpg", "/park-playground.jpg", "/park-benches.jpg"],
  },
  {
    id: "PUB-003",
    nombre: "Carcamo de Hermosillo",
    direccion: "Callejon del Carcamo, Centro",
    lat: 29.068889,
    lng: -110.958611,
    imagenes: [
      "/placeholder_location.jpg",
      "/placeholder_location.jpg",
      "/placeholder_location.jpg",
    ],
  },
  {
    id: "PUB-004",
    nombre: "Catedral de la Asuncion",
    direccion: "Blvd. Hidalgo s/n, Centro",
    lat: 29.073611,
    lng: -110.956389,
    imagenes: [
      "/placeholder_location.jpg",
      "/placeholder_location.jpg",
      "/placeholder_location.jpg",
    ],
  },
  {
    id: "PUB-005",
    nombre: "Estadio Sonora",
    direccion: "Blvd. de los Deportes, Hermosillo",
    lat: 29.091944,
    lng: -110.966111,
    imagenes: [
      "/placeholder_location.jpg",
      "/placeholder_location.jpg",
      "/placeholder_location.jpg",
    ],
  },
];

const toRadians = (value: number) => (value * Math.PI) / 180;

const getDistanceMeters = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const earthRadius = 6371000;
  const deltaLat = toRadians(b.lat - a.lat);
  const deltaLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const sinLat = Math.sin(deltaLat / 2);
  const sinLng = Math.sin(deltaLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return earthRadius * c;
};

const findNearestPropiedad = (lat: number, lng: number) => {
  let nearest: (typeof propiedades)[0] | null = null;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const propiedad of propiedades) {
    const distance = getDistanceMeters(
      { lat, lng },
      { lat: propiedad.lat, lng: propiedad.lng }
    );
    if (distance < nearestDistance) {
      nearest = propiedad;
      nearestDistance = distance;
    }
  }

  return nearest ? { propiedad: nearest, distance: nearestDistance } : null;
};

export default function MapaOsmPage() {
  const [selected, setSelected] = useState<(typeof propiedades)[0] | null>(
    null
  );
  const [query, setQuery] = useState("");
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<
    typeof propiedades
  >([]);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const markersRef = useRef<import("leaflet").Marker[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) {
      return;
    }

    let isMounted = true;

    const initMap = async () => {
      const L = await import("leaflet");
      if (!isMounted || !mapContainerRef.current || mapRef.current) {
        return;
      }

      const markerIcon = L.divIcon({
        className: "osm-marker",
        html: `<span style="display:block;width:18px;height:18px;border-radius:9999px;background:#111827;border:3px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,0.4)"></span>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: true,
      }).setView([center.lat, center.lng], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      markersRef.current = propiedades.map((propiedad) =>
        L.marker([propiedad.lat, propiedad.lng], {
          icon: markerIcon,
          interactive: true,
          riseOnHover: true,
        })
          .addTo(map)
          .on("click", () => {
            setSelected(propiedad);
            setCurrentImageIndex(0);
          })
      );

      map.on("click", (event: import("leaflet").LeafletMouseEvent) => {
        const nearest = findNearestPropiedad(
          event.latlng.lat,
          event.latlng.lng
        );
        if (nearest) {
          setSelected(nearest.propiedad);
          setCurrentImageIndex(0);
        }
      });

      mapRef.current = map;
    };

    initMap();

    return () => {
      isMounted = false;
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    const target = selected
      ? ([selected.lat, selected.lng] as [number, number])
      : ([center.lat, center.lng] as [number, number]);
    const zoom = selected ? 16 : 13;

    mapRef.current.setView(target, zoom, { animate: true });
  }, [selected]);

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (value.trim()) {
      const filtered = propiedades.filter(
        (p) =>
          p.nombre.toLowerCase().includes(value.toLowerCase()) ||
          p.id.toLowerCase().includes(value.toLowerCase()) ||
          p.direccion.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (propiedad: (typeof propiedades)[0]) => {
    setQuery(propiedad.nombre);
    setSelected(propiedad);
    setCurrentImageIndex(0);
    setShowSuggestions(false);
  };

  const nextImage = () => {
    if (selected) {
      setCurrentImageIndex((prev) => (prev + 1) % selected.imagenes.length);
    }
  };

  const prevImage = () => {
    if (selected) {
      setCurrentImageIndex(
        (prev) =>
          (prev - 1 + selected.imagenes.length) % selected.imagenes.length
      );
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Buscador flotante arriba del mapa */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-full max-w-md px-4">
        <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden">
          <div className="flex items-center gap-2 p-3">
            <Search className="w-5 h-5 text-neutral-400 ml-1" />
            <input
              type="text"
              placeholder="Buscar por codigo, nombre o direccion..."
              className="flex-1 outline-none text-sm text-neutral-700 placeholder:text-neutral-400"
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => {
                if (query.trim()) setShowSuggestions(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && filteredSuggestions.length > 0) {
                  handleSelectSuggestion(filteredSuggestions[0]);
                }
              }}
            />
            {query && (
              <button
                onClick={() => {
                  setQuery("");
                  setFilteredSuggestions([]);
                  setShowSuggestions(false);
                  setSelected(null);
                }}
                className="p-1 hover:bg-neutral-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-neutral-500" />
              </button>
            )}
          </div>

          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="border-t border-neutral-200 max-h-64 overflow-y-auto">
              {filteredSuggestions.map((propiedad) => (
                <button
                  key={propiedad.id}
                  onClick={() => handleSelectSuggestion(propiedad)}
                  className="w-full text-left px-4 py-3 hover:bg-neutral-50 transition-colors border-b border-neutral-100 last:border-b-0"
                >
                  <div className="font-medium text-sm text-neutral-900">
                    {propiedad.nombre}
                  </div>
                  <div className="text-xs text-neutral-500 mt-0.5">
                    {propiedad.id} - {propiedad.direccion}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detalles de la propiedad - Cuadro flotante izquierdo */}
      {selected && (
        <div className="absolute top-24 left-4 z-20 w-full max-w-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden">
            {/* Carrusel de imagenes */}
            <div className="relative aspect-video bg-neutral-100">
              <Image
                src={
                  selected.imagenes[currentImageIndex] ||
                  "/placeholder_location.jpg"
                }
                alt={`${selected.nombre} - imagen ${currentImageIndex + 1}`}
                fill
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => setShowImageModal(true)}
              />

              {/* Controles del carrusel */}
              <div className="absolute inset-0 flex items-center justify-between p-2">
                <button
                  onClick={prevImage}
                  className="w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-neutral-700" />
                </button>
                <button
                  onClick={nextImage}
                  className="w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-neutral-700" />
                </button>
              </div>

              {/* Indicadores */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                {selected.imagenes.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentImageIndex ? "bg-white w-6" : "bg-white/60"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Informacion */}
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">
                    {selected.nombre}
                  </h3>
                  <p className="text-sm text-neutral-500">{selected.id}</p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-500" />
                </button>
              </div>

              <p className="text-sm text-neutral-600 mb-4">
                {selected.direccion}
              </p>

              <div className="text-xs text-neutral-500 mb-4 font-mono">
                {selected.lat.toFixed(6)}, {selected.lng.toFixed(6)}
              </div>

              {/* Botones de accion */}
              <div className="space-y-2">
                <button
                  className="w-full flex items-center justify-center gap-2 bg-neutral-900 text-white py-3 px-4 rounded-xl hover:bg-neutral-800 transition-colors font-medium text-sm"
                  onClick={() =>
                    alert("Ver archivos adjuntos de " + selected.nombre)
                  }
                >
                  <FileText className="w-4 h-4" />
                  Ver archivos adjuntos
                </button>

                <button
                  className="w-full flex items-center justify-center gap-2 bg-neutral-100 text-neutral-700 py-3 px-4 rounded-xl hover:bg-neutral-200 transition-colors font-medium text-sm"
                  onClick={() =>
                    window.open(
                      `https://www.openstreetmap.org/?mlat=${selected.lat}&mlon=${selected.lng}#map=18/${selected.lat}/${selected.lng}`,
                      "_blank"
                    )
                  }
                >
                  <Navigation className="w-4 h-4" />
                  Abrir vista del mapa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de imagen en grande */}
      {showImageModal && selected && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div
            className="relative max-w-5xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-12 right-0 p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="relative">
              <Image
                fill
                src={
                  selected.imagenes[currentImageIndex] ||
                  "/placeholder_location.jpg"
                }
                alt={`${selected.nombre} - imagen ${currentImageIndex + 1}`}
                className="w-full h-auto rounded-xl"
              />

              {/* Controles del carrusel en modal */}
              <div className="absolute inset-0 flex items-center justify-between p-4">
                <button
                  onClick={prevImage}
                  className="w-12 h-12 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-colors"
                >
                  <ChevronLeft className="w-6 h-6 text-neutral-700" />
                </button>
                <button
                  onClick={nextImage}
                  className="w-12 h-12 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-colors"
                >
                  <ChevronRight className="w-6 h-6 text-neutral-700" />
                </button>
              </div>

              {/* Contador de imagenes */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/60 text-white text-sm rounded-full">
                {currentImageIndex + 1} / {selected.imagenes.length}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mapa */}
      <div ref={mapContainerRef} className="absolute inset-0 z-0 w-full h-full" />
    </div>
  );
}
