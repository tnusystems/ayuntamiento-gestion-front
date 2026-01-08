"use client";
import AppCard from "@/components/app-card";
import BienesInmueblesFilters from "@/components/bienes-inmuebles/bienes-inmuebles-filters";
import BienesInmueblesResults from "@/components/bienes-inmuebles/bienes-inmuebles-results";
import BienesInmueblesSectionCard from "@/components/bienes-inmuebles/bienes-inmuebles-section-card";
import BienesInmueblesSummary from "@/components/bienes-inmuebles/bienes-inmuebles-summary";
import AttachDocumentModal from "@/components/bienes-inmuebles/attach-document-modal";
import EditConfirmModal from "@/components/bienes-inmuebles/edit-confirm-modal";
import ReasonModal from "@/components/modals/reason-modal";
import type { BienesInmueblesFormValues } from "@/components/bienes-inmuebles/types";
import {
  useAssetActions,
  useAssetsList,
  useOperationTypes,
} from "@/lib/hooks/bienes-inmuebles";

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

export default function BienesInmueblesPage() {
  const {
    tableData,
    isLoading,
    loadError,
    pagination,
    assetFilters,
    setAssetFilters,
    loadAssets,
  } = useAssetsList(EMPTY_FORM_VALUES);
  const operationTypes = useOperationTypes();
  const {
    form,
    isSaving,
    submitError,
    successMessage,
    editRow,
    editingRow,
    attachRow,
    attachment,
    attachmentName,
    attachmentPosition,
    attachmentMetadata,
    deleteRow,
    deleteReason,
    setEditRow,
    setAttachmentName,
    setAttachmentPosition,
    setAttachmentMetadata,
    setDeleteRow,
    setDeleteReason,
    handleSearch,
    handlePageChange,
    onSubmit,
    handleEditRequest,
    handleConfirmEdit,
    handleCancelEdit,
    handleDelete,
    handleAttachRequest,
    handleCloseAttach,
    handleAttachmentFileChange,
    handleConfirmAttach,
    handleConfirmDelete,
  } = useAssetActions({
    emptyFormValues: EMPTY_FORM_VALUES,
    assetFilters,
    loadAssets,
    setAssetFilters,
  });

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
        name={attachmentName}
        position={attachmentPosition}
        metadata={attachmentMetadata}
        isSubmitting={isSaving}
        onFileChange={handleAttachmentFileChange}
        onNameChange={setAttachmentName}
        onPositionChange={setAttachmentPosition}
        onMetadataChange={setAttachmentMetadata}
        onClose={handleCloseAttach}
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
