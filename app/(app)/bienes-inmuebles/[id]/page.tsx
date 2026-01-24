// app/(app)/bienes-inmuebles/[id]/page.tsx
// app/(app)/bienes-inmuebles/[id]/page.tsx
import BienDetail from "@/components/bienes/bien-detail";
import { bienes } from "@/lib/mock-data";

interface BienDetailPageProps {
  params: {
    id: string;
  };
}

export async function generateStaticParams() {
  return bienes.map((bien) => ({
    id: bien.id,
  }));
}

export default function BienDetailPage({ params }: BienDetailPageProps) {
  return (
    <div className="max-w-7xl mx-auto">
      <BienDetail bienId={params.id} />
    </div>
  );
}

// "use client";
// import { useParams } from "next/navigation";
// import useGetAssetByID from "@/lib/hooks/assets";
// import AssetLoader from "@/components/bienes-inmuebles/asset-loader";
// import { ProcesoWizard } from "@/components/bienes-inmuebles/wizard/wizard-process";

// export default function ProcessPage() {
//     const params = useParams<{ id: string }>();

//     const { asset, isLoading, isError } = useGetAssetByID(params.id);

//     console.log(asset);

//     if (isLoading) {
//         return <AssetLoader id={params.id} />;
//     }

//     if (isError) {
//         return (
//             <div className="text-sm text-red-600">
//                 No se pudo cargar el bien #{params.id}. Intenta nuevamente.
//             </div>
//         );
//     }

//     return (
//         <div>
//             <div className="p-6">
//                 <ProcesoWizard bienId={params.id} />
//             </div>
//         </div>
//     );
// }
