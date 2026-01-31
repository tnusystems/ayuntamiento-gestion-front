import { ClipboardList, ShieldCheck } from "lucide-react";
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

type AuditLevel = "info" | "advertencia" | "critico";

type AuditLogItem = {
    id: string;
    actor: string;
    action: string;
    target: string;
    created_at: string;
    level: AuditLevel;
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
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

export default function AdminAuditPage() {
    const logs: AuditLogItem[] = [];

    return (
        <div className="container mx-auto py-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Auditoría</h1>
                    <p className="text-sm text-muted-foreground">
                        Registro de actividades del sistema y acciones de los
                        usuarios.
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Actividad reciente</CardTitle>
                    <CardDescription>
                        Eventos más recientes del sistema.
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
                            {logs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5}>
                                        <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
                                            <ClipboardList className="h-10 w-10 text-muted-foreground/60" />
                                            <div>
                                                <p className="font-medium">
                                                    Sin registros por ahora
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Cuando exista un endpoint,
                                                    aquí se verá el historial
                                                    completo.
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                logs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="font-medium">
                                            {log.actor}
                                        </TableCell>
                                        <TableCell>{log.action}</TableCell>
                                        <TableCell>{log.target}</TableCell>
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
                                                {levelConfig[log.level].label}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card className="border-dashed">
                <CardHeader className="flex flex-row items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                    <div>
                        <CardTitle>Notas para integración</CardTitle>
                        <CardDescription>
                            Esta sección se conectará al endpoint de auditoría
                            cuando esté disponible.
                        </CardDescription>
                    </div>
                </CardHeader>
            </Card>
        </div>
    );
}
