"use client";

import { Check, Loader2, FileText, Cog, Upload } from "lucide-react";

const steps = [
    { id: 1, label: "Creando asset", icon: FileText },
    { id: 2, label: "Creando proceso", icon: Cog },
    { id: 3, label: "Subiendo documentos", icon: Upload },
];

type StepStatus = "pending" | "loading" | "completed";

type ProcessLoaderProps = {
    assetStatus: StepStatus;
    processStatus: StepStatus;
    documentsStatus: StepStatus;
    documentsProgress?: { done: number; total: number };
    embedded?: boolean;
};

export default function ProcessLoader({
    assetStatus,
    processStatus,
    documentsStatus,
    documentsProgress,
    embedded = false,
}: ProcessLoaderProps) {
    const statuses: StepStatus[] = [
        assetStatus,
        processStatus,
        documentsStatus,
    ];
    const isComplete = statuses.every((status) => status === "completed");

    const getProgress = () => {
        const completedSteps = statuses.filter(
            (status) => status === "completed",
        ).length;
        const loadingStep = statuses.includes("loading") ? 0.5 : 0;
        return ((completedSteps + loadingStep) / steps.length) * 100;
    };

    const containerClassName = embedded
        ? "w-full"
        : "min-h-screen bg-background flex items-center justify-center p-4";

    const cardClassName = embedded
        ? "p-2"
        : "bg-card border border-border rounded-2xl p-8 shadow-lg";

    return (
        <div className={containerClassName}>
            <div className="w-full max-w-md">
                <div className={cardClassName}>
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-semibold text-foreground mb-2">
                            {isComplete
                                ? "¡Proceso completado!"
                                : "Procesando..."}
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            {isComplete
                                ? "Todos los pasos se han completado exitosamente"
                                : "Por favor espera mientras completamos los pasos"}
                        </p>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-8">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${getProgress()}%` }}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground text-right mt-2">
                            {Math.round(getProgress())}% completado
                        </p>
                    </div>

                    {/* Steps */}
                    <div className="space-y-4">
                        {steps.map((step, index) => {
                            const status = statuses[index];
                            const Icon = step.icon;

                            return (
                                <div
                                    key={step.id}
                                    className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                                        status === "loading"
                                            ? "bg-primary/10 border border-primary/20"
                                            : status === "completed"
                                              ? "bg-emerald-500/10 border border-emerald-500/20"
                                              : "bg-muted/50 border border-transparent"
                                    }`}
                                >
                                    {/* Icon container */}
                                    <div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                                            status === "loading"
                                                ? "bg-primary text-primary-foreground"
                                                : status === "completed"
                                                  ? "bg-emerald-500 text-white"
                                                  : "bg-muted text-muted-foreground"
                                        }`}
                                    >
                                        {status === "loading" ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : status === "completed" ? (
                                            <Check className="w-5 h-5" />
                                        ) : (
                                            <Icon className="w-5 h-5" />
                                        )}
                                    </div>

                                    {/* Text */}
                                    <div className="flex-1">
                                        <p
                                            className={`font-medium transition-colors duration-300 ${
                                                status === "loading"
                                                    ? "text-primary"
                                                    : status === "completed"
                                                      ? "text-emerald-600 dark:text-emerald-400"
                                                      : "text-muted-foreground"
                                            }`}
                                        >
                                            {step.label}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {status === "loading"
                                                ? "En progreso..."
                                                : status === "completed"
                                                  ? "Completado"
                                                  : "Pendiente"}
                                        </p>
                                    </div>

                                    {/* Status indicator */}
                                    {status === "loading" && (
                                        <div className="flex gap-1">
                                            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                                            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                                            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {documentsProgress &&
                        documentsStatus === "loading" &&
                        documentsProgress.total > 0 && (
                            <p className="mt-4 text-xs text-muted-foreground text-right">
                                {documentsProgress.done} de{" "}
                                {documentsProgress.total} documentos cargados
                            </p>
                        )}
                </div>
            </div>
        </div>
    );
}
