"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ShieldAlert } from "lucide-react";
import { ProcesoWizard } from "@/components/bienes-inmuebles/wizard/wizard-process";
import Modal from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

function normalizeRole(value?: string | null) {
    return value?.trim().toLowerCase() ?? "";
}

function getRoleKeys(role?: string | null, roles?: Array<{ name?: string }>) {
    const keys = new Set<string>();
    const normalizedRole = normalizeRole(role);
    if (normalizedRole) {
        keys.add(normalizedRole);
    }
    if (Array.isArray(roles)) {
        for (const item of roles) {
            const roleName = normalizeRole(item?.name);
            if (roleName) {
                keys.add(roleName);
            }
        }
    }
    return keys;
}

export default function AssetNewFromRegistryPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const { data: session, status } = useSession();

    const roleKeys = useMemo(
        () => getRoleKeys(session?.user?.role, session?.user?.roles),
        [session?.user?.role, session?.user?.roles],
    );
    const isViewer = roleKeys.has("viewer");
    const isLoading = status === "loading";

    return (
        <div>
            <div className="p-6">
                {!isLoading && !isViewer ? (
                    <ProcesoWizard
                        bienId={params.id}
                        backPath="/registry"
                        enableDocuments={false}
                    />
                ) : null}
            </div>
            <Modal
                open={!isLoading && isViewer}
                onClose={() => router.push("/registry")}
                title="Accion no permitida"
                description="Tu perfil solo tiene permisos de lectura."
                className="max-w-xl border-red-100"
                footer={
                    <Button onClick={() => router.push("/registry")}>
                        Volver a registros
                    </Button>
                }
            >
                <div className="rounded-xl border border-red-100 bg-red-50/70 p-4">
                    <div className="flex items-start gap-3">
                        <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-red-700">
                            <ShieldAlert className="h-5 w-5" />
                        </span>
                        <div className="space-y-1">
                            <p className="text-sm font-semibold text-red-900">
                                No tienes permisos para agregar assets.
                            </p>
                            <p className="text-sm text-red-800">
                                Si necesitas crear o editar informacion,
                                solicita acceso a un administrador.
                            </p>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
