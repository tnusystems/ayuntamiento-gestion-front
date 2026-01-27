"use client";

import { MapPin, Calendar } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface BienGeneralInfoProps {
  bien: any;
}

export default function BienGeneralInfo({ bien }: BienGeneralInfoProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ubicación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 text-primary" />
              <span className="font-medium">{bien.ubicacion}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valor Catastral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-semibold">
              {formatCurrency(bien.valorCatastral)}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Fecha de Alta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="font-medium">{formatDate(bien.fechaAlta)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos del Expediente</CardTitle>
          <CardDescription>
            Información legal y documental del bien
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">
                Número de Escritura
              </p>
              <p className="font-medium">12345-A</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Fecha de Escritura
              </p>
              <p className="font-medium">15 de enero de 2024</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Notaría</p>
              <p className="font-medium">Notaría Pública No. 45</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Boleta Registral</p>
              <p className="font-medium">BR-2024-00123</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Certificado de Libertad
              </p>
              <p className="font-medium">CLG-2024-00456</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Último Proceso</p>
              <p className="font-medium">{bien.ultimoProceso || "N/A"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
