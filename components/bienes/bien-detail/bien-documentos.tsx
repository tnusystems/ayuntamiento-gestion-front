"use client";

import { Download, FileText } from "lucide-react";
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
        filename?: string | null;
        byte_size?: number | null;
        created_at?: string | null;
        download_url?: string | null;
        url?: string | null;
    }>;
}

export default function BienDocumentos({
    documentos = [],
}: BienDocumentosProps) {
    const formatSize = (bytes?: number | null) => {
        if (!bytes || !Number.isFinite(bytes)) return "—";
        const mb = bytes / (1024 * 1024);
        return `${mb.toFixed(1)} MB`;
    };

    const formatDate = (value?: string | null) => {
        if (!value) return "—";
        return new Date(value).toLocaleDateString("es-MX");
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Documentos del Expediente</CardTitle>
                <CardDescription>
                    Archivos oficiales asociados al bien
                </CardDescription>
            </CardHeader>
            <CardContent>
                {documentos.length === 0 ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                        No hay documentos registrados.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {documentos.map((doc) => {
                            const name =
                                doc.name || doc.filename || "Documento";
                            const href =
                                doc.download_url || doc.url || undefined;
                            return (
                                <div
                                    key={doc.id ?? name}
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
                                                {formatSize(doc.byte_size)} •{" "}
                                                {formatDate(doc.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                    {href ? (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            asChild
                                        >
                                            <a
                                                href={href}
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
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
