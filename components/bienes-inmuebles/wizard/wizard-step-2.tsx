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

interface WizardStep2Props {
    formData: {
        colonia: string;
        calle: string;
        numero: string;
        lote: string;
        manzana: string;
        superficieTerreno: string;
        superficieConstruccion: string;
        zona: string;
        dominio: string;
        situacion: string;
        valorCatastral: string;
        valorComercial: string;
        lat: string;
        alt: string;
        observacionesTecnicas: string;
    };
    updateFormData: (data: Partial<WizardStep2Props["formData"]>) => void;
}

export function WizardStep2({ formData, updateFormData }: WizardStep2Props) {
    return (
        <div className="space-y-8">
            {/* Location Section */}
            <div>
                <h3 className="mb-4 text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Ubicación
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-2">
                        <Label htmlFor="colonia">Colonia *</Label>
                        <Input
                            id="colonia"
                            placeholder="Nombre de la colonia"
                            value={formData.colonia}
                            onChange={(e) =>
                                updateFormData({ colonia: e.target.value })
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="calle">Calle *</Label>
                        <Input
                            id="calle"
                            placeholder="Nombre de la calle"
                            value={formData.calle}
                            onChange={(e) =>
                                updateFormData({ calle: e.target.value })
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="numero">Número</Label>
                        <Input
                            id="numero"
                            placeholder="Número exterior"
                            value={formData.numero}
                            onChange={(e) =>
                                updateFormData({ numero: e.target.value })
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lote">Lote</Label>
                        <Input
                            id="lote"
                            placeholder="Número de lote"
                            value={formData.lote}
                            onChange={(e) =>
                                updateFormData({ lote: e.target.value })
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="manzana">Manzana</Label>
                        <Input
                            id="manzana"
                            placeholder="Número de manzana"
                            value={formData.manzana}
                            onChange={(e) =>
                                updateFormData({ manzana: e.target.value })
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="zona">Zona</Label>
                        <Select
                            value={formData.zona}
                            onValueChange={(value) =>
                                updateFormData({ zona: value })
                            }
                        >
                            <SelectTrigger id="zona">
                                <SelectValue placeholder="Seleccionar zona" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="norte">Norte</SelectItem>
                                <SelectItem value="sur">Sur</SelectItem>
                                <SelectItem value="este">Este</SelectItem>
                                <SelectItem value="oeste">Oeste</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Surfaces Section */}
            <div>
                <h3 className="mb-4 text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Superficies
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-2">
                        <Label htmlFor="superficieTerreno">
                            Superficie Terreno (m²)
                        </Label>
                        <Input
                            id="superficieTerreno"
                            type="number"
                            placeholder="0.00"
                            value={formData.superficieTerreno}
                            onChange={(e) =>
                                updateFormData({
                                    superficieTerreno: e.target.value,
                                })
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="superficieConstruccion">
                            Superficie Construcción (m²)
                        </Label>
                        <Input
                            id="superficieConstruccion"
                            type="number"
                            placeholder="0.00"
                            value={formData.superficieConstruccion}
                            onChange={(e) =>
                                updateFormData({
                                    superficieConstruccion: e.target.value,
                                })
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="dominio">Dominio</Label>
                        <Select
                            value={formData.dominio}
                            onValueChange={(value) =>
                                updateFormData({ dominio: value })
                            }
                        >
                            <SelectTrigger id="dominio">
                                <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="publico">Público</SelectItem>
                                <SelectItem value="privado">Privado</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="situacion">Situación Jurídica</Label>
                        <Select
                            value={formData.situacion}
                            onValueChange={(value) =>
                                updateFormData({ situacion: value })
                            }
                        >
                            <SelectTrigger id="situacion">
                                <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="regular">Regular</SelectItem>
                                <SelectItem value="irregular">
                                    Irregular
                                </SelectItem>
                                <SelectItem value="en_proceso">
                                    En Proceso
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Values Section */}
            <div>
                <h3 className="mb-4 text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Valores y Verificación
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-2">
                        <Label htmlFor="valorCatastral">
                            Valor Catastral (MXN)
                        </Label>
                        <Input
                            id="valorCatastral"
                            type="number"
                            placeholder="0.00"
                            value={formData.valorCatastral}
                            onChange={(e) =>
                                updateFormData({
                                    valorCatastral: e.target.value,
                                })
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="valorComercial">
                            Valor Comercial (MXN)
                        </Label>
                        <Input
                            id="valorComercial"
                            type="number"
                            placeholder="0.00"
                            value={formData.valorComercial}
                            onChange={(e) =>
                                updateFormData({
                                    valorComercial: e.target.value,
                                })
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lat">Lat</Label>
                        <Input
                            id="lat"
                            placeholder="29.0729"
                            value={formData.lat}
                            onChange={(e) =>
                                updateFormData({ lat: e.target.value })
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="alt">Alt</Label>
                        <Input
                            id="alt"
                            placeholder="200"
                            value={formData.alt}
                            onChange={(e) =>
                                updateFormData({ alt: e.target.value })
                            }
                        />
                    </div>
                </div>
            </div>

            {/* Observations */}
            <div className="space-y-2">
                <Label htmlFor="observacionesTecnicas">
                    Observaciones Técnicas
                </Label>
                <Textarea
                    id="observacionesTecnicas"
                    placeholder="Notas técnicas adicionales..."
                    rows={4}
                    value={formData.observacionesTecnicas}
                    onChange={(e) =>
                        updateFormData({
                            observacionesTecnicas: e.target.value,
                        })
                    }
                />
            </div>
        </div>
    );
}
