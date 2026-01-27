// components/bienes/bien-detail/bien-perfil-vigente.tsx
"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

interface BienPerfilVigenteProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    bien: any;
}

export default function BienPerfilVigente({ bien }: BienPerfilVigenteProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("es-MX", {
            style: "currency",
            currency: "MXN",
        }).format(value);
    };

    const valueOrDash = (value?: string | number | null) =>
        value === null || value === undefined || value === ""
            ? "—"
            : String(value);

    const hasCoords = bien.latitude || bien.longitude;
    const coordsText =
        hasCoords && (bien.latitude || bien.longitude)
            ? `${valueOrDash(bien.latitude)}°, ${valueOrDash(bien.longitude)}°`
            : "—";

    const valorCatastral = Number(bien.valorCatastral ?? 0);
    const valorComercial = Number.isFinite(Number(bien.valorComercial))
        ? Number(bien.valorComercial)
        : Number.isFinite(valorCatastral)
          ? valorCatastral * 1.3
          : 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Perfil Vigente del Bien</CardTitle>
                <CardDescription>
                    Datos técnicos actuales registrados en el último proceso
                    aprobado
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                        <p className="text-sm text-muted-foreground">Colonia</p>
                        <p className="font-medium">
                            {valueOrDash(bien.colony)}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Calle</p>
                        <p className="font-medium">
                            {valueOrDash(bien.street)}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Número</p>
                        <p className="font-medium">
                            {valueOrDash(bien.numero)}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Lote</p>
                        <p className="font-medium">{valueOrDash(bien.lot)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Manzana</p>
                        <p className="font-medium">{valueOrDash(bien.block)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Zona</p>
                        <p className="font-medium">{valueOrDash(bien.zone)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Superficie Terreno
                        </p>
                        <p className="font-medium">
                            {valueOrDash(bien.totalArea)} m²
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Superficie Construcción
                        </p>
                        <p className="font-medium">
                            {valueOrDash(bien.builtArea)} m²
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Dominio</p>
                        <p className="font-medium">
                            {valueOrDash(bien.domain)}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Situación Jurídica
                        </p>
                        <p className="font-medium">
                            {valueOrDash(bien.situacion)}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Valor Catastral
                        </p>
                        <p className="font-medium">
                            {formatCurrency(valorCatastral)}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Valor Comercial
                        </p>
                        <p className="font-medium">
                            {formatCurrency(valorComercial)}
                        </p>
                    </div>
                    <div className="sm:col-span-2 lg:col-span-3">
                        <p className="text-sm text-muted-foreground">
                            Coordenadas
                        </p>
                        <p className="font-mono font-medium">{coordsText}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
