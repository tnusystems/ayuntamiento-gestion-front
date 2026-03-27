"use client";

import { Download, Eye, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

interface BienDocumentosProps {
    documentos?: Array<{
        id?: string | number;
        name?: string | null;
        kind?: string | null;
        filename?: string | null;
        byte_size?: number | null;
        created_at?: string | null;
        download_url?: string | null;
        url?: string | null;
    }>;
    onUploadClick?: () => void;
}

export default function BienDocumentos({
    documentos = [],
    onUploadClick,
}: BienDocumentosProps) {
    const formatSize = (bytes?: number | null) => {
        if (!bytes || !Number.isFinite(bytes)) return "—";
        if (bytes < 1024) return `${bytes} B`;
        const kb = bytes / 1024;
        if (kb < 1024) return `${kb.toFixed(1)} KB`;
        const mb = kb / 1024;
        return `${mb.toFixed(1)} MB`;
    };

    const formatDate = (value?: string | null) => {
        if (!value) return "—";
        return new Date(value).toLocaleDateString("es-MX");
    };

    const kindLabels: Record<string, string> = {
        es_publica: "Escrituras",
        foto_bien: "Fotografías del Bien",
        catastro_plano: "Plano Catastral",
        solicitud: "Oficio de Solicitud",
        certificado: "Certificado de Libertad",
        avaluo: "Avalúo",
        baja: "Motivo de Baja",
        extraordinario: "Extraordinario",
    };

    const groups = documentos.reduce<
        Record<string, NonNullable<BienDocumentosProps["documentos"]>>
    >((acc, doc) => {
        const kind = doc.kind ?? "otros";
        if (!acc[kind]) {
            acc[kind] = [];
        }
        acc[kind]?.push(doc);
        return acc;
    }, {});

    const groupEntries = Object.entries(groups);

    return (
        <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                    <CardTitle>Documentos del Expediente</CardTitle>
                    <CardDescription>
                        Archivos oficiales asociados al bien
                    </CardDescription>
                </div>
                {onUploadClick ? (
                    <Button onClick={onUploadClick}>Subir documentos</Button>
                ) : null}
            </CardHeader>
            <CardContent>
                {documentos.length === 0 ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                        No hay documentos registrados.
                    </div>
                ) : (
                    <div className="space-y-5">
                        {groupEntries.map(([kind, docs]) => {
                            const label =
                                (kind && kindLabels[kind]) ||
                                (kind ? kind : "Otros documentos");
                            return (
                                <div key={kind} className="space-y-3">
                                    <h3 className="text-sm font-semibold text-muted-foreground">
                                        {label}
                                    </h3>
                                    <div className="space-y-3">
                                        {docs?.map((doc) => {
                                            const name =
                                                doc.name ||
                                                doc.filename ||
                                                "Documento";
                                            const viewHref =
                                                doc.url || undefined;
                                            const downloadHref =
                                                doc.download_url || undefined;
                                            const key =
                                                doc.id ??
                                                `${kind}-${name}-${doc.created_at ?? "na"}`;
                                            return (
                                                <div
                                                    key={key}
                                                    className="flex items-center justify-between rounded-lg border border-border p-4"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                                            <FileText className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">
                                                                {name}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {formatSize(
                                                                    doc.byte_size,
                                                                )}{" "}
                                                                •{" "}
                                                                {formatDate(
                                                                    doc.created_at,
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {viewHref ? (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                asChild
                                                            >
                                                                <a
                                                                    href={
                                                                        viewHref
                                                                    }
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </a>
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                disabled
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        {downloadHref ? (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                asChild
                                                            >
                                                                <a
                                                                    href={
                                                                        downloadHref
                                                                    }
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                >
                                                                    <Download className="h-4 w-4" />
                                                                </a>
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                disabled
                                                            >
                                                                <Download className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
