"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { tiposProceso } from "@/lib/mock-data";
import { useOperationTypes } from "@/lib/hooks/bienes-inmuebles";
import { searchAssets } from "@/lib/api/assets";

interface WizardStep1Props {
    formData: {
        tipoProceso: string;
        actoJuridico: string;
        responsable: string;
        observaciones: string;
        rppNumber: string;
        claveCatastral: string;
        hasAntecedente: boolean;
        antecedenteRpp: string;
        antecedenteAssetId: string;
        antecedenteRegistryId: string;
        antecedenteRegistryName: string;
    };
    errors?: {
        tipoProceso?: string;
        actoJuridico?: string;
        responsable?: string;
        observaciones?: string;
        antecedente?: string;
    };
    updateFormData: (data: Partial<WizardStep1Props["formData"]>) => void;
}

export function WizardStep1({
    formData,
    errors,
    updateFormData,
}: WizardStep1Props) {
    const operationTypes = useOperationTypes();
    const [isSearchingAntecedente, setIsSearchingAntecedente] = useState(false);
    const [antecedenteSearchError, setAntecedenteSearchError] = useState<
        string | null
    >(null);
    const [antecedenteResults, setAntecedenteResults] = useState<
        Array<{
            id: string;
            rppNumber: string;
            cNumber: string;
            ownerName: string;
            registryId: string;
            isActive: boolean;
        }>
    >([]);

    const handleSearchAntecedente = async () => {
        const query = formData.antecedenteRpp.trim();
        if (!query) {
            setAntecedenteSearchError("Ingresa un RPP para buscar.");
            return;
        }

        try {
            setIsSearchingAntecedente(true);
            setAntecedenteSearchError(null);

            const response = await searchAssets({
                q: query,
                rpp_number: query,
            });

            const matches = response.results
                .map((result) => ({
                    id: String(result.asset.id),
                    rppNumber: result.asset.rpp_number?.trim() ?? "",
                    cNumber: result.asset.c_number?.trim() ?? "",
                    ownerName: result.asset.owner_name?.trim() ?? "Sin titular",
                    registryId: String(result.asset.registry_id ?? ""),
                    isActive: result.is_active !== false,
                }))
                .filter((item) => item.id);

            if (matches.length === 0) {
                setAntecedenteResults([]);
                updateFormData({
                    antecedenteAssetId: "",
                    antecedenteRegistryId: "",
                    antecedenteRegistryName: "",
                });
                setAntecedenteSearchError(
                    "No se encontró un antecedente con ese RPP.",
                );
                return;
            }

            const exactMatch = matches.find(
                (item) => item.rppNumber.toLowerCase() === query.toLowerCase(),
            );
            const prioritizedMatches = exactMatch
                ? [
                      exactMatch,
                      ...matches.filter((item) => item.id !== exactMatch.id),
                  ]
                : matches;

            setAntecedenteResults(prioritizedMatches);
        } catch (error) {
            setAntecedenteResults([]);
            setAntecedenteSearchError(
                error instanceof Error
                    ? error.message
                    : "No se pudo buscar el antecedente.",
            );
        } finally {
            setIsSearchingAntecedente(false);
        }
    };

    const handleSelectAntecedente = (selectedAsset: {
        id: string;
        rppNumber: string;
        cNumber: string;
        ownerName: string;
        registryId: string;
    }) => {
        setAntecedenteSearchError(null);
        updateFormData({
            antecedenteAssetId: selectedAsset.id,
            antecedenteRpp: selectedAsset.rppNumber || formData.antecedenteRpp,
            antecedenteRegistryId: selectedAsset.registryId,
            antecedenteRegistryName:
                selectedAsset.ownerName || `Bien #${selectedAsset.id}`,
            ...(formData.rppNumber.trim() || !selectedAsset.rppNumber
                ? {}
                : {
                      rppNumber: selectedAsset.rppNumber,
                  }),
        });
    };

    return (
        <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-3 sm:col-span-2">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="order-1 space-y-2">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="hasAntecedente" className="text-sm">
                                Antecedente
                            </Label>
                            <label
                                htmlFor="hasAntecedente"
                                className="inline-flex cursor-pointer items-center"
                            >
                                <input
                                    id="hasAntecedente"
                                    type="checkbox"
                                    role="switch"
                                    checked={formData.hasAntecedente}
                                    onChange={(event) => {
                                        const hasAntecedente =
                                            event.target.checked;
                                        setAntecedenteSearchError(null);
                                        updateFormData({
                                            hasAntecedente,
                                            ...(hasAntecedente
                                                ? {}
                                                : {
                                                      antecedenteRpp: "",
                                                      antecedenteAssetId: "",
                                                      antecedenteRegistryId:
                                                          "",
                                                      antecedenteRegistryName:
                                                          "",
                                                  }),
                                        });
                                        if (!hasAntecedente) {
                                            setAntecedenteResults([]);
                                        }
                                    }}
                                    className="peer sr-only"
                                />
                                <span className="relative h-6 w-11 rounded-full bg-muted transition-colors peer-checked:bg-primary after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:bg-background after:shadow after:transition-transform after:content-[''] peer-checked:after:translate-x-5" />
                            </label>
                        </div>

                        {formData.hasAntecedente ? (
                            <div className="space-y-2">
                                <Input
                                    id="antecedenteRpp"
                                    placeholder="Buscar antecedente por RPP"
                                    value={formData.antecedenteRpp}
                                    onChange={(e) => {
                                        setAntecedenteSearchError(null);
                                        updateFormData({
                                            antecedenteRpp: e.target.value,
                                            antecedenteAssetId: "",
                                            antecedenteRegistryId: "",
                                            antecedenteRegistryName: "",
                                        });
                                        setAntecedenteResults([]);
                                    }}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter") {
                                            event.preventDefault();
                                            void handleSearchAntecedente();
                                        }
                                    }}
                                />

                                {antecedenteResults.length > 0 ? (
                                    <div className="space-y-2 rounded-md border border-border p-2">
                                        <p className="text-xs text-muted-foreground">
                                            Antecedentes encontrados: {antecedenteResults.length}
                                        </p>
                                        <div className="space-y-2">
                                            {antecedenteResults.map((item) => {
                                                const isSelected =
                                                    formData.antecedenteAssetId ===
                                                    item.id;

                                                return (
                                                    <button
                                                        key={item.id}
                                                        type="button"
                                                        className={`w-full rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                                                            isSelected
                                                                ? "border-primary bg-primary/5"
                                                                : "border-border hover:bg-muted/40"
                                                        }`}
                                                        onClick={() => {
                                                            handleSelectAntecedente(
                                                                item,
                                                            );
                                                        }}
                                                    >
                                                        <p className="font-medium">
                                                            RPP {item.rppNumber || "—"}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Catastral: {item.cNumber || "—"}
                                                            {" · "}
                                                            Titular: {item.ownerName}
                                                            {" · "}
                                                            {item.isActive
                                                                ? "Activo"
                                                                : "Inactivo"}
                                                        </p>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : null}

                                {formData.antecedenteAssetId ? (
                                    <p className="text-xs text-muted-foreground">
                                        Antecedente seleccionado: RPP {formData.antecedenteRpp}
                                        {" · "}
                                        {formData.antecedenteRegistryName}
                                    </p>
                                ) : null}

                                {antecedenteSearchError ? (
                                    <p className="text-xs text-red-600">
                                        {antecedenteSearchError}
                                    </p>
                                ) : null}

                                {errors?.antecedente ? (
                                    <p className="text-xs text-red-600">
                                        {errors.antecedente}
                                    </p>
                                ) : null}
                            </div>
                        ) : null}
                    </div>

                    <div className="order-2 space-y-2">
                        <div className="flex h-6 items-center">
                            <Label htmlFor="claveCatastral">Clave Catastral</Label>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <Input
                                id="claveCatastral"
                                type="number"
                                inputMode="numeric"
                                step="1"
                                placeholder="Clave catastral"
                                value={formData.claveCatastral}
                                onChange={(e) =>
                                    updateFormData({ claveCatastral: e.target.value })
                                }
                                className="sm:flex-1"
                            />
                            {formData.hasAntecedente ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        void handleSearchAntecedente();
                                    }}
                                    disabled={
                                        !formData.antecedenteRpp.trim() ||
                                        isSearchingAntecedente
                                    }
                                    className="w-full sm:w-auto"
                                >
                                    {isSearchingAntecedente
                                        ? "Buscando..."
                                        : "Buscar"}
                                </Button>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="tipoProceso">Tipo de Proceso *</Label>
                <Select
                    value={formData.tipoProceso}
                    onValueChange={(value) =>
                        updateFormData({ tipoProceso: value })
                    }
                >
                    <SelectTrigger
                        id="tipoProceso"
                        aria-invalid={!!errors?.tipoProceso}
                    >
                        <SelectValue placeholder="Seleccionar tipo de proceso" />
                    </SelectTrigger>
                    <SelectContent>
                        {tiposProceso.map((tipo) => (
                            <SelectItem key={tipo.value} value={tipo.value}>
                                {tipo.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors?.tipoProceso ? (
                    <p className="text-xs text-red-600">{errors.tipoProceso}</p>
                ) : null}
            </div>

            <div className="space-y-2">
                <Label htmlFor="rppNumber">RPP</Label>
                <Input
                    id="rppNumber"
                    placeholder="RPP"
                    value={formData.rppNumber}
                    readOnly
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="actoJuridico">Acto Jurídico *</Label>
                <Select
                    value={formData.actoJuridico}
                    onValueChange={(value) =>
                        updateFormData({ actoJuridico: value })
                    }
                >
                    <SelectTrigger
                        id="actoJuridico"
                        aria-invalid={!!errors?.actoJuridico}
                    >
                        <SelectValue placeholder="Seleccionar acto jurídico" />
                    </SelectTrigger>
                    <SelectContent>
                        {operationTypes.length === 0 && (
                            <SelectItem value="__empty" disabled>
                                Sin tipos disponibles
                            </SelectItem>
                        )}
                        {operationTypes.map((operationType) => {
                            const label =
                                operationType.name ??
                                operationType.key ??
                                String(operationType.id);
                            return (
                                <SelectItem
                                    key={operationType.id}
                                    value={String(operationType.id)}
                                >
                                    {label}
                                </SelectItem>
                            );
                        })}
                    </SelectContent>
                </Select>
                {errors?.actoJuridico ? (
                    <p className="text-xs text-red-600">
                        {errors.actoJuridico}
                    </p>
                ) : null}
            </div>

            <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="responsable">Responsable del Trámite *</Label>
                <Input
                    id="responsable"
                    placeholder="Nombre completo del responsable"
                    value={formData.responsable}
                    onChange={(e) =>
                        updateFormData({ responsable: e.target.value })
                    }
                    aria-invalid={!!errors?.responsable}
                />
                {errors?.responsable ? (
                    <p className="text-xs text-red-600">{errors.responsable}</p>
                ) : null}
            </div>

            <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="observaciones">Observaciones Generales *</Label>
                <Textarea
                    id="observaciones"
                    placeholder="Notas adicionales sobre el proceso..."
                    rows={4}
                    value={formData.observaciones}
                    onChange={(e) =>
                        updateFormData({ observaciones: e.target.value })
                    }
                    aria-invalid={!!errors?.observaciones}
                />
                {errors?.observaciones ? (
                    <p className="text-xs text-red-600">
                        {errors.observaciones}
                    </p>
                ) : null}
            </div>
        </div>
    );
}
