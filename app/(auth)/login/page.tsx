"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  return (
    <main className="relative min-h-svh overflow-hidden bg-muted/30">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-amber-200/30 blur-3xl" />

      <div className="relative mx-auto flex min-h-svh w-full max-w-xl flex-col items-center justify-between px-4 py-10 sm:px-6">
        <header className="mt-2 flex flex-col items-center gap-3 text-center sm:mt-6">
          <Image
            src="/icons/logo_ayuntamiento_hermosillo.png"
            alt="Logo"
            width={250}
            height={250}
          />
        </header>

        <section className="w-full max-w-sm sm:max-w-md">
          <Card className="bg-card/80 shadow-xl backdrop-blur">
            <CardHeader className="space-y-1 pb-4">
              <h1 className="text-center text-lg font-semibold">
                Iniciar sesion
              </h1>
              <p className="text-center text-sm text-muted-foreground">
                Ingresa tus credenciales para continuar
              </p>
            </CardHeader>

            <CardContent>
              <form
                className="space-y-5"
                onSubmit={async (event) => {
                  event.preventDefault();
                  setErrorMessage(null);
                  setIsSubmitting(true);

                  const formData = new FormData(event.currentTarget);
                  const email = String(formData.get("email") || "").trim();
                  const password = String(formData.get("password") || "");
                  const callbackUrl =
                    searchParams.get("callbackUrl") || "/dashboard";

                  if (!email || !password) {
                    setErrorMessage("Ingresa tu correo y contrasena.");
                    setIsSubmitting(false);
                    return;
                  }

                  const result = await signIn("credentials", {
                    email,
                    password,
                    redirect: false,
                    callbackUrl,
                  });

                  if (result?.error) {
                    setErrorMessage("Credenciales invalidas.");
                    setIsSubmitting(false);
                    return;
                  }

                  router.push(result?.url || callbackUrl);
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="email">Correo</Label>
                  <Input
                    id="email"
                    name="email"
                    autoComplete="email"
                    placeholder="correo@ejemplo.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contrasena</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Contrasena"
                  />
                </div>

                {errorMessage ? (
                  <p className="text-sm text-destructive">{errorMessage}</p>
                ) : null}

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Ingresando..." : "Iniciar sesion"}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="flex justify-center">
              <p className="text-center text-xs text-muted-foreground">
                Al continuar aceptas los terminos y condiciones.
              </p>
            </CardFooter>
          </Card>
        </section>

        <footer className="flex flex-col items-center gap-3 pt-10 text-center text-[11px] text-muted-foreground">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              type="button"
              variant="link"
              className="h-auto p-0 text-xs text-muted-foreground"
            >
              Aviso de Privacidad
            </Button>
            <span className="text-muted-foreground/40">|</span>
            <Button
              type="button"
              variant="link"
              className="h-auto p-0 text-xs text-muted-foreground"
            >
              Terminos y Condiciones
            </Button>
            <span className="text-muted-foreground/40">|</span>
            <Button
              type="button"
              variant="link"
              className="h-auto p-0 text-xs text-muted-foreground"
            >
              Reportar un problema
            </Button>
          </div>

          <div>Copyright @ Lorem Ipsum 2025. Todos los derechos reservados</div>

          <div className="flex items-center gap-2 text-foreground/80">
            <span className="font-medium">Powered by</span>
            <Image
              src="/icons/logo_tutor.png"
              alt="Tecnologico Nacional de Mexico"
              width={80}
              height={20}
            />
          </div>
        </footer>
      </div>
    </main>
  );
}
