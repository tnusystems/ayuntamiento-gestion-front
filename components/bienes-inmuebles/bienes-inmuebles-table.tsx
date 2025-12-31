"use client";

import { useEffect, useMemo, useState } from "react";

import { Paperclip, Pencil, Trash2 } from "lucide-react";

import type { BienesInmueblesTableRow } from "@/components/bienes-inmuebles/types";
import { Button } from "@/components/ui/button";

type BienesInmueblesTableProps = {
  data: BienesInmueblesTableRow[];
  pageSize?: number;
  isLoading?: boolean;
  onEdit: (row: BienesInmueblesTableRow) => void;
  onDelete: (row: BienesInmueblesTableRow) => void;
  onAttach: (row: BienesInmueblesTableRow) => void;
};

export default function BienesInmueblesTable({
  data,
  pageSize = 6,
  isLoading = false,
  onEdit,
  onDelete,
  onAttach,
}: BienesInmueblesTableProps) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const pagedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, page, pageSize]);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border border-border/60 bg-background">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-border/60 text-muted-foreground">
              <th className="px-4 py-3 text-left font-medium">Clave</th>
              <th className="px-4 py-3 text-left font-medium">Descripcion</th>
              <th className="px-4 py-3 text-left font-medium">Ubicacion</th>
              <th className="px-4 py-3 text-left font-medium">Estado</th>
              <th className="px-4 py-3 text-left font-medium">Fecha</th>
              <th className="px-4 py-3 text-left font-medium">Responsable</th>
              <th className="px-4 py-3 text-left font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-6 text-center text-muted-foreground"
                >
                  Cargando bienes...
                </td>
              </tr>
            ) : pagedData.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-6 text-center text-muted-foreground"
                >
                  Sin resultados para mostrar.
                </td>
              </tr>
            ) : (
              pagedData.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-border/40 last:border-b-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3 text-foreground">{row.clave}</td>
                  <td className="px-4 py-3 text-foreground">
                    {row.descripcion}
                  </td>
                  <td className="px-4 py-3 text-foreground">{row.ubicacion}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        row.estado === "Activo"
                          ? "bg-green-100 text-green-700"
                          : "bg-neutral-200 text-neutral-700"
                      }`}
                    >
                      {row.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-foreground">{row.fecha}</td>
                  <td className="px-4 py-3 text-foreground">
                    {row.responsable}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        onClick={() => onEdit(row)}
                        aria-label="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        onClick={() => onDelete(row)}
                        aria-label="Dar de baja"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        onClick={() => onAttach(row)}
                        aria-label="Adjuntar documento"
                      >
                        <Paperclip className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <div>
          Pagina {page} de {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page === 1 || isLoading}
          >
            Anterior
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page === totalPages || isLoading}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
