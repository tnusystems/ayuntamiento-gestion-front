"use client";

import { useEffect, useRef, useState } from "react";

import type { BienesInmueblesTableRow } from "@/components/bienes-inmuebles/types";
import AppCard from "@/components/app-card";
import BienesInmueblesTable from "@/components/bienes-inmuebles/bienes-inmuebles-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type BienesInmueblesResultsProps = {
  data: BienesInmueblesTableRow[];
  isLoading?: boolean;
  onEdit: (row: BienesInmueblesTableRow) => void;
  onDelete: (row: BienesInmueblesTableRow) => void;
  onAttach: (row: BienesInmueblesTableRow) => void;
  onSearch: (query: string) => void;
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
};

export default function BienesInmueblesResults({
  data,
  isLoading = false,
  onEdit,
  onDelete,
  onAttach,
  onSearch,
  page,
  totalPages,
  totalCount,
  onPageChange,
}: BienesInmueblesResultsProps) {
  const [query, setQuery] = useState("");
  const initialSearchDone = useRef(false);
  const onSearchRef = useRef(onSearch);

  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  useEffect(() => {
    if (!initialSearchDone.current) {
      initialSearchDone.current = true;
      return;
    }
    const timeoutId = setTimeout(() => {
      onSearchRef.current(query.trim());
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <AppCard
      title="Resultados"
      description="Busqueda de bienes inmuebles."
      headerAction={
        <Button type="button" onClick={() => onSearch(query.trim())}>
          Buscar
        </Button>
      }
    >
      <div className="space-y-4">
        <Input
          placeholder="Buscar por clave, descripcion, ubicacion o responsable..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onSearch(query.trim());
            }
          }}
          disabled={isLoading}
        />
        <BienesInmueblesTable
          data={data}
          isLoading={isLoading}
          onEdit={onEdit}
          onDelete={onDelete}
          onAttach={onAttach}
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          onPageChange={onPageChange}
        />
      </div>
    </AppCard>
  );
}
