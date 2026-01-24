// components/bienes/bienes-table/index.tsx
"use client";

import { useState } from "react";
import { bienes, categorias, type Bien } from "@/lib/mock-data";
import BienesTableFilters from "./bienes-table-filters";
import BienesTableContent from "./bienes-table";
import BienesTablePagination from "./bienes-table-pagination";

export const estatusConfig = {
  activo: {
    label: "Activo",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  baja: { label: "Baja", className: "bg-red-100 text-red-800 border-red-200" },
  en_tramite: {
    label: "En Trámite",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
} as const;

export type EstatusKeys = keyof typeof estatusConfig;

export default function BienesTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [estatusFilter, setEstatusFilter] = useState<string>("todos");
  const [tipoFilter, setTipoFilter] = useState<string>("todos");
  const [categoriaFilter, setCategoriaFilter] = useState<string>("todos");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredBienes = bienes.filter((bien) => {
    const matchesSearch =
      bien.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bien.rppNumero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bien.cNumero.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstatus =
      estatusFilter === "todos" || bien.estatus === estatusFilter;
    const matchesTipo = tipoFilter === "todos" || bien.tipo === tipoFilter;
    const matchesCategoria =
      categoriaFilter === "todos" || bien.categoria === categoriaFilter;
    return matchesSearch && matchesEstatus && matchesTipo && matchesCategoria;
  });

  const totalPages = Math.ceil(filteredBienes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBienes = filteredBienes.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(value);
  };

  return (
    <div className="space-y-4">
      <BienesTableFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        estatusFilter={estatusFilter}
        setEstatusFilter={setEstatusFilter}
        tipoFilter={tipoFilter}
        setTipoFilter={setTipoFilter}
        categoriaFilter={categoriaFilter}
        setCategoriaFilter={setCategoriaFilter}
        categorias={categorias}
      />

      <div className="rounded-lg border border-gray-200 bg-white">
        <BienesTableContent
          bienes={paginatedBienes}
          estatusConfig={estatusConfig}
          formatCurrency={formatCurrency}
        />

        <BienesTablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          startIndex={startIndex}
          itemsPerPage={itemsPerPage}
          filteredBienes={filteredBienes}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </div>
  );
}
