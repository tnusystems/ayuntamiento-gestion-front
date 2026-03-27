// components/bienes/bien-detail/index.tsx

"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createAssetDocument } from "@/lib/api/assets";
import {
    createBajaInventoryProcess,
    createInventoryProcess,
} from "@/lib/api/inventory-processes";
import BienDetailHeader from "./bien-detail-header";
import BienDetailTabs from "./bien-detail-tabs";
import BajaConfirmModal from "@/components/modals/baja-confirm-modal";
import ReactivateConfirmModal from "../../modals/reactivate-confirm-modal";

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
        verificationStatus?: string;
        numero?: string;
        situacion?: string;
        zoneId?: number;
        domainId?: number;
        verificationStatusId?: number;
        operationTypeId?: number;
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
        kind?: string | null;
        filename?: string | null;
        byte_size?: number | null;
        created_at?: string | null;
        download_url?: string | null;
        url?: string | null;
    }>;
    onUploadDocuments?: () => void;
    registryId?: string;
    backPath?: string;
    hideCreateProcess?: boolean;
    viewLocationHref?: string;
    canEdit?: boolean;
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
    onUploadDocuments,
    registryId,
    backPath = "/assets",
    hideCreateProcess = false,
    viewLocationHref,
    canEdit = true,
}: BienDetailProps) {
    const [showBajaDialog, setShowBajaDialog] = useState(false);
    const [isBajaSubmitting, setIsBajaSubmitting] = useState(false);
    const [bajaReason, setBajaReason] = useState("");
    const [bajaDocument, setBajaDocument] = useState<File | null>(null);
    const [bajaError, setBajaError] = useState<string | null>(null);
    const [isReactivating, setIsReactivating] = useState(false);
    const [showReactivateDialog, setShowReactivateDialog] = useState(false);
    const [reactivateNote, setReactivateNote] = useState("");
    const [reactivateError, setReactivateError] = useState<string | null>(null);
    const [actionNotice, setActionNotice] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

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
        if (!bajaReason.trim()) {
            setBajaError("Indica el motivo de la baja.");
            return;
        }
        if (!bajaDocument) {
            setBajaError("Adjunta el documento de motivo de baja.");
            return;
        }
        setActionNotice(null);
        setActionError(null);
        setBajaError(null);
        setShowBajaDialog(false);
        try {
            setIsBajaSubmitting(true);
            const now = new Date().toISOString();
            await createAssetDocument(Number(bien.id), {
                file: bajaDocument,
                name: bajaDocument.name,
                kind: "baja",
            });
            await createBajaInventoryProcess(Number(bien.id), {
                opened_at: now,
                notes: bajaReason.trim(),
                status: "PENDIENTE",
                domain_id: bien.domainId ?? 0,
                operation_type_id: bien.operationTypeId ?? 0,
                verification_status_id: 190,
                zone_id: bien.zoneId ?? 0,
                observations: bajaReason.trim(),
                legacy_status: bien.estatus ?? "",
                reason: bajaReason.trim(),
            });
            setActionNotice(
                "Proceso de baja enviado correctamente con su documento. Actualizando vista...",
            );
            window.setTimeout(() => {
                window.location.reload();
            }, 1200);
        } catch (error) {
            setActionError(
                error instanceof Error
                    ? error.message
                    : "No se pudo iniciar el proceso de baja.",
            );
        } finally {
            setIsBajaSubmitting(false);
            setBajaReason("");
            setBajaDocument(null);
        }
    };

    const canBaja = canEdit && bien.estatus === "activo";
    const canReactivate = canEdit && bien.estatus === "baja";

    const handleReactivar = async () => {
        if (isReactivating) return;
        try {
            if (!reactivateNote.trim()) {
                setReactivateError("Indica la nota de reactivación.");
                return;
            }
            setActionNotice(null);
            setActionError(null);
            setReactivateError(null);
            setShowReactivateDialog(false);
            setIsReactivating(true);
            const now = new Date().toISOString();
            await createInventoryProcess({
                asset_id: Number(bien.id),
                process_type: "alta",
                status: "ABIERTA",
                opened_at: now,
                notes: reactivateNote.trim(),
            });
            setActionNotice(
                "Reactivación enviada correctamente. Actualizando vista...",
            );
            window.setTimeout(() => {
                window.location.reload();
            }, 1200);
        } catch (error) {
            setActionError(
                error instanceof Error
                    ? error.message
                    : "No se pudo iniciar la reactivación del bien.",
            );
        } finally {
            setIsReactivating(false);
        }
    };

    return (
        <div className="space-y-6">
            {actionError ? (
                <div className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {actionError}
                </div>
            ) : null}
            {actionNotice ? (
                <div className="rounded-md border border-success/20 bg-success/10 px-4 py-3 text-sm text-success">
                    {actionNotice}
                </div>
            ) : null}
            <BienDetailHeader
                bien={bien}
                estatusConfig={estatusConfig}
                canBaja={canBaja}
                canReactivate={canReactivate}
                onBajaClick={() => setShowBajaDialog(true)}
                onReactivateClick={() => {
                    setReactivateError(null);
                    setShowReactivateDialog(true);
                }}
                backPath={backPath}
                hideCreateProcess={hideCreateProcess}
                viewLocationHref={viewLocationHref}
                canEdit={canEdit}
            />

            <BienDetailTabs
                bien={bien}
                bienId={`${bien.id}`}
                procesos={procesos}
                documentos={documentos}
                onUploadDocuments={onUploadDocuments}
                registry={registry}
                registryId={registryId}
                canEdit={canEdit}
                hideCreateProcess={hideCreateProcess}
            />

            <BajaConfirmModal
                open={showBajaDialog}
                onOpenChange={(open) => {
                    setShowBajaDialog(open);
                    if (!open) {
                        setBajaReason("");
                        setBajaDocument(null);
                        setBajaError(null);
                    }
                }}
                bienNombre={bien.nombre}
                onConfirm={handleIniciarBaja}
                reason={bajaReason}
                onReasonChange={(value) => {
                    setBajaReason(value);
                    if (bajaError) {
                        setBajaError(null);
                    }
                }}
                file={bajaDocument}
                onFileChange={(file) => {
                    setBajaDocument(file);
                    if (bajaError) {
                        setBajaError(null);
                    }
                }}
                errorMessage={bajaError}
                isSubmitting={isBajaSubmitting}
            />
            <ReactivateConfirmModal
                open={showReactivateDialog}
                onOpenChange={(open) => {
                    setShowReactivateDialog(open);
                    if (!open) {
                        setReactivateNote("");
                        setReactivateError(null);
                    }
                }}
                bienNombre={bien.nombre}
                onConfirm={handleReactivar}
                note={reactivateNote}
                onNoteChange={(value) => {
                    setReactivateNote(value);
                    if (reactivateError) {
                        setReactivateError(null);
                    }
                }}
                errorMessage={reactivateError}
                isSubmitting={isReactivating}
            />
        </div>
    );
}
