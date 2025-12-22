"use client";

import { useState } from "react";
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

const buildRow = (
  id: string,
  overrides: Partial<BienesInmueblesTableRow>
): BienesInmueblesTableRow => ({
  ...EMPTY_FORM_VALUES,
  id,
  clave: "",
  descripcion: "",
  ubicacion: "",
  estado: "Activo",
  fecha: "",
  responsable: "",
  ...overrides,
});

const TABLE_DATA: BienesInmueblesTableRow[] = [
  buildRow("1", {
    clave: "BI-001",
    descripcion: "Terreno urbano",
    ubicacion: "Centro",
    fecha: "12/01/2024",
    responsable: "Juan Perez",
    operation: "Compra",
    nombre: "Terreno urbano",
    antecedente: "BI-001",
    registroNumero: "124",
    registroVolumen: "II",
    registroSeccion: "Centro",
    registroFecha: "12/01/2024",
    escriturasNumero: "56",
    escriturasNotaria: "Juan Perez",
    escriturasFecha: "10/01/2024",
    boletinNumero: "33",
    boletinVolumen: "A",
    boletinFecha: "11/01/2024",
    convenioNumero: "12",
    convenioVolumen: "III",
    convenioFecha: "12/01/2024",
  }),
  buildRow("2", {
    clave: "BI-002",
    descripcion: "Casa habitacion",
    ubicacion: "Colonia Norte",
    fecha: "15/01/2024",
    responsable: "Ana Lopez",
    operation: "Adjudicacion",
    nombre: "Casa habitacion",
    antecedente: "BI-002",
    registroNumero: "215",
    registroVolumen: "I",
    registroSeccion: "Colonia Norte",
    registroFecha: "15/01/2024",
    escriturasNumero: "89",
    escriturasNotaria: "Ana Lopez",
    escriturasFecha: "14/01/2024",
    boletinNumero: "40",
    boletinVolumen: "B",
    boletinFecha: "14/01/2024",
    convenioNumero: "7",
    convenioVolumen: "II",
    convenioFecha: "13/01/2024",
  }),
  buildRow("3", {
    clave: "BI-003",
    descripcion: "Local comercial",
    ubicacion: "Zona Industrial",
    estado: "Inactivo",
    fecha: "18/01/2024",
    responsable: "Carlos Medina",
    operation: "Arrendamiento",
    nombre: "Local comercial",
    antecedente: "BI-003",
    registroNumero: "318",
    registroVolumen: "III",
    registroSeccion: "Zona Industrial",
    registroFecha: "18/01/2024",
    escriturasNumero: "102",
    escriturasNotaria: "Carlos Medina",
    escriturasFecha: "17/01/2024",
    boletinNumero: "45",
    boletinVolumen: "C",
    boletinFecha: "17/01/2024",
    convenioNumero: "21",
    convenioVolumen: "I",
    convenioFecha: "16/01/2024",
  }),
  buildRow("4", {
    clave: "BI-004",
    descripcion: "Predio rural",
    ubicacion: "Ejido Norte",
    fecha: "22/01/2024",
    responsable: "Maria Ruiz",
    operation: "Comodato",
    nombre: "Predio rural",
    antecedente: "BI-004",
    registroNumero: "402",
    registroVolumen: "IV",
    registroSeccion: "Ejido Norte",
    registroFecha: "22/01/2024",
    escriturasNumero: "130",
    escriturasNotaria: "Maria Ruiz",
    escriturasFecha: "20/01/2024",
    boletinNumero: "50",
    boletinVolumen: "A",
    boletinFecha: "21/01/2024",
    convenioNumero: "9",
    convenioVolumen: "III",
    convenioFecha: "21/01/2024",
  }),
  buildRow("5", {
    clave: "BI-005",
    descripcion: "Bodega municipal",
    ubicacion: "Parque Sur",
    fecha: "02/02/2024",
    responsable: "Rafael Diaz",
    operation: "Concesion",
    nombre: "Bodega municipal",
    antecedente: "BI-005",
    registroNumero: "512",
    registroVolumen: "I",
    registroSeccion: "Parque Sur",
    registroFecha: "02/02/2024",
    escriturasNumero: "145",
    escriturasNotaria: "Rafael Diaz",
    escriturasFecha: "01/02/2024",
    boletinNumero: "62",
    boletinVolumen: "B",
    boletinFecha: "01/02/2024",
    convenioNumero: "18",
    convenioVolumen: "II",
    convenioFecha: "01/02/2024",
  }),
  buildRow("6", {
    clave: "BI-006",
    descripcion: "Oficinas administrativas",
    ubicacion: "Centro",
    estado: "Inactivo",
    fecha: "05/02/2024",
    responsable: "Laura Vega",
    operation: "Dacion",
    nombre: "Oficinas administrativas",
    antecedente: "BI-006",
    registroNumero: "602",
    registroVolumen: "V",
    registroSeccion: "Centro",
    registroFecha: "05/02/2024",
    escriturasNumero: "161",
    escriturasNotaria: "Laura Vega",
    escriturasFecha: "04/02/2024",
    boletinNumero: "70",
    boletinVolumen: "C",
    boletinFecha: "04/02/2024",
    convenioNumero: "25",
    convenioVolumen: "IV",
    convenioFecha: "04/02/2024",
  }),
  buildRow("7", {
    clave: "BI-007",
    descripcion: "Terreno baldia",
    ubicacion: "Colonia Sur",
    fecha: "07/02/2024",
    responsable: "Hector Ramos",
    operation: "Fraccionamiento",
    nombre: "Terreno baldia",
    antecedente: "BI-007",
    registroNumero: "701",
    registroVolumen: "II",
    registroSeccion: "Colonia Sur",
    registroFecha: "07/02/2024",
    escriturasNumero: "172",
    escriturasNotaria: "Hector Ramos",
    escriturasFecha: "06/02/2024",
    boletinNumero: "75",
    boletinVolumen: "A",
    boletinFecha: "06/02/2024",
    convenioNumero: "13",
    convenioVolumen: "I",
    convenioFecha: "06/02/2024",
  }),
  buildRow("8", {
    clave: "BI-008",
    descripcion: "Parque publico",
    ubicacion: "Las Palmas",
    fecha: "10/02/2024",
    responsable: "Sofia Luna",
    operation: "Permuta",
    nombre: "Parque publico",
    antecedente: "BI-008",
    registroNumero: "805",
    registroVolumen: "III",
    registroSeccion: "Las Palmas",
    registroFecha: "10/02/2024",
    escriturasNumero: "183",
    escriturasNotaria: "Sofia Luna",
    escriturasFecha: "09/02/2024",
    boletinNumero: "82",
    boletinVolumen: "B",
    boletinFecha: "09/02/2024",
    convenioNumero: "17",
    convenioVolumen: "II",
    convenioFecha: "09/02/2024",
  }),
  buildRow("9", {
    clave: "BI-009",
    descripcion: "Almacen general",
    ubicacion: "Zona Norte",
    estado: "Inactivo",
    fecha: "12/02/2024",
    responsable: "Diego Torres",
    operation: "Regularizacion",
    nombre: "Almacen general",
    antecedente: "BI-009",
    registroNumero: "914",
    registroVolumen: "IV",
    registroSeccion: "Zona Norte",
    registroFecha: "12/02/2024",
    escriturasNumero: "194",
    escriturasNotaria: "Diego Torres",
    escriturasFecha: "11/02/2024",
    boletinNumero: "90",
    boletinVolumen: "C",
    boletinFecha: "11/02/2024",
    convenioNumero: "22",
    convenioVolumen: "III",
    convenioFecha: "11/02/2024",
  }),
  buildRow("10", {
    clave: "BI-010",
    descripcion: "Centro comunitario",
    ubicacion: "Colonia Oeste",
    fecha: "15/02/2024",
    responsable: "Paula Mendez",
    operation: "Venta",
    nombre: "Centro comunitario",
    antecedente: "BI-010",
    registroNumero: "1001",
    registroVolumen: "V",
    registroSeccion: "Colonia Oeste",
    registroFecha: "15/02/2024",
    escriturasNumero: "205",
    escriturasNotaria: "Paula Mendez",
    escriturasFecha: "14/02/2024",
    boletinNumero: "95",
    boletinVolumen: "A",
    boletinFecha: "14/02/2024",
    convenioNumero: "30",
    convenioVolumen: "IV",
    convenioFecha: "14/02/2024",
  }),
];

export default function BienesInmueblesPage() {
  const [tableData, setTableData] = useState(TABLE_DATA);
  const [editRow, setEditRow] = useState<BienesInmueblesTableRow | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [attachRow, setAttachRow] = useState<BienesInmueblesTableRow | null>(null);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [deleteRow, setDeleteRow] = useState<BienesInmueblesTableRow | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const form = useForm<BienesInmueblesFormValues>({
    defaultValues: EMPTY_FORM_VALUES,
  });

  const formatDate = (date: Date) => {
    const day = `${date.getDate()}`.padStart(2, "0");
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    return `${day}/${month}/${date.getFullYear()}`;
  };

  const toFormValues = (
    row: BienesInmueblesTableRow
  ): BienesInmueblesFormValues => ({
    operation: row.operation,
    dateFilter: row.dateFilter,
    registroNumero: row.registroNumero,
    registroVolumen: row.registroVolumen,
    registroSeccion: row.registroSeccion,
    registroFecha: row.registroFecha,
    escriturasNumero: row.escriturasNumero,
    escriturasNotaria: row.escriturasNotaria,
    escriturasFecha: row.escriturasFecha,
    boletinNumero: row.boletinNumero,
    boletinVolumen: row.boletinVolumen,
    boletinFecha: row.boletinFecha,
    convenioNumero: row.convenioNumero,
    convenioVolumen: row.convenioVolumen,
    convenioFecha: row.convenioFecha,
    nombre: row.nombre,
    antecedente: row.antecedente,
  });

  const buildRowFromForm = (
    values: BienesInmueblesFormValues,
    options?: {
      base?: BienesInmueblesTableRow;
      id?: string;
      fallbackClave?: string;
      fallbackFecha?: string;
    }
  ): BienesInmueblesTableRow => ({
    ...(options?.base ?? EMPTY_FORM_VALUES),
    ...values,
    id: options?.id ?? options?.base?.id ?? "",
    estado: options?.base?.estado ?? "Activo",
    clave:
      values.antecedente ||
      options?.base?.clave ||
      options?.fallbackClave ||
      "BI-000",
    descripcion:
      values.nombre || options?.base?.descripcion || "Nuevo bien inmueble",
    ubicacion:
      values.registroSeccion || options?.base?.ubicacion || "Sin ubicacion",
    fecha:
      values.registroFecha ||
      options?.base?.fecha ||
      options?.fallbackFecha ||
      "",
    responsable:
      values.escriturasNotaria ||
      options?.base?.responsable ||
      "Sin responsable",
  });

  const onSubmit = (values: BienesInmueblesFormValues) => {
    if (editingId) {
      setTableData((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? buildRowFromForm(values, { base: item })
            : item
        )
      );
    } else {
      const now = new Date();
      const nextId = `${now.getTime()}`;
      setTableData((prev) => [
        buildRowFromForm(values, {
          id: nextId,
          fallbackClave: `BI-${nextId.slice(-3)}`,
          fallbackFecha: formatDate(now),
        }),
        ...prev,
      ]);
    }

    setEditingId(null);
    form.reset(EMPTY_FORM_VALUES);
  };

  const handleEditRequest = (row: BienesInmueblesTableRow) => {
    setEditRow(row);
  };

  const handleConfirmEdit = () => {
    if (editRow) {
      form.reset(toFormValues(editRow));
      setEditingId(editRow.id);
    }
    setEditRow(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
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

  const handleConfirmDelete = () => {
    if (deleteRow) {
      setTableData((prev) =>
        prev.map((item) =>
          item.id === deleteRow.id ? { ...item, estado: "Inactivo" } : item
        )
      );
    }
    setDeleteRow(null);
    setDeleteReason("");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <AppCard
        title="CRUD"
        description="Gestion de bienes inmuebles conforme a los lineamientos del sistema."
      >
        <form
          id="bienes-inmuebles-form"
          className="space-y-6"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <BienesInmueblesFilters register={form.register} />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {SECTION_CARDS.map((card) => (
              <BienesInmueblesSectionCard
                key={card.title}
                title={card.title}
                fields={card.fields}
                register={form.register}
              />
            ))}
          </div>

          <BienesInmueblesSummary
            register={form.register}
            submitLabel={editingId ? "Actualizar" : "Guardar"}
            showCancel={!!editingId}
            onCancel={handleCancelEdit}
          />
        </form>
      </AppCard>

      <BienesInmueblesResults
        data={tableData}
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
