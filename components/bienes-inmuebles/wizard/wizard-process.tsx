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
    type LucideIcon,
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
import {
    createAsset,
    createAssetDocument,
    createAssetReplace,
    createAssetRegistryReassign,
} from "@/lib/api/assets";
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
import {
    buildCreateAssetPayload,
    buildNewAssetForReassign,
    clearStep1ErrorsOnUpdate,
    clearStep2ErrorsOnUpdate,
    countDocuments,
    createInitialFormData,
    documentKindMap,
    extractAssetIdFromResponse,
    getApprovalResponse,
    resolveRegistryIds,
    validateStep1,
    validateStep2,
    type ProcessStepStatus,
    type Step1Errors,
    type Step2Errors,
    type SubmitStage,
    type WizardFormData,
} from "./wizard-process.helpers";

interface ProcesoWizardProps {
    bienId?: string;
    backPath?: string;
    enableDocuments?: boolean;
}

type WizardStepDefinition = {
    id: number;
    name: string;
    icon: LucideIcon;
    description: string;
};

const DEFAULT_BACK_PATH = "/assets";
const ANTECEDENTE_BAJA_NOTES = "Dado de baja por antecedentes";
const ANTECEDENTE_BAJA_REASON = "antecedentes";
const REPLACE_BAJA_NOTES = "antecedente";
const REPLACE_BAJA_REASON = "antecedente";

const buildWizardSteps = (enableDocuments: boolean): WizardStepDefinition[] => [
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
    ...(enableDocuments
        ? [
              {
                  id: 3,
                  name: "Documentación",
                  icon: Upload,
                  description: "Archivos y evidencias",
              },
          ]
        : []),
    {
        id: enableDocuments ? 4 : 3,
        name: "Revisión Final",
        icon: ClipboardCheck,
        description: "Resumen y envío",
    },
];

const getReviewStepId = (enableDocuments: boolean) => (enableDocuments ? 4 : 3);

export function ProcesoWizard({
    bienId,
    backPath,
    enableDocuments = true,
}: ProcesoWizardProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const resolvedBackPath = backPath ?? DEFAULT_BACK_PATH;
    const steps = buildWizardSteps(enableDocuments);
    const reviewStepId = getReviewStepId(enableDocuments);
    const tipoFromUrl = searchParams.get("tipo") ?? "";

    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStage, setSubmitStage] = useState<SubmitStage>("idle");
    const [uploadProgress, setUploadProgress] = useState({ total: 0, done: 0 });
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitNotice, setSubmitNotice] = useState<string | null>(null);
    const [showNoDocsDialog, setShowNoDocsDialog] = useState(false);
    const [redirectToDashboard, setRedirectToDashboard] = useState(false);
    const [assetStatus, setAssetStatus] = useState<ProcessStepStatus>("pending");
    const [processStatus, setProcessStatus] =
        useState<ProcessStepStatus>("pending");
    const [documentsStatus, setDocumentsStatus] =
        useState<ProcessStepStatus>("pending");
    const [step1Errors, setStep1Errors] = useState<Step1Errors>({});
    const [step2Errors, setStep2Errors] = useState<Step2Errors>({});
    const [formData, setFormData] = useState<WizardFormData>(() =>
        createInitialFormData(tipoFromUrl),
    );

    const updateFormData = (data: Partial<WizardFormData>) => {
        setFormData((previous) => ({ ...previous, ...data }));
        setStep1Errors((previous) => clearStep1ErrorsOnUpdate(previous, data));
        setStep2Errors((previous) => clearStep2ErrorsOnUpdate(previous, data));
    };

    useEffect(() => {
        if (!bienId) {
            return;
        }

        let isMounted = true;

        const loadRegistry = async () => {
            try {
                const registry = await fetchRegistry(bienId);
                if (!isMounted || !registry) {
                    return;
                }

                setFormData((previous) => ({
                    ...previous,
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

    useEffect(() => {
        if (submitStage === "done" && redirectToDashboard) {
            router.push("/dashboard");
        }
    }, [redirectToDashboard, router, submitStage]);

    const validateCurrentStep1 = () => {
        const errors = validateStep1(formData);
        setStep1Errors(errors);
        return Object.keys(errors).length === 0;
    };

    const validateCurrentStep2 = () => {
        const errors = validateStep2(formData);
        setStep2Errors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleNext = () => {
        if (currentStep >= steps.length) {
            return;
        }

        if (currentStep === 1 && !validateCurrentStep1()) {
            return;
        }
        if (currentStep === 2 && !validateCurrentStep2()) {
            return;
        }

        setCurrentStep((previous) => previous + 1);
    };

    const handlePrevious = () => {
        if (currentStep <= 1) {
            return;
        }
        setCurrentStep((previous) => previous - 1);
    };

    const getDocumentCount = () => countDocuments(formData.documentosDetalle);

    const startSubmission = () => {
        setIsSubmitting(true);
        setSubmitError(null);
        setSubmitNotice(null);
        setSubmitStage("creating");
        setAssetStatus("loading");
        setProcessStatus("pending");
        setDocumentsStatus(enableDocuments ? "pending" : "completed");
        setUploadProgress({ total: 0, done: 0 });
    };

    const createAssetRequest = async (now: string) => {
        const { newRegistryId, oldRegistryId, resolvedRegistryId } =
            resolveRegistryIds({
                bienId,
                antecedenteRegistryId: formData.antecedenteRegistryId,
                hasAntecedente: formData.hasAntecedente,
            });

        const newAssetForReassign = buildNewAssetForReassign({
            formData,
            registryId: newRegistryId,
            now,
        });

        if (formData.hasAntecedente && formData.antecedenteAssetId.trim()) {
            const replaceAssetId = Number(formData.antecedenteAssetId.trim());
            if (!Number.isFinite(replaceAssetId) || Math.trunc(replaceAssetId) <= 0) {
                throw new Error(
                    "Selecciona un antecedente valido para reemplazar.",
                );
            }

            const normalizedReplaceAssetId = Math.trunc(replaceAssetId);
            return createAssetReplace(normalizedReplaceAssetId, {
                replacement_asset: {
                    ...newAssetForReassign,
                    rpp_number: formData.rppNumber.trim(),
                },
                baja_notes: REPLACE_BAJA_NOTES,
                reason: REPLACE_BAJA_REASON,
            });
        }

        if (
            formData.hasAntecedente &&
            formData.antecedenteRegistryId.trim()
        ) {
            const antecedenteRegistryId = formData.antecedenteRegistryId.trim();
            const selectedOldRpp = formData.antecedenteRpp.trim();
            if (!selectedOldRpp) {
                throw new Error(
                    "Selecciona un antecedente valido con RPP para continuar.",
                );
            }

            const selectedOldRegistryId = Number(antecedenteRegistryId);
            const normalizedOldRegistryId =
                Number.isFinite(selectedOldRegistryId) &&
                Math.trunc(selectedOldRegistryId) > 0
                    ? Math.trunc(selectedOldRegistryId)
                    : oldRegistryId;

            if (normalizedOldRegistryId <= 0) {
                throw new Error(
                    "Selecciona un antecedente valido con registry_id para continuar.",
                );
            }

            return createAssetRegistryReassign({
                old_asset: {
                    ...newAssetForReassign,
                    registry_id: normalizedOldRegistryId,
                    rpp_number: selectedOldRpp,
                },
                new_asset: {
                    ...newAssetForReassign,
                    rpp_number: formData.rppNumber.trim(),
                },
                baja_notes: ANTECEDENTE_BAJA_NOTES,
                reason: ANTECEDENTE_BAJA_REASON,
            });
        }

        const createAssetPayload = buildCreateAssetPayload({
            formData,
            registryId: resolvedRegistryId,
            now,
        });
        return createAsset(createAssetPayload);
    };

    const createProcessForAsset = async (assetId: number, now: string) => {
        setProcessStatus("loading");
        await createInventoryProcess({
            asset_id: assetId,
            process_type: formData.tipoProceso.trim().toLowerCase(),
            status: "ABIERTA",
            opened_at: now,
            notes: formData.observaciones.trim(),
        });
        setProcessStatus("completed");
    };

    const uploadDocumentsForAsset = async (assetId: number) => {
        const totalDocs = getDocumentCount();
        setUploadProgress({ total: totalDocs, done: 0 });

        if (totalDocs <= 0) {
            setDocumentsStatus("completed");
            return;
        }

        setSubmitStage("uploading");
        setDocumentsStatus("loading");

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
                setUploadProgress((previous) => ({
                    total: previous.total,
                    done: previous.done + 1,
                }));
            }
        }

        setDocumentsStatus("completed");
    };

    const handleSubmit = async () => {
        if (isSubmitting) {
            return;
        }
        if (!formData.verificationStatus.trim()) {
            setSubmitError("Selecciona un estado de verificación.");
            return;
        }

        const now = new Date().toISOString();

        try {
            startSubmission();
            const response = await createAssetRequest(now);

            const approvalResponse = getApprovalResponse(response);
            if (approvalResponse?.approval_request) {
                setSubmitNotice(
                    "Solicitud enviada para aprobación. Una vez aprobado el Bien favor de subir los documentos en la sección de detalles del bien.",
                );
                setAssetStatus("completed");
                setProcessStatus("completed");
                setDocumentsStatus("completed");
                setRedirectToDashboard(true);
                setSubmitStage("done");
                return;
            }

            const assetId = extractAssetIdFromResponse(response);
            setAssetStatus("completed");

            if (assetId) {
                await createProcessForAsset(assetId, now);
                if (enableDocuments) {
                    await uploadDocumentsForAsset(assetId);
                }
            }

            if (enableDocuments && getDocumentCount() > 0) {
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
        if (isSubmitting) {
            return;
        }

        if (!enableDocuments) {
            void handleSubmit();
            return;
        }

        if (getDocumentCount() === 0) {
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
        setDocumentsStatus(enableDocuments ? "pending" : "completed");

        if (redirectToDashboard) {
            return;
        }

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
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href={resolvedBackPath}>
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-semibold">
                        Solicitud de aprobación
                    </h1>
                    <p className="text-muted-foreground">
                        Complete los pasos para enviar la solicitud del bien
                    </p>
                </div>
            </div>

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
                                        onClick={() => {
                                            if (
                                                !isSubmitting &&
                                                step.id <= currentStep
                                            ) {
                                                setCurrentStep(step.id);
                                            }
                                        }}
                                        disabled={isSubmitting || step.id > currentStep}
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
                            errors={step2Errors}
                            updateFormData={updateFormData}
                        />
                    )}
                    {enableDocuments && currentStep === 3 && (
                        <WizardStep3
                            formData={formData}
                            updateFormData={updateFormData}
                        />
                    )}
                    {currentStep === reviewStepId && <WizardStep5 formData={formData} />}
                </CardContent>
            </Card>

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
                    {currentStep === steps.length ? (
                        <Button onClick={handleSubmitRequest} disabled={isSubmitting}>
                            <Send className="mr-2 h-4 w-4" />
                            Enviar solicitud de aprobación
                        </Button>
                    ) : (
                        <Button onClick={handleNext} disabled={isSubmitting}>
                            Siguiente
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {submitError && <p className="text-sm text-destructive">{submitError}</p>}

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
                            Progreso de envío de solicitud
                        </DialogTitle>
                    </DialogHeader>
                    <ProcessLoader
                        assetStatus={assetStatus}
                        processStatus={processStatus}
                        documentsStatus={documentsStatus}
                        documentsProgress={uploadProgress}
                        embedded
                    />
                    {submitStage === "done" && submitNotice ? (
                        <p className="text-sm text-muted-foreground">{submitNotice}</p>
                    ) : null}
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
                {enableDocuments ? (
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Enviar sin documentos</AlertDialogTitle>
                            <AlertDialogDescription>
                                No se han cargado documentos. ¿Deseas enviar la
                                solicitud de aprobación de todas formas?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleConfirmSubmitWithoutDocs}
                            >
                                Enviar sin documentos
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                ) : null}
            </AlertDialog>
        </div>
    );
}
