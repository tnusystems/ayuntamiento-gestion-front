"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { tiposProceso, actosJuridicos } from "@/lib/mock-data";

interface WizardStep1Props {
    formData: {
        tipoProceso: string;
        actoJuridico: string;
        responsable: string;
        observaciones: string;
    };
    updateFormData: (data: Partial<WizardStep1Props["formData"]>) => void;
}

export function WizardStep1({ formData, updateFormData }: WizardStep1Props) {
    return (
        <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
                <Label htmlFor="tipoProceso">Tipo de Proceso *</Label>
                <Select
                    value={formData.tipoProceso}
                    onValueChange={(value) =>
                        updateFormData({ tipoProceso: value })
                    }
                >
                    <SelectTrigger id="tipoProceso">
                        <SelectValue placeholder="Seleccionar tipo de proceso" />
                    </SelectTrigger>
                    <SelectContent>
                        {tiposProceso.map((tipo) => (
                            <SelectItem key={tipo.value} value={tipo.value}>
                                {tipo.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="actoJuridico">Acto Jurídico *</Label>
                <Select
                    value={formData.actoJuridico}
                    onValueChange={(value) =>
                        updateFormData({ actoJuridico: value })
                    }
                >
                    <SelectTrigger id="actoJuridico">
                        <SelectValue placeholder="Seleccionar acto jurídico" />
                    </SelectTrigger>
                    <SelectContent>
                        {actosJuridicos.map((acto) => (
                            <SelectItem key={acto} value={acto}>
                                {acto}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="responsable">Responsable del Trámite *</Label>
                <Input
                    id="responsable"
                    placeholder="Nombre completo del responsable"
                    value={formData.responsable}
                    onChange={(e) =>
                        updateFormData({ responsable: e.target.value })
                    }
                />
            </div>

            <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="observaciones">Observaciones Generales</Label>
                <Textarea
                    id="observaciones"
                    placeholder="Notas adicionales sobre el proceso..."
                    rows={4}
                    value={formData.observaciones}
                    onChange={(e) =>
                        updateFormData({ observaciones: e.target.value })
                    }
                />
            </div>
        </div>
    );
}
