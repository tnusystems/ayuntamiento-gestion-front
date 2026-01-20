"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
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

export default function BienForm() {
  const router = useRouter();

  const onCLickSave = () => {};

  return (
    <form className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/bienes-inmuebless">
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
          <Button type="button" onClick={onCLickSave}>
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
            <Input id="rpp" placeholder="2138974" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="claveC">Clave catastral</Label>
            <Input id="claveC" placeholder="1380247" />
          </div>

          <div className="space-y-2 sm:col-span-2 lg:col-span-1">
            <Label htmlFor="nombre">Nombre del Bien *</Label>
            <Input id="nombre" placeholder="Nombre descriptivo del bien" />
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
              <Label htmlFor="RPPVolume">RPP Volumen</Label>
              <Input id="RPPVolume" placeholder="Ej: 12345" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="RPPSection">RPP Seccion</Label>
              <Input id="RPPSection" placeholder="Ej: 12345" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="RPPDate">RPP Fecha</Label>
              <Input id="RPPDate" type="date" />
            </div>
          </div>

          <div className="grid grid-rows-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scriptureNumber">Numero de escrituras</Label>
              <Input id="scriptureNumber" placeholder="Ej: 12345" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notary">Notaria</Label>
              <Input id="notary" placeholder="Ej: 12345" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scriptureDate">Fecha de escrituras</Label>
              <Input id="scriptureDate" type="date" />
            </div>
          </div>

          <div className="grid grid-rows-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bulletin">Boletin</Label>
              <Input id="bulletin" placeholder="Ej: 12345" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bulletinVolume">Volumen</Label>
              <Input id="bulletinVolume" placeholder="Ej: 12345" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bulletinDate">Fecha de boletin</Label>
              <Input id="bulletinDate" type="date" />
            </div>
          </div>

          <div className="grid grid-rows-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bulletin">Boletin</Label>
              <Input id="bulletin" placeholder="Ej: 12345" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bulletinVolume">Volumen</Label>
              <Input id="bulletinVolume" placeholder="Ej: 12345" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bulletinDate">Fecha de boletin</Label>
              <Input id="bulletinDate" type="date" />
            </div>
          </div>

          <div className="space-y-2 sm:col-span-2 lg:col-span-4">
            <Label htmlFor="antecedentes">Antecedentes</Label>
            <Textarea
              id="antecedentes"
              placeholder="Historial y antecedentes del bien..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
