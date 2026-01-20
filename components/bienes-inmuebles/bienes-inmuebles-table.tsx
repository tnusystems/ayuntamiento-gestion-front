"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import {
  BookDown,
  Building2,
  Download,
  FolderClosed,
  MoveDown,
  Paperclip,
  Pencil,
  Plus,
  PlusCircle,
  Trash2,
} from "lucide-react";

import type { BienesInmueblesTableRow } from "@/components/bienes-inmuebles/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

type BienesInmueblesTableProps = {
  data: BienesInmueblesTableRow[];
  isLoading?: boolean;
  onEdit: (row: BienesInmueblesTableRow) => void;
  onDelete: (row: BienesInmueblesTableRow) => void;
  onAttach: (row: BienesInmueblesTableRow) => void;
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
};

export default function BienesInmueblesTable({
  data,
  isLoading = false,
  onEdit,
  onDelete,
  onAttach,
  page,
  totalPages,
  totalCount,
  onPageChange,
}: BienesInmueblesTableProps) {
  const pageLabel = useMemo(() => {
    if (totalCount <= 0) {
      return `Pagina ${page} de ${totalPages}`;
    }
    return `Pagina ${page} de ${totalPages} - ${totalCount} bienes`;
  }, [page, totalCount, totalPages]);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border border-border/60 bg-background">
        <Table className="w-full text-sm border-collapse">
          <TableHeader>
            <TableRow className="border-b border-border/60 text-muted-foreground">
              <TableHead className="px-4 py-3 text-left font-medium">
                RPP Numero / Clave
              </TableHead>
              <TableHead className="px-4 py-3 text-left font-medium">
                Ubicacion
              </TableHead>
              <TableHead className="px-4 py-3 text-left font-medium">
                Estado
              </TableHead>
              <TableHead className="px-4 py-3 text-left font-medium">
                Fecha
              </TableHead>
              <TableHead className="px-4 py-3 text-left font-medium">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="px-4 py-6 text-center text-muted-foreground "
                >
                  Cargando bienes...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="px-4 py-6 text-center text-muted-foreground"
                >
                  Sin resultados para mostrar.
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-b border-border/40 last:border-b-0 hover:bg-muted/30"
                >
                  <TableCell className="px-4 py-3 text-foreground">
                    <div className="inline-flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div className="text-sm">
                        <p className="font-mono"> {row.clave}</p>
                        <p className="font-mono text-muted-foreground">
                          {row.cNumber}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-foreground">
                    {row.colony} {row.ubicacion} {row.block}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        row.estado === "Activo"
                          ? "bg-green-100 text-green-700"
                          : "bg-neutral-200 text-neutral-700"
                      }`}
                    >
                      {row.estado}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-foreground">
                    {row.fecha}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        onClick={() => onDelete(row)}
                        aria-label="Dar de baja"
                      >
                        <PlusCircle className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        onClick={() => onEdit(row)}
                        aria-label="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <div>{pageLabel}</div>
        <div className="flex items-center gap-2">
          {isLoading ? <span className="text-xs">Cargando...</span> : null}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1 || isLoading}
          >
            Anterior
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages || isLoading}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
