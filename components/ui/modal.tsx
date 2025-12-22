import * as React from "react";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

type ModalProps = {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

export default function Modal({
  open,
  title,
  description,
  onClose,
  children,
  footer,
  className,
}: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="Cerrar modal"
      />
      <Card className={cn("relative w-full max-w-lg shadow-lg", className)}>
        <CardHeader className="space-y-1">
          <CardTitle className="text-lg">{title}</CardTitle>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </CardHeader>
        <CardContent>{children}</CardContent>
        {footer ? <CardFooter className="justify-end gap-2">{footer}</CardFooter> : null}
      </Card>
    </div>
  );
}
