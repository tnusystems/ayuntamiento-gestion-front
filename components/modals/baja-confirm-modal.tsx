"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface BajaConfirmModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    bienNombre: string;
    onConfirm: () => void;
    reason: string;
    onReasonChange: (value: string) => void;
    errorMessage?: string | null;
    isSubmitting?: boolean;
}

export default function BajaConfirmModal({
    open,
    onOpenChange,
    bienNombre,
    onConfirm,
    reason,
    onReasonChange,
    errorMessage,
    isSubmitting = false,
}: BajaConfirmModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Iniciar Proceso de Baja</DialogTitle>
                    <DialogDescription>
                        Está a punto de iniciar el proceso de baja para el bien
                        "{bienNombre}". Este proceso requiere documentación y
                        aprobación del área correspondiente.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">
                        Motivo de baja
                    </p>
                    <Textarea
                        placeholder="Describe el motivo de la baja..."
                        value={reason}
                        onChange={(event) => onReasonChange(event.target.value)}
                        disabled={isSubmitting}
                    />
                    {errorMessage ? (
                        <p className="text-sm text-destructive">
                            {errorMessage}
                        </p>
                    ) : null}
                </div>
                <div className="rounded-lg border border-warning/50 bg-warning/10 p-4">
                    <p className="text-sm text-warning-foreground">
                        <strong>Importante:</strong> Una vez aprobado el proceso
                        de baja, el bien quedará desincorporado del inventario
                        patrimonial. Esta acción genera un expediente
                        permanente.
                    </p>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? "Iniciando..."
                            : "Iniciar Proceso de Baja"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
