// app/(app)/bienes-inmuebles/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchAsset } from "@/lib/api/assets";

export default function BienDetailPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const assetId = params.id;
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;

        const redirectToNewRoute = async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const asset = await fetchAsset(assetId);
                const registryId =
                    (asset as { registry_id?: number | string })?.registry_id ??
                    null;
                if (!active) return;
                if (registryId) {
                    router.replace(`/assets/${registryId}/detail/${assetId}`);
                } else {
                    setLoadError("No se encontró el expediente del bien.");
                }
            } catch (error) {
                if (!active) return;
                setLoadError(
                    error instanceof Error
                        ? error.message
                        : "No se pudo cargar el bien.",
                );
            } finally {
                if (active) {
                    setIsLoading(false);
                }
            }
        };

        void redirectToNewRoute();
        return () => {
            active = false;
        };
    }, [assetId, router]);

    if (isLoading) {
        return (
            <div className="container mx-auto py-8 text-center text-muted-foreground">
                Redirigiendo...
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center space-y-4">
                    <p className="text-destructive">{loadError}</p>
                    <Button
                        onClick={() => router.push("/assets")}
                        variant="outline"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver a bienes
                    </Button>
                </div>
            </div>
        );
    }

    return null;
}
