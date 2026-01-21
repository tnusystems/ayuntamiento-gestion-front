"use client";

import {
    CheckCircle2,
    AlertCircle,
    FileText,
    MapPin,
    Upload,
    ListChecks,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { tiposProceso } from "@/lib/mock-data";

interface WizardStep5Props {
    formData: {
        tipoProceso: string;
        actoJuridico: string;
        responsable: string;
        observaciones: string;
        colonia: string;
        calle: string;
        numero: string;
        lote: string;
        manzana: string;
        superficieTerreno: string;
        superficieConstruccion: string;
        zona: string;
        dominio: string;
        situacion: string;
        valorCatastral: string;
        valorComercial: string;
        lat: string;
        alt: string;
        observacionesTecnicas: string;
        documentos: string[];
        etapas: Array<{
            nombre: string;
            completada: boolean;
            fecha: string;
            observaciones: string;
        }>;
    };
}

export function WizardStep5({ formData }: WizardStep5Props) {
    const tipoProcesoLabel =
        tiposProceso.find((t) => t.value === formData.tipoProceso)?.label ||
        formData.tipoProceso;
    const etapasCompletadas = formData.etapas.filter(
        (e) => e.completada,
    ).length;

    const isComplete = (section: string) => {
        switch (section) {
            case "proceso":
                return (
                    formData.tipoProceso &&
                    formData.actoJuridico &&
                    formData.responsable
                );
            case "tecnica":
                return formData.colonia && formData.calle;
            case "documentos":
                return formData.documentos.length > 0;
            case "etapas":
                return true;
            default:
                return false;
        }
    };

    return (
        <div className="space-y-6">
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                        <p className="font-medium">Revisión Final</p>
                        <p className="text-sm text-muted-foreground">
                            Verifique que toda la información sea correcta antes
                            de enviar el proceso a aprobación.
                        </p>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Process Info */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <FileText className="h-4 w-4" />
                                Información del Proceso
                            </CardTitle>
                            {isComplete("proceso") ? (
                                <Badge
                                    variant="outline"
                                    className="bg-success/10 text-success border-success/20"
                                >
                                    <CheckCircle2 className="mr-1 h-3 w-3" />
                                    Completo
                                </Badge>
                            ) : (
                                <Badge
                                    variant="outline"
                                    className="bg-warning/10 text-warning-foreground border-warning/20"
                                >
                                    Incompleto
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                Tipo de Proceso:
                            </span>
                            <span className="font-medium">
                                {tipoProcesoLabel || "No especificado"}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                Acto Jurídico:
                            </span>
                            <span className="font-medium capitalize">
                                {formData.actoJuridico || "No especificado"}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                Responsable:
                            </span>
                            <span className="font-medium">
                                {formData.responsable || "No especificado"}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Technical Data */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <MapPin className="h-4 w-4" />
                                Captura Técnica
                            </CardTitle>
                            {isComplete("tecnica") ? (
                                <Badge
                                    variant="outline"
                                    className="bg-success/10 text-success border-success/20"
                                >
                                    <CheckCircle2 className="mr-1 h-3 w-3" />
                                    Completo
                                </Badge>
                            ) : (
                                <Badge
                                    variant="outline"
                                    className="bg-warning/10 text-warning-foreground border-warning/20"
                                >
                                    Incompleto
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                Ubicación:
                            </span>
                            <span className="font-medium">
                                {formData.calle && formData.colonia
                                    ? `${formData.calle} ${formData.numero}, ${formData.colonia}`
                                    : "No especificada"}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                Superficie Terreno:
                            </span>
                            <span className="font-medium">
                                {formData.superficieTerreno
                                    ? `${formData.superficieTerreno} m²`
                                    : "No especificada"}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                Valor Catastral:
                            </span>
                            <span className="font-medium">
                                {formData.valorCatastral
                                    ? new Intl.NumberFormat("es-MX", {
                                          style: "currency",
                                          currency: "MXN",
                                      }).format(Number(formData.valorCatastral))
                                    : "No especificado"}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Documents */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Upload className="h-4 w-4" />
                                Documentación
                            </CardTitle>
                            {isComplete("documentos") ? (
                                <Badge
                                    variant="outline"
                                    className="bg-success/10 text-success border-success/20"
                                >
                                    <CheckCircle2 className="mr-1 h-3 w-3" />
                                    Completo
                                </Badge>
                            ) : (
                                <Badge
                                    variant="outline"
                                    className="bg-warning/10 text-warning-foreground border-warning/20"
                                >
                                    Incompleto
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="text-sm">
                        <p className="text-muted-foreground">
                            {formData.documentos.length > 0
                                ? `${formData.documentos.length} documento(s) cargado(s)`
                                : "No se han cargado documentos"}
                        </p>
                        {formData.documentos.length > 0 && (
                            <ul className="mt-2 space-y-1">
                                {formData.documentos
                                    .slice(0, 3)
                                    .map((doc, index) => (
                                        <li
                                            key={index}
                                            className="text-xs text-muted-foreground truncate"
                                        >
                                            • {doc}
                                        </li>
                                    ))}
                                {formData.documentos.length > 3 && (
                                    <li className="text-xs text-muted-foreground">
                                        • +{formData.documentos.length - 3}{" "}
                                        más...
                                    </li>
                                )}
                            </ul>
                        )}
                    </CardContent>
                </Card>

                {/* Stages */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <ListChecks className="h-4 w-4" />
                                Etapas del Trámite
                            </CardTitle>
                            <Badge
                                variant="outline"
                                className="bg-info/10 text-info border-info/20"
                            >
                                {etapasCompletadas}/{formData.etapas.length}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="text-sm">
                        <div className="space-y-2">
                            {formData.etapas.map((etapa, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between"
                                >
                                    <span
                                        className={
                                            etapa.completada
                                                ? "text-foreground"
                                                : "text-muted-foreground"
                                        }
                                    >
                                        {etapa.nombre}
                                    </span>
                                    {etapa.completada ? (
                                        <CheckCircle2 className="h-4 w-4 text-success" />
                                    ) : (
                                        <span className="h-4 w-4 rounded-full border border-muted-foreground/30" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Observations */}
            {formData.observaciones && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">
                            Observaciones Generales
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            {formData.observaciones}
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
