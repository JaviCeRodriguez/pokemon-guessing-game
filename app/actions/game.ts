"use server";

import { cookies } from "next/headers";

import { createClient } from "@/utils/supabase/server";

export async function recordWin(input: { streak: number }) {
  const streak = Number.isFinite(input.streak) ? Math.max(0, input.streak) : 0;

  const supabase = createClient(cookies());
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;
  if (!user) return { ok: false as const, reason: "not_authenticated" as const };

  // Ensure a row exists; RLS allows only own row
  const { data: existing, error: existingError } = await supabase
    .from("ranking")
    .select("user_id,total_wins,best_streak")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingError) {
    return { ok: false as const, reason: "db_error" as const, message: existingError.message };
  }

  const totalWins = (existing?.total_wins ?? 0) + 1;
  const bestStreak = Math.max(existing?.best_streak ?? 0, streak);

  const { error } = await supabase
    .from("ranking")
    .upsert(
      {
        user_id: user.id,
        total_wins: totalWins,
        best_streak: bestStreak,
      },
      { onConflict: "user_id" },
    );

  if (error) {
    return { ok: false as const, reason: "db_error" as const, message: error.message };
  }

  return { ok: true as const };
}

