"use client";

import { useEffect, useMemo, useState } from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { Map as MapIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { fetchCatalogs, type LookupCatalogs } from "@/lib/api/lookup-values";
import type { LookupValue } from "@/types";

interface WizardStep2Props {
    formData: {
        colonia: string;
        calle: string;
        numero: string;
        lote: string;
        manzana: string;
        superficieTerreno: string;
        superficieConstruccion: string;
        zona: string;
        dominio: string;
        stageDefinition: string;
        operacionU: string;
        verificationStatus: string;
        valorCatastral: string;
        valorComercial: string;
        lat: string;
        alt: string;
        observacionesTecnicas: string;
    };
    updateFormData: (data: Partial<WizardStep2Props["formData"]>) => void;
}

const DEFAULT_MAP_CENTER = {
    lat: 29.0892,
    lng: -110.9613,
};

export function WizardStep2({ formData, updateFormData }: WizardStep2Props) {
    const [catalogs, setCatalogs] = useState<LookupCatalogs | null>(null);
    const [isLoadingCatalogs, setIsLoadingCatalogs] = useState(true);
    const [catalogsError, setCatalogsError] = useState<string | null>(null);
    const [isMapDialogOpen, setIsMapDialogOpen] = useState(false);
    const [mapSelection, setMapSelection] =
        useState<google.maps.LatLngLiteral | null>(null);
    const [addressQuery, setAddressQuery] = useState("");
    const [isSearchingAddress, setIsSearchingAddress] = useState(false);
    const [addressSearchError, setAddressSearchError] = useState<string | null>(
        null,
    );
    const [catalogSearch, setCatalogSearch] = useState({
        zone: "",
        domain: "",
        stage_definition: "",
        situation: "",
        verification_status: "",
    });
    const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? "";
    const hasGoogleMapsKey = googleMapsApiKey.trim().length > 0;
    const { isLoaded: isMapLoaded, loadError: mapLoadError } = useLoadScript({
        id: "wizard-step-2-map-script",
        googleMapsApiKey,
    });

    const situationCatalog = useMemo(() => {
        const items = catalogs?.situation ?? [];
        if (items.length <= 1) {
            return items;
        }

        const selectedValue = formData.operacionU;
        const getLabel = (item: LookupValue) =>
            (item.name ?? String(item.key ?? item.id)).trim().toLowerCase();

        const uniqueByLabel = new Map<string, LookupValue>();
        for (const item of items) {
            const label = getLabel(item);
            if (!uniqueByLabel.has(label)) {
                uniqueByLabel.set(label, item);
                continue;
            }

            if (selectedValue && String(item.id) === selectedValue) {
                uniqueByLabel.set(label, item);
            }
        }

        return Array.from(uniqueByLabel.values());
    }, [catalogs?.situation, formData.operacionU]);

    const parsedCoordinates = useMemo(() => {
        const lat = Number(formData.lat);
        const lng = Number(formData.alt);

        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
            return null;
        }

        return { lat, lng };
    }, [formData.alt, formData.lat]);

    const mapCenter = mapSelection ?? parsedCoordinates ?? DEFAULT_MAP_CENTER;

    const handleOpenMapDialog = () => {
        setMapSelection(parsedCoordinates);
        setAddressSearchError(null);
        setIsMapDialogOpen(true);
    };

    const handleSearchAddress = () => {
        const query = addressQuery.trim();
        if (!query || !isMapLoaded) {
            return;
        }

        setIsSearchingAddress(true);
        setAddressSearchError(null);

        const geocoder = new google.maps.Geocoder();
        geocoder.geocode(
            {
                address: query,
                region: "mx",
            },
            (results, status) => {
                setIsSearchingAddress(false);

                if (status !== "OK" || !results || results.length === 0) {
                    setAddressSearchError(
                        "No encontramos esa dirección. Intenta con otra referencia.",
                    );
                    return;
                }

                const location = results[0].geometry.location;
                setMapSelection({ lat: location.lat(), lng: location.lng() });
            },
        );
    };

    const handleMapClick = (event: google.maps.MapMouseEvent) => {
        if (!event.latLng) {
            return;
        }

        setMapSelection({
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
        });
    };

    const handleApplyMapSelection = () => {
        if (!mapSelection) {
            return;
        }

        updateFormData({
            lat: mapSelection.lat.toFixed(6),
            alt: mapSelection.lng.toFixed(6),
        });
        setIsMapDialogOpen(false);
    };

    useEffect(() => {
        let isMounted = true;

        const loadCatalogs = async () => {
            setIsLoadingCatalogs(true);
            setCatalogsError(null);
            try {
                const data = await fetchCatalogs();
                if (isMounted) {
                    setCatalogs(data);
                }
            } catch (error) {
                if (isMounted) {
                    setCatalogs(null);
                    setCatalogsError(
                        error instanceof Error
                            ? error.message
                            : "No se pudieron cargar los catalogos.",
                    );
                }
            } finally {
                if (isMounted) {
                    setIsLoadingCatalogs(false);
                }
            }
        };

        void loadCatalogs();
        return () => {
            isMounted = false;
        };
    }, []);

    const renderCatalogItems = (items: LookupValue[], searchValue: string) => {
        if (isLoadingCatalogs) {
            return (
                <SelectItem value="__loading" disabled>
                    Cargando...
                </SelectItem>
            );
        }
        const normalizedSearch = searchValue.trim().toLowerCase();
        const filteredItems = normalizedSearch
            ? items.filter((item) => {
                  const label = item.name ?? String(item.key ?? item.id);
                  return label.toLowerCase().includes(normalizedSearch);
              })
            : items;
        if (filteredItems.length === 0) {
            return (
                <SelectItem value="__empty" disabled>
                    Sin opciones
                </SelectItem>
            );
        }
        return filteredItems.map((item) => {
            const value = String(item.id);
            const label = item.name ?? String(item.key ?? item.id);
            return (
                <SelectItem key={item.id} value={value}>
                    {label}
                </SelectItem>
            );
        });
    };

    return (
        <div className="space-y-8">
            {/* Location Section */}
            <div>
                <h3 className="mb-4 text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Dirección
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-2">
                        <Label htmlFor="colonia">Colonia *</Label>
                        <Input
                            id="colonia"
                            placeholder="Nombre de la colonia"
                            value={formData.colonia}
                            onChange={(e) =>
                                updateFormData({ colonia: e.target.value })
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="calle">Calle *</Label>
                        <Input
                            id="calle"
                            placeholder="Nombre de la calle"
                            value={formData.calle}
                            onChange={(e) =>
                                updateFormData({ calle: e.target.value })
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="numero">Número</Label>
                        <Input
                            id="numero"
                            placeholder="Número exterior"
                            value={formData.numero}
                            onChange={(e) =>
                                updateFormData({ numero: e.target.value })
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lote">Lote</Label>
                        <Input
                            id="lote"
                            placeholder="Número de lote"
                            value={formData.lote}
                            onChange={(e) =>
                                updateFormData({ lote: e.target.value })
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="manzana">Manzana</Label>
                        <Input
                            id="manzana"
                            placeholder="Número de manzana"
                            value={formData.manzana}
                            onChange={(e) =>
                                updateFormData({ manzana: e.target.value })
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="zona">Zona</Label>
                        <Select
                            value={formData.zona}
                            onValueChange={(value) =>
                                updateFormData({ zona: value })
                            }
                        >
                            <SelectTrigger id="zona">
                                <SelectValue placeholder="Seleccionar zona" />
                            </SelectTrigger>
                            <SelectContent>
                                <div className="p-2">
                                    <Input
                                        placeholder="Buscar zona..."
                                        value={catalogSearch.zone}
                                        onChange={(e) =>
                                            setCatalogSearch((prev) => ({
                                                ...prev,
                                                zone: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                                {renderCatalogItems(
                                    catalogs?.zone ?? [],
                                    catalogSearch.zone,
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Surfaces Section */}
            <div>
                <h3 className="mb-4 text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Superficies
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-2">
                        <Label htmlFor="superficieTerreno">
                            Superficie Terreno (m²)
                        </Label>
                        <Input
                            id="superficieTerreno"
                            type="number"
                            placeholder="0.00"
                            value={formData.superficieTerreno}
                            onChange={(e) =>
                                updateFormData({
                                    superficieTerreno: e.target.value,
                                })
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="superficieConstruccion">
                            Superficie Construcción (m²)
                        </Label>
                        <Input
                            id="superficieConstruccion"
                            type="number"
                            placeholder="0.00"
                            value={formData.superficieConstruccion}
                            onChange={(e) =>
                                updateFormData({
                                    superficieConstruccion: e.target.value,
                                })
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="dominio">Dominio</Label>
                        <Select
                            value={formData.dominio}
                            onValueChange={(value) =>
                                updateFormData({ dominio: value })
                            }
                        >
                            <SelectTrigger id="dominio">
                                <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent>
                                <div className="p-2">
                                    <Input
                                        placeholder="Buscar dominio..."
                                        value={catalogSearch.domain}
                                        onChange={(e) =>
                                            setCatalogSearch((prev) => ({
                                                ...prev,
                                                domain: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                                {renderCatalogItems(
                                    catalogs?.domain ?? [],
                                    catalogSearch.domain,
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Catalogs Section */}
            <div>
                <h3 className="mb-4 text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Catálogos
                </h3>
                {catalogsError ? (
                    <p className="mb-4 text-sm text-red-600">{catalogsError}</p>
                ) : null}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-2">
                        <Label htmlFor="stageDefinition">
                            Etapa del Trámite
                        </Label>
                        <Select
                            value={formData.stageDefinition}
                            onValueChange={(value) =>
                                updateFormData({ stageDefinition: value })
                            }
                        >
                            <SelectTrigger id="stageDefinition">
                                <SelectValue placeholder="Seleccionar etapa" />
                            </SelectTrigger>
                            <SelectContent>
                                <div className="p-2">
                                    <Input
                                        placeholder="Buscar etapa..."
                                        value={catalogSearch.stage_definition}
                                        onChange={(e) =>
                                            setCatalogSearch((prev) => ({
                                                ...prev,
                                                stage_definition:
                                                    e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                                {renderCatalogItems(
                                    catalogs?.stage_definition ?? [],
                                    catalogSearch.stage_definition,
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="operacionU">Uso de suelo</Label>
                        <Select
                            value={formData.operacionU}
                            onValueChange={(value) =>
                                updateFormData({ operacionU: value })
                            }
                        >
                            <SelectTrigger id="operacionU">
                                <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent>
                                <div className="p-2">
                                    <Input
                                        placeholder="Buscar uso de suelo..."
                                        value={catalogSearch.situation}
                                        onChange={(e) =>
                                            setCatalogSearch((prev) => ({
                                                ...prev,
                                                situation: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                                {renderCatalogItems(
                                    situationCatalog,
                                    catalogSearch.situation,
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="verificationStatus">
                            Estado de Verificación *
                        </Label>
                        <Select
                            value={formData.verificationStatus}
                            onValueChange={(value) =>
                                updateFormData({ verificationStatus: value })
                            }
                        >
                            <SelectTrigger id="verificationStatus">
                                <SelectValue placeholder="Seleccionar estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <div className="p-2">
                                    <Input
                                        placeholder="Buscar estado..."
                                        value={
                                            catalogSearch.verification_status
                                        }
                                        onChange={(e) =>
                                            setCatalogSearch((prev) => ({
                                                ...prev,
                                                verification_status:
                                                    e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                                {renderCatalogItems(
                                    catalogs?.verification_status ?? [],
                                    catalogSearch.verification_status,
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Values Section */}
            <div>
                <h3 className="mb-4 text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Valores y Verificación
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="valorCatastral">
                            Valor Catastral (MXN)
                        </Label>
                        <Input
                            id="valorCatastral"
                            type="number"
                            placeholder="0.00"
                            value={formData.valorCatastral}
                            onChange={(e) =>
                                updateFormData({
                                    valorCatastral: e.target.value,
                                })
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="valorComercial">
                            Valor Comercial (MXN)
                        </Label>
                        <Input
                            id="valorComercial"
                            type="number"
                            placeholder="0.00"
                            value={formData.valorComercial}
                            onChange={(e) =>
                                updateFormData({
                                    valorComercial: e.target.value,
                                })
                            }
                        />
                    </div>
                </div>
            </div>

            <div>
                <h3 className="mb-4 text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Localización
                </h3>
                <div className="rounded-lg border bg-muted/20 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-sm font-medium">
                                Selección de coordenadas
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Puedes capturar latitud y longitud manualmente o
                                seleccionarlas desde el mapa.
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleOpenMapDialog}
                        >
                            <MapIcon className="mr-2 h-4 w-4" />
                            Seleccionar en mapa
                        </Button>
                    </div>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="lat">Latitud</Label>
                            <Input
                                id="lat"
                                type="number"
                                inputMode="decimal"
                                step="any"
                                placeholder="29.072967"
                                value={formData.lat}
                                onChange={(e) =>
                                    updateFormData({ lat: e.target.value })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="alt">Longitud</Label>
                            <Input
                                id="alt"
                                type="number"
                                inputMode="decimal"
                                step="any"
                                placeholder="-110.955919"
                                value={formData.alt}
                                onChange={(e) =>
                                    updateFormData({ alt: e.target.value })
                                }
                            />
                        </div>
                    </div>
                    {parsedCoordinates ? (
                        <p className="mt-3 text-xs text-muted-foreground">
                            Coordenadas actuales: {parsedCoordinates.lat.toFixed(
                                6,
                            )}
                            , {parsedCoordinates.lng.toFixed(6)}
                        </p>
                    ) : null}
                </div>
            </div>

            {/* Observations */}
            <div className="space-y-2">
                <Label htmlFor="observacionesTecnicas">
                    Observaciones Técnicas
                </Label>
                <Textarea
                    id="observacionesTecnicas"
                    placeholder="Notas técnicas adicionales..."
                    rows={4}
                    value={formData.observacionesTecnicas}
                    onChange={(e) =>
                        updateFormData({
                            observacionesTecnicas: e.target.value,
                        })
                    }
                />
            </div>

            <Dialog open={isMapDialogOpen} onOpenChange={setIsMapDialogOpen}>
                <DialogContent className="max-w-5xl">
                    <DialogHeader>
                        <DialogTitle>Seleccionar ubicación en el mapa</DialogTitle>
                        <DialogDescription>
                            Haz clic en el mapa para establecer la latitud y
                            longitud del bien.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3">
                        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                            <Input
                                placeholder="Buscar dirección (ej. Blvd. Hidalgo, Hermosillo)"
                                value={addressQuery}
                                onChange={(event) => {
                                    setAddressQuery(event.target.value);
                                    if (addressSearchError) {
                                        setAddressSearchError(null);
                                    }
                                }}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                        event.preventDefault();
                                        handleSearchAddress();
                                    }
                                }}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleSearchAddress}
                                disabled={
                                    !addressQuery.trim() ||
                                    !hasGoogleMapsKey ||
                                    !isMapLoaded ||
                                    isSearchingAddress
                                }
                            >
                                {isSearchingAddress ? "Buscando..." : "Buscar"}
                            </Button>
                        </div>

                        {addressSearchError ? (
                            <p className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                                {addressSearchError}
                            </p>
                        ) : null}

                        {!hasGoogleMapsKey ? (
                            <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
                                No se encontró la variable
                                NEXT_PUBLIC_GOOGLE_MAPS_KEY. Configúrala para
                                habilitar el selector de mapa.
                            </p>
                        ) : mapLoadError ? (
                            <p className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                                No se pudo cargar Google Maps. Intenta de nuevo
                                en unos momentos.
                            </p>
                        ) : !isMapLoaded ? (
                            <p className="rounded-md border p-3 text-sm text-muted-foreground">
                                Cargando mapa...
                            </p>
                        ) : (
                            <div className="h-[520px] overflow-hidden rounded-md border">
                                <GoogleMap
                                    zoom={mapSelection ? 16 : 12}
                                    center={mapCenter}
                                    onClick={handleMapClick}
                                    mapContainerClassName="h-full w-full"
                                >
                                    {mapSelection ? (
                                        <Marker position={mapSelection} />
                                    ) : null}
                                </GoogleMap>
                            </div>
                        )}

                        <p className="text-xs text-muted-foreground">
                            {mapSelection
                                ? `Latitud: ${mapSelection.lat.toFixed(6)} | Longitud: ${mapSelection.lng.toFixed(6)}`
                                : "Haz clic sobre el mapa para seleccionar la ubicación."}
                        </p>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsMapDialogOpen(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            onClick={handleApplyMapSelection}
                            disabled={
                                !mapSelection ||
                                !hasGoogleMapsKey ||
                                Boolean(mapLoadError)
                            }
                        >
                            Usar esta ubicación
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
