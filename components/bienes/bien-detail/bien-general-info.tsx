"use client";

import { MapPin, Calendar } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

interface BienGeneralInfoProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    bien: any;
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
}

export default function BienGeneralInfo({
    bien,
    registry = null,
}: BienGeneralInfoProps) {
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
                <CardHeader>
                    <CardTitle>Datos del Expediente</CardTitle>
                    <CardDescription>
                        Información legal y documental del bien
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Número de Escritura
                            </p>
                            <p className="font-medium">
                                {registry?.e_number ?? "—"}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Fecha de Escritura
                            </p>
                            <p className="font-medium">
                                {formatDate(registry?.e_date)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Notaría
                            </p>
                            <p className="font-medium">
                                {registry?.e_notary ?? "—"}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Boleta Registral
                            </p>
                            <p className="font-medium">
                                {registry?.rpp_number ?? "—"}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Certificado de Libertad
                            </p>
                            <p className="font-medium">
                                {registry?.co_number ?? "—"}
                            </p>
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
