import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Modal from "@/components/ui/modal";

type ReasonModalProps = {
  open: boolean;
  title: string;
  description?: string;
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
};

export default function ReasonModal({
  open,
  title,
  description,
  label = "Motivo",
  placeholder = "Escribe el motivo...",
  value,
  onChange,
  onClose,
  onConfirm,
  confirmText = "Aceptar",
  cancelText = "Cancelar",
}: ReasonModalProps) {
  return (
    <Modal
      open={open}
      title={title}
      description={description}
      onClose={onClose}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            {cancelText}
          </Button>
          <Button type="button" onClick={onConfirm} disabled={!value.trim()}>
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="space-y-2">
        <Label htmlFor="reason-modal-input">{label}</Label>
        <Input
          id="reason-modal-input"
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </Modal>
  );
}
