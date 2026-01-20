"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Car,
  Eye,
  FileEdit,
  MoreHorizontal,
  Plus,
  ChevronLeft,
  ChevronRight,
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { cn } from "@/lib/utils";
import { bienes, categorias } from "@/lib/mock-data";

const estatusConfig = {
  activo: {
    label: "Activo",
    className: "bg-success/10 text-success border-success/20",
  },
  baja: {
    label: "Baja",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
  en_tramite: {
    label: "En Trámite",
    className: "bg-warning/10 text-warning-foreground border-warning/20",
  },
};

export function BienesTable() {
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
      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-4 sm:flex-row">
          <Input
            placeholder="Buscar por nombre, RPP o C Número..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-72"
          />
          <Select value={estatusFilter} onValueChange={setEstatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Estatus" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estatus</SelectItem>
              <SelectItem value="activo">Activo</SelectItem>
              <SelectItem value="baja">Baja</SelectItem>
              <SelectItem value="en_tramite">En Trámite</SelectItem>
            </SelectContent>
          </Select>
          <Select value={tipoFilter} onValueChange={setTipoFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los tipos</SelectItem>
              <SelectItem value="inmueble">Inmueble</SelectItem>
              <SelectItem value="mueble">Mueble</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button asChild>
          <Link href="/bienes/nuevo">
            <Plus className="mr-2 h-4 w-4" />
            Registrar Nuevo Bien
          </Link>
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card">
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
            {paginatedBienes.map((bien) => (
              <TableRow key={bien.id}>
                <TableCell>
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg",
                      bien.tipo === "inmueble"
                        ? "bg-primary/10 text-primary"
                        : "bg-info/10 text-info",
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
                      href={`/bienes/${bien.id}`}
                      className="font-medium text-foreground hover:text-primary hover:underline"
                    >
                      {bien.nombre}
                    </Link>
                    <p className="text-sm text-muted-foreground capitalize">
                      {bien.tipo}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <p className="font-mono">{bien.rppNumero}</p>
                    <p className="font-mono text-muted-foreground">
                      {bien.cNumero}
                    </p>
                  </div>
                </TableCell>
                <TableCell>{bien.categoria}</TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {bien.ubicacion}
                  </span>
                </TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(bien.valorCatastral)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={estatusConfig[bien.estatus].className}
                  >
                    {estatusConfig[bien.estatus].label}
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
                        <Link href={`/bienes/${bien.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Detalle
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/bienes/${bien.id}/editar`}>
                          <FileEdit className="mr-2 h-4 w-4" />
                          Editar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/bienes/${bien.id}/proceso/nuevo`}>
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

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <p className="text-sm text-muted-foreground">
            Mostrando {startIndex + 1} a{" "}
            {Math.min(startIndex + itemsPerPage, filteredBienes.length)} de{" "}
            {filteredBienes.length} bienes
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "ghost"}
                    size="sm"
                    className="w-8"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ),
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
