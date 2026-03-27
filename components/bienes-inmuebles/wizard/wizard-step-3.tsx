"use client";

import { useMemo, useRef, useState } from "react";
import {
    FileUp,
    X,
    ImageIcon,
    FileText,
    File,
    Check,
    Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface UploadedFile {
    id: string;
    name: string;
    type: string;
    size: number;
    sizeLabel: string;
    docTypeId: string;
    docTypeLabel: string;
    file: File;
}

interface WizardStep3Props {
    formData: {
        documentos: string[];
        documentosDetalle: Array<{
            docTypeId: string;
            docTypeLabel: string;
            files: Array<{
                name: string;
                type: string;
                size: number;
                lastModified: number;
                file: File;
            }>;
        }>;
    };
    updateFormData: (data: Partial<WizardStep3Props["formData"]>) => void;
}

const spreadsheetAndCadAccept = ".xls,.xlsx,.dwg,.dwf";
const standardDocumentAccept = `.pdf,${spreadsheetAndCadAccept}`;
const imageAccept = ".jpg,.jpeg,.png";
const mixedDocumentAccept = `${standardDocumentAccept},${imageAccept}`;

const documentTypes = [
    {
        id: "escritura",
        label: "Escritura Pública",
        icon: FileText,
        accept: standardDocumentAccept,
        required: true,
        multiple: false,
    },
    {
        id: "fotos",
        label: "Fotografías del Bien",
        icon: ImageIcon,
        accept: imageAccept,
        required: true,
        multiple: true,
    },
    {
        id: "plano",
        label: "Plano Catastral",
        icon: File,
        accept: mixedDocumentAccept,
        required: false,
        multiple: false,
    },
    {
        id: "oficio",
        label: "Oficio de Solicitud",
        icon: FileText,
        accept: standardDocumentAccept,
        required: true,
        multiple: false,
    },
    {
        id: "certificado",
        label: "Certificado de Valor Catastral",
        icon: FileText,
        accept: standardDocumentAccept,
        required: false,
        multiple: false,
    },
    {
        id: "avaluo",
        label: "Avalúo",
        icon: FileText,
        accept: standardDocumentAccept,
        required: false,
        multiple: false,
    },
];

export function WizardStep3({ formData, updateFormData }: WizardStep3Props) {
    const [selectedDocType, setSelectedDocType] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dropZoneInputRef = useRef<HTMLInputElement>(null);
    const additionalDocTypeId = "extraordinario";
    const additionalDocTypeLabel = "Documento Extraordinario";

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const formatAcceptLabel = (accept: string) =>
        accept
            .split(",")
            .map((value) => value.trim().replace(".", "").toUpperCase())
            .join(", ");

    const handleDocTypeClick = (docId: string) => {
        setSelectedDocType(docId);
        const docType = documentTypes.find((d) => d.id === docId);
        if (fileInputRef.current && docType) {
            fileInputRef.current.accept = docType.accept;
            fileInputRef.current.multiple = docType.multiple;
            fileInputRef.current.click();
        }
    };

    const buildFileId = (docTypeId: string, file: File) =>
        `${docTypeId}-${file.name}-${file.size}-${file.lastModified}`;

    const buildDocumentosDetalle = (files: UploadedFile[]) => {
        const grouped = files.reduce<Record<string, UploadedFile[]>>(
            (acc, file) => {
                if (!acc[file.docTypeId]) {
                    acc[file.docTypeId] = [];
                }
                acc[file.docTypeId].push(file);
                return acc;
            },
            {},
        );

        return Object.values(
            Object.keys(grouped).reduce<
                Record<
                    string,
                    {
                        docTypeId: string;
                        docTypeLabel: string;
                        files: Array<{
                            name: string;
                            type: string;
                            size: number;
                            lastModified: number;
                            file: File;
                        }>;
                    }
                >
            >((acc, docTypeId) => {
                const group = grouped[docTypeId];
                acc[docTypeId] = {
                    docTypeId,
                    docTypeLabel: group[0]?.docTypeLabel ?? docTypeId,
                    files: group.map((item) => ({
                        name: item.name,
                        type: item.type,
                        size: item.size,
                        lastModified: item.file.lastModified,
                        file: item.file,
                    })),
                };
                return acc;
            }, {}),
        );
    };

    const uploadedFiles = useMemo<UploadedFile[]>(
        () =>
            formData.documentosDetalle.flatMap((group) =>
                group.files.map((item) => ({
                    id: buildFileId(group.docTypeId, item.file),
                    name: item.name,
                    type: item.type,
                    size: item.size,
                    sizeLabel: formatFileSize(item.size),
                    docTypeId: group.docTypeId,
                    docTypeLabel: group.docTypeLabel,
                    file: item.file,
                })),
            ),
        [formData.documentosDetalle],
    );

    const uploadedDocTypeIds = useMemo(
        () => new Set(uploadedFiles.map((file) => file.docTypeId)),
        [uploadedFiles],
    );

    const requiredTypesCount = documentTypes.filter((doc) => doc.required).length;
    const requiredUploadedCount = documentTypes.filter(
        (doc) => doc.required && uploadedDocTypeIds.has(doc.id),
    ).length;

    const syncFormData = (files: UploadedFile[]) => {
        updateFormData({
            documentos: files.map(
                (file) => `${file.docTypeLabel}: ${file.name}`,
            ),
            documentosDetalle: buildDocumentosDetalle(files),
        });
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0 || !selectedDocType) return;

        const docType = documentTypes.find((d) => d.id === selectedDocType);
        if (!docType) return;

        const incomingFiles = Array.from(files);
        const filesToUse = docType.multiple
            ? incomingFiles
            : incomingFiles.slice(0, 1);
        const newFiles: UploadedFile[] = filesToUse.map((file) => ({
            id: buildFileId(docType.id, file),
            name: file.name,
            type: file.type,
            size: file.size,
            sizeLabel: formatFileSize(file.size),
            docTypeId: docType.id,
            docTypeLabel: docType.label,
            file,
        }));

        const filtered = docType.multiple
            ? uploadedFiles
            : uploadedFiles.filter((f) => f.docTypeId !== docType.id);
        const deduped = [...filtered, ...newFiles].reduce<UploadedFile[]>(
            (acc, item) => {
                if (acc.some((existing) => existing.id === item.id)) {
                    return acc;
                }
                acc.push(item);
                return acc;
            },
            [],
        );

        syncFormData(deduped);

        // Reset
        setSelectedDocType(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleDropZoneClick = () => {
        dropZoneInputRef.current?.click();
    };

    const handleDropZoneFiles = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        const newFiles: UploadedFile[] = Array.from(files).map((file) => ({
            id: buildFileId(additionalDocTypeId, file),
            name: file.name,
            type: file.type,
            size: file.size,
            sizeLabel: formatFileSize(file.size),
            docTypeId: additionalDocTypeId,
            docTypeLabel: additionalDocTypeLabel,
            file,
        }));

        const updatedFiles = [...uploadedFiles, ...newFiles].reduce<
            UploadedFile[]
        >((acc, item) => {
            if (acc.some((existing) => existing.id === item.id)) {
                return acc;
            }
            acc.push(item);
            return acc;
        }, []);
        syncFormData(updatedFiles);

        if (dropZoneInputRef.current) {
            dropZoneInputRef.current.value = "";
        }
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const files = event.dataTransfer.files;
        if (!files || files.length === 0) return;

        const newFiles: UploadedFile[] = Array.from(files).map((file) => ({
            id: buildFileId(additionalDocTypeId, file),
            name: file.name,
            type: file.type,
            size: file.size,
            sizeLabel: formatFileSize(file.size),
            docTypeId: additionalDocTypeId,
            docTypeLabel: additionalDocTypeLabel,
            file,
        }));

        const updatedFiles = [...uploadedFiles, ...newFiles].reduce<
            UploadedFile[]
        >((acc, item) => {
            if (acc.some((existing) => existing.id === item.id)) {
                return acc;
            }
            acc.push(item);
            return acc;
        }, []);
        syncFormData(updatedFiles);
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    };

    const handleRemove = (index: number) => {
        const newFiles = uploadedFiles.filter((_, i) => i !== index);
        syncFormData(newFiles);
    };

    const isDocTypeUploaded = (docId: string) => {
        return uploadedFiles.some((f) => f.docTypeId === docId);
    };

    const getUploadedFilesForType = (docId: string) => {
        return uploadedFiles.filter((f) => f.docTypeId === docId);
    };

    return (
        <div className="space-y-7">
            {/* Hidden file inputs */}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileSelect}
            />
            <input
                type="file"
                ref={dropZoneInputRef}
                className="hidden"
                multiple
                accept={mixedDocumentAccept}
                onChange={handleDropZoneFiles}
            />

            {/* Document Types */}
            <div>
                <Label className="text-lg">Tipos de Documento</Label>
                <p className="mb-5 text-sm sm:text-base text-muted-foreground">
                    Seleccione el tipo de documento y súbalo al sistema. Los
                    campos con * son obligatorios.
                </p>
                <div className="mb-5 flex flex-wrap items-center gap-2">
                    <Badge
                        variant={
                            requiredUploadedCount === requiredTypesCount
                                ? "secondary"
                                : "outline"
                        }
                    >
                        Obligatorios: {requiredUploadedCount}/{requiredTypesCount}
                    </Badge>
                    <Badge variant="outline">
                        Archivos seleccionados: {uploadedFiles.length}
                    </Badge>
                </div>
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                    {documentTypes.map((doc) => {
                        const isUploaded = isDocTypeUploaded(doc.id);
                        const uploadedForType = getUploadedFilesForType(doc.id);
                        const uploadedLabel =
                            doc.multiple && uploadedForType.length > 1
                                ? `${uploadedForType.length} archivos`
                                : uploadedForType[0]?.name;

                        return (
                            <div
                                key={doc.id}
                                className={`relative rounded-xl border-2 transition-all ${
                                    isUploaded
                                        ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                                        : "border-border bg-transparent hover:border-primary/50 hover:bg-muted/50"
                                }`}
                            >
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="h-auto w-full flex-col gap-2 p-5 min-h-[140px]"
                                    onClick={() => handleDocTypeClick(doc.id)}
                                >
                                    <div className="relative">
                                        <doc.icon
                                            className={`h-9 w-9 ${isUploaded ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}
                                        />
                                        {isUploaded && (
                                            <div className="absolute -right-1 -top-1 rounded-full bg-green-500 p-0.5">
                                                <Check className="h-3 w-3 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-sm sm:text-base font-medium text-center leading-tight">
                                        {doc.label}
                                        {doc.required && (
                                            <span className="text-destructive">
                                                {" "}
                                                *
                                            </span>
                                        )}
                                    </span>
                                    {isUploaded && uploadedLabel ? (
                                        <span className="text-xs sm:text-sm text-green-600 dark:text-green-400 truncate max-w-full">
                                            {uploadedLabel}
                                        </span>
                                    ) : (
                                        <>
                                            <span className="text-[11px] sm:text-xs text-muted-foreground text-center leading-snug">
                                                Formatos: {formatAcceptLabel(doc.accept)}
                                            </span>
                                            <span className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                                                <Upload className="h-3 w-3" />
                                                {doc.multiple
                                                    ? "Click para subir varios"
                                                    : "Click para subir"}
                                            </span>
                                        </>
                                    )}
                                </Button>
                                {isUploaded && (
                                    <Badge
                                        variant="secondary"
                                        className="absolute right-2 top-2 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                    >
                                        Cargado
                                    </Badge>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
                <div>
                    <Label className="text-lg">Archivos Subidos</Label>
                    <p className="mb-4 text-sm sm:text-base text-muted-foreground">
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
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium truncate">
                                            {file.name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {file.docTypeLabel} &bull;{" "}
                                            {file.sizeLabel}
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

            {/* Drop Zone for additional files */}
            <div
                className="cursor-pointer rounded-xl border-2 border-dashed border-border p-8 sm:p-10 text-center transition-colors hover:border-primary/50 hover:bg-muted/50"
                onClick={handleDropZoneClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
            >
                <FileUp className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-base font-semibold">
                    Arrastre archivos aquí o haga clic para seleccionar
                    documentos adicionales
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                    Formatos aceptados: PDF, JPG, PNG, XLS, XLSX, DWG, DWF
                    (maximo 1GB o 1024MB por archivo)
                </p>
            </div>
        </div>
    );
}
