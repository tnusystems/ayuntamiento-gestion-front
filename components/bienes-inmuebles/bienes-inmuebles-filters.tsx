import type { FieldErrors, UseFormRegister } from "react-hook-form";

import type { BienesInmueblesFormValues } from "@/components/bienes-inmuebles/types";
import type { OperationType } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type BienesInmueblesFiltersProps = {
  register: UseFormRegister<BienesInmueblesFormValues>;
  errors?: FieldErrors<BienesInmueblesFormValues>;
  operationOptions: OperationType[];
};

export default function BienesInmueblesFilters({
  register,
  errors,
  operationOptions,
}: BienesInmueblesFiltersProps) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/30 px-4 py-3">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Label className="min-w-20 text-sm font-medium text-foreground">
              Operacion
            </Label>
            <select
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
              {...register("operation")}
              aria-invalid={!!errors?.operation}
            >
              <option value="">Seleccionar operacion</option>
              {operationOptions
                .filter((operation) => operation.name)
                .map((operation) => (
                  <option key={operation.id} value={String(operation.id)}>
                    {operation.name}
                  </option>
                ))}
            </select>
          </div>
          {errors?.operation?.message ? (
            <p className="text-xs text-red-600">{errors.operation.message}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Label className="min-w-20 text-sm font-medium text-foreground">
              Fecha
            </Label>
            <Input
              type="date"
              {...register("dateFilter")}
              aria-invalid={!!errors?.dateFilter}
            />
          </div>
          {errors?.dateFilter?.message ? (
            <p className="text-xs text-red-600">{errors.dateFilter.message}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
