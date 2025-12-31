"use client";

import { useEffect, useState } from "react";
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
import { createAsset, fetchAssets, updateAsset } from "@/lib/api/assets";
import { ApiError } from "@/lib/api/errors";
import { BienFormSchema } from "@/types";

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
];


export default function BienesInmueblesPage() {
  const [tableData, setTableData] = useState<BienesInmueblesTableRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editRow, setEditRow] = useState<BienesInmueblesTableRow | null>(null);
  const [editingRow, setEditingRow] =
    useState<BienesInmueblesTableRow | null>(null);
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

  const mapAssetToRow = (
    asset: Awaited<ReturnType<typeof fetchAssets>>[number]
  ): BienesInmueblesTableRow => {
    const status = asset.inventory_status ?? "active";
    const estado = status === "active" ? "Activo" : "Inactivo";
    const ubicacion =
      asset.location?.name ?? asset.location?.address ?? "";
    const descripcion = asset.description ?? "";
    const clave = asset.rpp_number || asset.c_number || `${asset.id}`;

    return {
      ...EMPTY_FORM_VALUES,
      id: `${asset.id}`,
      clave,
      descripcion: descripcion || asset.operation_type_name || "",
      ubicacion,
      estado,
      fecha: "",
      responsable: "",
      apiId: asset.id,
      rppNumber: asset.rpp_number,
      cNumber: asset.c_number,
      inventoryStatus: asset.inventory_status,
      operationTypeId: asset.operation_type_id,
      operationTypeName: asset.operation_type_name,
      operation: asset.operation_type_name ?? "",
      registroNumero: asset.rpp_number ?? "",
      escriturasNumero: asset.c_number ?? "",
      nombre: asset.description ?? "",
      antecedente: "",
    };
  };

  const toFormValues = (
    row: BienesInmueblesTableRow
  ): BienesInmueblesFormValues => ({
    operation: row.operation || row.operationTypeName || "",
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
  });

  const loadAssets = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const assets = await fetchAssets();
      setTableData(assets.map(mapAssetToRow));
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "No se pudo cargar el listado."
      );
      setTableData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadAssets();
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
      const payload = {
        rpp_number: values.registroNumero.trim(),
        c_number: values.escriturasNumero.trim(),
        inventory_status: inventoryStatus,
        status: inventoryStatus,
        operation_type_id: editingRow?.operationTypeId,
        description: values.nombre.trim() || undefined,
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
      await loadAssets();
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
      const rpp = deleteRow.rppNumber || deleteRow.registroNumero || "";
      const cNumber = deleteRow.cNumber || deleteRow.escriturasNumero || "";

      if (!rpp || !cNumber) {
        throw new Error("Faltan datos para dar de baja el bien.");
      }

      await updateAsset(deleteRow.apiId, {
        rpp_number: rpp,
        c_number: cNumber,
        inventory_status: "baja",
        status: "baja",
        operation_type_id: deleteRow.operationTypeId,
      });
      setSuccessMessage("Bien dado de baja correctamente.");
      await loadAssets();
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
