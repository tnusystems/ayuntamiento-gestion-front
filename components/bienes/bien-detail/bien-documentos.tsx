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

export default function BienDocumentos() {
  const documentos = [
    { name: "Escritura_Publica_12345.pdf", size: "2.4 MB", date: "15/01/2024" },
    {
      name: "Certificado_Libertad_Gravamen.pdf",
      size: "1.2 MB",
      date: "10/01/2024",
    },
    { name: "Plano_Catastral.pdf", size: "5.8 MB", date: "12/01/2024" },
    { name: "Fotos_Inmueble.zip", size: "15.3 MB", date: "14/01/2024" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documentos del Expediente</CardTitle>
        <CardDescription>Archivos oficiales asociados al bien</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {documentos.map((doc, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg border border-border p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{doc.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {doc.size} • {doc.date}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
