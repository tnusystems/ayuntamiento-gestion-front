"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { createRegistry } from "@/lib/api/registries";

type RegistryFormValues = {
    rppNumber: string;
    nombre: string;
    rppVolume: string;
    rppSection: string;
    rppDate: string;
    escrituraNumber: string;
    notary: string;
    escrituraDate: string;
    boletinNumber: string;
    boletinVolume: string;
    boletinDate: string;
    convenioNumber: string;
    convenioDate: string;
    antecedentes: string;
};

const DEFAULT_VALUES: RegistryFormValues = {
    rppNumber: "",
    nombre: "",
    rppVolume: "",
    rppSection: "",
    rppDate: "",
    escrituraNumber: "",
    notary: "",
    escrituraDate: "",
    boletinNumber: "",
    boletinVolume: "",
    boletinDate: "",
    convenioNumber: "",
    convenioDate: "",
    antecedentes: "",
};

export default function RegistryNewPage() {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
    const { register, handleSubmit, reset } = useForm<RegistryFormValues>({
        defaultValues: DEFAULT_VALUES,
    });

    const onSubmit = handleSubmit(async (values) => {
        setIsSaving(true);
        setErrorMessage(null);
        setNoticeMessage(null);
        try {
            const created = await createRegistry({
                name: values.nombre,
                rpp_number: values.rppNumber,
                rpp_volume: values.rppVolume || undefined,
                rpp_section: values.rppSection || undefined,
                rpp_date: values.rppDate || undefined,
                rpp_antecedent: values.antecedentes || undefined,
                b_number: values.boletinNumber || undefined,
                b_volume: values.boletinVolume || undefined,
                b_date: values.boletinDate || undefined,
                e_number: values.escrituraNumber || undefined,
                e_notary: values.notary || undefined,
                e_date: values.escrituraDate || undefined,
                co_number: values.convenioNumber || undefined,
                co_date: values.convenioDate || undefined,
            });
            reset(DEFAULT_VALUES);
            if (
                created &&
                typeof created === "object" &&
                "approval_request" in created
            ) {
                setNoticeMessage("Solicitud enviada para aprobación.");
                window.setTimeout(() => {
                    router.push("/registry");
                }, 1200);
            } else if (created?.id) {
                router.push(`/assets/new/${created.id}`);
            } else {
                router.push("/registry");
            }
        } catch (error) {
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "No se pudo guardar el registro.",
            );
        } finally {
            setIsSaving(false);
        }
    });

    return (
        <form className="space-y-6" onSubmit={onSubmit}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button variant="ghost" asChild className="w-full justify-start sm:w-auto">
                    <Link href="/registry">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver al Listado
                    </Link>
                </Button>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:gap-3">
                    <Button
                        variant="outline"
                        type="button"
                        onClick={() => router.push("/registry")}
                        disabled={isSaving}
                        className="w-full sm:w-auto"
                    >
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
                        <Save className="mr-2 h-4 w-4" />
                        Guardar Registro
                    </Button>
                </div>
            </div>

            {errorMessage ? (
                <div className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {errorMessage}
                </div>
            ) : null}
            {noticeMessage ? (
                <div className="rounded-md border border-success/20 bg-success/10 px-4 py-3 text-sm text-success">
                    {noticeMessage}
                </div>
            ) : null}

            <Card>
                <CardHeader>
                    <CardTitle>Sección A: Identificación</CardTitle>
                    <CardDescription>
                        Información básica para identificar el registro
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-2">
                        <Label htmlFor="rppNumber">RPP Número *</Label>
                        <Input
                            id="rppNumber"
                            placeholder="2138974"
                            {...register("rppNumber")}
                            disabled={isSaving}
                        />
                    </div>
                    <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                        <Label htmlFor="nombre">Nombre *</Label>
                        <Input
                            id="nombre"
                            placeholder="Nombre descriptivo"
                            {...register("nombre")}
                            disabled={isSaving}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Sección B: Datos del Expediente</CardTitle>
                    <CardDescription>
                        Información documental y legal del registro
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                    <div className="grid content-start gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="rppVolume">RPP Volumen</Label>
                            <Input
                                id="rppVolume"
                                placeholder="Ej: 12345"
                                {...register("rppVolume")}
                                disabled={isSaving}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="rppSection">RPP Sección</Label>
                            <Input
                                id="rppSection"
                                placeholder="Ej: 12345"
                                {...register("rppSection")}
                                disabled={isSaving}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="rppDate">RPP Fecha</Label>
                            <Input
                                id="rppDate"
                                type="date"
                                {...register("rppDate")}
                                disabled={isSaving}
                            />
                        </div>
                    </div>

                    <div className="grid content-start gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="escrituraNumber">
                                Número de escrituras
                            </Label>
                            <Input
                                id="escrituraNumber"
                                placeholder="Ej: 12345"
                                {...register("escrituraNumber")}
                                disabled={isSaving}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="notary">Notaría</Label>
                            <Input
                                id="notary"
                                placeholder="Ej: 12345"
                                {...register("notary")}
                                disabled={isSaving}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="escrituraDate">
                                Fecha de escrituras
                            </Label>
                            <Input
                                id="escrituraDate"
                                type="date"
                                {...register("escrituraDate")}
                                disabled={isSaving}
                            />
                        </div>
                    </div>

                    <div className="grid content-start gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="boletinNumber">Boletín</Label>
                            <Input
                                id="boletinNumber"
                                placeholder="Ej: 12345"
                                {...register("boletinNumber")}
                                disabled={isSaving}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="boletinVolume">Volumen</Label>
                            <Input
                                id="boletinVolume"
                                placeholder="Ej: 12345"
                                {...register("boletinVolume")}
                                disabled={isSaving}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="boletinDate">
                                Fecha de boletín
                            </Label>
                            <Input
                                id="boletinDate"
                                type="date"
                                {...register("boletinDate")}
                                disabled={isSaving}
                            />
                        </div>
                    </div>

                    <div className="grid content-start gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="convenioNumber">Convenio</Label>
                            <Input
                                id="convenioNumber"
                                placeholder="Ej: 12345"
                                {...register("convenioNumber")}
                                disabled={isSaving}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="convenioDate">
                                Fecha de convenio
                            </Label>
                            <Input
                                id="convenioDate"
                                type="date"
                                {...register("convenioDate")}
                                disabled={isSaving}
                            />
                        </div>
                    </div>

                    <div className="space-y-2 md:col-span-2 xl:col-span-4">
                        <Label htmlFor="antecedentes">Antecedentes</Label>
                        <Textarea
                            id="antecedentes"
                            placeholder="Historial y antecedentes del registro..."
                            rows={4}
                            {...register("antecedentes")}
                            disabled={isSaving}
                        />
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}
