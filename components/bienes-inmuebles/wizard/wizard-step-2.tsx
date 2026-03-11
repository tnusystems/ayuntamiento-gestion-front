"use client";

import { useEffect, useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

export function WizardStep2({ formData, updateFormData }: WizardStep2Props) {
    const [catalogs, setCatalogs] = useState<LookupCatalogs | null>(null);
    const [isLoadingCatalogs, setIsLoadingCatalogs] = useState(true);
    const [catalogsError, setCatalogsError] = useState<string | null>(null);
    const [catalogSearch, setCatalogSearch] = useState({
        zone: "",
        domain: "",
        stage_definition: "",
        situation: "",
        verification_status: "",
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
                    Ubicación
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
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                    <div className="space-y-2">
                        <Label htmlFor="lat">Lat</Label>
                        <Input
                            id="lat"
                            type="number"
                            inputMode="decimal"
                            step="any"
                            placeholder="29.0729"
                            value={formData.lat}
                            onChange={(e) =>
                                updateFormData({ lat: e.target.value })
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="alt">Alt</Label>
                        <Input
                            id="alt"
                            type="number"
                            inputMode="numeric"
                            step="1"
                            placeholder="200"
                            value={formData.alt}
                            onChange={(e) =>
                                updateFormData({ alt: e.target.value })
                            }
                        />
                    </div>
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
        </div>
    );
}
