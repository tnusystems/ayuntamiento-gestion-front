import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { Button } from "@/components/ui/button";

export type BienRow = {
    id: string | number;
    nombre: string;
    tipo: string;
    categoria: string;
    ubicacion: string;
    valorCatastral: number;
    estatus: string;
    descripcion?: string;
};

export function BienesTableContent({
    bienes,
    router,
    expedienteId,
}: {
    bienes: BienRow[];
    router: AppRouterInstance;
    expedienteId?: string;
}) {
    const estatusConfig = {
        activo: {
            label: "Activo",
            className: "bg-green-100 text-green-800 border-green-200",
        },
        baja: {
            label: "Baja",
            className: "bg-red-100 text-red-800 border-red-200",
        },
        en_tramite: {
            label: "En Trámite",
            className: "bg-yellow-100 text-yellow-800 border-yellow-200",
        },
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("es-MX", {
            style: "currency",
            currency: "MXN",
        }).format(value);
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-border">
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                            Bien
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                            Clave catastral
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                            Ubicación
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                            Valor Catastral
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                            Estatus
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                            Acciones
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {bienes.map((bien) => (
                        <tr
                            key={bien.id}
                            className="border-b border-border hover:bg-muted/50"
                        >
                            <td className="p-4 align-middle">
                                <div>
                                    <div className="font-medium">
                                        {bien.nombre}
                                    </div>
                                    <div className="text-sm text-muted-foreground capitalize">
                                        {bien.tipo}
                                    </div>
                                </div>
                            </td>
                            <td className="p-4 align-middle">
                                {bien.categoria}
                            </td>
                            <td className="p-4 align-middle">
                                <span className="text-sm text-gray-600">
                                    {bien.ubicacion}
                                </span>
                            </td>
                            <td className="p-4 align-middle font-medium">
                                {formatCurrency(bien.valorCatastral)}
                            </td>
                            <td className="p-4 align-middle">
                                <span
                                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                                        estatusConfig[
                                            bien.estatus as keyof typeof estatusConfig
                                        ]?.className ||
                                        "bg-gray-100 text-gray-800 border-gray-200"
                                    }`}
                                >
                                    {estatusConfig[
                                        bien.estatus as keyof typeof estatusConfig
                                    ]?.label || bien.estatus}
                                </span>
                            </td>
                            <td className="p-4 align-middle">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        if (!expedienteId) return;
                                        router.push(
                                            `/assets/${expedienteId}/detail/${bien.id}`,
                                        );
                                    }}
                                >
                                    Ver Detalles
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
