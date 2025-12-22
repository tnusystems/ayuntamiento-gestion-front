"use client";

import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { useState } from "react";
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
  Navigation,
} from "lucide-react";

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
      "/modern-house-exterior.png",
      "/cozy-living-room.png",
      "/cozy-kitchen.png",
    ],
  },
  {
    id: "HMO-002",
    nombre: "Terreno Norte",
    direccion: "Col. Modelo",
    lat: 29.0981,
    lng: -110.9654,
    imagenes: [
      "/empty-land-plot.png",
      "/land-aerial-view.jpg",
      "/land-with-trees.jpg",
    ],
  },
  {
    id: "PUB-001",
    nombre: "Cerro de la Campana",
    direccion: "Cerro de la Campana, Hermosillo",
    lat: 29.080556,
    lng: -110.958889,
    imagenes: [
      "/majestic-mountain-vista.png",
      "/winding-forest-trail.png",
      "/scenic-mountain-vista.png",
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
    nombre: "Cárcamo de Hermosillo",
    direccion: "Callejón del Cárcamo, Centro",
    lat: 29.068889,
    lng: -110.958611,
    imagenes: [
      "/water-reservoir.png",
      "/historic-building.png",
      "/architecture-details.jpg",
    ],
  },
  {
    id: "PUB-004",
    nombre: "Catedral de la Asunción",
    direccion: "Blvd. Hidalgo s/n, Centro",
    lat: 29.073611,
    lng: -110.956389,
    imagenes: [
      "/cathedral-exterior.jpg",
      "/cathedral-interior.jpg",
      "/church-altar.jpg",
    ],
  },
  {
    id: "PUB-005",
    nombre: "Estadio Sonora",
    direccion: "Blvd. de los Deportes, Hermosillo",
    lat: 29.091944,
    lng: -110.966111,
    imagenes: [
      "/baseball-stadium-exterior.jpg",
      "/stadium-field.jpg",
      "/stadium-seats.jpg",
    ],
  },
];

export default function MapaPage() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "",
  });

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

  if (!isLoaded)
    return (
      <div className="flex items-center justify-center h-screen bg-neutral-50">
        <p className="text-neutral-600">Cargando mapa...</p>
      </div>
    );

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Buscador flotante arriba del mapa */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-full max-w-md px-4">
        <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden">
          <div className="flex items-center gap-2 p-3">
            <Search className="w-5 h-5 text-neutral-400 ml-1" />
            <input
              type="text"
              placeholder="Buscar por código, nombre o dirección..."
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
            {/* Carrusel de imágenes */}
            <div className="relative aspect-video bg-neutral-100">
              <img
                src={selected.imagenes[currentImageIndex] || "/placeholder.svg"}
                alt={`${selected.nombre} - imagen ${currentImageIndex + 1}`}
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

            {/* Información */}
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

              {/* Botones de acción */}
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
                      `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${selected.lat},${selected.lng}`,
                      "_blank"
                    )
                  }
                >
                  <Navigation className="w-4 h-4" />
                  Abrir vista de calle
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
              <img
                src={selected.imagenes[currentImageIndex] || "/placeholder.svg"}
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

              {/* Contador de imágenes */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/60 text-white text-sm rounded-full">
                {currentImageIndex + 1} / {selected.imagenes.length}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mapa */}
      <GoogleMap
        zoom={13}
        center={selected ? { lat: selected.lat, lng: selected.lng } : center}
        mapContainerClassName="w-full h-full"
      >
        {propiedades.map((p) => (
          <Marker
            key={p.id}
            position={{ lat: p.lat, lng: p.lng }}
            onClick={() => {
              setSelected(p);
              setCurrentImageIndex(0);
            }}
          />
        ))}
      </GoogleMap>
    </div>
  );
}
