// components/bienes/bien-detail/index.tsx

"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createInventoryProcess } from "@/lib/api/inventory-processes";
import BienDetailHeader from "./bien-detail-header";
import BienDetailTabs from "./bien-detail-tabs";
import BajaConfirmModal from "@/components/modals/baja-confirm-modal";

interface BienDetailProps {
    bien: {
        id: string | number;
        nombre: string;
        tipo?: string;
        categoria?: string;
        estatus?: string;
        rppNumero?: string;
        cNumero?: string;
        ubicacion?: string;
        valorCatastral?: number;
        valorComercial?: number;
        fechaAlta?: string;
        ultimoProceso?: string;
        colony?: string;
        street?: string;
        block?: string;
        lot?: string;
        zone?: string;
        domain?: string;
        totalArea?: string | number;
        builtArea?: string | number;
        latitude?: string | number;
        longitude?: string | number;
    };
    registry?: {
        rpp_number?: string | null;
        rpp_date?: string | null;
        rpp_volume?: string | null;
        rpp_section?: string | null;
        e_number?: string | null;
        e_date?: string | null;
        e_notary?: string | null;
        b_number?: string | null;
        b_date?: string | null;
        co_number?: string | null;
    } | null;
    procesos?: Array<{
        id?: string | number;
        tipo?: string;
        status?: string | null;
        opened_at?: string | null;
        closed_at?: string | null;
        notes?: string | null;
    }>;
    documentos?: Array<{
        id?: string | number;
        name?: string | null;
        filename?: string | null;
        byte_size?: number | null;
        created_at?: string | null;
        download_url?: string | null;
        url?: string | null;
    }>;
    backPath?: string;
    hideCreateProcess?: boolean;
    viewLocationHref?: string;
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

export default function BienDetail({
    bien,
    registry,
    procesos = [],
    documentos = [],
    backPath = "/assets",
    hideCreateProcess = false,
    viewLocationHref,
}: BienDetailProps) {
    const [showBajaDialog, setShowBajaDialog] = useState(false);
    const [isBajaSubmitting, setIsBajaSubmitting] = useState(false);

    if (!bien) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground" />
                <h2 className="mt-4 text-lg font-semibold">
                    Bien no encontrado
                </h2>
                <p className="text-muted-foreground">
                    El bien solicitado no existe en el sistema
                </p>
                <Button asChild className="mt-4">
                    <a href={backPath}>Volver al Listado</a>
                </Button>
            </div>
        );
    }

    const handleIniciarBaja = async () => {
        if (isBajaSubmitting) return;
        setShowBajaDialog(false);
        try {
            setIsBajaSubmitting(true);
            const now = new Date().toISOString();
            await createInventoryProcess({
                asset_id: Number(bien.id),
                process_type: "baja",
                status: "CERRADA",
                closed_at: now,
                notes: "",
            });
            window.location.reload();
        } catch (error) {
            console.error("Baja process error:", error);
        } finally {
            setIsBajaSubmitting(false);
        }
    };

    const canBaja = bien.estatus === "activo";

    return (
        <div className="space-y-6">
            <BienDetailHeader
                bien={bien}
                estatusConfig={estatusConfig}
                canBaja={canBaja}
                onBajaClick={() => setShowBajaDialog(true)}
                backPath={backPath}
                hideCreateProcess={hideCreateProcess}
                viewLocationHref={viewLocationHref}
            />

            <BienDetailTabs
                bien={bien}
                bienId={`${bien.id}`}
                procesos={procesos}
                documentos={documentos}
                registry={registry}
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
