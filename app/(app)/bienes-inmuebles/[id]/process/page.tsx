// app/(app)/bienes-inmuebles/[id]/process/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProcessPageProps {
  params: {
    id: string;
  };
}

export default function ProcessPage({ params }: ProcessPageProps) {
  const router = useRouter();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nuevo Proceso</h1>
          <p className="text-gray-600 mt-1">
            Crear nuevo proceso para el bien ID: {params.id}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p>Formulario para crear nuevo proceso...</p>
        {/* Aquí va tu formulario para crear procesos */}
      </div>
    </div>
  );
}
