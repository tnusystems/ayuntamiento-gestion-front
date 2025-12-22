import type { UseFormRegister } from "react-hook-form";
import type { BienesInmueblesFormValues } from "@/components/bienes-inmuebles/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type BienesInmueblesSummaryProps = {
  register: UseFormRegister<BienesInmueblesFormValues>;
  submitLabel?: string;
  showCancel?: boolean;
  onCancel?: () => void;
};

export default function BienesInmueblesSummary({
  register,
  submitLabel = "Guardar",
  showCancel = false,
  onCancel,
}: BienesInmueblesSummaryProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr,220px]">
      <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">
                Nombre
              </Label>
              <Input placeholder="Ingresar texto..." {...register("nombre")} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">
                Antecedente
              </Label>
              <Input
                placeholder="Ingresar texto..."
                {...register("antecedente")}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="submit">{submitLabel}</Button>
            {showCancel ? (
              <Button
                type="button"
                variant="secondary"
                onClick={onCancel}
              >
                Cancelar edicion
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
