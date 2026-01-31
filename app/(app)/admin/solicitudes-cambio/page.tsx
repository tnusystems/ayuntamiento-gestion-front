import { ClipboardList } from "lucide-react";
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

type ChangeRequestStatus = "pendiente" | "aprobado" | "rechazado";

type ChangeRequest = {
    id: string;
    asset: string;
    field: string;
    current_value?: string | number | null;
    requested_value?: string | number | null;
    requested_by?: string | null;
    created_at?: string | null;
    status?: ChangeRequestStatus;
};

const statusConfig: Record<
    ChangeRequestStatus,
    { label: string; className: string }
> = {
    pendiente: {
        label: "Pendiente",
        className: "text-warning border-warning/30 bg-warning/10",
    },
    aprobado: {
        label: "Aprobado",
        className: "text-success border-success/30 bg-success/10",
    },
    rechazado: {
        label: "Rechazado",
        className: "text-destructive border-destructive/30 bg-destructive/10",
    },
};

const valueOrDash = (value?: string | number | null) =>
    value === null || value === undefined || value === ""
        ? "—"
        : String(value);

const formatDate = (value?: string | null) => {
    if (!value) return "—";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "—";
    return parsed.toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
};

export default function AdminChangeRequestsPage() {
    const requests: ChangeRequest[] = [];

    return (
        <div className="container mx-auto py-8 space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">
                    Solicitudes de cambio
                </h1>
                <p className="text-sm text-muted-foreground">
                    Revisión y seguimiento de cambios solicitados en activos.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Solicitudes registradas</CardTitle>
                    <CardDescription>
                        Este listado mostrará todas las solicitudes de cambio
                        cuando el endpoint esté disponible.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Solicitud</TableHead>
                                <TableHead>Activo</TableHead>
                                <TableHead>Campo</TableHead>
                                <TableHead>Valor actual</TableHead>
                                <TableHead>Valor solicitado</TableHead>
                                <TableHead>Solicitante</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Estado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {requests.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8}>
                                        <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
                                            <ClipboardList className="h-10 w-10 text-muted-foreground/60" />
                                            <div>
                                                <p className="font-medium">
                                                    Sin solicitudes por ahora
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Cuando exista un endpoint,
                                                    podrás revisar aquí cada
                                                    petición de cambio.
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                requests.map((request) => {
                                    const statusKey =
                                        request.status || "pendiente";
                                    const status =
                                        statusConfig[statusKey] ||
                                        statusConfig.pendiente;

                                    return (
                                        <TableRow key={request.id}>
                                            <TableCell className="font-medium">
                                                {request.id}
                                            </TableCell>
                                            <TableCell>{request.asset}</TableCell>
                                            <TableCell>{request.field}</TableCell>
                                            <TableCell>
                                                {valueOrDash(
                                                    request.current_value,
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {valueOrDash(
                                                    request.requested_value,
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {valueOrDash(
                                                    request.requested_by,
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(request.created_at)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        status.className,
                                                    )}
                                                >
                                                    {status.label}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
