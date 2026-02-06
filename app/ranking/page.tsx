import { cookies } from "next/headers";

import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const supabase = createClient(cookies());

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
      <main className="p-4 sm:p-8">
        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle>Ranking</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-destructive">
            Error cargando ranking: {error.message}
          </CardContent>
        </Card>
      </main>
    );
  }

  const rows = (data ?? []) as unknown as LeaderboardRow[];

  return (
    <main className="p-4 sm:p-8">
      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Ranking</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">#</TableHead>
                <TableHead>Jugador</TableHead>
                <TableHead className="text-right">Victorias</TableHead>
                <TableHead className="text-right">Mejor racha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    Aún no hay partidas registradas.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, idx) => {
                  const name = displayName(row);
                  return (
                    <TableRow key={row.user_id}>
                      <TableCell className="font-medium">{idx + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            {row.app_user?.avatar_url ? (
                              <AvatarImage
                                src={row.app_user.avatar_url}
                                alt={name}
                              />
                            ) : null}
                            <AvatarFallback>{initials(name)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{name}</span>
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

