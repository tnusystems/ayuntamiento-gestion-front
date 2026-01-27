"use client";

import {
    GoogleMap,
    Marker,
    StreetViewPanorama,
    useLoadScript,
} from "@react-google-maps/api";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FileText, Navigation, Search, X } from "lucide-react";
import Image from "next/image";
import { fetchRegistries, fetchRegistry } from "@/lib/api/registries";
import { fetchAssets } from "@/lib/api/assets";

const center = {
    lat: 29.072967,
    lng: -110.955919,
};

type RegistryItem = Awaited<ReturnType<typeof fetchRegistries>>["data"][number];

type AssetItem = Awaited<ReturnType<typeof fetchAssets>>["data"][number];

type AssetMarker = {
    id: string | number;
    lat: number;
    lng: number;
    c_number?: string | null;
    rpp_number?: string | null;
    name?: string | null;
};

export default function MapaPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "",
    });

    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState<RegistryItem[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [isRegistrySelected, setIsRegistrySelected] = useState(false);

    const [registryId, setRegistryId] = useState<string | number | null>(null);
    const [registryName, setRegistryName] = useState<string | null>(null);
    const selectedAssetId = searchParams.get("asset_id");
    const registryIdParam = searchParams.get("registry_id");
    const isDeepLink = Boolean(selectedAssetId && registryIdParam);

    const [assetQuery, setAssetQuery] = useState("");
    const [debouncedAssetQuery, setDebouncedAssetQuery] = useState("");
    const [isAssetSearching, setIsAssetSearching] = useState(false);
    const [assetError, setAssetError] = useState<string | null>(null);
    const [assets, setAssets] = useState<AssetMarker[]>([]);
    const [selectedAsset, setSelectedAsset] = useState<AssetMarker | null>(
        null,
    );
    const [showStreetView, setShowStreetView] = useState(false);
    const [streetViewPosition, setStreetViewPosition] =
        useState<google.maps.LatLngLiteral | null>(null);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedQuery(query.trim());
        }, 400);
        return () => clearTimeout(timeoutId);
    }, [query]);

    useEffect(() => {
        let isActive = true;

        const hydrateFromParams = async () => {
            if (!registryIdParam) return;
            setRegistryId(registryIdParam);
            setIsRegistrySelected(true);
            try {
                const response = await fetchRegistry(registryIdParam);
                if (!isActive) return;
                const label =
                    response?.name ??
                    response?.rpp_number ??
                    String(registryIdParam);
                setRegistryName(label);
                setQuery(label);
            } catch {
                // ignore
            }
            if (selectedAssetId) {
                setAssetQuery("");
                setDebouncedAssetQuery("");
            }
        };

        void hydrateFromParams();
        return () => {
            isActive = false;
        };
    }, [registryIdParam, selectedAssetId]);

    useEffect(() => {
        let isActive = true;

        const loadSuggestions = async () => {
            if (!debouncedQuery) {
                setSuggestions([]);
                setShowSuggestions(false);
                setSearchError(null);
                return;
            }
            if (isRegistrySelected) {
                setSuggestions([]);
                setShowSuggestions(false);
                setSearchError(null);
                return;
            }
            setIsSearching(true);
            setSearchError(null);
            try {
                const response = await fetchRegistries({
                    page: 1,
                    per_page: 10,
                    q: debouncedQuery,
                });
                if (!isActive) return;
                setSuggestions(response.data ?? []);
                setShowSuggestions(true);
            } catch (error) {
                if (!isActive) return;
                setSuggestions([]);
                setShowSuggestions(true);
                setSearchError(
                    error instanceof Error
                        ? error.message
                        : "Error al buscar registros.",
                );
            } finally {
                if (isActive) {
                    setIsSearching(false);
                }
            }
        };

        void loadSuggestions();
        return () => {
            isActive = false;
        };
    }, [debouncedQuery]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedAssetQuery(assetQuery.trim());
        }, 400);
        return () => clearTimeout(timeoutId);
    }, [assetQuery]);

    useEffect(() => {
        let isActive = true;

        const loadAssets = async () => {
            if (!registryId || (!debouncedAssetQuery && !selectedAssetId)) {
                setAssets([]);
                setAssetError(null);
                return;
            }
            setIsAssetSearching(true);
            setAssetError(null);
            try {
                const queryValue =
                    debouncedAssetQuery && !isDeepLink
                        ? debouncedAssetQuery
                        : undefined;
                const response = await fetchAssets({
                    page: 1,
                    per_page: 100,
                    q: queryValue,
                    registry_id: String(registryId),
                });
                if (!isActive) return;
                const nextAssets = response.data
                    .map((asset, index) => {
                        const lat = Number(asset.latitude);
                        const lng = Number(asset.longitude);
                        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
                            return null;
                        }
                        return {
                            id: asset.id ?? `${lat}-${lng}-${index}`,
                            lat,
                            lng,
                            c_number: asset.c_number ?? null,
                            rpp_number: asset.rpp_number ?? null,
                            name: asset.description ?? asset.colony ?? null,
                        } as AssetMarker;
                    })
                    .filter((asset): asset is AssetMarker => Boolean(asset));
                const limitedAssets = nextAssets.slice(0, 100);
                setAssets(limitedAssets);
                if (selectedAssetId) {
                    const match = limitedAssets.find(
                        (asset) => String(asset.id) === String(selectedAssetId),
                    );
                    setSelectedAsset(match ?? null);
                } else {
                    setSelectedAsset(null);
                }
            } catch (error) {
                if (!isActive) return;
                setAssets([]);
                setSelectedAsset(null);
                setAssetError(
                    error instanceof Error
                        ? error.message
                        : "Error al buscar bienes.",
                );
            } finally {
                if (isActive) {
                    setIsAssetSearching(false);
                }
            }
        };

        void loadAssets();
        return () => {
            isActive = false;
        };
    }, [debouncedAssetQuery, registryId, selectedAssetId]);

    const handleSelectRegistry = async (registry: RegistryItem) => {
        setRegistryId(registry.id ?? null);
        setRegistryName(
            registry.name ?? registry.rpp_number ?? String(registry.id),
        );
        setQuery(registry.name ?? registry.rpp_number ?? String(registry.id));
        setShowSuggestions(false);
        setIsRegistrySelected(true);
        setAssets([]);
        setAssetQuery("");
        setSelectedAsset(null);
        try {
            const response = await fetchRegistry(registry.id);
            setRegistryName(
                response?.name ?? response?.rpp_number ?? String(registry.id),
            );
        } catch {
            // ignore
        }
    };

    const handleClear = () => {
        setQuery("");
        setDebouncedQuery("");
        setShowSuggestions(false);
        setSuggestions([]);
        setSearchError(null);
        setRegistryId(null);
        setRegistryName(null);
        setIsRegistrySelected(false);
        setAssets([]);
        setAssetQuery("");
        setDebouncedAssetQuery("");
        setAssetError(null);
        setSelectedAsset(null);
        setShowStreetView(false);
        setStreetViewPosition(null);
    };

    const openGoogleMaps = (asset: AssetMarker) => {
        const url = `https://www.google.com/maps/search/?api=1&query=${asset.lat},${asset.lng}`;
        window.open(url, "_blank", "noopener,noreferrer");
    };

    const mapCenter = useMemo(() => {
        if (selectedAsset) {
            return { lat: selectedAsset.lat, lng: selectedAsset.lng };
        }
        return center;
    }, [selectedAsset]);

    useEffect(() => {
        if (selectedAsset) {
            setStreetViewPosition({
                lat: selectedAsset.lat,
                lng: selectedAsset.lng,
            });
            setShowStreetView(false);
        } else {
            setStreetViewPosition(null);
            setShowStreetView(false);
        }
    }, [selectedAsset]);

    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center h-screen bg-neutral-50">
                <p className="text-neutral-600">Cargando mapa...</p>
            </div>
        );
    }

    return (
        <div className="relative h-screen w-full overflow-hidden">
            {" "}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-full max-w-md px-4">
                <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden">
                    <div className="flex items-center gap-2 p-3">
                        <Search className="w-5 h-5 text-neutral-400 ml-1" />
                        <input
                            type="text"
                            placeholder="Buscar registro por ID, RPP o nombre..."
                            className="flex-1 outline-none text-sm text-neutral-700 placeholder:text-neutral-400"
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setIsRegistrySelected(false);
                            }}
                            onFocus={() => {
                                if (debouncedQuery && !isRegistrySelected) {
                                    setShowSuggestions(true);
                                }
                            }}
                            onKeyDown={(e) => {
                                if (
                                    e.key === "Enter" &&
                                    suggestions.length > 0
                                ) {
                                    handleSelectRegistry(suggestions[0]);
                                }
                            }}
                        />
                        {query && (
                            <button
                                onClick={handleClear}
                                className="p-1 hover:bg-neutral-100 rounded-full transition-colors"
                            >
                                <X className="w-4 h-4 text-neutral-500" />
                            </button>
                        )}
                    </div>

                    {showSuggestions && (
                        <div className="border-t border-neutral-200 max-h-64 overflow-y-auto">
                            {isSearching ? (
                                <div className="px-4 py-3 text-sm text-neutral-500">
                                    Buscando registros...
                                </div>
                            ) : searchError ? (
                                <div className="px-4 py-3 text-sm text-red-600">
                                    {searchError}
                                </div>
                            ) : suggestions.length === 0 ? (
                                <div className="px-4 py-3 text-sm text-neutral-500">
                                    Sin resultados.
                                </div>
                            ) : (
                                suggestions.map((registry) => (
                                    <button
                                        key={String(registry.id)}
                                        onClick={() =>
                                            handleSelectRegistry(registry)
                                        }
                                        className="w-full text-left px-4 py-3 hover:bg-neutral-50 transition-colors border-b border-neutral-100 last:border-b-0"
                                    >
                                        <div className="font-medium text-sm text-neutral-900">
                                            {registry.name ?? "Registro"}
                                        </div>
                                        <div className="text-xs text-neutral-500 mt-0.5">
                                            {registry.rpp_number ?? "RPP"} · ID{" "}
                                            {String(registry.id)}
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
            {registryId && (
                <div className="absolute top-4 right-4 z-20 w-full max-w-xs">
                    <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-3 space-y-2">
                        <div className="text-xs text-neutral-500">
                            {registryName
                                ? `Registro: ${registryName}`
                                : "Registro seleccionado"}
                        </div>
                        <input
                            type="text"
                            placeholder="Filtrar por clave catastral o RPP..."
                            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
                            value={assetQuery}
                            onChange={(e) => setAssetQuery(e.target.value)}
                        />
                        {isAssetSearching ? (
                            <div className="text-xs text-neutral-500">
                                Buscando bienes...
                            </div>
                        ) : assetError ? (
                            <div className="text-xs text-red-600">
                                {assetError}
                            </div>
                        ) : (
                            <div className="text-xs text-neutral-500">
                                Mostrando {assets.length} resultado(s) (máx. 10)
                            </div>
                        )}
                    </div>
                </div>
            )}
            <GoogleMap
                zoom={assets.length ? 14 : 12}
                center={mapCenter}
                mapContainerClassName="w-full h-full"
            >
                {showStreetView && streetViewPosition && (
                    <StreetViewPanorama
                        options={{
                            addressControl: false,
                            fullscreenControl: false,
                            visible: true,
                            position: streetViewPosition,
                        }}
                    />
                )}
                {assets.map((asset) => (
                    <Marker
                        key={String(asset.id)}
                        position={{ lat: asset.lat, lng: asset.lng }}
                        onClick={() => {
                            setSelectedAsset(asset);
                            setShowStreetView(false);
                        }}
                    />
                ))}
            </GoogleMap>
            {selectedAsset && (
                <div className="absolute bottom-4 right-4 z-20 w-full max-w-sm">
                    <div className="bg-white rounded-3xl shadow-xl border border-neutral-200 overflow-hidden">
                        <div className="relative aspect-[4/3] bg-neutral-100">
                            <Image
                                src="/placeholder_location.jpg"
                                alt="Vista previa del bien"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="p-4 space-y-3">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <p className="text-lg font-semibold text-neutral-900">
                                        {selectedAsset.name ?? "Bien"}
                                    </p>
                                    <p className="text-xs text-neutral-500">
                                        {selectedAsset.rpp_number ?? "—"}
                                    </p>
                                </div>
                                <button
                                    className="p-1.5 rounded-full hover:bg-neutral-100"
                                    onClick={() => {
                                        setSelectedAsset(null);
                                        setShowStreetView(false);
                                        setStreetViewPosition(null);
                                    }}
                                >
                                    <X className="h-4 w-4 text-neutral-500" />
                                </button>
                            </div>
                            <div className="text-sm text-neutral-600">
                                Clave catastral: {selectedAsset.c_number ?? "—"}
                            </div>
                            <div className="text-xs text-neutral-500">
                                {selectedAsset.lat.toFixed(6)},{" "}
                                {selectedAsset.lng.toFixed(6)}
                            </div>
                            <button
                                className="w-full flex items-center justify-center gap-2 bg-neutral-900 text-white py-2.5 px-4 rounded-xl hover:bg-neutral-800 transition-colors font-medium text-sm"
                                type="button"
                                onClick={() => alert("Ver archivos adjuntos")}
                            >
                                <FileText className="w-4 h-4" />
                                Ver archivos adjuntos
                            </button>
                            <button
                                className="w-full flex items-center justify-center gap-2 bg-neutral-100 text-neutral-700 py-2.5 px-4 rounded-xl hover:bg-neutral-200 transition-colors font-medium text-sm"
                                type="button"
                                onClick={() => {
                                    setStreetViewPosition({
                                        lat: selectedAsset.lat,
                                        lng: selectedAsset.lng,
                                    });
                                    setShowStreetView((prev) => !prev);
                                }}
                            >
                                <Navigation className="w-4 h-4" />
                                {showStreetView
                                    ? "Ocultar vista de calle"
                                    : "Abrir vista de calle"}
                            </button>
                            <button
                                className="w-full flex items-center justify-center gap-2 bg-neutral-100 text-neutral-700 py-2.5 px-4 rounded-xl hover:bg-neutral-200 transition-colors font-medium text-sm"
                                type="button"
                                onClick={() => {
                                    if (!registryId) return;
                                    router.push(
                                        `/assets/${registryId}/detail/${selectedAsset.id}`,
                                    );
                                }}
                            >
                                <FileText className="w-4 h-4" />
                                Ver bien
                            </button>
                            <button
                                className="w-full flex items-center justify-center gap-2 bg-neutral-100 text-neutral-700 py-2.5 px-4 rounded-xl hover:bg-neutral-200 transition-colors font-medium text-sm"
                                type="button"
                                onClick={() => openGoogleMaps(selectedAsset)}
                            >
                                <Navigation className="w-4 h-4" />
                                Abrir en Google Maps
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
