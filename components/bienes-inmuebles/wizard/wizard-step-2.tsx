"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
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
        verificationDocument: {
            name: string;
            type: string;
            size: number;
            lastModified: number;
            file: File;
        } | null;
        valorCatastral: string;
        valorComercial: string;
        lat: string;
        alt: string;
        observacionesTecnicas: string;
    };
    errors?: {
        zona?: string;
        dominio?: string;
        stageDefinition?: string;
        operacionU?: string;
        verificationStatus?: string;
    };
    updateFormData: (data: Partial<WizardStep2Props["formData"]>) => void;
}

const DEFAULT_MAP_CENTER = {
    lat: 29.072967,
    lng: -110.955919,
};

const verificationDocumentAccept = ".pdf,.jpg,.jpeg,.png,.xls,.xlsx,.dwg,.dwf";

const isVerificationStatusForDocument = (labelValue: string) => {
    const label = labelValue
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase();

    if (!label) {
        return false;
    }

    if (/\bno\s+verifica(?:do|da|dos|das)?\b/.test(label)) {
        return false;
    }

    return /\bverifica(?:do|da|dos|das)?\b/.test(label);
};

export function WizardStep2({
    formData,
    errors,
    updateFormData,
}: WizardStep2Props) {
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

    const shouldShowVerificationDocument = useMemo(() => {
        const selected = (catalogs?.verification_status ?? []).find(
            (item) => String(item.id) === formData.verificationStatus,
        );
        if (!selected) {
            return false;
        }

        return isVerificationStatusForDocument(
            String(selected.name ?? selected.key ?? selected.id),
        );
    }, [catalogs?.verification_status, formData.verificationStatus]);

    const handleVerificationStatusChange = (value: string) => {
        const selected = (catalogs?.verification_status ?? []).find(
            (item) => String(item.id) === value,
        );
        const shouldKeepDocument = selected
            ? isVerificationStatusForDocument(
                  String(selected.name ?? selected.key ?? selected.id),
              )
            : false;

        updateFormData({
            verificationStatus: value,
            verificationDocument: shouldKeepDocument
                ? formData.verificationDocument
                : null,
        });
    };

    const handleVerificationDocumentChange = (
        event: ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0] ?? null;
        if (!file) {
            updateFormData({ verificationDocument: null });
            return;
        }

        updateFormData({
            verificationDocument: {
                name: file.name,
                type: file.type,
                size: file.size,
                lastModified: file.lastModified,
                file,
            },
        });
    };

    const parsedCoordinates = useMemo(() => {
        const latValue = formData.lat.trim();
        const lngValue = formData.alt.trim();

        if (!latValue || !lngValue) {
            return null;
        }

        const lat = Number(latValue);
        const lng = Number(lngValue);

        if (
            !Number.isFinite(lat) ||
            !Number.isFinite(lng) ||
            lat < -90 ||
            lat > 90 ||
            lng < -180 ||
            lng > 180
        ) {
            return null;
        }

        return { lat, lng };
    }, [formData.alt, formData.lat]);

    const hasMeaningfulCoordinates =
        parsedCoordinates !== null &&
        (Math.abs(parsedCoordinates.lat) > 0.01 ||
            Math.abs(parsedCoordinates.lng) > 0.01);

    const mapCenter = mapSelection ?? parsedCoordinates ?? DEFAULT_MAP_CENTER;

    const handleOpenMapDialog = () => {
        setMapSelection(
            hasMeaningfulCoordinates ? parsedCoordinates : DEFAULT_MAP_CENTER,
        );
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
        <div className="space-y-6">
            <div className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3">
                <p className="text-sm font-medium">Captura técnica del bien</p>
                <p className="text-xs text-muted-foreground">
                    Organiza la ubicación, clasificación y valores del inmueble.
                    Los campos con * son obligatorios.
                </p>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
                <section className="rounded-lg border border-border bg-card p-4">
                    <div className="mb-4">
                        <h3 className="text-sm font-semibold">Dirección</h3>
                        <p className="text-xs text-muted-foreground">
                            Datos para identificar físicamente el inmueble.
                        </p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
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
                        <div className="space-y-2 sm:col-span-2">
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
                    </div>
                </section>

                <section className="rounded-lg border border-border bg-card p-4">
                    <div className="mb-4 flex items-start justify-between gap-3">
                        <div>
                            <h3 className="text-sm font-semibold">Clasificación</h3>
                            <p className="text-xs text-muted-foreground">
                                Catálogos obligatorios para continuar.
                            </p>
                        </div>
                        <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                            Requerido
                        </span>
                    </div>
                    {catalogsError ? (
                        <p className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                            {catalogsError}
                        </p>
                    ) : null}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="zona">Zona *</Label>
                            <Select
                                value={formData.zona}
                                onValueChange={(value) =>
                                    updateFormData({ zona: value })
                                }
                            >
                                <SelectTrigger
                                    id="zona"
                                    aria-invalid={!!errors?.zona}
                                >
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
                            {errors?.zona ? (
                                <p className="text-xs text-red-600">{errors.zona}</p>
                            ) : null}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dominio">Dominio *</Label>
                            <Select
                                value={formData.dominio}
                                onValueChange={(value) =>
                                    updateFormData({ dominio: value })
                                }
                            >
                                <SelectTrigger
                                    id="dominio"
                                    aria-invalid={!!errors?.dominio}
                                >
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
                            {errors?.dominio ? (
                                <p className="text-xs text-red-600">
                                    {errors.dominio}
                                </p>
                            ) : null}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="stageDefinition">Etapa del Trámite *</Label>
                            <Select
                                value={formData.stageDefinition}
                                onValueChange={(value) =>
                                    updateFormData({ stageDefinition: value })
                                }
                            >
                                <SelectTrigger
                                    id="stageDefinition"
                                    aria-invalid={!!errors?.stageDefinition}
                                >
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
                            {errors?.stageDefinition ? (
                                <p className="text-xs text-red-600">
                                    {errors.stageDefinition}
                                </p>
                            ) : null}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="operacionU">Destino *</Label>
                            <Select
                                value={formData.operacionU}
                                onValueChange={(value) =>
                                    updateFormData({ operacionU: value })
                                }
                            >
                                <SelectTrigger
                                    id="operacionU"
                                    aria-invalid={!!errors?.operacionU}
                                >
                                    <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                                <SelectContent>
                                    <div className="p-2">
                                        <Input
                                            placeholder="Buscar destino..."
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
                            {errors?.operacionU ? (
                                <p className="text-xs text-red-600">
                                    {errors.operacionU}
                                </p>
                            ) : null}
                        </div>

                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="verificationStatus">
                                Estado de Verificación *
                            </Label>
                            <Select
                                value={formData.verificationStatus}
                                onValueChange={handleVerificationStatusChange}
                            >
                                <SelectTrigger
                                    id="verificationStatus"
                                    aria-invalid={!!errors?.verificationStatus}
                                >
                                    <SelectValue placeholder="Seleccionar estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <div className="p-2">
                                        <Input
                                            placeholder="Buscar estado..."
                                            value={catalogSearch.verification_status}
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
                            {errors?.verificationStatus ? (
                                <p className="text-xs text-red-600">
                                    {errors.verificationStatus}
                                </p>
                            ) : null}
                            {shouldShowVerificationDocument ? (
                                <div className="space-y-2 pt-2">
                                    <Label htmlFor="verificationDocument">
                                        Documento de verificación
                                    </Label>
                                    <Input
                                        id="verificationDocument"
                                        type="file"
                                        accept={verificationDocumentAccept}
                                        onChange={handleVerificationDocumentChange}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Formatos aceptados: PDF, JPG, PNG, XLS,
                                        XLSX, DWG, DWF.
                                    </p>
                                    {formData.verificationDocument ? (
                                        <p className="text-xs text-muted-foreground">
                                            Archivo seleccionado: {" "}
                                            {formData.verificationDocument.name}
                                        </p>
                                    ) : null}
                                </div>
                            ) : null}
                        </div>
                    </div>
                </section>
            </div>

            <section className="rounded-lg border border-border bg-card p-4">
                <div className="mb-4">
                    <h3 className="text-sm font-semibold">Superficies y valores</h3>
                    <p className="text-xs text-muted-foreground">
                        Captura medidas y montos de referencia del inmueble.
                    </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-2">
                        <Label htmlFor="superficieTerreno">Superficie Terreno (m²)</Label>
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
                        <Label htmlFor="valorCatastral">Valor Catastral (MXN)</Label>
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
                        <Label htmlFor="valorComercial">Valor Comercial (MXN)</Label>
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
            </section>

            <section className="rounded-lg border border-border bg-card p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h3 className="text-sm font-semibold">Localización</h3>
                        <p className="text-xs text-muted-foreground">
                            Puedes capturar latitud y longitud manualmente o seleccionarlas desde el mapa.
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
                            onChange={(e) => updateFormData({ lat: e.target.value })}
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
                            onChange={(e) => updateFormData({ alt: e.target.value })}
                        />
                    </div>
                </div>
                {parsedCoordinates ? (
                    <p className="mt-3 text-xs text-muted-foreground">
                        Coordenadas actuales: {parsedCoordinates.lat.toFixed(6)}, {" "}
                        {parsedCoordinates.lng.toFixed(6)}
                    </p>
                ) : null}
            </section>

            <section className="rounded-lg border border-border bg-card p-4">
                <div className="space-y-2">
                    <Label htmlFor="observacionesTecnicas">Observaciones Técnicas</Label>
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
            </section>

            <Dialog open={isMapDialogOpen} onOpenChange={setIsMapDialogOpen}>
                <DialogContent className="h-[88vh] w-[98vw] max-w-[98vw] overflow-y-auto p-6 sm:max-w-[98vw]">
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
                            <div className="h-[64vh] overflow-hidden rounded-md border">
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
