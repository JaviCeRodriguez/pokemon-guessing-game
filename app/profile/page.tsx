import { cookies } from "next/headers";

import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const supabase = createClient(cookies());
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;

  if (!user) {
    return (
      <main className="p-4 sm:p-8">
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Perfil</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Inicia sesión para ver tu perfil.
          </CardContent>
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
    <main className="p-4 sm:p-8">
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <p className="text-sm text-destructive">
              Error cargando perfil: {error.message}
            </p>
          ) : null}

          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              {avatarUrl ? <AvatarImage src={avatarUrl} alt={name} /> : null}
              <AvatarFallback>{initials(name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-semibold truncate">{name}</p>
              {user.email ? (
                <p className="text-sm text-muted-foreground truncate">
                  {user.email}
                </p>
              ) : null}
            </div>
          </div>

          <div className="text-sm">
            <p>
              <span className="text-muted-foreground">User ID:</span>{" "}
              <span className="font-mono">{user.id}</span>
            </p>
            {row?.created_at ? (
              <p className="text-muted-foreground">
                Registrado: {new Date(row.created_at).toLocaleString("es-ES")}
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

