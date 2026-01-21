"use client";

import { useState } from "react";
import { FileUp, X, ImageIcon, FileText, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface WizardStep3Props {
    formData: {
        documentos: string[];
    };
    updateFormData: (data: Partial<WizardStep3Props["formData"]>) => void;
}

const documentTypes = [
    { id: "escritura", label: "Escritura Pública", icon: FileText },
    { id: "fotos", label: "Fotografías del Bien", icon: ImageIcon },
    { id: "plano", label: "Plano Catastral", icon: File },
    { id: "oficio", label: "Oficio de Solicitud", icon: FileText },
    {
        id: "certificado",
        label: "Certificado de Libertad de Gravamen",
        icon: FileText,
    },
    { id: "avaluo", label: "Avalúo", icon: FileText },
];

export function WizardStep3({ formData, updateFormData }: WizardStep3Props) {
    const [uploadedFiles, setUploadedFiles] = useState<
        Array<{ name: string; type: string; size: string }>
    >([]);

    const handleUpload = (docType: string) => {
        const newFile = {
            name: `${docType}_${Date.now()}.pdf`,
            type: docType,
            size: `${(Math.random() * 5 + 1).toFixed(1)} MB`,
        };
        setUploadedFiles([...uploadedFiles, newFile]);
        updateFormData({ documentos: [...formData.documentos, newFile.name] });
    };

    const handleRemove = (index: number) => {
        const newFiles = uploadedFiles.filter((_, i) => i !== index);
        setUploadedFiles(newFiles);
        updateFormData({ documentos: newFiles.map((f) => f.name) });
    };

    return (
        <div className="space-y-6">
            {/* Document Types */}
            <div>
                <Label className="text-base">Tipos de Documento</Label>
                <p className="mb-4 text-sm text-muted-foreground">
                    Seleccione el tipo de documento y súbalo al sistema
                </p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {documentTypes.map((doc) => (
                        <Button
                            key={doc.id}
                            type="button"
                            variant="outline"
                            className="h-auto flex-col gap-2 p-4 bg-transparent"
                            onClick={() => handleUpload(doc.label)}
                        >
                            <doc.icon className="h-8 w-8 text-muted-foreground" />
                            <span className="text-sm">{doc.label}</span>
                            <span className="text-xs text-muted-foreground">
                                Click para subir
                            </span>
                        </Button>
                    ))}
                </div>
            </div>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
                <div>
                    <Label className="text-base">Archivos Subidos</Label>
                    <p className="mb-4 text-sm text-muted-foreground">
                        {uploadedFiles.length} archivo(s) cargado(s)
                    </p>
                    <div className="space-y-2">
                        {uploadedFiles.map((file, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between rounded-lg border border-border p-4"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                        <FileUp className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium">
                                            {file.name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {file.type} • {file.size}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemove(index)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Drop Zone */}
            <div className="rounded-lg border-2 border-dashed border-border p-8 text-center">
                <FileUp className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-sm font-medium">
                    Arrastre archivos aquí o haga clic para seleccionar
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                    Formatos aceptados: PDF, JPG, PNG (máx. 10MB por archivo)
                </p>
            </div>
        </div>
    );
}
