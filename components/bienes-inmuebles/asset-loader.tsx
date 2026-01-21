import { Loader2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AssetLoaderProps = {
  id?: string | number;
};

export default function AssetLoader({ id }: AssetLoaderProps) {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Cargando bien {id ? `#${id}` : ""}...</span>
      </div>
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/50">
          <CardTitle className="flex items-center justify-between text-base">
            <span>Preparando ficha del bien</span>
            {id ? (
              <span className="text-xs font-normal text-muted-foreground">
                ID: {id}
              </span>
            ) : null}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 py-6">
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="space-y-2 rounded-lg border border-dashed border-border/70 bg-muted/30 p-4"
              >
                <div className="h-3 w-20 animate-pulse rounded-full bg-muted-foreground/30" />
                <div className="h-4 w-32 animate-pulse rounded-full bg-muted-foreground/40" />
              </div>
            ))}
          </div>
          <div className="space-y-2 rounded-lg border border-dashed border-border/70 bg-muted/30 p-4">
            <div className="h-3 w-24 animate-pulse rounded-full bg-muted-foreground/30" />
            <div className="h-4 w-full animate-pulse rounded-full bg-muted-foreground/40" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
