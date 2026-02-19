"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { FileText, FolderOpen, Layers } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { fetchAssets } from "@/lib/api/assets";
import { fetchRegistries } from "@/lib/api/registries";
import { fetchActivities } from "@/lib/api/activities";
import type { Activity, BienApi, RegistryApi } from "@/types";

type DashboardAsset = {
    id: number;
    rpp: string;
    cNumber: string;
    status: string;
    createdAt: string;
};

type DashboardRegistry = {
    id: string | number;
    rpp: string;
    name: string;
    createdAt: string;
};

type AuditLevel = "info" | "advertencia" | "critico";

type AuditLogItem = {
    id: string;
    actor: string;
    action: string;
    target: string;
    details?: string;
    created_at: string;
    level: AuditLevel;
};

const actionLabels: Record<string, string> = {
    created: "Creó",
    updated: "Actualizó",
    deleted: "Eliminó",
    destroyed: "Eliminó",
};

const actionLevels: Record<string, AuditLevel> = {
    created: "info",
    updated: "advertencia",
    deleted: "critico",
    destroyed: "critico",
};

const trackableLabels: Record<string, string> = {
    Asset: "Bien",
    Registry: "Registro",
    InventoryProcess: "Proceso de inventario",
};

const levelConfig: Record<AuditLevel, { label: string; className: string }> = {
    info: {
        label: "Info",
        className: "text-primary border-primary/20 bg-primary/10",
    },
    advertencia: {
        label: "Advertencia",
        className: "text-warning border-warning/30 bg-warning/10",
    },
    critico: {
        label: "Crítico",
        className: "text-destructive border-destructive/30 bg-destructive/10",
    },
};

const formatDate = (value?: string | null) => {
    if (!value) return "—";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "—";
    return parsed.toLocaleString("es-MX", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const resolveActionLabel = (action: string) => {
    const key = action.toLowerCase();
    return actionLabels[key] ?? action;
};

const resolveActionLevel = (action: string): AuditLevel => {
    const key = action.toLowerCase();
    return actionLevels[key] ?? "info";
};

const buildDetailsLabel = (activity: Activity) => {
    if (!activity.details) return undefined;
    const details = activity.details as Record<string, unknown>;
    const parts: string[] = [];
    if (details.rpp_number) {
        parts.push(`RPP: ${details.rpp_number}`);
    } else if (details.name) {
        parts.push(`RPP: ${details.name}`);
    }
    if (details.asset_id) {
        parts.push(`Asset ID: ${details.asset_id}`);
    }
    if (details.registry_id) {
        parts.push(`Registro ID: ${details.registry_id}`);
    }
    if (details.inventory_process_id) {
        parts.push(`Proceso ID: ${details.inventory_process_id}`);
    }
    if (parts.length === 0) return undefined;
    if (parts.length === 2) {
        return `${parts[0]} y ${parts[1]}`;
    }
    return parts.join(" · ");
};

const buildTargetLabel = (activity: Activity) => {
    const targetType =
        trackableLabels[activity.trackable_type] ?? activity.trackable_type;
    return `${targetType} #${activity.trackable_id}`;
};

const mapActivityToLog = (activity: Activity): AuditLogItem => {
    const userName = activity.user?.name?.trim();
    const userEmail = activity.user?.email?.trim();
    const actor = userName
        ? userEmail
            ? `${userName} (${userEmail})`
            : userName
        : userEmail || `Usuario #${activity.user_id}`;
    return {
        id: String(activity.id),
        actor,
        action: resolveActionLabel(activity.action),
        target: buildTargetLabel(activity),
        details: buildDetailsLabel(activity),
        created_at: activity.created_at,
        level: resolveActionLevel(activity.action),
    };
};

const mapAssetRow = (asset: BienApi): DashboardAsset => ({
    id: asset.id,
    rpp: asset.rpp_number ?? "—",
    cNumber: asset.c_number ?? "—",
    status: asset.inventory_status ?? "—",
    createdAt: asset.created_at ?? "",
});

function resolveTotalCount(data: DashboardAsset[], totalCount?: number | null) {
    if (typeof totalCount === "number" && Number.isFinite(totalCount)) {
        return totalCount;
    }
    return data.length;
}

function PieChart({ alta, baja }: { alta: number; baja: number }) {
    const total = alta + baja;
    const altaPercent = total ? (alta / total) * 100 : 0;
    const bajaPercent = total ? (baja / total) * 100 : 0;
    const radius = 15.9155;
    const circumferenceOffset = 25;

    return (
        <div className="flex flex-col items-center gap-4">
            <svg viewBox="0 0 36 36" className="h-40 w-40">
                <circle
                    cx="18"
                    cy="18"
                    r={radius}
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="3"
                />
                <circle
                    cx="18"
                    cy="18"
                    r={radius}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeDasharray={`${altaPercent} ${100 - altaPercent}`}
                    strokeDashoffset={circumferenceOffset}
                    strokeLinecap="round"
                />
                <circle
                    cx="18"
                    cy="18"
                    r={radius}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="3"
                    strokeDasharray={`${bajaPercent} ${100 - bajaPercent}`}
                    strokeDashoffset={circumferenceOffset + altaPercent}
                    strokeLinecap="round"
                />
            </svg>
            <div className="grid w-full grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-emerald-500" />
                    <span className="text-muted-foreground">Altas</span>
                    <span className="ml-auto font-semibold text-neutral-900">
                        {alta}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-red-500" />
                    <span className="text-muted-foreground">Bajas</span>
                    <span className="ml-auto font-semibold text-neutral-900">
                        {baja}
                    </span>
                </div>
            </div>
        </div>
    );
}

const mapRegistryRow = (registry: RegistryApi): DashboardRegistry => ({
    id: registry.id ?? "—",
    rpp: registry.rpp_number ?? "—",
    name: registry.name ?? "—",
    createdAt: registry.created_at ?? registry.fecha_alta ?? "",
});

function normalize(value?: string | null) {
    return value?.trim().toLowerCase() ?? "";
}

function getUserInitial(name?: string | null, email?: string | null) {
    const source = name?.trim() || email?.trim() || "";
    if (!source) return "U";
    return source[0]?.toUpperCase() ?? "U";
}

export default function DashboardPage() {
    const { data: session } = useSession();
    const role = normalize(session?.user?.role);
    const isAdmin = role === "admin";
    const userName = session?.user?.name ?? "Usuario";
    const userEmail = session?.user?.email ?? "—";
    const userImage = session?.user?.image ?? "";
    const userInitial = getUserInitial(
        session?.user?.name,
        session?.user?.email,
    );

    const [assets, setAssets] = useState<DashboardAsset[]>([]);
    const [altaAssets, setAltaAssets] = useState<DashboardAsset[]>([]);
    const [bajaAssets, setBajaAssets] = useState<DashboardAsset[]>([]);
    const [altaTotal, setAltaTotal] = useState(0);
    const [bajaTotal, setBajaTotal] = useState(0);
    const [registries, setRegistries] = useState<DashboardRegistry[]>([]);
    const [activities, setActivities] = useState<AuditLogItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;

        const loadDashboard = async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const [
                    assetsResponse,
                    registriesResponse,
                    activitiesResponse,
                    altaResponse,
                    bajaResponse,
                ] = await Promise.all([
                    fetchAssets({ page: 1, per_page: 5, order: "desc" }),
                    fetchRegistries({ page: 1, per_page: 5 }),
                    isAdmin
                        ? fetchActivities({ page: 1, per_page: 10 })
                        : Promise.resolve(null),
                    fetchAssets({
                        page: 1,
                        per_page: 5,
                        inventory_process_type: "alta",
                        order: "desc",
                        order_by: "created_at",
                    }),
                    fetchAssets({
                        page: 1,
                        per_page: 5,
                        inventory_process_type: "baja",
                        order: "desc",
                        order_by: "created_at",
                    }),
                ]);
                if (!active) return;
                setAssets(assetsResponse.data.map(mapAssetRow));
                setRegistries(registriesResponse.data.map(mapRegistryRow));
                setActivities(
                    activitiesResponse
                        ? activitiesResponse.data.map(mapActivityToLog)
                        : [],
                );
                const altaMapped = altaResponse.data.map(mapAssetRow);
                const bajaMapped = bajaResponse.data.map(mapAssetRow);
                setAltaAssets(altaMapped);
                setBajaAssets(bajaMapped);
                setAltaTotal(
                    resolveTotalCount(
                        altaMapped,
                        altaResponse.pagination?.total_count ?? null,
                    ),
                );
                setBajaTotal(
                    resolveTotalCount(
                        bajaMapped,
                        bajaResponse.pagination?.total_count ?? null,
                    ),
                );
            } catch (error) {
                if (!active) return;
                setLoadError(
                    error instanceof Error
                        ? error.message
                        : "No se pudo cargar el dashboard.",
                );
            } finally {
                if (active) setIsLoading(false);
            }
        };

        loadDashboard();
        return () => {
            active = false;
        };
    }, [isAdmin]);

    return (
        <div className="container mx-auto py-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Dashboard SIGBI</h1>
                    <p className="text-sm text-muted-foreground">
                        Resumen SIGBI de registros, bienes y actividad reciente.
                    </p>
                </div>
            </div>

            {loadError ? (
                <Card>
                    <CardContent className="py-6 text-sm text-destructive">
                        {loadError}
                    </CardContent>
                </Card>
            ) : null}

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-1">
                    <CardContent className="flex flex-col items-center gap-4 py-6 text-center">
                        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-neutral-200 text-2xl font-semibold text-neutral-700">
                            {userImage ? (
                                <Image
                                    width={160}
                                    height={160}
                                    src={userImage}
                                    alt={userName}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <span>{userInitial}</span>
                            )}
                        </div>
                        <div>
                            <p className="text-lg font-semibold text-neutral-900">
                                {userName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {userEmail}
                            </p>
                        </div>
                        <div className="w-full space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Accesos rápidos
                            </p>
                            <div className="flex flex-wrap justify-center gap-2">
                                <Link
                                    href="/registry"
                                    className="inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 transition-colors hover:bg-emerald-100"
                                >
                                    <FolderOpen className="h-4 w-4" />
                                    Registros
                                </Link>
                                <Link
                                    href="/reportes"
                                    className="inline-flex items-center gap-2 rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-medium text-sky-800 transition-colors hover:bg-sky-100"
                                >
                                    <FileText className="h-4 w-4" />
                                    Reportes
                                </Link>
                                <Link
                                    href="/assets"
                                    className="inline-flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800 transition-colors hover:bg-amber-100"
                                >
                                    <Layers className="h-4 w-4" />
                                    Bienes
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Últimos bienes</CardTitle>
                        <CardDescription>
                            Bienes agregados recientemente.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>RPP</TableHead>
                                    <TableHead>Clave</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Fecha</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5}>
                                            <div className="py-4 text-center text-sm text-muted-foreground">
                                                Cargando bienes...
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : assets.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5}>
                                            <div className="py-4 text-center text-sm text-muted-foreground">
                                                No hay bienes recientes.
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    assets.map((asset) => (
                                        <TableRow key={asset.id}>
                                            <TableCell>#{asset.id}</TableCell>
                                            <TableCell>{asset.rpp}</TableCell>
                                            <TableCell>
                                                {asset.cNumber}
                                            </TableCell>
                                            <TableCell>
                                                {asset.status}
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(asset.createdAt)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                        <div className="pt-3 text-sm">
                            <Link
                                href="/assets"
                                className="text-primary hover:underline"
                            >
                                Ver todos los bienes
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Últimos registros</CardTitle>
                        <CardDescription>
                            Registros creados recientemente.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>RPP</TableHead>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Fecha</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={4}>
                                            <div className="py-4 text-center text-sm text-muted-foreground">
                                                Cargando registros...
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : registries.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4}>
                                            <div className="py-4 text-center text-sm text-muted-foreground">
                                                No hay registros recientes.
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    registries.map((registry) => (
                                        <TableRow key={registry.id}>
                                            <TableCell>
                                                #{registry.id}
                                            </TableCell>
                                            <TableCell>
                                                {registry.rpp}
                                            </TableCell>
                                            <TableCell>
                                                {registry.name}
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(registry.createdAt)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                        <div className="pt-3 text-sm">
                            <Link
                                href="/registry"
                                className="text-primary hover:underline"
                            >
                                Ver todos los registros
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Altas vs Bajas</CardTitle>
                        <CardDescription>
                            Distribución de procesos de inventario.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="py-10 text-center text-sm text-muted-foreground">
                                Cargando gráfica...
                            </div>
                        ) : (
                            <PieChart alta={altaTotal} baja={bajaTotal} />
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Bienes en alta</CardTitle>
                        <CardDescription>
                            Últimos bienes con proceso de alta.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>RPP</TableHead>
                                    <TableHead>Clave</TableHead>
                                    <TableHead>Fecha</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={4}>
                                            <div className="py-4 text-center text-sm text-muted-foreground">
                                                Cargando bienes...
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : altaAssets.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4}>
                                            <div className="py-4 text-center text-sm text-muted-foreground">
                                                No hay bienes en alta.
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    altaAssets.map((asset) => (
                                        <TableRow key={`alta-${asset.id}`}>
                                            <TableCell>#{asset.id}</TableCell>
                                            <TableCell>{asset.rpp}</TableCell>
                                            <TableCell>
                                                {asset.cNumber}
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(asset.createdAt)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                        <div className="pt-3 text-sm">
                            <Link
                                href="/assets?inventory_process_type=alta&order=desc"
                                className="text-primary hover:underline"
                            >
                                Ver todos los bienes en alta
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Bienes en baja</CardTitle>
                        <CardDescription>
                            Últimos bienes con proceso de baja.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>RPP</TableHead>
                                    <TableHead>Clave</TableHead>
                                    <TableHead>Fecha</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={4}>
                                            <div className="py-4 text-center text-sm text-muted-foreground">
                                                Cargando bienes...
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : bajaAssets.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4}>
                                            <div className="py-4 text-center text-sm text-muted-foreground">
                                                No hay bienes en baja.
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    bajaAssets.map((asset) => (
                                        <TableRow key={`baja-${asset.id}`}>
                                            <TableCell>#{asset.id}</TableCell>
                                            <TableCell>{asset.rpp}</TableCell>
                                            <TableCell>
                                                {asset.cNumber}
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(asset.createdAt)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                        <div className="pt-3 text-sm">
                            <Link
                                href="/assets?inventory_process_type=baja&order=desc"
                                className="text-primary hover:underline"
                            >
                                Ver todos los bienes en baja
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {isAdmin ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Actividad reciente</CardTitle>
                        <CardDescription>
                            Últimas 10 actividades registradas.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Usuario</TableHead>
                                    <TableHead>Acción</TableHead>
                                    <TableHead>Objetivo</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Nivel</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5}>
                                            <div className="py-4 text-center text-sm text-muted-foreground">
                                                Cargando actividades...
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : activities.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5}>
                                            <div className="py-4 text-center text-sm text-muted-foreground">
                                                No hay actividades recientes.
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    activities.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="font-medium">
                                                {log.actor}
                                            </TableCell>
                                            <TableCell>{log.action}</TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <p>{log.target}</p>
                                                    {log.details ? (
                                                        <p className="text-xs text-muted-foreground">
                                                            {log.details}
                                                        </p>
                                                    ) : null}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(log.created_at)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        levelConfig[log.level]
                                                            .className,
                                                    )}
                                                >
                                                    {
                                                        levelConfig[log.level]
                                                            .label
                                                    }
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                        <div className="pt-3 text-sm">
                            <Link
                                href="/admin/actividades"
                                className="text-primary hover:underline"
                            >
                                Ver todas las actividades
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            ) : null}
        </div>
    );
}
