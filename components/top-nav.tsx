"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, LogOut, Radar } from "lucide-react";

import type { AppShellUser } from "@/components/app-shell";
import { DevEmailAuthDialog } from "@/components/dev-email-auth-dialog";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";

function initials(value: string) {
  const parts = value.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (first + last).toUpperCase() || "?";
}

export function TopNav({
  devEmailAuthEnabled,
  user,
}: {
  devEmailAuthEnabled: boolean;
  user: AppShellUser | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const onLogin = async () => {
    setBusy(true);
    try {
      const supabase = createClient();
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    } finally {
      setBusy(false);
    }
  };

  const onLogout = async () => {
    setBusy(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <header className="sticky top-0 z-20 border-b-2 bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75">
      <div className="flex min-h-16 items-center gap-3 px-[clamp(1rem,3vw,2rem)]">
        <SidebarTrigger className="size-12" />
        <div className="hidden items-center gap-2 sm:flex">
          <Radar className="text-accent" aria-hidden="true" />
          <span className="field-label">Red de investigación activa</span>
        </div>
        <div className="flex-1" />

        {!user && devEmailAuthEnabled ? (
          <DevEmailAuthDialog googleBusy={busy} onGoogleLogin={onLogin} />
        ) : !user ? (
          <Button onClick={onLogin} disabled={busy} variant="outline">
            <LogIn data-icon="inline-start" aria-hidden="true" />
            Iniciar sesión
          </Button>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="px-2" disabled={busy}>
                <Avatar className="size-9">
                  {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={user.name ?? "User"} /> : null}
                  <AvatarFallback>
                    {initials(user.name ?? user.email ?? "User")}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden max-w-[16rem] truncate font-bold sm:inline">
                  {user.name ?? user.email ?? "Usuario"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex flex-col gap-1 px-2 py-2">
                <p className="truncate text-base font-bold">{user.name ?? "Usuario"}</p>
                {user.email ? (
                  <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                ) : null}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={onLogout} className="min-h-11 text-base">
                  <LogOut aria-hidden="true" />
                  <span>Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
