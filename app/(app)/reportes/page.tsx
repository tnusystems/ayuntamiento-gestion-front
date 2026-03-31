"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Download, RefreshCw } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type ReportRow = {
    id: number;
    type: string;
    status: string;
    createdAt: string;
    filename?: string | null;
};

type ReportType = "assets" | "registries" | "inventory_processes";

type DateFieldProps = {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    minDate?: Date;
    maxDate?: Date;
};

const monthOptions = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
];

const toISODate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const parseISODate = (value: string) => {
    if (!value) return undefined;
    const [year, month, day] = value.split("-").map(Number);
    if (!year || !month || !day) return undefined;
    return new Date(year, month - 1, day);
};

const formatPickerDate = (value: string) => {
    const parsed = parseISODate(value);
    if (!parsed) return "Seleccionar fecha";
    return parsed.toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

function DateField({
    id,
    label,
    value,
    onChange,
    minDate,
    maxDate,
}: DateFieldProps) {
    const selectedDate = parseISODate(value);
    const getMonthFloor = () => {
        if (!minDate) return undefined;
        return new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    };
    const getMonthCeil = () => {
        if (!maxDate) return undefined;
        return new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
    };
    const monthFloor = getMonthFloor();
    const monthCeil = getMonthCeil();
    const clampMonth = (date: Date) => {
        const normalized = new Date(date.getFullYear(), date.getMonth(), 1);
        if (monthFloor && normalized < monthFloor) return monthFloor;
        if (monthCeil && normalized > monthCeil) return monthCeil;
        return normalized;
    };
    const [rawVisibleMonth, setRawVisibleMonth] = useState<Date>(() =>
        selectedDate ?? new Date(),
    );
    const visibleMonth = clampMonth(selectedDate ?? rawVisibleMonth);
    const minYear = monthFloor?.getFullYear() ?? new Date().getFullYear() - 20;
    const maxYear = monthCeil?.getFullYear() ?? new Date().getFullYear() + 10;
    const yearOptions = Array.from(
        { length: maxYear - minYear + 1 },
        (_, index) => minYear + index,
    );

    const disabled: React.ComponentProps<typeof Calendar>["disabled"] =
        minDate && maxDate
            ? [{ before: minDate }, { after: maxDate }]
            : minDate
              ? { before: minDate }
              : maxDate
                ? { after: maxDate }
                : undefined;

    return (
        <div className="space-y-2">
            <Label htmlFor={id}>{label}</Label>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id={id}
                        type="button"
                        variant="outline"
                        className={cn(
                            "w-full justify-start text-left font-normal",
                            !value && "text-muted-foreground",
                        )}
                    >
                        <CalendarDays className="mr-2 h-4 w-4" />
                        {formatPickerDate(value)}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <div className="flex items-center gap-2 border-b p-3">
                        <Select
                            value={String(visibleMonth.getMonth())}
                            onValueChange={(month) => {
                                const parsedMonth = Number(month);
                                setRawVisibleMonth((current) =>
                                    clampMonth(
                                        new Date(
                                            current.getFullYear(),
                                            parsedMonth,
                                            1,
                                        ),
                                    ),
                                );
                            }}
                        >
                            <SelectTrigger className="h-8 w-[140px]">
                                <SelectValue placeholder="Mes" />
                            </SelectTrigger>
                            <SelectContent>
                                {monthOptions.map((monthLabel, monthIndex) => (
                                    <SelectItem
                                        key={monthLabel}
                                        value={String(monthIndex)}
                                    >
                                        {monthLabel}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={String(visibleMonth.getFullYear())}
                            onValueChange={(year) => {
                                const parsedYear = Number(year);
                                setRawVisibleMonth((current) =>
                                    clampMonth(
                                        new Date(
                                            parsedYear,
                                            current.getMonth(),
                                            1,
                                        ),
                                    ),
                                );
                            }}
                        >
                            <SelectTrigger className="h-8 w-[110px]">
                                <SelectValue placeholder="Año" />
                            </SelectTrigger>
                            <SelectContent>
                                {yearOptions.map((year) => (
                                    <SelectItem key={year} value={String(year)}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Calendar
                        mode="single"
                        month={visibleMonth}
                        onMonthChange={(month) =>
                            setRawVisibleMonth(clampMonth(month))
                        }
                        selected={selectedDate}
                        onSelect={(date) => onChange(date ? toISODate(date) : "")}
                        disabled={disabled}
                        initialFocus
                        classNames={{
                            month_caption: "hidden",
                            nav: "hidden",
                        }}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}

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
    const [isGenerating, setIsGenerating] = useState<ReportType | null>(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const startDateValue = parseISODate(startDate);
    const endDateValue = parseISODate(endDate);

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

    const handleGenerate = async (type: ReportType) => {
        setNotice(null);
        setLoadError(null);

        if (!startDate || !endDate) {
            setLoadError(
                "Debes seleccionar start_date y end_date para generar el reporte.",
            );
            return;
        }

        if (startDate > endDate) {
            setLoadError(
                "start_date no puede ser mayor que end_date.",
            );
            return;
        }

        setIsGenerating(type);
        const params = { start_date: startDate, end_date: endDate };

        try {
            if (type === "assets") {
                await generateAssetsReport(params);
            } else if (type === "registries") {
                await generateRegistriesReport(params);
            } else {
                await generateInventoryProcessesReport(params);
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

            <Card>
                <CardHeader>
                    <CardTitle>Rango de fechas</CardTitle>
                    <CardDescription>
                        Se enviará como parámetros start_date y end_date (YYYY-MM-DD).
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        <DateField
                            id="report-start-date"
                            label="Fecha inicio"
                            value={startDate}
                            onChange={setStartDate}
                            maxDate={endDateValue}
                        />
                        <DateField
                            id="report-end-date"
                            label="Fecha fin"
                            value={endDate}
                            onChange={setEndDate}
                            minDate={startDateValue}
                        />
                    </div>
                </CardContent>
            </Card>

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
                            disabled={
                                isGenerating !== null || !startDate || !endDate
                            }
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
                            disabled={
                                isGenerating !== null || !startDate || !endDate
                            }
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
                            disabled={
                                isGenerating !== null || !startDate || !endDate
                            }
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
