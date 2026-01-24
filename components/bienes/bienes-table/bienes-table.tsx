// components/bienes/bienes-table/bienes-table.tsx
"use client";

import Link from "next/link";
import {
  Building2,
  Car,
  Eye,
  FileEdit,
  MoreHorizontal,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Bien } from "@/lib/mock-data";
import { EstatusKeys } from "./index";
import { createTimeoutSignal } from "../../../lib/api/timeout";

interface BienesTableContentProps {
  bienes: Bien[];
  estatusConfig: {
    [key in EstatusKeys]: { label: string; className: string };
  };
  formatCurrency: (value: number) => string;
}

export default function BienesTableContent({
  bienes,
  estatusConfig,
  formatCurrency,
}: BienesTableContentProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-12"></TableHead>
          <TableHead>Bien</TableHead>
          <TableHead>RPP / C Número</TableHead>
          <TableHead>Categoría</TableHead>
          <TableHead>Ubicación</TableHead>
          <TableHead>Valor Catastral</TableHead>
          <TableHead>Estatus</TableHead>
          <TableHead className="w-12"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bienes.map((bien) => (
          <TableRow key={bien.id}>
            <TableCell>
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg",
                  bien.tipo === "inmueble"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-purple-100 text-purple-600",
                )}
              >
                {bien.tipo === "inmueble" ? (
                  <Building2 className="h-5 w-5" />
                ) : (
                  <Car className="h-5 w-5" />
                )}
              </div>
            </TableCell>
            <TableCell>
              <div>
                <Link
                  href={`/bienes-inmuebles/${bien.id}`}
                  className="font-medium text-gray-900 hover:text-blue-600 hover:underline"
                >
                  {bien.nombre}
                </Link>
                <p className="text-sm text-gray-500 capitalize">{bien.tipo}</p>
              </div>
            </TableCell>
            <TableCell>
              <div className="text-sm">
                <p className="font-mono font-medium">{bien.rppNumero}</p>
                <p className="font-mono text-gray-500">{bien.cNumero}</p>
              </div>
            </TableCell>
            <TableCell>{bien.categoria}</TableCell>
            <TableCell>
              <span className="text-sm text-gray-600">{bien.ubicacion}</span>
            </TableCell>
            <TableCell className="font-medium">
              {formatCurrency(bien.valorCatastral)}
            </TableCell>
            <TableCell>
              <Badge
                variant="outline"
                className={estatusConfig[bien.estatus as EstatusKeys].className}
              >
                {estatusConfig[bien.estatus as EstatusKeys].label}
              </Badge>
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/bienes-inmuebles/${bien.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Detalle
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/bienes-inmuebles/${bien.id}/editar`}>
                      <FileEdit className="mr-2 h-4 w-4" />
                      Editar
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/bienes-inmuebles/${bien.id}/process`}>
                      <Plus className="mr-2 h-4 w-4" />
                      Crear Proceso
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
