"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BienGeneralInfo from "./bien-general-info";
import BienPerfilVigente from "./bien-perfil-vigente";
import BienProcesos from "./bien-procesos";
import BienDocumentos from "./bien-documentos";
interface BienDetailTabsProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    bien: any;
    bienId: string;
    registryId?: string;
    procesos?: Array<{
        id?: string | number;
        tipo?: string;
        status?: string | null;
        opened_at?: string | null;
        closed_at?: string | null;
        notes?: string | null;
    }>;
    documentos?: Array<{
        id?: string | number;
        name?: string | null;
        kind?: string | null;
        filename?: string | null;
        byte_size?: number | null;
        created_at?: string | null;
        download_url?: string | null;
        url?: string | null;
    }>;
    onUploadDocuments?: () => void;
    registry?: {
        rpp_number?: string | null;
        rpp_date?: string | null;
        rpp_volume?: string | null;
        rpp_section?: string | null;
        e_number?: string | null;
        e_date?: string | null;
        e_notary?: string | null;
        b_number?: string | null;
        b_date?: string | null;
        co_number?: string | null;
    } | null;
    canEdit?: boolean;
    hideCreateProcess?: boolean;
}

export default function BienDetailTabs({
    bien,
    bienId,
    registryId,
    procesos = [],
    documentos = [],
    onUploadDocuments,
    registry = null,
    canEdit = true,
    hideCreateProcess = false,
}: BienDetailTabsProps) {
    return (
        <Tabs defaultValue="general" className="space-y-4">
            <TabsList>
                <TabsTrigger value="general">Información General</TabsTrigger>
                <TabsTrigger value="perfil">Perfil Vigente</TabsTrigger>
                <TabsTrigger value="procesos">
                    Procesos ({procesos.length})
                </TabsTrigger>
                <TabsTrigger value="documentos">Documentos</TabsTrigger>
            </TabsList>

            <TabsContent value="general">
                <BienGeneralInfo
                    bien={bien}
                    registry={registry}
                    registryId={registryId}
                    canEdit={canEdit}
                />
            </TabsContent>

            <TabsContent value="perfil">
                <BienPerfilVigente bien={bien} canEdit={canEdit} />
            </TabsContent>

            <TabsContent value="procesos">
                <BienProcesos
                    bienId={bienId}
                    procesos={procesos}
                    hideCreateProcess={hideCreateProcess}
                />
            </TabsContent>

            <TabsContent value="documentos">
                <BienDocumentos
                    documentos={documentos}
                    onUploadClick={canEdit ? onUploadDocuments : undefined}
                />
            </TabsContent>
        </Tabs>
    );
}
