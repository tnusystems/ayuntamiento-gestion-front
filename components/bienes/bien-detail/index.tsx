// components/bienes/bien-detail/index.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { bienes, procesos } from "@/lib/mock-data";
import BienDetailHeader from "./bien-detail-header";
import BienDetailTabs from "./bien-detail-tabs";
import BajaConfirmModal from "@/components/modals/baja-confirm-modal";

interface BienDetailProps {
  bienId: string;
}

const estatusConfig = {
  activo: {
    label: "Activo",
    className: "bg-success/10 text-success border-success/20",
  },
  baja: {
    label: "Baja",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
  en_tramite: {
    label: "En Trámite",
    className: "bg-warning/10 text-warning-foreground border-warning/20",
  },
};

export default function BienDetail({ bienId }: BienDetailProps) {
  const router = useRouter();
  const [showBajaDialog, setShowBajaDialog] = useState(false);
  const bien = bienes.find((b) => b.id === bienId);
  const bienProcesos = procesos.filter((p) => p.bienId === bienId);
  
  if (!bien) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-lg font-semibold">Bien no encontrado</h2>
        <p className="text-muted-foreground">
          El bien solicitado no existe en el sistema
        </p>
        <Button asChild className="mt-4">
          {/* //cambiar link */}
          <a href="/bienes-inmuebles">Volver al Listado</a>
        </Button>
      </div>
    );
  }

  const handleIniciarBaja = () => {
    setShowBajaDialog(false);
    router.push(`/bienes-inmuebles/${bienId}/process?tipo=BAJA`);
  };

  const canBaja = bien.estatus === "activo";

  return (
    <div className="space-y-6">
      <BienDetailHeader
        bien={bien}
        estatusConfig={estatusConfig}
        canBaja={canBaja}
        onBajaClick={() => setShowBajaDialog(true)}
      />

      <BienDetailTabs
        bien={bien}
        bienId={bienId}
        procesosCount={bienProcesos.length}
      />

      <BajaConfirmModal
        open={showBajaDialog}
        onOpenChange={setShowBajaDialog}
        bienNombre={bien.nombre}
        onConfirm={handleIniciarBaja}
      />
    </div>
  );
}
