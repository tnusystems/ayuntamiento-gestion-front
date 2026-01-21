"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface Etapa {
    nombre: string;
    completada: boolean;
    fecha: string;
    observaciones: string;
}

interface WizardStep4Props {
    formData: {
        etapas: Etapa[];
    };
    updateFormData: (data: Partial<WizardStep4Props["formData"]>) => void;
}

export function WizardStep4({ formData, updateFormData }: WizardStep4Props) {
    const updateEtapa = (
        index: number,
        field: keyof Etapa,
        value: string | boolean,
    ) => {
        const newEtapas = [...formData.etapas];
        const prev = newEtapas[index];

        let nextValue = value;
        // Auto-asignar fecha actual al marcar como completada si no existe.
        if (field === "completada" && value === true && !prev.fecha) {
            nextValue = value;
            newEtapas[index] = {
                ...prev,
                [field]: nextValue,
                fecha: new Date().toISOString().slice(0, 10),
            };
        } else {
            newEtapas[index] = { ...prev, [field]: nextValue };
        }

        updateFormData({ etapas: newEtapas });
    };

    return (
        <div className="space-y-6">
            <div>
                <p className="text-sm text-muted-foreground">
                    Registre el avance de cada etapa del trámite. Las etapas
                    completadas quedarán marcadas en el historial.
                </p>
            </div>

            <div className="space-y-4">
                {formData.etapas.map((etapa, index) => (
                    <div
                        key={index}
                        className={cn(
                            "rounded-lg border p-4 transition-colors",
                            etapa.completada
                                ? "border-success/50 bg-success/5"
                                : "border-border",
                        )}
                    >
                        <div className="flex items-start gap-4">
                            <div className="pt-1">
                                <Checkbox
                                    id={`etapa-${index}`}
                                    checked={etapa.completada}
                                    onCheckedChange={(checked) =>
                                        updateEtapa(
                                            index,
                                            "completada",
                                            checked as boolean,
                                        )
                                    }
                                />
                            </div>
                            <div className="flex-1 space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label
                                        htmlFor={`etapa-${index}`}
                                        className={cn(
                                            "text-base font-medium cursor-pointer",
                                            etapa.completada &&
                                                "line-through text-muted-foreground",
                                        )}
                                    >
                                        Etapa {index + 1}: {etapa.nombre}
                                    </Label>
                                    <span
                                        className={cn(
                                            "text-xs px-2 py-1 rounded-full",
                                            etapa.completada
                                                ? "bg-success/10 text-success"
                                                : "bg-muted text-muted-foreground",
                                        )}
                                    >
                                        {etapa.completada
                                            ? "Completada"
                                            : "Pendiente"}
                                    </span>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor={`fecha-${index}`}
                                            className="text-sm"
                                        >
                                            Fecha de Cumplimiento
                                        </Label>
                                        <Input
                                            id={`fecha-${index}`}
                                            type="date"
                                            value={etapa.fecha}
                                            onChange={(e) =>
                                                updateEtapa(
                                                    index,
                                                    "fecha",
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor={`obs-${index}`}
                                            className="text-sm"
                                        >
                                            Observaciones
                                        </Label>
                                        <Textarea
                                            id={`obs-${index}`}
                                            placeholder="Notas de la etapa..."
                                            rows={2}
                                            value={etapa.observaciones}
                                            onChange={(e) =>
                                                updateEtapa(
                                                    index,
                                                    "observaciones",
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">
                    <strong>Nota:</strong> Las etapas marcadas como completadas
                    se registrarán automáticamente con la fecha actual si no se
                    especifica una fecha diferente.
                </p>
            </div>
        </div>
    );
}
