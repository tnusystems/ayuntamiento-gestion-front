"use client";

import { useMemo, useState } from "react";

import type { BienesInmueblesTableRow } from "@/components/bienes-inmuebles/types";
import AppCard from "@/components/app-card";
import BienesInmueblesTable from "@/components/bienes-inmuebles/bienes-inmuebles-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type BienesInmueblesResultsProps = {
  data: BienesInmueblesTableRow[];
  onEdit: (row: BienesInmueblesTableRow) => void;
  onDelete: (row: BienesInmueblesTableRow) => void;
  onAttach: (row: BienesInmueblesTableRow) => void;
};

export default function BienesInmueblesResults({
  data,
  onEdit,
  onDelete,
  onAttach,
}: BienesInmueblesResultsProps) {
  const [query, setQuery] = useState("");

  const filteredData = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return data;
    }
    return data.filter((row) =>
      [
        row.clave,
        row.descripcion,
        row.ubicacion,
        row.estado,
        row.fecha,
        row.responsable,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalized)
    );
  }, [data, query]);

  return (
    <AppCard
      title="Resultados"
      description="Busqueda de bienes inmuebles."
      headerAction={<Button type="button">Buscar</Button>}
    >
      <div className="space-y-4">
        <Input
          placeholder="Buscar por clave, descripcion, ubicacion o responsable..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <BienesInmueblesTable
          data={filteredData}
          onEdit={onEdit}
          onDelete={onDelete}
          onAttach={onAttach}
        />
      </div>
    </AppCard>
  );
}
