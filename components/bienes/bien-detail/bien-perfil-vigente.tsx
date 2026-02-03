// components/bienes/bien-detail/bien-perfil-vigente.tsx
"use client";

import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateAsset } from "@/lib/api/assets";

interface BienPerfilVigenteProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    bien: any;
}

export default function BienPerfilVigente({ bien }: BienPerfilVigenteProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [currentBien, setCurrentBien] = useState(bien);
    const [formValues, setFormValues] = useState({
        colony: bien.colony ?? "",
        street: bien.street ?? "",
        numero: bien.numero ?? "",
        lot: bien.lot ?? "",
        block: bien.block ?? "",
        zone: bien.zone ?? "",
        totalArea: bien.totalArea ?? "",
        builtArea: bien.builtArea ?? "",
        domain: bien.domain ?? "",
        situacion: bien.situacion ?? "",
        valorCatastral: bien.valorCatastral ?? "",
        valorComercial: bien.valorComercial ?? "",
        latitude: bien.latitude ?? "",
        longitude: bien.longitude ?? "",
    });

    useEffect(() => {
        setCurrentBien(bien);
        setFormValues({
            colony: bien.colony ?? "",
            street: bien.street ?? "",
            numero: bien.numero ?? "",
            lot: bien.lot ?? "",
            block: bien.block ?? "",
            zone: bien.zone ?? "",
            totalArea: bien.totalArea ?? "",
            builtArea: bien.builtArea ?? "",
            domain: bien.domain ?? "",
            situacion: bien.situacion ?? "",
            valorCatastral: bien.valorCatastral ?? "",
            valorComercial: bien.valorComercial ?? "",
            latitude: bien.latitude ?? "",
            longitude: bien.longitude ?? "",
        });
    }, [bien]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("es-MX", {
            style: "currency",
            currency: "MXN",
        }).format(value);
    };

    const valueOrDash = (value?: string | number | null) =>
        value === null || value === undefined || value === ""
            ? "—"
            : String(value);

    const hasCoords = currentBien.latitude || currentBien.longitude;
    const coordsText =
        hasCoords && (currentBien.latitude || currentBien.longitude)
            ? `${valueOrDash(currentBien.latitude)}°, ${valueOrDash(
                  currentBien.longitude,
              )}°`
            : "—";

    const valorCatastral = Number(currentBien.valorCatastral ?? 0);
    const valorComercial = Number.isFinite(Number(currentBien.valorComercial))
        ? Number(currentBien.valorComercial)
        : Number.isFinite(valorCatastral)
          ? valorCatastral * 1.3
          : 0;

    const normalizeNumber = (value: string | number) => {
        if (value === "" || value === null || value === undefined) {
            return undefined;
        }
        if (typeof value === "number") {
            return Number.isFinite(value) ? value : undefined;
        }
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : undefined;
    };

    const handleSave = async () => {
        if (!bien?.id) return;
        setError(null);
        setNotice(null);
        setIsSaving(true);
        try {
            const payload = {
                colony: formValues.colony || undefined,
                street: formValues.street || undefined,
                c_number: formValues.numero || undefined,
                lot: formValues.lot || undefined,
                block: formValues.block || undefined,
                zone_id: formValues.zone || undefined,
                domain_id: formValues.domain || undefined,
                total_area: normalizeNumber(formValues.totalArea),
                built_area: normalizeNumber(formValues.builtArea),
                cadastral_value: normalizeNumber(formValues.valorCatastral),
                commercial_value: normalizeNumber(formValues.valorComercial),
                latitude: normalizeNumber(formValues.latitude),
                longitude: normalizeNumber(formValues.longitude),
                status: formValues.situacion || undefined,
            };
            const updated = await updateAsset(Number(bien.id), payload);
            if (
                updated &&
                typeof updated === "object" &&
                "approval_request" in updated
            ) {
                setNotice("Solicitud enviada para aprobación.");
                setIsEditing(false);
                return;
            }
            setCurrentBien((prev: typeof bien) => ({
                ...prev,
                colony: formValues.colony || undefined,
                street: formValues.street || undefined,
                numero: formValues.numero || undefined,
                lot: formValues.lot || undefined,
                block: formValues.block || undefined,
                zone: formValues.zone || undefined,
                domain: formValues.domain || undefined,
                totalArea: formValues.totalArea || undefined,
                builtArea: formValues.builtArea || undefined,
                valorCatastral:
                    normalizeNumber(formValues.valorCatastral) ??
                    prev.valorCatastral,
                valorComercial:
                    normalizeNumber(formValues.valorComercial) ??
                    prev.valorComercial,
                latitude: formValues.latitude || undefined,
                longitude: formValues.longitude || undefined,
                situacion: formValues.situacion || undefined,
            }));
            setIsEditing(false);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "No se pudo actualizar el bien.",
            );
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setFormValues({
            colony: currentBien.colony ?? "",
            street: currentBien.street ?? "",
            numero: currentBien.numero ?? "",
            lot: currentBien.lot ?? "",
            block: currentBien.block ?? "",
            zone: currentBien.zone ?? "",
            totalArea: currentBien.totalArea ?? "",
            builtArea: currentBien.builtArea ?? "",
            domain: currentBien.domain ?? "",
            situacion: currentBien.situacion ?? "",
            valorCatastral: currentBien.valorCatastral ?? "",
            valorComercial: currentBien.valorComercial ?? "",
            latitude: currentBien.latitude ?? "",
            longitude: currentBien.longitude ?? "",
        });
        setError(null);
        setNotice(null);
        setIsEditing(false);
    };

    const isBaja = bien?.estatus === "baja";

    return (
        <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <CardTitle>Perfil Vigente del Bien</CardTitle>
                    <CardDescription>
                        Datos técnicos actuales registrados en el último proceso
                        aprobado
                    </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                    {isEditing ? (
                        <>
                            <Button onClick={handleSave} disabled={isSaving}>
                                {isSaving ? "Enviando..." : "Enviar aprobación"}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleCancel}
                                disabled={isSaving}
                            >
                                Cancelar
                            </Button>
                        </>
                    ) : isBaja ? (
                        <Button variant="outline" disabled>
                            Reactivar
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            onClick={() => setIsEditing(true)}
                        >
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {error ? (
                    <div className="mb-4 text-sm text-destructive">{error}</div>
                ) : null}
                {notice ? (
                    <div className="mb-4 text-sm text-success">{notice}</div>
                ) : null}
                {isBaja ? (
                    <div className="mb-4 text-sm text-muted-foreground">
                        Para editar este bien debes reactivarlo primero.
                    </div>
                ) : null}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                        <p className="text-sm text-muted-foreground">Colonia</p>
                        {isEditing ? (
                            <Input
                                value={formValues.colony}
                                onChange={(event) =>
                                    setFormValues((prev) => ({
                                        ...prev,
                                        colony: event.target.value,
                                    }))
                                }
                                disabled={isSaving}
                            />
                        ) : (
                            <p className="font-medium">
                                {valueOrDash(currentBien.colony)}
                            </p>
                        )}
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Calle</p>
                        {isEditing ? (
                            <Input
                                value={formValues.street}
                                onChange={(event) =>
                                    setFormValues((prev) => ({
                                        ...prev,
                                        street: event.target.value,
                                    }))
                                }
                                disabled={isSaving}
                            />
                        ) : (
                            <p className="font-medium">
                                {valueOrDash(currentBien.street)}
                            </p>
                        )}
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Número</p>
                        {isEditing ? (
                            <Input
                                value={formValues.numero}
                                onChange={(event) =>
                                    setFormValues((prev) => ({
                                        ...prev,
                                        numero: event.target.value,
                                    }))
                                }
                                disabled={isSaving}
                            />
                        ) : (
                            <p className="font-medium">
                                {valueOrDash(currentBien.numero)}
                            </p>
                        )}
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Lote</p>
                        {isEditing ? (
                            <Input
                                value={formValues.lot}
                                onChange={(event) =>
                                    setFormValues((prev) => ({
                                        ...prev,
                                        lot: event.target.value,
                                    }))
                                }
                                disabled={isSaving}
                            />
                        ) : (
                            <p className="font-medium">
                                {valueOrDash(currentBien.lot)}
                            </p>
                        )}
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Manzana</p>
                        {isEditing ? (
                            <Input
                                value={formValues.block}
                                onChange={(event) =>
                                    setFormValues((prev) => ({
                                        ...prev,
                                        block: event.target.value,
                                    }))
                                }
                                disabled={isSaving}
                            />
                        ) : (
                            <p className="font-medium">
                                {valueOrDash(currentBien.block)}
                            </p>
                        )}
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Zona</p>
                        {isEditing ? (
                            <Input
                                value={formValues.zone}
                                onChange={(event) =>
                                    setFormValues((prev) => ({
                                        ...prev,
                                        zone: event.target.value,
                                    }))
                                }
                                disabled={isSaving}
                            />
                        ) : (
                            <p className="font-medium">
                                {valueOrDash(currentBien.zone)}
                            </p>
                        )}
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Superficie Terreno
                        </p>
                        {isEditing ? (
                            <Input
                                type="number"
                                value={formValues.totalArea}
                                onChange={(event) =>
                                    setFormValues((prev) => ({
                                        ...prev,
                                        totalArea: event.target.value,
                                    }))
                                }
                                disabled={isSaving}
                            />
                        ) : (
                            <p className="font-medium">
                                {valueOrDash(currentBien.totalArea)} m²
                            </p>
                        )}
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Superficie Construcción
                        </p>
                        {isEditing ? (
                            <Input
                                type="number"
                                value={formValues.builtArea}
                                onChange={(event) =>
                                    setFormValues((prev) => ({
                                        ...prev,
                                        builtArea: event.target.value,
                                    }))
                                }
                                disabled={isSaving}
                            />
                        ) : (
                            <p className="font-medium">
                                {valueOrDash(currentBien.builtArea)} m²
                            </p>
                        )}
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Dominio</p>
                        {isEditing ? (
                            <Input
                                value={formValues.domain}
                                onChange={(event) =>
                                    setFormValues((prev) => ({
                                        ...prev,
                                        domain: event.target.value,
                                    }))
                                }
                                disabled={isSaving}
                            />
                        ) : (
                            <p className="font-medium">
                                {valueOrDash(currentBien.domain)}
                            </p>
                        )}
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Situación Jurídica
                        </p>
                        {isEditing ? (
                            <Input
                                value={formValues.situacion}
                                onChange={(event) =>
                                    setFormValues((prev) => ({
                                        ...prev,
                                        situacion: event.target.value,
                                    }))
                                }
                                disabled={isSaving}
                            />
                        ) : (
                            <p className="font-medium">
                                {valueOrDash(currentBien.situacion)}
                            </p>
                        )}
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Valor Catastral
                        </p>
                        {isEditing ? (
                            <Input
                                type="number"
                                value={formValues.valorCatastral}
                                onChange={(event) =>
                                    setFormValues((prev) => ({
                                        ...prev,
                                        valorCatastral: event.target.value,
                                    }))
                                }
                                disabled={isSaving}
                            />
                        ) : (
                            <p className="font-medium">
                                {formatCurrency(valorCatastral)}
                            </p>
                        )}
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Valor Comercial
                        </p>
                        {isEditing ? (
                            <Input
                                type="number"
                                value={formValues.valorComercial}
                                onChange={(event) =>
                                    setFormValues((prev) => ({
                                        ...prev,
                                        valorComercial: event.target.value,
                                    }))
                                }
                                disabled={isSaving}
                            />
                        ) : (
                            <p className="font-medium">
                                {formatCurrency(valorComercial)}
                            </p>
                        )}
                    </div>
                    <div className="sm:col-span-2 lg:col-span-3">
                        <p className="text-sm text-muted-foreground">
                            Coordenadas
                        </p>
                        {isEditing ? (
                            <div className="grid gap-3 sm:grid-cols-2">
                                <Input
                                    placeholder="Latitud"
                                    value={formValues.latitude}
                                    onChange={(event) =>
                                        setFormValues((prev) => ({
                                            ...prev,
                                            latitude: event.target.value,
                                        }))
                                    }
                                    disabled={isSaving}
                                />
                                <Input
                                    placeholder="Longitud"
                                    value={formValues.longitude}
                                    onChange={(event) =>
                                        setFormValues((prev) => ({
                                            ...prev,
                                            longitude: event.target.value,
                                        }))
                                    }
                                    disabled={isSaving}
                                />
                            </div>
                        ) : (
                            <p className="font-mono font-medium">
                                {coordsText}
                            </p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
