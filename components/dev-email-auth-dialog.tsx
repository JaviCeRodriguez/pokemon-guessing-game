"use client";

import { useActionState, useEffect, useState } from "react";
import { CircleAlert, ExternalLink, FlaskConical, LogIn, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  authenticateWithDevEmail,
  type DevEmailAuthState,
} from "@/app/actions/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

const initialState: DevEmailAuthState = { status: "idle", message: "" };

export function DevEmailAuthDialog({
  googleBusy,
  onGoogleLogin,
}: {
  googleBusy: boolean;
  onGoogleLogin: () => Promise<void>;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    authenticateWithDevEmail,
    initialState,
  );

  useEffect(() => {
    if (state.status !== "authenticated") return;
    setOpen(false);
    router.refresh();
  }, [router, state.status]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <LogIn data-icon="inline-start" aria-hidden="true" />
          Iniciar sesión
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>Acceso de entrenador</DialogTitle>
            <Badge variant="secondary">
              <FlaskConical aria-hidden="true" />
              Desarrollo
            </Badge>
          </div>
          <DialogDescription>
            Usá Google o una cuenta temporal de email para probar partidas autenticadas.
          </DialogDescription>
        </DialogHeader>

        <Button
          type="button"
          variant="outline"
          disabled={googleBusy || pending}
          onClick={onGoogleLogin}
        >
          {googleBusy ? (
            <Spinner data-icon="inline-start" aria-label="Abriendo Google" />
          ) : (
            <ExternalLink data-icon="inline-start" aria-hidden="true" />
          )}
          Continuar con Google
        </Button>

        <form action={formAction}>
          <FieldGroup>
            <FieldSeparator>Email y contraseña</FieldSeparator>
            <Field>
              <FieldLabel htmlFor="dev-auth-email">Email</FieldLabel>
              <Input
                id="dev-auth-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="trainer@example.test"
                required
                disabled={pending}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="dev-auth-password">Contraseña</FieldLabel>
              <Input
                id="dev-auth-password"
                name="password"
                type="password"
                autoComplete="current-password"
                minLength={6}
                maxLength={72}
                required
                disabled={pending}
              />
              <FieldDescription>Mínimo 6 caracteres.</FieldDescription>
            </Field>

            {state.status === "error" || state.status === "confirmation_required" ? (
              <Alert variant={state.status === "error" ? "destructive" : "default"}>
                <CircleAlert aria-hidden="true" />
                <AlertDescription aria-live="polite">{state.message}</AlertDescription>
              </Alert>
            ) : null}

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                type="submit"
                name="intent"
                value="sign-up"
                variant="outline"
                disabled={pending || googleBusy}
              >
                <UserPlus data-icon="inline-start" aria-hidden="true" />
                Crear cuenta de prueba
              </Button>
              <Button
                type="submit"
                name="intent"
                value="sign-in"
                disabled={pending || googleBusy}
              >
                {pending ? (
                  <Spinner data-icon="inline-start" aria-label="Autenticando" />
                ) : (
                  <LogIn data-icon="inline-start" aria-hidden="true" />
                )}
                Entrar
              </Button>
            </div>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
