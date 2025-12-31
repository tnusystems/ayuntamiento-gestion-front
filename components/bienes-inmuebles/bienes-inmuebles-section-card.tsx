import type { FieldErrors, UseFormRegister } from "react-hook-form";

import type { BienesInmueblesFormValues } from "@/components/bienes-inmuebles/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FieldConfig = {
  label: string;
  name: keyof BienesInmueblesFormValues;
  placeholder?: string;
  type?: "text" | "date";
};

type BienesInmueblesSectionCardProps = {
  title: string;
  fields: FieldConfig[];
  register: UseFormRegister<BienesInmueblesFormValues>;
  errors?: FieldErrors<BienesInmueblesFormValues>;
};

export default function BienesInmueblesSectionCard({
  title,
  fields,
  register,
  errors,
}: BienesInmueblesSectionCardProps) {
  return (
    <Card className="bg-muted/40 shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.map((field) => (
          <div key={field.label} className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">
              {field.label}
            </Label>
            <Input
              type={field.type ?? "text"}
              placeholder={field.placeholder ?? "Ingresar texto..."}
              {...register(field.name)}
              aria-invalid={!!errors?.[field.name]}
            />
            {errors?.[field.name]?.message ? (
              <p className="text-xs text-red-600">
                {errors[field.name]?.message as string}
              </p>
            ) : null}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
