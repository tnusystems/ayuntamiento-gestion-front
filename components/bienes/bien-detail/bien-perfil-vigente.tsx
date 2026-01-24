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
  bien: any;
}

export default function BienPerfilVigente({ bien }: BienPerfilVigenteProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perfil Vigente del Bien</CardTitle>
        <CardDescription>
          Datos técnicos actuales registrados en el último proceso aprobado
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-sm text-muted-foreground">Colonia</p>
            <p className="font-medium">Centro</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Calle</p>
            <p className="font-medium">Serdán</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Número</p>
            <p className="font-medium">123</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Lote</p>
            <p className="font-medium">15</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Manzana</p>
            <p className="font-medium">8</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Zona</p>
            <p className="font-medium">Urbana</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Superficie Terreno</p>
            <p className="font-medium">500 m²</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              Superficie Construcción
            </p>
            <p className="font-medium">350 m²</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Dominio</p>
            <p className="font-medium">Público</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Situación Jurídica</p>
            <p className="font-medium">Regular</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Valor Catastral</p>
            <p className="font-medium">{formatCurrency(bien.valorCatastral)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Valor Comercial</p>
            <p className="font-medium">
              {formatCurrency(bien.valorCatastral * 1.3)}
            </p>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <p className="text-sm text-muted-foreground">Coordenadas</p>
            <p className="font-mono font-medium">29.0729° N, 110.9559° W</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
