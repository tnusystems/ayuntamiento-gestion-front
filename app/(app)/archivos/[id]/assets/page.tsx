"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import AppCard from "@/components/app-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  fetchAssetDocument,
  fetchAssetDocuments,
} from "@/lib/api/files/fileByAsset";
import { getApiBaseUrl } from "@/lib/api/baseUrl";
import type { ArchivoApi } from "@/types";

const formatBytes = (bytes?: number | null) => {
  if (!bytes || !Number.isFinite(bytes)) {
    return "-";
  }
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${
    units[unitIndex]
  }`;
};

const getDocumentType = (document: ArchivoApi) =>
  document.document_type?.name || document.file?.content_type || "Sin tipo";

const apiBaseUrl = getApiBaseUrl().replace(/\/$/, "");

const withApiBase = (path?: string | null) => {
  if (!path) {
    return "";
  }
  const value = path.trim();
  if (!value) {
    return "";
  }
  if (!apiBaseUrl) {
    return value;
  }
  if (/^https?:\/\//i.test(value)) {
    try {
      const parsed = new URL(value);
      const relativePath = `${parsed.pathname}${parsed.search}${parsed.hash}`;
      return `${apiBaseUrl}${relativePath.startsWith("/") ? "" : "/"}${relativePath}`;
    } catch {
      return value;
    }
  }
  return `${apiBaseUrl}${value.startsWith("/") ? "" : "/"}${value}`;
};

const getDocumentUrl = (document: ArchivoApi, mode: "view" | "download") => {
  const viewUrl = withApiBase(document.file?.url);
  const downloadUrl = withApiBase(document.file?.download_url);
  if (mode === "download") {
    return downloadUrl || viewUrl;
  }
  return viewUrl || downloadUrl;
};

export default function FileByAssetsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const assetId = Number(params.id);
  const [documents, setDocuments] = useState<ArchivoApi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [activeDocumentId, setActiveDocumentId] = useState<number | null>(null);

  const loadDocuments = useCallback(async () => {
    if (!Number.isFinite(assetId)) {
      setLoadError("Id de bien invalido.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await fetchAssetDocuments(assetId);
      setDocuments(data);
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los documentos."
      );
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  }, [assetId]);

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  const filteredDocuments = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return documents;
    }
    return documents.filter((document) => {
      const name = document.name?.toLowerCase() ?? "";
      const type = getDocumentType(document).toLowerCase();
      return name.includes(normalized) || type.includes(normalized);
    });
  }, [documents, query]);

  const handleOpenDocument = useCallback(
    async (documentId: number, mode: "view" | "download") => {
      if (!Number.isFinite(assetId)) {
        setLoadError("Id de bien invalido.");
        return;
      }
      setActiveDocumentId(documentId);
      setLoadError(null);
      try {
        const document = await fetchAssetDocument(assetId, documentId);
        const url = getDocumentUrl(document, mode);
        if (!url) {
          setLoadError("No hay url disponible para este documento.");
          return;
        }
        window.open(url, "_blank", "noopener,noreferrer");
      } catch (error) {
        setLoadError(
          error instanceof Error
            ? error.message
            : "No se pudo abrir el documento."
        );
      } finally {
        setActiveDocumentId(null);
      }
    },
    [assetId]
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <AppCard
        title={`Documentos del bien ${Number.isFinite(assetId) ? assetId : ""}`}
        description="Archivos asociados al bien inmueble seleccionado."
        headerAction={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Volver
            </Button>
            <Button type="button" onClick={loadDocuments} disabled={isLoading}>
              Actualizar
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {loadError ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {loadError}
            </div>
          ) : null}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <Input
              placeholder="Buscar por nombre o tipo..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              disabled={isLoading}
            />
            <div className="text-sm text-muted-foreground">
              {filteredDocuments.length} de {documents.length} documentos
            </div>
          </div>
          <div className="overflow-x-auto rounded-lg border border-border/60">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Documento
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Posicion
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Tamano
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Formato
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-6 text-center text-sm text-muted-foreground"
                    >
                      Cargando documentos...
                    </td>
                  </tr>
                ) : filteredDocuments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-6 text-center text-sm text-muted-foreground"
                    >
                      Sin documentos para este bien.
                    </td>
                  </tr>
                ) : (
                  filteredDocuments.map((document) => {
                    return (
                      <tr key={document.id}>
                        <td className="px-4 py-3 text-sm text-foreground font-medium">
                          {document.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {getDocumentType(document)}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {document.position ?? "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {formatBytes(document.file?.byte_size)}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {document.file?.content_type ?? "-"}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={activeDocumentId === document.id}
                              onClick={() =>
                                handleOpenDocument(document.id, "view")
                              }
                            >
                              Ver
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              disabled={activeDocumentId === document.id}
                              onClick={() =>
                                handleOpenDocument(document.id, "download")
                              }
                            >
                              Descargar
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </AppCard>
    </div>
  );
}
