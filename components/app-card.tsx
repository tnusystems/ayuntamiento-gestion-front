import * as React from "react";

import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type AppCardProps = React.HTMLAttributes<HTMLDivElement> & {
  title?: React.ReactNode;
  description?: React.ReactNode;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
  contentClassName?: string;
};

const AppCard = React.forwardRef<HTMLDivElement, AppCardProps>(
  (
    {
      title,
      description,
      headerAction,
      footer,
      contentClassName,
      className,
      children,
      ...props
    },
    ref,
  ) => (
    <Card ref={ref} className={cn("shadow-sm", className)} {...props}>
      {(title || description || headerAction) && (
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              {title ? <CardTitle className="text-lg">{title}</CardTitle> : null}
              {description ? (
                <CardDescription>{description}</CardDescription>
              ) : null}
            </div>
            {headerAction ? <div className="shrink-0">{headerAction}</div> : null}
          </div>
        </CardHeader>
      )}
      {children ? (
        <CardContent className={cn("pt-0", contentClassName)}>
          {children}
        </CardContent>
      ) : null}
      {footer ? <CardFooter>{footer}</CardFooter> : null}
    </Card>
  ),
);

AppCard.displayName = "AppCard";

export default AppCard;
