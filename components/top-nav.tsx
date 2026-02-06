"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import type { AppShellUser } from "@/components/app-shell";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
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

export function TopNav({ user }: { user: AppShellUser | null }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

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
    <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center gap-3 px-4">
        <SidebarTrigger />
        <div className="flex-1" />

        {!user ? (
          <Button onClick={onLogin} disabled={busy}>
            Login con Google
          </Button>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2" disabled={busy}>
                <Avatar className="h-8 w-8">
                  {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={user.name ?? "User"} /> : null}
                  <AvatarFallback>
                    {initials(user.name ?? user.email ?? "User")}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline font-medium truncate max-w-[16rem]">
                  {user.name ?? user.email ?? "Usuario"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium truncate">{user.name ?? "Usuario"}</p>
                {user.email ? (
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                ) : null}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout}>
                <LogOut />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}

