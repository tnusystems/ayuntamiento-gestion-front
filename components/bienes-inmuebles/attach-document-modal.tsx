import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Modal from "@/components/ui/modal";
import type { BienesInmueblesTableRow } from "@/components/bienes-inmuebles/types";

type AttachDocumentModalProps = {
  open: boolean;
  row: BienesInmueblesTableRow | null;
  file: File | null;
  name: string;
  position: string;
  metadata: string;
  isSubmitting?: boolean;
  onFileChange: (file: File | null) => void;
  onNameChange: (value: string) => void;
  onPositionChange: (value: string) => void;
  onMetadataChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
};

const attachmentAccept = ".pdf,.jpg,.jpeg,.png,.xls,.xlsx,.dwg,.dwf";

export default function AttachDocumentModal({
  open,
  row,
  file,
  name,
  position,
  metadata,
  isSubmitting,
  onFileChange,
  onNameChange,
  onPositionChange,
  onMetadataChange,
  onClose,
  onConfirm,
}: AttachDocumentModalProps) {
  return (
    <Modal
      open={open}
      title="Adjuntar documento"
      description={
        row
          ? `Sube el documento para ${row.descripcion} (${row.clave}).`
          : "Selecciona el archivo que deseas subir."
      }
      onClose={onClose}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" onClick={onConfirm} disabled={!file || isSubmitting}>
            Subir
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Label htmlFor="attachment">Documento</Label>
        <Input
          id="attachment"
          type="file"
          accept={attachmentAccept}
          onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
        />
        <p className="text-xs text-muted-foreground">
          Formatos aceptados: PDF, JPG, PNG, XLS, XLSX, DWG, DWF.
        </p>
        {file ? (
          <p className="text-xs text-muted-foreground">
            Archivo seleccionado: {file.name}
          </p>
        ) : null}
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="attachment-name">Nombre</Label>
          <Input
            id="attachment-name"
            placeholder="Ej. Escritura publica"
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Titulo visible del documento en el sistema.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="attachment-position">Posicion</Label>
          <Input
            id="attachment-position"
            type="number"
            value={position}
            onChange={(event) => onPositionChange(event.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Orden o prioridad del documento.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="attachment-metadata">Metadatos (JSON)</Label>
          <textarea
            id="attachment-metadata"
            value={metadata}
            onChange={(event) => onMetadataChange(event.target.value)}
            placeholder='Ej. {"folio":"123","origen":"registro"}'
            className="min-h-[96px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          <p className="text-xs text-muted-foreground">
            Objeto JSON con datos extra (opcional).
          </p>
        </div>
      </div>
    </Modal>
  );
}
