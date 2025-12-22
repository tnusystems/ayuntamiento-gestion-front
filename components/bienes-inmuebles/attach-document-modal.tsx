import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Modal from "@/components/ui/modal";
import type { BienesInmueblesTableRow } from "@/components/bienes-inmuebles/types";

type AttachDocumentModalProps = {
  open: boolean;
  row: BienesInmueblesTableRow | null;
  file: File | null;
  onFileChange: (file: File | null) => void;
  onClose: () => void;
  onConfirm: () => void;
};

export default function AttachDocumentModal({
  open,
  row,
  file,
  onFileChange,
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
          <Button type="button" onClick={onConfirm}>
            Subir
          </Button>
        </>
      }
    >
      <div className="space-y-2">
        <Label htmlFor="attachment">Documento</Label>
        <Input
          id="attachment"
          type="file"
          onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
        />
        {file ? (
          <p className="text-xs text-muted-foreground">
            Archivo seleccionado: {file.name}
          </p>
        ) : null}
      </div>
    </Modal>
  );
}
