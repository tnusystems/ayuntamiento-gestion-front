"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Image from "next/image";
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

const mapRegistryRow = (registry: RegistryApi): DashboardRegistry => ({
    id: registry.id ?? "—",
    rpp: registry.rpp_number ?? "—",
    name: registry.name ?? "—",
    createdAt: registry.created_at ?? registry.fecha_alta ?? "",
});

function normalize(value?: string | null) {
    return value?.trim().toLowerCase() ?? "";
}

export default function DashboardPage() {
    const { data: session } = useSession();
    const role = normalize(session?.user?.role);
    const isAdmin = role === "admin";

    const [assets, setAssets] = useState<DashboardAsset[]>([]);
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
                const [assetsResponse, registriesResponse, activitiesResponse] =
                    await Promise.all([
                        fetchAssets({ page: 1, per_page: 5 }),
                        fetchRegistries({ page: 1, per_page: 5 }),
                        isAdmin
                            ? fetchActivities({ page: 1, per_page: 10 })
                            : Promise.resolve(null),
                    ]);
                if (!active) return;
                setAssets(assetsResponse.data.map(mapAssetRow));
                setRegistries(registriesResponse.data.map(mapRegistryRow));
                setActivities(
                    activitiesResponse
                        ? activitiesResponse.data.map(mapActivityToLog)
                        : [],
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
                    <h1 className="text-2xl font-semibold">Dashboard</h1>
                    <p className="text-sm text-muted-foreground">
                        Resumen de registros, bienes y actividad reciente.
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
                        <div className="h-20 w-20 overflow-hidden rounded-full bg-neutral-200">
                            <Image
                                width={160}
                                height={160}
                                src="/placeholder-user.png"
                                alt="Usuario"
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <div>
                            <p className="text-lg font-semibold text-neutral-900">
                                {session?.user?.name ?? "Usuario"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {session?.user?.email ?? "—"}
                            </p>
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
                                href="/bienes-inmuebles"
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
