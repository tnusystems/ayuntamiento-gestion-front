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
import ProcessLoader from "./process-loader";
import { createAsset, createAssetDocument } from "@/lib/api/assets";
import { fetchRegistry } from "@/lib/api/registries";
import { createInventoryProcess } from "@/lib/api/inventory-processes";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStage, setSubmitStage] = useState<
        "idle" | "creating" | "uploading" | "done" | "error"
    >("idle");
    const [uploadProgress, setUploadProgress] = useState({
        total: 0,
        done: 0,
    });
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [showNoDocsDialog, setShowNoDocsDialog] = useState(false);
    const [assetStatus, setAssetStatus] = useState<
        "pending" | "loading" | "completed"
    >("pending");
    const [processStatus, setProcessStatus] = useState<
        "pending" | "loading" | "completed"
    >("pending");
    const [documentsStatus, setDocumentsStatus] = useState<
        "pending" | "loading" | "completed"
    >("pending");
    const [step1Errors, setStep1Errors] = useState<{
        tipoProceso?: string;
        actoJuridico?: string;
        responsable?: string;
    }>({});
    const resolvedBackPath =
        backPath ??
        (bienId ? `/bienes-inmuebles/${bienId}` : "/bienes-inmuebles");
    const documentKindMap: Record<string, string> = {
        escritura: "es_publica",
        fotos: "foto_bien",
        plano: "catastro_plano",
        oficio: "solicitud",
        certificado: "certificado",
        avaluo: "avaluo",
        extraordinario: "extraordinario",
    };

    const tipoFromUrl = searchParams.get("tipo") || "";
    const [formData, setFormData] = useState({
        // Step 1
        tipoProceso: tipoFromUrl,
        actoJuridico: "",
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

    const countDocuments = () =>
        formData.documentosDetalle.reduce(
            (acc, group) => acc + group.files.length,
            0,
        );

    const handleSubmit = async () => {
        if (isSubmitting) return;
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
            zone_id: formData.zona.trim(),
            domain_id: formData.dominio.trim(),
            stage_definition_id: formData.stageDefinition.trim(),
            land_use_id: formData.operacionU.trim(),
            operation_type: formData.actoJuridico.trim(),
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
            setIsSubmitting(true);
            setSubmitError(null);
            setSubmitStage("creating");
            setAssetStatus("loading");
            setProcessStatus("pending");
            setDocumentsStatus("pending");
            setUploadProgress({ total: 0, done: 0 });
            console.log("Wizard payload:", payload);
            const response = await createAsset(payload);
            const assetId = response?.id ?? null;
            setCreatedAssetId(assetId);
            setAssetStatus("completed");
            console.log("Create asset response:", response);

            if (assetId) {
                setProcessStatus("loading");
                await createInventoryProcess({
                    asset_id: assetId,
                    process_type: formData.tipoProceso.trim().toLowerCase(),
                    status: "ABIERTA",
                    closed_at: now,
                    notes: formData.observaciones.trim() || undefined,
                });
                setProcessStatus("completed");
                const totalDocs = countDocuments();
                setUploadProgress({ total: totalDocs, done: 0 });
                if (totalDocs > 0) {
                    setSubmitStage("uploading");
                    setDocumentsStatus("loading");
                } else {
                    setDocumentsStatus("completed");
                }
                let position = 1;
                for (const group of formData.documentosDetalle) {
                    const kind = documentKindMap[group.docTypeId];
                    if (!kind) {
                        console.warn(
                            "Unknown document kind for docTypeId:",
                            group.docTypeId,
                        );
                        continue;
                    }
                    for (const file of group.files) {
                        await createAssetDocument(assetId, {
                            file: file.file,
                            name: file.name,
                            kind,
                            position,
                        });
                        position += 1;
                        setUploadProgress((prev) => ({
                            total: prev.total,
                            done: prev.done + 1,
                        }));
                    }
                }
            }
            if (countDocuments() > 0) {
                setDocumentsStatus("completed");
            }
            setSubmitStage("done");
        } catch (error) {
            setSubmitError(
                error instanceof Error
                    ? error.message
                    : "No se pudo completar el proceso.",
            );
            console.error("Create asset error:", error);
            setAssetStatus("pending");
            setProcessStatus("pending");
            setDocumentsStatus("pending");
            setSubmitStage("idle");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmitRequest = () => {
        if (isSubmitting) return;
        if (countDocuments() === 0) {
            setShowNoDocsDialog(true);
            return;
        }
        void handleSubmit();
    };

    const handleConfirmSubmitWithoutDocs = () => {
        setShowNoDocsDialog(false);
        void handleSubmit();
    };

    const handleCloseSuccess = () => {
        setSubmitStage("idle");
        setAssetStatus("pending");
        setProcessStatus("pending");
        setDocumentsStatus("pending");
        if (backPath === "/registry" && bienId) {
            router.push(`/assets/${bienId}`);
            return;
        }
        if (backPath) {
            router.push(backPath);
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
                                            !isSubmitting &&
                                            step.id <= currentStep &&
                                            setCurrentStep(step.id)
                                        }
                                        disabled={
                                            isSubmitting ||
                                            step.id > currentStep
                                        }
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
                    disabled={currentStep === 1 || isSubmitting}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Anterior
                </Button>

                <div className="flex gap-3">
                    {currentStep === 4 ? (
                        <Button
                            onClick={handleSubmitRequest}
                            disabled={isSubmitting}
                        >
                            <Send className="mr-2 h-4 w-4" />
                            Guardar Asset
                        </Button>
                    ) : (
                        <Button onClick={handleNext} disabled={isSubmitting}>
                            Siguiente
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {submitError && (
                <p className="text-sm text-destructive">{submitError}</p>
            )}

            <Dialog
                open={submitStage !== "idle"}
                onOpenChange={() => {
                    if (submitStage === "done") {
                        handleCloseSuccess();
                    }
                }}
            >
                <DialogContent
                    onPointerDownOutside={(event) => event.preventDefault()}
                    onEscapeKeyDown={(event) => event.preventDefault()}
                >
                    <DialogHeader>
                        <DialogTitle className="sr-only">
                            Progreso de guardado del asset
                        </DialogTitle>
                    </DialogHeader>
                    <ProcessLoader
                        assetStatus={assetStatus}
                        processStatus={processStatus}
                        documentsStatus={documentsStatus}
                        documentsProgress={uploadProgress}
                        embedded
                    />
                    {submitStage === "done" && (
                        <DialogFooter>
                            <Button onClick={handleCloseSuccess}>Cerrar</Button>
                        </DialogFooter>
                    )}
                </DialogContent>
            </Dialog>

            <AlertDialog
                open={showNoDocsDialog}
                onOpenChange={setShowNoDocsDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Continuar sin documentos
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            No se han cargado documentos. ¿Deseas crear el bien
                            de todas formas?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmSubmitWithoutDocs}
                        >
                            Crear sin documentos
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
