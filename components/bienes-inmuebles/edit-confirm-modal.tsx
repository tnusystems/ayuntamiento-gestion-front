import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import type { BienesInmueblesTableRow } from "@/components/bienes-inmuebles/types";

type EditConfirmModalProps = {
  open: boolean;
  row: BienesInmueblesTableRow | null;
  onClose: () => void;
  onConfirm: () => void;
};

export default function EditConfirmModal({
  open,
  row,
  onClose,
  onConfirm,
}: EditConfirmModalProps) {
  return (
    <Modal
      open={open}
      title="Confirmar edicion"
      description="Se cargara la informacion del bien en el formulario."
      onClose={onClose}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" onClick={onConfirm}>
            Confirmar
          </Button>
        </>
      }
    >
      <p className="text-sm text-muted-foreground">
        {row ? `Editar bien: ${row.descripcion} (${row.clave})` : null}
      </p>
    </Modal>
  );
}
