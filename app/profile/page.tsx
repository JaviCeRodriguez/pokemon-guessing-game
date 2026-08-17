import { cookies } from "next/headers";
import { CalendarDays, CircleUserRound, Fingerprint, ShieldCheck, UserRound } from "lucide-react";

import { createClient } from "@/utils/supabase/server";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type AppUserRow = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
};

function initials(value: string) {
  const parts = value.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (first + last).toUpperCase() || "?";
}

export default async function ProfilePage() {
  const supabase = createClient(await cookies());
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;

  if (!user) {
    return (
      <main className="mx-auto w-full max-w-3xl px-[clamp(1rem,5vw,4rem)] py-8 sm:py-12">
        <Card>
          <CardHeader>
            <Badge variant="outline" className="mb-2 w-fit">
              <CircleUserRound aria-hidden="true" />
              Ficha de entrenador
            </Badge>
            <CardTitle className="font-[family-name:var(--font-display)] text-3xl">Perfil bloqueado</CardTitle>
            <CardDescription>Iniciá sesión para consultar tu identidad y progreso conectado.</CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  const { data, error } = await supabase
    .from("app_user")
    .select("id,username,full_name,avatar_url,created_at")
    .eq("id", user.id)
    .maybeSingle();

  const row = (data ?? null) as unknown as AppUserRow | null;

  const name =
    row?.username ??
    row?.full_name ??
    (typeof user.user_metadata?.full_name === "string"
      ? (user.user_metadata.full_name as string)
      : user.email) ??
    "Usuario";

  const avatarUrl =
    row?.avatar_url ??
    (typeof user.user_metadata?.avatar_url === "string"
      ? (user.user_metadata.avatar_url as string)
      : typeof user.user_metadata?.picture === "string"
        ? (user.user_metadata.picture as string)
        : null);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-[clamp(1rem,5vw,4rem)] py-8 sm:py-12">
      <header className="flex flex-col gap-2">
        <Badge variant="outline" className="w-fit">
          <UserRound aria-hidden="true" />
          Ficha de entrenador
        </Badge>
        <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight sm:text-5xl">Perfil</h1>
        <p className="text-lg text-muted-foreground">Tu identidad dentro de la red de investigación.</p>
      </header>

      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle>Credencial de campo</CardTitle>
          <CardDescription>Datos sincronizados con tu cuenta de entrenador.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6 p-6 sm:p-8">
          {error ? (
            <Alert variant="destructive">
              <CircleUserRound aria-hidden="true" />
              <AlertTitle>Perfil parcialmente disponible</AlertTitle>
              <AlertDescription>No pudimos sincronizar todos los datos de la cuenta.</AlertDescription>
            </Alert>
          ) : null}

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <Avatar className="size-24 border-4 border-background shadow-lg ring-4 ring-primary/20">
              {avatarUrl ? <AvatarImage src={avatarUrl} alt={name} /> : null}
              <AvatarFallback>{initials(name)}</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-2xl font-black">{name}</p>
                <Badge variant="secondary">
                  <ShieldCheck aria-hidden="true" />
                  Cuenta verificada
                </Badge>
              </div>
              {user.email ? (
                <p className="truncate text-base text-muted-foreground">
                  {user.email}
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-2xl border bg-muted/30 p-4">
              <Fingerprint className="mt-0.5 text-primary" aria-hidden="true" />
              <div className="min-w-0">
                <p className="field-label">ID de entrenador</p>
                <p className="mt-1 truncate font-mono text-base font-bold">{user.id}</p>
              </div>
            </div>
            {row?.created_at ? (
              <div className="flex items-start gap-3 rounded-2xl border bg-muted/30 p-4">
                <CalendarDays className="mt-0.5 text-accent" aria-hidden="true" />
                <div>
                  <p className="field-label">Ingreso a la red</p>
                  <p className="mt-1 text-base font-bold">
                    {new Date(row.created_at).toLocaleDateString("es-AR", { dateStyle: "long" })}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
