// components/bienes/bienes-table/bienes-table-filters.tsx
"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BienesTableFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  estatusFilter: string;
  setEstatusFilter: (value: string) => void;
  tipoFilter: string;
  setTipoFilter: (value: string) => void;
  categoriaFilter: string;
  setCategoriaFilter: (value: string) => void;
  categorias: string[];
}

export default function BienesTableFilters({
  searchTerm,
  setSearchTerm,
  estatusFilter,
  setEstatusFilter,
  tipoFilter,
  setTipoFilter,
  categoriaFilter,
  setCategoriaFilter,
  categorias,
}: BienesTableFiltersProps) {
  return (
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
        <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas las categorías</SelectItem>
            {categorias.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
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
  );
}
