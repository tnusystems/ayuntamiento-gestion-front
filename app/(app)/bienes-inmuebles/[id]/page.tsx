
// app/(app)/bienes-inmuebles/[id]/page.tsx
"use client";

import BienDetail from "@/components/bienes/bien-detail";
import { bienes } from "@/lib/mock-data2";
import { useParams } from "next/navigation";

export default function BienDetailPage() {
  const params = useParams();
  const bienId = params.id as string;

  return (
    <div className="max-w-7xl mx-auto">
      <BienDetail bienId={bienId} />
    </div>
  );
}



