"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BienGeneralInfo from "./bien-general-info";
import BienPerfilVigente from "./bien-perfil-vigente";
import BienProcesos from "./bien-procesos";
import BienDocumentos from "./bien-documentos";
interface BienDetailTabsProps {
  bien: any;
  bienId: string;
  procesosCount?: number;
}

export default function BienDetailTabs({
  bien,
  bienId,
  procesosCount = 0,
}: BienDetailTabsProps) {
  return (
    <Tabs defaultValue="general" className="space-y-4">
      <TabsList>
        <TabsTrigger value="general">Información General</TabsTrigger>
        <TabsTrigger value="perfil">Perfil Vigente</TabsTrigger>
        <TabsTrigger value="procesos">Procesos ({procesosCount})</TabsTrigger>
        <TabsTrigger value="documentos">Documentos</TabsTrigger>
      </TabsList>

      <TabsContent value="general">
        <BienGeneralInfo bien={bien} />
      </TabsContent>

      <TabsContent value="perfil">
        <BienPerfilVigente bien={bien} />
      </TabsContent>

      <TabsContent value="procesos">
        <BienProcesos bienId={bienId} />
      </TabsContent>

      <TabsContent value="documentos">
        <BienDocumentos />
      </TabsContent>
    </Tabs>
  );
}
