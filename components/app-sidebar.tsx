"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gamepad2, Trophy, User } from "lucide-react";

import type { AppShellUser } from "@/components/app-shell";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";

const NAV_ITEMS = [
  { href: "/", label: "Game", icon: Gamepad2 },
  { href: "/ranking", label: "Ranking", icon: Trophy },
  { href: "/profile", label: "Perfil", icon: User },
] as const;

export function AppSidebar({ user }: { user: AppShellUser | null }) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="px-4 py-3">
        <Link href="/" className="font-black tracking-tight text-lg">
          Pokémon Guesser
        </Link>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarMenu>
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                  <Link href={item.href}>
                    <Icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter className="px-4 py-3 text-xs text-muted-foreground">
        {user ? (
          <span className="truncate">Conectado: {user.name ?? user.email ?? user.id}</span>
        ) : (
          <span>No conectado</span>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

