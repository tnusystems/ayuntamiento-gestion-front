"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
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

type BienFormValues = {
    rpp: string;
    claveC: string;
    nombre: string;
    rppVolume: string;
    rppSection: string;
    rppDate: string;
    scriptureNumber: string;
    notary: string;
    scriptureDate: string;
    bulletinNumber: string;
    bulletinVolume: string;
    bulletinDate: string;
    agreementNumber: string;
    agreementVolume: string;
    agreementDate: string;
    antecedentes: string;
};

const DEFAULT_VALUES: BienFormValues = {
    rpp: "",
    claveC: "",
    nombre: "",
    rppVolume: "",
    rppSection: "",
    rppDate: "",
    scriptureNumber: "",
    notary: "",
    scriptureDate: "",
    bulletinNumber: "",
    bulletinVolume: "",
    bulletinDate: "",
    agreementNumber: "",
    agreementVolume: "",
    agreementDate: "",
    antecedentes: "",
};

export default function BienForm() {
    const router = useRouter();
    const { register, getValues } = useForm<BienFormValues>({
        defaultValues: DEFAULT_VALUES,
    });

    const onClickSave = () => {
        const payload = getValues();
        console.log(payload);
        router.push("/bienes-inmuebles/7039/process");
        return payload;
    };

    return (
        <form className="space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="ghost" asChild>
                    <Link href="/bienes-inmuebles">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver al Listado
                    </Link>
                </Button>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        type="button"
                        onClick={() => router.push("/bienes-inmuebles")}
                    >
                        Cancelar
                    </Button>
                    <Button type="button" onClick={onClickSave}>
                        <Save className="mr-2 h-4 w-4" />
                        Guardar y Capturar Alta
                    </Button>
                </div>
            </div>

            {/* Section A: Identification */}
            <Card>
                <CardHeader>
                    <CardTitle>Sección A: Identificación del Bien</CardTitle>
                    <CardDescription>
                        Información básica para identificar el bien patrimonial
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-2">
                        <Label htmlFor="rpp">RPP Número *</Label>
                        <Input
                            id="rpp"
                            placeholder="2138974"
                            {...register("rpp")}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="claveC">Clave catastral</Label>
                        <Input
                            id="claveC"
                            placeholder="1380247"
                            {...register("claveC")}
                        />
                    </div>

                    <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                        <Label htmlFor="nombre">Nombre del Bien *</Label>
                        <Input
                            id="nombre"
                            placeholder="Nombre descriptivo del bien"
                            {...register("nombre")}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Section B: Expedient Data */}
            <Card>
                <CardHeader>
                    <CardTitle>Sección B: Datos del Expediente</CardTitle>
                    <CardDescription>
                        Información documental y legal del bien
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="grid grid-rows-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="rppVolume">RPP Volumen</Label>
                            <Input
                                id="rppVolume"
                                placeholder="Ej: 12345"
                                {...register("rppVolume")}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="rppSection">RPP Seccion</Label>
                            <Input
                                id="rppSection"
                                placeholder="Ej: 12345"
                                {...register("rppSection")}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="rppDate">RPP Fecha</Label>
                            <Input
                                id="rppDate"
                                type="date"
                                {...register("rppDate")}
                            />
                        </div>
                    </div>

                    <div className="grid grid-rows-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="scriptureNumber">
                                Numero de escrituras
                            </Label>
                            <Input
                                id="scriptureNumber"
                                placeholder="Ej: 12345"
                                {...register("scriptureNumber")}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notary">Notaria</Label>
                            <Input
                                id="notary"
                                placeholder="Ej: 12345"
                                {...register("notary")}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="scriptureDate">
                                Fecha de escrituras
                            </Label>
                            <Input
                                id="scriptureDate"
                                type="date"
                                {...register("scriptureDate")}
                            />
                        </div>
                    </div>

                    <div className="grid grid-rows-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="bulletinNumber">Boletin</Label>
                            <Input
                                id="bulletinNumber"
                                placeholder="Ej: 12345"
                                {...register("bulletinNumber")}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bulletinVolume">Volumen</Label>
                            <Input
                                id="bulletinVolume"
                                placeholder="Ej: 12345"
                                {...register("bulletinVolume")}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bulletinDate">
                                Fecha de boletin
                            </Label>
                            <Input
                                id="bulletinDate"
                                type="date"
                                {...register("bulletinDate")}
                            />
                        </div>
                    </div>

                    <div className="grid grid-rows-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="agreementNumber">Convenio</Label>
                            <Input
                                id="agreementNumber"
                                placeholder="Ej: 12345"
                                {...register("agreementNumber")}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="agreementVolume">Volumen</Label>
                            <Input
                                id="agreementVolume"
                                placeholder="Ej: 12345"
                                {...register("agreementVolume")}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="agreementDate">
                                Fecha de convenio
                            </Label>
                            <Input
                                id="agreementDate"
                                type="date"
                                {...register("agreementDate")}
                            />
                        </div>
                    </div>

                    <div className="space-y-2 sm:col-span-2 lg:col-span-4">
                        <Label htmlFor="antecedentes">Antecedentes</Label>
                        <Textarea
                            id="antecedentes"
                            placeholder="Historial y antecedentes del bien..."
                            rows={4}
                            {...register("antecedentes")}
                        />
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}
