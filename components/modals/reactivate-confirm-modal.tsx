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

interface ReactivateConfirmModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    bienNombre: string;
    onConfirm: () => void;
    note: string;
    onNoteChange: (value: string) => void;
    errorMessage?: string | null;
    isSubmitting?: boolean;
}

export default function ReactivateConfirmModal({
    open,
    onOpenChange,
    bienNombre,
    onConfirm,
    note,
    onNoteChange,
    errorMessage,
    isSubmitting = false,
}: ReactivateConfirmModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Reactivar Bien</DialogTitle>
                    <DialogDescription>
                        Está a punto de reactivar el bien &ldquo;{bienNombre}
                        &rdquo;. Esta acción generará un nuevo proceso en el
                        historial.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">
                        Nota de reactivación
                    </p>
                    <Textarea
                        placeholder="Describe el motivo o contexto de la reactivación..."
                        value={note}
                        onChange={(event) => onNoteChange(event.target.value)}
                        disabled={isSubmitting}
                    />
                    {errorMessage ? (
                        <p className="text-sm text-destructive">
                            {errorMessage}
                        </p>
                    ) : null}
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </Button>
                    <Button onClick={onConfirm} disabled={isSubmitting}>
                        {isSubmitting ? "Reactivando..." : "Reactivar"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
