"use client";

import { useParams } from "next/navigation";
import { ProcesoWizard } from "@/components/bienes-inmuebles/wizard/wizard-process";

export default function AssetNewFromRegistryPage() {
    const params = useParams<{ id: string }>();

    return (
        <div>
            <div className="p-6">
                <ProcesoWizard
                    bienId={params.id}
                    backPath="/registry"
                    enableDocuments={false}
                />
            </div>
        </div>
    );
}
