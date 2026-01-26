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
import { tiposProceso } from "@/lib/mock-data";
import { useOperationTypes } from "@/lib/hooks/bienes-inmuebles";

interface WizardStep1Props {
    formData: {
        tipoProceso: string;
        actoJuridico: string;
        responsable: string;
        observaciones: string;
        rppNumber: string;
        claveCatastral: string;
    };
    errors?: {
        tipoProceso?: string;
        actoJuridico?: string;
        responsable?: string;
    };
    updateFormData: (data: Partial<WizardStep1Props["formData"]>) => void;
}

export function WizardStep1({
    formData,
    errors,
    updateFormData,
}: WizardStep1Props) {
    const operationTypes = useOperationTypes();

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
                    <SelectTrigger
                        id="tipoProceso"
                        aria-invalid={!!errors?.tipoProceso}
                    >
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
                {errors?.tipoProceso ? (
                    <p className="text-xs text-red-600">{errors.tipoProceso}</p>
                ) : null}
            </div>

            <div className="space-y-2">
                <Label htmlFor="rppNumber">RPP</Label>
                <Input
                    id="rppNumber"
                    placeholder="RPP"
                    value={formData.rppNumber}
                    readOnly
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="actoJuridico">Acto Jurídico *</Label>
                <Select
                    value={formData.actoJuridico}
                    onValueChange={(value) =>
                        updateFormData({ actoJuridico: value })
                    }
                >
                    <SelectTrigger
                        id="actoJuridico"
                        aria-invalid={!!errors?.actoJuridico}
                    >
                        <SelectValue placeholder="Seleccionar acto jurídico" />
                    </SelectTrigger>
                    <SelectContent>
                        {operationTypes.length === 0 && (
                            <SelectItem value="__empty" disabled>
                                Sin tipos disponibles
                            </SelectItem>
                        )}
                        {operationTypes.map((operationType) => {
                            const label =
                                operationType.name ??
                                operationType.key ??
                                String(operationType.id);
                            return (
                                <SelectItem
                                    key={operationType.id}
                                    value={String(operationType.id)}
                                >
                                    {label}
                                </SelectItem>
                            );
                        })}
                    </SelectContent>
                </Select>
                {errors?.actoJuridico ? (
                    <p className="text-xs text-red-600">
                        {errors.actoJuridico}
                    </p>
                ) : null}
            </div>

            <div className="space-y-2">
                <Label htmlFor="claveCatastral">Clave Catastral</Label>
                <Input
                    id="claveCatastral"
                    type="number"
                    inputMode="numeric"
                    step="1"
                    placeholder="Clave catastral"
                    value={formData.claveCatastral}
                    onChange={(e) =>
                        updateFormData({ claveCatastral: e.target.value })
                    }
                />
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
                    aria-invalid={!!errors?.responsable}
                />
                {errors?.responsable ? (
                    <p className="text-xs text-red-600">{errors.responsable}</p>
                ) : null}
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
