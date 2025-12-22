"use client";

import type React from "react";

import { useMemo, useState } from "react";

import Modal from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const INITIAL_FILES = [
  {
    id: "1",
    nombre: "documento-fiscal-2024.pdf",
    tipo: "PDF",
    fecha: "15/01/2024",
    tamano: "2.4 MB",
    usuario: "Juan Pérez",
    departamento: "Contabilidad",
  },
  {
    id: "2",
    nombre: "inventario-enero.xlsx",
    tipo: "Excel",
    fecha: "14/01/2024",
    tamano: "1.8 MB",
    usuario: "María García",
    departamento: "Almacén",
  },
  {
    id: "3",
    nombre: "reporte-ventas-q1.docx",
    tipo: "Word",
    fecha: "13/01/2024",
    tamano: "856 KB",
    usuario: "Carlos López",
    departamento: "Ventas",
  },
  {
    id: "4",
    nombre: "presentacion-corporativa.pptx",
    tipo: "PowerPoint",
    fecha: "12/01/2024",
    tamano: "5.2 MB",
    usuario: "Ana Martínez",
    departamento: "Marketing",
  },
  {
    id: "5",
    nombre: "base-datos-clientes.csv",
    tipo: "CSV",
    fecha: "11/01/2024",
    tamano: "3.1 MB",
    usuario: "Roberto Sánchez",
    departamento: "IT",
  },
  {
    id: "6",
    nombre: "contrato-proveedor-001.pdf",
    tipo: "PDF",
    fecha: "10/01/2024",
    tamano: "1.2 MB",
    usuario: "Laura Gómez",
    departamento: "Legal",
  },
  {
    id: "7",
    nombre: "factura-diciembre-2023.pdf",
    tipo: "PDF",
    fecha: "09/01/2024",
    tamano: "450 KB",
    usuario: "Pedro Ramírez",
    departamento: "Contabilidad",
  },
  {
    id: "8",
    nombre: "nomina-enero-2024.xlsx",
    tipo: "Excel",
    fecha: "08/01/2024",
    tamano: "2.1 MB",
    usuario: "Carmen Silva",
    departamento: "Recursos Humanos",
  },
];

const BIENES = [
  {
    id: "BI-001",
    nombre: "Terreno urbano",
    rpp: "RPP-124-2024",
    claveCatastral: "HMO-001-0001",
    ubicacion: "Centro",
  },
  {
    id: "BI-002",
    nombre: "Casa habitacion",
    rpp: "RPP-215-2024",
    claveCatastral: "HMO-002-0105",
    ubicacion: "Colonia Norte",
  },
  {
    id: "BI-003",
    nombre: "Local comercial",
    rpp: "RPP-318-2024",
    claveCatastral: "HMO-003-0042",
    ubicacion: "Zona Industrial",
  },
  {
    id: "BI-004",
    nombre: "Predio rural",
    rpp: "RPP-402-2024",
    claveCatastral: "HMO-004-0201",
    ubicacion: "Ejido Norte",
  },
  {
    id: "BI-005",
    nombre: "Bodega municipal",
    rpp: "RPP-512-2024",
    claveCatastral: "HMO-005-0088",
    ubicacion: "Parque Sur",
  },
];

export default function ArchivosPage() {
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isAttachOpen, setIsAttachOpen] = useState(false);
  const [attachFile, setAttachFile] = useState<File | null>(null);
  const [bienQuery, setBienQuery] = useState("");
  const [selectedBienId, setSelectedBienId] = useState<string | null>(null);

  const filteredFiles = INITIAL_FILES.filter((file) =>
    file.nombre.toLowerCase().includes(search.toLowerCase())
  );

  const filteredBienes = useMemo(() => {
    const normalized = bienQuery.trim().toLowerCase();
    if (!normalized) {
      return BIENES;
    }
    return BIENES.filter((bien) =>
      `${bien.rpp} ${bien.claveCatastral} ${bien.nombre}`
        .toLowerCase()
        .includes(normalized)
    );
  }, [bienQuery]);

  const selectedBien = selectedBienId
    ? BIENES.find((bien) => bien.id === selectedBienId) ?? null
    : null;

  const handleOpenAttach = () => {
    setAttachFile(null);
    setBienQuery("");
    setSelectedBienId(null);
    setIsAttachOpen(true);
  };

  const handleCloseAttach = () => {
    setIsAttachOpen(false);
    setAttachFile(null);
    setBienQuery("");
    setSelectedBienId(null);
  };

  const handleConfirmAttach = () => {
    if (!attachFile || !selectedBien) {
      return;
    }
    alert(
      `Archivo: ${attachFile.name}\nAsignado a: ${selectedBien.nombre} (${selectedBien.id})`
    );
    handleCloseAttach();
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (value.trim()) {
      const matches = INITIAL_FILES.filter((file) =>
        file.nombre.toLowerCase().includes(value.toLowerCase())
      ).map((file) => file.nombre);
      setSuggestions(matches);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setSearch(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Title */}
        

        {/* Action Cards */}
        <section className="bg-white border border-neutral-200 rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ActionCard
              title="Adjuntar Archivo"
              description="Sube un nuevo archivo desde tu equipo local"
              icon={<UploadIcon />}
              onClick={handleOpenAttach}
            />
            <ActionCard
              title="Escanear Documento"
              description="Digitaliza documentos físicos usando tu impresora"
              icon={<PrinterIcon />}
              onClick={() => alert("Escanear desde impresora")}
            />
            <ActionCard
              title="Captura Móvil"
              description="Escanea documentos con la cámara de tu dispositivo"
              icon={<MobileIcon />}
              onClick={() => alert("Escanear desde móvil")}
            />
          </div>
        </section>

        {/* Table Section */}
        <section className="bg-white border border-neutral-200 rounded-xl p-4 md:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-lg font-semibold text-neutral-900">
              Archivos subidos recientemente
            </h2>

            {/* Search with Autocomplete */}
            <div className="relative w-full sm:w-80">
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onBlur={() =>
                    setTimeout(() => setShowSuggestions(false), 200)
                  }
                  onFocus={() =>
                    search &&
                    setSuggestions(
                      INITIAL_FILES.filter((file) =>
                        file.nombre.toLowerCase().includes(search.toLowerCase())
                      ).map((file) => file.nombre)
                    )
                  }
                  placeholder="Buscar archivos por nombre..."
                  className="w-full rounded-lg border border-neutral-300 pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:border-transparent"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                  <SearchIcon />
                </div>
              </div>

              {/* Autocomplete Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectSuggestion(suggestion)}
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-neutral-50 transition-colors border-b border-neutral-100 last:border-b-0"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Responsive Table */}
          <div className="overflow-x-auto -mx-4 md:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider hidden sm:table-cell">
                      Fecha
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider hidden md:table-cell">
                      Tamaño
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider hidden lg:table-cell">
                      Usuario
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider hidden xl:table-cell">
                      Departamento
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-100">
                  {filteredFiles.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-8 text-center text-sm text-neutral-500"
                      >
                        No se encontraron archivos que coincidan con tu búsqueda
                      </td>
                    </tr>
                  ) : (
                    filteredFiles.map((file) => (
                      <tr
                        key={file.id}
                        className="hover:bg-neutral-50 transition-colors"
                      >
                        <td className="px-4 py-4 text-sm text-neutral-900 font-medium max-w-xs truncate">
                          {file.nombre}
                        </td>
                        <td className="px-4 py-4 text-sm text-neutral-600">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800">
                            {file.tipo}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-neutral-600 hidden sm:table-cell">
                          {file.fecha}
                        </td>
                        <td className="px-4 py-4 text-sm text-neutral-600 hidden md:table-cell">
                          {file.tamano}
                        </td>
                        <td className="px-4 py-4 text-sm text-neutral-600 hidden lg:table-cell">
                          {file.usuario}
                        </td>
                        <td className="px-4 py-4 text-sm text-neutral-600 hidden xl:table-cell">
                          {file.departamento}
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => alert(`Editando: ${file.nombre}`)}
                              className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                              aria-label="Editar"
                              title="Editar archivo"
                            >
                              <EditIcon />
                            </button>
                            <button
                              onClick={() => {
                                if (
                                  confirm(`¿Deseas eliminar ${file.nombre}?`)
                                ) {
                                  alert("Archivo eliminado");
                                }
                              }}
                              className="p-2 rounded-lg hover:bg-red-50 transition-colors text-red-600"
                              aria-label="Eliminar"
                              title="Eliminar archivo"
                            >
                              <DeleteIcon />
                            </button>
                            <button
                              onClick={() =>
                                alert(`Estado cambiado para: ${file.nombre}`)
                              }
                              className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                              aria-label="Cambiar estado"
                              title="Activar/Desactivar"
                            >
                              <ToggleIcon />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* View More Button */}
          <div className="flex justify-center pt-4">
            <button
              onClick={() => alert("Ver todos los archivos")}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg transition-colors"
            >
              Ver todos los archivos
              <ChevronDownIcon />
            </button>
          </div>
        </section>
      </div>

      <Modal
        open={isAttachOpen}
        title="Adjuntar archivo"
        description="Selecciona un archivo y el bien inmueble al que se asignara."
        onClose={handleCloseAttach}
        footer={
          <>
            <Button type="button" variant="secondary" onClick={handleCloseAttach}>
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleConfirmAttach}
              disabled={!attachFile || !selectedBien}
            >
              Adjuntar
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="archivo-adjunto">Archivo</Label>
            <Input
              id="archivo-adjunto"
              type="file"
              onChange={(event) =>
                setAttachFile(event.target.files?.[0] ?? null)
              }
            />
            {attachFile ? (
              <p className="text-xs text-muted-foreground">
                Archivo seleccionado: {attachFile.name}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bien-search">
              Buscar bien por RPP o clave catastral
            </Label>
            <Input
              id="bien-search"
              placeholder="Ej. RPP-124-2024 o HMO-001-0001"
              value={bienQuery}
              onChange={(event) => setBienQuery(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">
              Bienes encontrados
            </div>
            <div className="max-h-48 overflow-y-auto rounded-lg border border-border/60">
              {filteredBienes.length === 0 ? (
                <div className="px-4 py-3 text-sm text-muted-foreground">
                  Sin resultados.
                </div>
              ) : (
                filteredBienes.map((bien) => (
                  <button
                    key={bien.id}
                    type="button"
                    onClick={() => setSelectedBienId(bien.id)}
                    className={`w-full text-left px-4 py-3 border-b border-border/60 last:border-b-0 transition-colors ${
                      selectedBienId === bien.id
                        ? "bg-neutral-100"
                        : "hover:bg-neutral-50"
                    }`}
                  >
                    <div className="text-sm font-medium text-neutral-900">
                      {bien.nombre}
                    </div>
                    <div className="text-xs text-neutral-500">
                      RPP: {bien.rpp} · Clave: {bien.claveCatastral}
                    </div>
                    <div className="text-xs text-neutral-500">
                      {bien.ubicacion}
                    </div>
                  </button>
                ))
              )}
            </div>
            {selectedBien ? (
              <div className="text-xs text-neutral-600">
                Seleccionado: {selectedBien.nombre} ({selectedBien.id})
              </div>
            ) : null}
          </div>
        </div>
      </Modal>
    </div>
  );
}

type ActionCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
};

function ActionCard({ title, description, icon, onClick }: ActionCardProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 hover:border-neutral-300 transition-all p-6 text-center group"
    >
      <div className="text-neutral-600 group-hover:text-neutral-900 transition-colors">
        {icon}
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
        <p className="text-xs text-neutral-500 leading-relaxed">
          {description}
        </p>
      </div>
    </button>
  );
}

function UploadIcon() {
  return (
    <svg
      className="w-12 h-12"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
      />
    </svg>
  );
}

function PrinterIcon() {
  return (
    <svg
      className="w-12 h-12"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z"
      />
    </svg>
  );
}

function MobileIcon() {
  return (
    <svg
      className="w-12 h-12"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
      />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
      />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
      />
    </svg>
  );
}

function ToggleIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5.636 5.636a9 9 0 1012.728 0M12 3v9"
      />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
      />
    </svg>
  );
}
