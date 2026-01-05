"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import AppCard from "@/components/app-card";
import BienesInmueblesFilters from "@/components/bienes-inmuebles/bienes-inmuebles-filters";
import BienesInmueblesResults from "@/components/bienes-inmuebles/bienes-inmuebles-results";
import BienesInmueblesSectionCard from "@/components/bienes-inmuebles/bienes-inmuebles-section-card";
import BienesInmueblesSummary from "@/components/bienes-inmuebles/bienes-inmuebles-summary";
import AttachDocumentModal from "@/components/bienes-inmuebles/attach-document-modal";
import EditConfirmModal from "@/components/bienes-inmuebles/edit-confirm-modal";
import ReasonModal from "@/components/modals/reason-modal";
import type {
  BienesInmueblesFormValues,
  BienesInmueblesTableRow,
} from "@/components/bienes-inmuebles/types";
import {
  createAsset,
  deleteAsset,
  fetchAssets,
  type AssetListParams,
  updateAsset,
} from "@/lib/api/assets";
import { fetchOperationTypes } from "@/lib/api/operation-types";
import { ApiError } from "@/lib/api/errors";
import { BienFormSchema, type OperationType } from "@/types";

type SectionCardConfig = {
  title: string;
  fields: {
    label: string;
    name: keyof BienesInmueblesFormValues;
    type?: "text" | "date";
  }[];
};

const EMPTY_FORM_VALUES: BienesInmueblesFormValues = {
  operation: "",
  dateFilter: "",
  registroNumero: "",
  registroVolumen: "",
  registroSeccion: "",
  registroFecha: "",
  escriturasNumero: "",
  escriturasNotaria: "",
  escriturasFecha: "",
  boletinNumero: "",
  boletinVolumen: "",
  boletinFecha: "",
  convenioNumero: "",
  convenioVolumen: "",
  convenioFecha: "",
  nombre: "",
  antecedente: "",
  colony: "",
  street: "",
  block: "",
  lot: "",
  totalArea: "",
  builtArea: "",
  cadastralValue: "",
  commercialValue: "",
  latitude: "",
  longitude: "",
};

const SECTION_CARDS: SectionCardConfig[] = [
  {
    title: "Registro Publico de la Propiedad",
    fields: [
      { label: "Numero", name: "registroNumero" },
      { label: "Volumen", name: "registroVolumen" },
      { label: "Seccion", name: "registroSeccion" },
      { label: "Fecha", name: "registroFecha", type: "date" as const },
    ],
  },
  {
    title: "Escrituras",
    fields: [
      { label: "Numero", name: "escriturasNumero" },
      { label: "Notaria", name: "escriturasNotaria" },
      { label: "Fecha", name: "escriturasFecha", type: "date" as const },
    ],
  },
  {
    title: "Boletin Oficial",
    fields: [
      { label: "Numero", name: "boletinNumero" },
      { label: "Volumen", name: "boletinVolumen" },
      { label: "Fecha", name: "boletinFecha", type: "date" as const },
    ],
  },
  {
    title: "Convenio con Fraccionamiento",
    fields: [
      { label: "Numero", name: "convenioNumero" },
      { label: "Volumen", name: "convenioVolumen" },
      { label: "Fecha", name: "convenioFecha", type: "date" as const },
    ],
  },
  {
    title: "Ubicacion",
    fields: [
      { label: "Colonia", name: "colony" },
      { label: "Calle", name: "street" },
      { label: "Manzana", name: "block" },
      { label: "Lote", name: "lot" },
    ],
  },
  {
    title: "Superficie y valores",
    fields: [
      { label: "Superficie total", name: "totalArea" },
      { label: "Superficie construida", name: "builtArea" },
      { label: "Valor catastral", name: "cadastralValue" },
      { label: "Valor comercial", name: "commercialValue" },
    ],
  },
  {
    title: "Coordenadas",
    fields: [
      { label: "Latitud", name: "latitude" },
      { label: "Longitud", name: "longitude" },
    ],
  },
];

const formatDate = (value?: string) => {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleDateString("es-MX");
};

const toOptionalNumber = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export default function BienesInmueblesPage() {
  const [tableData, setTableData] = useState<BienesInmueblesTableRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [operationTypes, setOperationTypes] = useState<OperationType[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    perPage: 10,
  });
  const [assetFilters, setAssetFilters] = useState<AssetListParams>({
    page: 1,
    per_page: 10,
  });
  const [editRow, setEditRow] = useState<BienesInmueblesTableRow | null>(null);
  const [editingRow, setEditingRow] = useState<BienesInmueblesTableRow | null>(
    null
  );
  const [attachRow, setAttachRow] = useState<BienesInmueblesTableRow | null>(
    null
  );
  const [attachment, setAttachment] = useState<File | null>(null);
  const [deleteRow, setDeleteRow] = useState<BienesInmueblesTableRow | null>(
    null
  );
  const [deleteReason, setDeleteReason] = useState("");
  const form = useForm<BienesInmueblesFormValues>({
    defaultValues: EMPTY_FORM_VALUES,
  });

  const parseInventoryStatus = (
    value?: string | null
  ): "active" | "maintenance" | "baja" | undefined => {
    if (!value || value === "NULL") return undefined;
    if (value === "active" || value === "maintenance" || value === "baja")
      return value;
    return undefined;
  };

  const mapAssetToRow = (
    asset: Awaited<ReturnType<typeof fetchAssets>>["data"][number]
  ): BienesInmueblesTableRow => {
    const status =
      asset.inventory_status && asset.inventory_status !== "NULL"
        ? asset.inventory_status
        : "active";
    const estado = status === "active" ? "Activo" : "Inactivo";
    const ubicacion =
      [asset.street, asset.colony].filter(Boolean).join(", ") ||
      asset.location?.name ||
      asset.location?.address ||
      "";
    const descripcionFallback = [
      asset.colony ? `Col. ${asset.colony}` : null,
      asset.block ? `Mz. ${asset.block}` : null,
      asset.lot ? `Lt. ${asset.lot}` : null,
    ]
      .filter(Boolean)
      .join(" · ");
    const descripcion =
      asset.description ||
      descripcionFallback ||
      asset.operation_type_name ||
      "";
    const clave = asset.rpp_number || asset.c_number || `${asset.id}`;

    return {
      ...EMPTY_FORM_VALUES,
      id: `${asset.id}`,
      clave,
      descripcion,
      ubicacion,
      estado,
      fecha: formatDate(asset.created_at),
      responsable: "",
      apiId: asset.id,
      rppNumber: asset.rpp_number ?? undefined,
      cNumber: asset.c_number ?? "",
      inventoryStatus: parseInventoryStatus(asset.inventory_status),
      operationTypeId: asset.operation_type_id,
      operationTypeName: asset.operation_type_name,
      operation: asset.operation_type_id ? String(asset.operation_type_id) : "",
      registroNumero: asset.rpp_number ?? "",
      escriturasNumero: asset.c_number ?? "",
      nombre: asset.description ?? asset.colony ?? "",
      antecedente: "",
      colony: asset.colony ?? "",
      street: asset.street ?? "",
      block: asset.block ?? "",
      lot: asset.lot ?? "",
      totalArea:
        asset.total_area !== null && asset.total_area !== undefined
          ? String(asset.total_area)
          : "",
      builtArea:
        asset.built_area !== null && asset.built_area !== undefined
          ? String(asset.built_area)
          : "",
      cadastralValue:
        asset.cadastral_value !== null && asset.cadastral_value !== undefined
          ? String(asset.cadastral_value)
          : "",
      commercialValue:
        asset.commercial_value !== null && asset.commercial_value !== undefined
          ? String(asset.commercial_value)
          : "",
      latitude:
        asset.latitude !== null && asset.latitude !== undefined
          ? String(asset.latitude)
          : "",
      longitude:
        asset.longitude !== null && asset.longitude !== undefined
          ? String(asset.longitude)
          : "",
    };
  };

  const toFormValues = (
    row: BienesInmueblesTableRow
  ): BienesInmueblesFormValues => ({
    operation:
      row.operationTypeId !== undefined
        ? String(row.operationTypeId)
        : row.operation || "",
    dateFilter: row.dateFilter,
    registroNumero: row.registroNumero || row.rppNumber || "",
    registroVolumen: row.registroVolumen,
    registroSeccion: row.registroSeccion,
    registroFecha: row.registroFecha,
    escriturasNumero: row.escriturasNumero || row.cNumber || "",
    escriturasNotaria: row.escriturasNotaria,
    escriturasFecha: row.escriturasFecha,
    boletinNumero: row.boletinNumero,
    boletinVolumen: row.boletinVolumen,
    boletinFecha: row.boletinFecha,
    convenioNumero: row.convenioNumero,
    convenioVolumen: row.convenioVolumen,
    convenioFecha: row.convenioFecha,
    nombre: row.nombre || row.descripcion,
    antecedente: row.antecedente,
    colony: row.colony,
    street: row.street,
    block: row.block,
    lot: row.lot,
    totalArea: row.totalArea,
    builtArea: row.builtArea,
    cadastralValue: row.cadastralValue,
    commercialValue: row.commercialValue,
    latitude: row.latitude,
    longitude: row.longitude,
  });

  const loadAssets = async (params: AssetListParams) => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const response = await fetchAssets(params);
      setTableData(response.data.map(mapAssetToRow));
      setPagination({
        currentPage: response.pagination?.current_page ?? params.page ?? 1,
        totalPages: Math.max(1, response.pagination?.total_pages ?? 1),
        totalCount: response.pagination?.total_count ?? response.data.length,
        perPage: response.pagination?.per_page ?? params.per_page ?? 10,
      });
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "No se pudo cargar el listado."
      );
      setTableData([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        perPage: params.per_page ?? 10,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadAssets(assetFilters);
  }, [assetFilters]);

  useEffect(() => {
    let isMounted = true;
    const loadOperationTypes = async () => {
      try {
        const data = await fetchOperationTypes();
        if (isMounted) {
          setOperationTypes(data);
        }
      } catch {
        if (isMounted) {
          setOperationTypes([]);
        }
      }
    };
    void loadOperationTypes();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearch = useCallback(
    (query: string) => {
      const operationTypeId = toOptionalNumber(form.getValues("operation"));
      setAssetFilters((prev) => ({
        ...prev,
        page: 1,
        q: query || undefined,
        operation_type_id: operationTypeId,
      }));
    },
    [form]
  );

  const handlePageChange = useCallback((nextPage: number) => {
    setAssetFilters((prev) => ({
      ...prev,
      page: nextPage,
    }));
  }, []);

  const onSubmit = async (values: BienesInmueblesFormValues) => {
    form.clearErrors();
    setSubmitError(null);
    setSuccessMessage(null);

    const parsed = BienFormSchema.safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (field) {
          form.setError(field as keyof BienesInmueblesFormValues, {
            type: "manual",
            message: issue.message,
          });
        }
      }
      return;
    }

    setIsSaving(true);
    try {
      const inventoryStatus = editingRow?.inventoryStatus ?? "active";
      const operationTypeId = toOptionalNumber(values.operation);
      const payload = {
        rpp_number: values.registroNumero.trim(),
        c_number: values.escriturasNumero.trim(),
        inventory_status: inventoryStatus,
        status: inventoryStatus,
        operation_type_id: operationTypeId,
        description: values.nombre.trim() || undefined,
        colony: values.colony.trim() || undefined,
        street: values.street.trim() || undefined,
        block: values.block.trim() || undefined,
        lot: values.lot.trim() || undefined,
        total_area: values.totalArea.trim() || undefined,
        built_area: values.builtArea.trim() || undefined,
        cadastral_value: values.cadastralValue.trim() || undefined,
        commercial_value: values.commercialValue.trim() || undefined,
        latitude: toOptionalNumber(values.latitude),
        longitude: toOptionalNumber(values.longitude),
      };

      if (editingRow?.apiId) {
        await updateAsset(editingRow.apiId, payload);
        setSuccessMessage("Bien actualizado correctamente.");
      } else {
        await createAsset(payload);
        setSuccessMessage("Bien creado correctamente.");
      }

      setEditingRow(null);
      form.reset(EMPTY_FORM_VALUES);
      await loadAssets(assetFilters);
    } catch (error) {
      if (error instanceof ApiError) {
        setSubmitError(error.message);
      } else if (error instanceof Error) {
        setSubmitError(error.message);
      } else {
        setSubmitError("No se pudo guardar el bien.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditRequest = (row: BienesInmueblesTableRow) => {
    setEditRow(row);
  };

  const handleConfirmEdit = () => {
    if (editRow) {
      form.reset(toFormValues(editRow));
      setEditingRow(editRow);
      setSuccessMessage(null);
      setSubmitError(null);
    }
    setEditRow(null);
  };

  const handleCancelEdit = () => {
    setEditingRow(null);
    setSuccessMessage(null);
    setSubmitError(null);
    form.reset(EMPTY_FORM_VALUES);
  };

  const handleDelete = (row: BienesInmueblesTableRow) => {
    setDeleteReason("");
    setDeleteRow(row);
  };

  const handleAttachRequest = (row: BienesInmueblesTableRow) => {
    setAttachment(null);
    setAttachRow(row);
  };

  const handleConfirmAttach = () => {
    setAttachRow(null);
    setAttachment(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteRow?.apiId) {
      setDeleteRow(null);
      setDeleteReason("");
      return;
    }

    setIsSaving(true);
    setSubmitError(null);
    setSuccessMessage(null);

    try {
      await deleteAsset(deleteRow.apiId);
      setSuccessMessage("Bien dado de baja correctamente.");
      await loadAssets(assetFilters);
    } catch (error) {
      if (error instanceof ApiError) {
        setSubmitError(error.message);
      } else if (error instanceof Error) {
        setSubmitError(error.message);
      } else {
        setSubmitError("No se pudo dar de baja el bien.");
      }
    } finally {
      setIsSaving(false);
      setDeleteRow(null);
      setDeleteReason("");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <AppCard
        title="Bienes Inmuebles"
        description="Gestion de bienes inmuebles conforme a los lineamientos del sistema."
      >
        {loadError ? (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {loadError}
          </div>
        ) : null}
        {submitError ? (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {submitError}
          </div>
        ) : null}
        {successMessage ? (
          <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {successMessage}
          </div>
        ) : null}
        <form
          id="bienes-inmuebles-form"
          className="space-y-6"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <BienesInmueblesFilters
            register={form.register}
            errors={form.formState.errors}
            operationOptions={operationTypes}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {SECTION_CARDS.map((card) => (
              <BienesInmueblesSectionCard
                key={card.title}
                title={card.title}
                fields={card.fields}
                register={form.register}
                errors={form.formState.errors}
              />
            ))}
          </div>

          <BienesInmueblesSummary
            register={form.register}
            errors={form.formState.errors}
            isSubmitting={isSaving}
            submitLabel={editingRow ? "Actualizar" : "Guardar"}
            showCancel={!!editingRow}
            onCancel={handleCancelEdit}
          />
        </form>
      </AppCard>

      <BienesInmueblesResults
        data={tableData}
        isLoading={isLoading}
        onEdit={handleEditRequest}
        onDelete={handleDelete}
        onAttach={handleAttachRequest}
        onSearch={handleSearch}
        page={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalCount={pagination.totalCount}
        onPageChange={handlePageChange}
      />

      <EditConfirmModal
        open={!!editRow}
        row={editRow}
        onClose={() => setEditRow(null)}
        onConfirm={handleConfirmEdit}
      />

      <AttachDocumentModal
        open={!!attachRow}
        row={attachRow}
        file={attachment}
        onFileChange={setAttachment}
        onClose={() => setAttachRow(null)}
        onConfirm={handleConfirmAttach}
      />

      <ReasonModal
        open={!!deleteRow}
        title="Motivo de baja"
        description="Indica el motivo para dar de baja este bien."
        label="Motivo de baja"
        value={deleteReason}
        onChange={setDeleteReason}
        onClose={() => {
          setDeleteRow(null);
          setDeleteReason("");
        }}
        onConfirm={handleConfirmDelete}
        confirmText="Dar de baja"
      />
    </div>
  );
}
