"use client";

import { useEffect, useState } from "react";
import { Download, RefreshCw } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    fetchReports,
    generateAssetsReport,
    generateInventoryProcessesReport,
    generateRegistriesReport,
    downloadReportFile,
} from "@/lib/api/reports";
import type { Report } from "@/types";

type ReportRow = {
    id: number;
    type: string;
    status: string;
    createdAt: string;
    filename?: string | null;
};

const formatDate = (value?: string | null) => {
    if (!value) return "—";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "—";
    return parsed.toLocaleString("es-MX", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const mapReportRow = (report: Report): ReportRow => ({
    id: report.id,
    type: report.report_type ?? "Reporte",
    status: report.status ?? "—",
    createdAt: report.created_at ?? "",
    filename: report.file_name ?? report.filename ?? null,
});

export default function ReportsPage() {
    const [reports, setReports] = useState<ReportRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState<string | null>(null);

    const loadReports = async () => {
        setIsLoading(true);
        setLoadError(null);
        try {
            const response = await fetchReports({ page: 1, per_page: 20 });
            setReports(response.data.map(mapReportRow));
        } catch (error) {
            setLoadError(
                error instanceof Error
                    ? error.message
                    : "No se pudieron cargar los reportes.",
            );
            setReports([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void loadReports();
    }, []);

    const handleGenerate = async (type: string) => {
        setNotice(null);
        setLoadError(null);
        setIsGenerating(type);
        try {
            if (type === "assets") {
                await generateAssetsReport();
            } else if (type === "registries") {
                await generateRegistriesReport();
            } else {
                await generateInventoryProcessesReport();
            }
            setNotice("Reporte solicitado. Se generará en unos momentos.");
            await loadReports();
        } catch (error) {
            setLoadError(
                error instanceof Error
                    ? error.message
                    : "No se pudo generar el reporte.",
            );
        } finally {
            setIsGenerating(null);
        }
    };

    const handleDownload = async (id: number) => {
        setLoadError(null);
        try {
            await downloadReportFile(id);
        } catch (error) {
            setLoadError(
                error instanceof Error
                    ? error.message
                    : "No se pudo descargar el reporte.",
            );
        }
    };

    return (
        <div className="container mx-auto py-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Reportes SIGBI</h1>
                    <p className="text-sm text-muted-foreground">
                        Genera y descarga reportes de SIGBI en formato CSV.
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={loadReports}
                    disabled={isLoading}
                >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Actualizar
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Bienes</CardTitle>
                        <CardDescription>
                            Genera el reporte de bienes.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            onClick={() => handleGenerate("assets")}
                            disabled={isGenerating !== null}
                        >
                            {isGenerating === "assets"
                                ? "Generando..."
                                : "Generar reporte"}
                        </Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Registros</CardTitle>
                        <CardDescription>
                            Genera el reporte de registros.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            onClick={() => handleGenerate("registries")}
                            disabled={isGenerating !== null}
                        >
                            {isGenerating === "registries"
                                ? "Generando..."
                                : "Generar reporte"}
                        </Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Procesos de inventario</CardTitle>
                        <CardDescription>
                            Genera el reporte de procesos de inventario.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            onClick={() =>
                                handleGenerate("inventory_processes")
                            }
                            disabled={isGenerating !== null}
                        >
                            {isGenerating === "inventory_processes"
                                ? "Generando..."
                                : "Generar reporte"}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Historial</CardTitle>
                    <CardDescription>
                        Descarga los reportes generados recientemente.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {notice ? (
                        <div className="mb-4 text-sm text-success">
                            {notice}
                        </div>
                    ) : null}
                    {loadError ? (
                        <div className="mb-4 text-sm text-destructive">
                            {loadError}
                        </div>
                    ) : null}
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Archivo</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5}>
                                        <div className="py-6 text-center text-sm text-muted-foreground">
                                            Cargando reportes...
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : reports.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5}>
                                        <div className="py-6 text-center text-sm text-muted-foreground">
                                            No hay reportes disponibles.
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                reports.map((report) => (
                                    <TableRow key={report.id}>
                                        <TableCell>#{report.id}</TableCell>
                                        <TableCell>{report.type}</TableCell>
                                        <TableCell>{report.status}</TableCell>
                                        <TableCell>
                                            {formatDate(report.createdAt)}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    handleDownload(report.id)
                                                }
                                            >
                                                <Download className="mr-2 h-4 w-4" />
                                                Descargar
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
