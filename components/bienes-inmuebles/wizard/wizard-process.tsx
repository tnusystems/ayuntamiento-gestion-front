"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    ArrowRight,
    Check,
    FileText,
    MapPin,
    Upload,
    ClipboardCheck,
    Save,
    Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { WizardStep1 } from "./wizard-step-1";
import { WizardStep2 } from "./wizard-step-2";
import { WizardStep3 } from "./wizard-step-3";
import { WizardStep5 } from "./wizard-step-5";
import { createAsset } from "@/lib/api/assets";
import { fetchRegistry } from "@/lib/api/registries";

interface ProcesoWizardProps {
    bienId?: string;
    backPath?: string;
}

const steps = [
    {
        id: 1,
        name: "Información del Proceso",
        icon: FileText,
        description: "Datos generales del trámite",
    },
    {
        id: 2,
        name: "Captura Técnica",
        icon: MapPin,
        description: "Datos técnicos del bien",
    },
    {
        id: 3,
        name: "Documentación",
        icon: Upload,
        description: "Archivos y evidencias",
    },
    {
        id: 4,
        name: "Revisión Final",
        icon: ClipboardCheck,
        description: "Resumen y envío",
    },
];

export function ProcesoWizard({ bienId, backPath }: ProcesoWizardProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [currentStep, setCurrentStep] = useState(1);
    const [createdAssetId, setCreatedAssetId] = useState<number | null>(null);
    const [step1Errors, setStep1Errors] = useState<{
        tipoProceso?: string;
        actoJuridico?: string;
        responsable?: string;
    }>({});
    const resolvedBackPath =
        backPath ??
        (bienId ? `/bienes-inmuebles/${bienId}` : "/bienes-inmuebles");

    const tipoFromUrl = searchParams.get("tipo") || "";
    const [formData, setFormData] = useState({
        // Step 1
        tipoProceso: tipoFromUrl,
        actoJuridico: tipoFromUrl === "BAJA" ? "Desincorporación" : "",
        responsable: "",
        observaciones: "",
        rppNumber: "",
        claveCatastral: "",
        // Step 2
        colonia: "",
        calle: "",
        numero: "",
        lote: "",
        manzana: "",
        superficieTerreno: "",
        superficieConstruccion: "",
        zona: "",
        dominio: "",
        stageDefinition: "",
        operacionU: "",
        valorCatastral: "",
        valorComercial: "",
        lat: "",
        alt: "",
        observacionesTecnicas: "",
        // Step 3
        documentos: [] as string[],
        documentosDetalle: [] as Array<{
            docTypeId: string;
            docTypeLabel: string;
            files: Array<{
                name: string;
                type: string;
                size: number;
                lastModified: number;
                file: File;
            }>;
        }>,
    });

    const updateFormData = (data: Partial<typeof formData>) => {
        setFormData((prev) => ({ ...prev, ...data }));
        if (
            "tipoProceso" in data ||
            "actoJuridico" in data ||
            "responsable" in data
        ) {
            setStep1Errors((prev) => {
                const next = { ...prev };
                if ("tipoProceso" in data) {
                    delete next.tipoProceso;
                }
                if ("actoJuridico" in data) {
                    delete next.actoJuridico;
                }
                if ("responsable" in data) {
                    delete next.responsable;
                }
                return next;
            });
        }
    };

    useEffect(() => {
        if (!bienId) return;
        let isMounted = true;

        const loadRegistry = async () => {
            try {
                const registry = await fetchRegistry(bienId);
                if (!isMounted || !registry) return;
                setFormData((prev) => ({
                    ...prev,
                    rppNumber: registry.rpp_number ?? "",
                }));
            } catch (error) {
                if (isMounted) {
                    console.error("Registry load error:", error);
                }
            }
        };

        void loadRegistry();
        return () => {
            isMounted = false;
        };
    }, [bienId]);

    const validateStep1 = () => {
        const errors: typeof step1Errors = {};

        if (!formData.tipoProceso) {
            errors.tipoProceso = "Selecciona un tipo de proceso.";
        }
        if (!formData.actoJuridico || formData.actoJuridico === "__empty") {
            errors.actoJuridico = "Selecciona un acto jurídico.";
        }
        if (!formData.responsable.trim()) {
            errors.responsable = "Ingresa el nombre del responsable.";
        }

        setStep1Errors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleNext = () => {
        if (currentStep < 4) {
            if (currentStep === 1 && !validateStep1()) {
                return;
            }
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSaveDraft = () => {
        // Save as draft logic
        router.push(resolvedBackPath);
    };

    const handleSubmit = async () => {
        const toNumber = (value: string) => {
            const trimmed = value.trim();
            if (!trimmed) return 0;
            const parsed = Number(trimmed);
            return Number.isFinite(parsed) ? parsed : 0;
        };

        const now = new Date().toISOString();
        const registryId = bienId ? Number(bienId) : 0;
        const safeRegistryId = Number.isFinite(registryId) ? registryId : 0;
        const payload = {
            rpp_number: formData.rppNumber.trim(),
            c_number: formData.claveCatastral.trim(),
            lot: formData.lote.trim(),
            block: formData.manzana.trim(),
            colony: formData.colonia.trim(),
            street: formData.calle.trim(),
            total_area: toNumber(formData.superficieTerreno),
            built_area: toNumber(formData.superficieConstruccion),
            cadastral_value: toNumber(formData.valorCatastral),
            commercial_value: toNumber(formData.valorComercial),
            latitude: toNumber(formData.lat),
            longitude: toNumber(formData.alt),
            inventory_status: "active" as const,
            owner_name: formData.responsable.trim(),
            registry_date: now,
            registry_section: "",
            registry_volume: "",
            operation_type_id: toNumber(formData.actoJuridico),
            registry_id: safeRegistryId,
            created_at: now,
            updated_at: now,
            category: {},
            location: {},
        };

        try {
            console.log("Wizard payload:", payload);
            const response = await createAsset(payload);
            setCreatedAssetId(response?.id ?? null);
            console.log("Create asset response:", response);
        } catch (error) {
            console.error("Create asset error:", error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href={resolvedBackPath}>
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-semibold">
                        Crear Nuevo Proceso
                    </h1>
                    <p className="text-muted-foreground">
                        Complete los pasos para registrar el trámite
                    </p>
                </div>
            </div>

            {/* Progress Steps */}
            <Card>
                <CardContent className="p-6">
                    <nav aria-label="Progress">
                        <ol className="flex items-center justify-between">
                            {steps.map((step, index) => (
                                <li
                                    key={step.id}
                                    className="relative flex flex-1 flex-col items-center"
                                >
                                    {index !== 0 && (
                                        <div
                                            className={cn(
                                                "absolute left-0 top-5 h-0.5 w-[calc(50%-20px)] -translate-x-1/2",
                                                step.id <= currentStep
                                                    ? "bg-primary"
                                                    : "bg-border",
                                            )}
                                            style={{
                                                left: "calc(-50% + 20px)",
                                            }}
                                        />
                                    )}
                                    {index !== steps.length - 1 && (
                                        <div
                                            className={cn(
                                                "absolute right-0 top-5 h-0.5 w-[calc(50%-20px)] translate-x-1/2",
                                                step.id < currentStep
                                                    ? "bg-primary"
                                                    : "bg-border",
                                            )}
                                            style={{
                                                right: "calc(-50% + 20px)",
                                            }}
                                        />
                                    )}
                                    <button
                                        onClick={() =>
                                            step.id <= currentStep &&
                                            setCurrentStep(step.id)
                                        }
                                        disabled={step.id > currentStep}
                                        className={cn(
                                            "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                                            step.id === currentStep
                                                ? "border-primary bg-primary text-primary-foreground"
                                                : step.id < currentStep
                                                  ? "border-primary bg-primary text-primary-foreground"
                                                  : "border-border bg-background text-muted-foreground",
                                        )}
                                    >
                                        {step.id < currentStep ? (
                                            <Check className="h-5 w-5" />
                                        ) : (
                                            <step.icon className="h-5 w-5" />
                                        )}
                                    </button>
                                    <div className="mt-3 text-center">
                                        <p
                                            className={cn(
                                                "text-sm font-medium",
                                                step.id === currentStep
                                                    ? "text-foreground"
                                                    : "text-muted-foreground",
                                            )}
                                        >
                                            {step.name}
                                        </p>
                                        <p className="hidden text-xs text-muted-foreground sm:block">
                                            {step.description}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </nav>
                </CardContent>
            </Card>

            {/* Step Content */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        Paso {currentStep}: {steps[currentStep - 1].name}
                    </CardTitle>
                    <CardDescription>
                        {steps[currentStep - 1].description}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {currentStep === 1 && (
                        <WizardStep1
                            formData={formData}
                            errors={step1Errors}
                            updateFormData={updateFormData}
                        />
                    )}
                    {currentStep === 2 && (
                        <WizardStep2
                            formData={formData}
                            updateFormData={updateFormData}
                        />
                    )}
                    {currentStep === 3 && (
                        <WizardStep3
                            formData={formData}
                            updateFormData={updateFormData}
                        />
                    )}
                    {currentStep === 4 && <WizardStep5 formData={formData} />}
                </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between">
                <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Anterior
                </Button>

                <div className="flex gap-3">
                    {currentStep === 4 ? (
                        <Button onClick={handleSubmit}>
                            <Send className="mr-2 h-4 w-4" />
                            Enviar a Aprobación
                        </Button>
                    ) : (
                        <Button onClick={handleNext}>
                            Siguiente
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
