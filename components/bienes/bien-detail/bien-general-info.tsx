"use client";

import { useEffect, useState } from "react";
import { MapPin, Calendar, Pencil } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateRegistry } from "@/lib/api/registries";

interface BienGeneralInfoProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    bien: any;
    registryId?: string;
    registry?: {
        rpp_number?: string | null;
        rpp_date?: string | null;
        rpp_volume?: string | null;
        rpp_section?: string | null;
        e_number?: string | null;
        e_date?: string | null;
        e_notary?: string | null;
        b_number?: string | null;
        b_date?: string | null;
        co_number?: string | null;
    } | null;
    canEdit?: boolean;
}

export default function BienGeneralInfo({
    bien,
    registryId,
    registry = null,
    canEdit = true,
}: BienGeneralInfoProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [formValues, setFormValues] = useState({
        e_number: registry?.e_number ?? "",
        e_date: registry?.e_date ?? "",
        e_notary: registry?.e_notary ?? "",
        rpp_number: registry?.rpp_number ?? "",
        co_number: registry?.co_number ?? "",
    });
    const [currentRegistry, setCurrentRegistry] = useState(registry);

    useEffect(() => {
        setCurrentRegistry(registry);
        setFormValues({
            e_number: registry?.e_number ?? "",
            e_date: registry?.e_date ?? "",
            e_notary: registry?.e_notary ?? "",
            rpp_number: registry?.rpp_number ?? "",
            co_number: registry?.co_number ?? "",
        });
    }, [registry]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("es-MX", {
            style: "currency",
            currency: "MXN",
        }).format(value);
    };

    const formatDate = (date?: string | null) => {
        if (!date) return "—";
        return new Date(date).toLocaleDateString("es-MX", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const isBaja = bien?.estatus === "baja";

    const handleSave = async () => {
        if (!registryId) {
            setError("No se encontró el expediente.");
            return;
        }
        setError(null);
        setNotice(null);
        setIsSaving(true);
        try {
            const payload = {
                e_number: formValues.e_number || undefined,
                e_date: formValues.e_date || undefined,
                e_notary: formValues.e_notary || undefined,
                rpp_number: formValues.rpp_number || undefined,
                co_number: formValues.co_number || undefined,
            };
            const updated = await updateRegistry(registryId, payload);
            if (
                updated &&
                typeof updated === "object" &&
                "approval_request" in updated
            ) {
                setNotice("Solicitud enviada para aprobación.");
                setIsEditing(false);
                return;
            }
            setCurrentRegistry(updated ?? currentRegistry);
            setNotice("Cambios guardados correctamente.");
            setIsEditing(false);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "No se pudo actualizar el expediente.",
            );
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setFormValues({
            e_number: currentRegistry?.e_number ?? "",
            e_date: currentRegistry?.e_date ?? "",
            e_notary: currentRegistry?.e_notary ?? "",
            rpp_number: currentRegistry?.rpp_number ?? "",
            co_number: currentRegistry?.co_number ?? "",
        });
        setError(null);
        setNotice(null);
        setIsEditing(false);
    };

    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Ubicación
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-start gap-3">
                            <MapPin className="mt-0.5 h-5 w-5 text-primary" />
                            <span className="font-medium">
                                {bien.ubicacion ?? "—"}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Valor Catastral
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <span className="text-2xl font-semibold">
                            {formatCurrency(bien.valorCatastral ?? 0)}
                        </span>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Fecha de Alta
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-primary" />
                            <span className="font-medium">
                                {formatDate(bien.fechaAlta)}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle>Datos del Expediente</CardTitle>
                        <CardDescription>
                            Información legal y documental del bien
                        </CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {canEdit && isEditing ? (
                            <>
                                <Button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                >
                                    {isSaving
                                        ? "Enviando..."
                                        : "Enviar aprobación"}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleCancel}
                                    disabled={isSaving}
                                >
                                    Cancelar
                                </Button>
                            </>
                        ) : canEdit && isBaja ? (
                            <Button variant="outline" disabled>
                                Reactivar
                            </Button>
                        ) : canEdit ? (
                            <Button
                                variant="outline"
                                onClick={() => setIsEditing(true)}
                            >
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar
                            </Button>
                        ) : null}
                    </div>
                </CardHeader>
                <CardContent>
                    {error ? (
                        <div className="mb-4 rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                            {error}
                        </div>
                    ) : null}
                    {notice ? (
                        <div className="mb-4 rounded-md border border-success/20 bg-success/10 px-4 py-3 text-sm text-success">
                            {notice}
                        </div>
                    ) : null}
                    {isBaja ? (
                        <div className="mb-4 text-sm text-muted-foreground">
                            Para editar este bien debes reactivarlo primero.
                        </div>
                    ) : null}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Número de Escritura
                            </p>
                            {isEditing ? (
                                <Input
                                    id="e_number"
                                    value={formValues.e_number}
                                    onChange={(event) =>
                                        setFormValues((prev) => ({
                                            ...prev,
                                            e_number: event.target.value,
                                        }))
                                    }
                                    disabled={isSaving}
                                />
                            ) : (
                                <p className="font-medium">
                                    {currentRegistry?.e_number ?? "—"}
                                </p>
                            )}
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Fecha de Escritura
                            </p>
                            {isEditing ? (
                                <Input
                                    id="e_date"
                                    type="date"
                                    value={
                                        formValues.e_date
                                            ? formValues.e_date.slice(0, 10)
                                            : ""
                                    }
                                    onChange={(event) =>
                                        setFormValues((prev) => ({
                                            ...prev,
                                            e_date: event.target.value,
                                        }))
                                    }
                                    disabled={isSaving}
                                />
                            ) : (
                                <p className="font-medium">
                                    {formatDate(currentRegistry?.e_date)}
                                </p>
                            )}
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Notaría
                            </p>
                            {isEditing ? (
                                <Input
                                    id="e_notary"
                                    value={formValues.e_notary}
                                    onChange={(event) =>
                                        setFormValues((prev) => ({
                                            ...prev,
                                            e_notary: event.target.value,
                                        }))
                                    }
                                    disabled={isSaving}
                                />
                            ) : (
                                <p className="font-medium">
                                    {currentRegistry?.e_notary ?? "—"}
                                </p>
                            )}
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Boleta Registral
                            </p>
                            {isEditing ? (
                                <Input
                                    id="rpp_number"
                                    value={formValues.rpp_number}
                                    onChange={(event) =>
                                        setFormValues((prev) => ({
                                            ...prev,
                                            rpp_number: event.target.value,
                                        }))
                                    }
                                    disabled={isSaving}
                                />
                            ) : (
                                <p className="font-medium">
                                    {currentRegistry?.rpp_number ?? "—"}
                                </p>
                            )}
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Certificado de Libertad
                            </p>
                            {isEditing ? (
                                <Input
                                    id="co_number"
                                    value={formValues.co_number}
                                    onChange={(event) =>
                                        setFormValues((prev) => ({
                                            ...prev,
                                            co_number: event.target.value,
                                        }))
                                    }
                                    disabled={isSaving}
                                />
                            ) : (
                                <p className="font-medium">
                                    {currentRegistry?.co_number ?? "—"}
                                </p>
                            )}
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Último Proceso
                            </p>
                            <p className="font-medium">
                                {bien.ultimoProceso || "—"}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
