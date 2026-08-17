import { cookies } from "next/headers";
import { Crown, Medal, Trophy, Users } from "lucide-react";

import { createClient } from "@/utils/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type LeaderboardRow = {
  user_id: string;
  total_wins: number;
  best_streak: number;
  app_user: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

function displayName(row: LeaderboardRow) {
  return (
    row.app_user?.username ??
    row.app_user?.full_name ??
    row.user_id.slice(0, 8)
  );
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (first + last).toUpperCase() || "?";
}

export default async function RankingPage() {
  const supabase = createClient(await cookies());

  const { data, error } = await supabase
    .from("ranking")
    .select(
      "user_id,total_wins,best_streak,app_user:app_user(username,full_name,avatar_url)",
    )
    .order("total_wins", { ascending: false })
    .order("best_streak", { ascending: false })
    .limit(50);

  if (error) {
    return (
      <main className="mx-auto w-full max-w-6xl px-[clamp(1rem,5vw,4rem)] py-8">
        <Card>
          <CardHeader>
            <CardTitle>No pudimos cargar el ranking</CardTitle>
            <CardDescription>La clasificación no está disponible en este momento. Intentá nuevamente más tarde.</CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  const rows = (data ?? []) as unknown as LeaderboardRow[];

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-[clamp(1rem,5vw,4rem)] py-8 sm:py-12">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <Badge variant="outline" className="w-fit">
            <Trophy aria-hidden="true" />
            Liga de entrenadores
          </Badge>
          <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight sm:text-5xl">Ranking</h1>
          <p className="max-w-2xl text-lg text-muted-foreground">Las mejores expediciones, ordenadas por capturas y rachas.</p>
        </div>
        <div className="flex items-center gap-2 text-base font-bold text-muted-foreground">
          <Users aria-hidden="true" />
          <span>{rows.length} entrenadores registrados</span>
        </div>
      </header>

      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="flex items-center gap-2">
            <Crown className="text-secondary-foreground" aria-hidden="true" />
            Tabla general
          </CardTitle>
          <CardDescription>Las victorias definen la posición; la mejor racha desempata.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Pos.</TableHead>
                <TableHead>Jugador</TableHead>
                <TableHead className="text-right">Victorias</TableHead>
                <TableHead className="text-right">Mejor racha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                    Todavía no hay partidas registradas. La primera captura puede ser tuya.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, idx) => {
                  const name = displayName(row);
                  return (
                    <TableRow key={row.user_id} className={idx < 3 ? "bg-secondary/10" : undefined}>
                      <TableCell className="font-black">
                        <span className="inline-flex items-center gap-2">
                          {idx < 3 ? <Medal className="text-secondary-foreground" aria-hidden="true" /> : null}
                          {idx + 1}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-10">
                            {row.app_user?.avatar_url ? (
                              <AvatarImage
                                src={row.app_user.avatar_url}
                                alt={name}
                              />
                            ) : null}
                            <AvatarFallback>{initials(name)}</AvatarFallback>
                          </Avatar>
                          <span className="font-bold">{name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {row.total_wins}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {row.best_streak}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
