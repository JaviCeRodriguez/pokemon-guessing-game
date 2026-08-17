"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Crosshair, Gamepad2, Trophy, User } from "lucide-react";

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
  { href: "/", label: "Jugar", icon: Gamepad2 },
  { href: "/ranking", label: "Ranking", icon: Trophy },
  { href: "/profile", label: "Perfil", icon: User },
] as const;

export function AppSidebar({ user }: { user: AppShellUser | null }) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="px-3 py-4">
        <Link
          href="/"
          className="flex min-h-12 items-center gap-3 rounded-xl px-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sidebar-ring/40"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full border-4 border-sidebar-foreground bg-sidebar-primary text-sidebar-primary-foreground shadow-[inset_0_0_0_3px_hsl(var(--sidebar-background))]">
            <Crosshair aria-hidden="true" />
          </span>
          <span className="font-[family-name:var(--font-display)] text-sm leading-tight tracking-wide group-data-[collapsible=icon]:hidden">
            Pokémon<br />Guesser
          </span>
        </Link>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent className="px-2 py-4">
        <p className="field-label px-2 pb-3 text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden">
          Menú principal
        </p>
        <SidebarMenu className="gap-2">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={active}
                  tooltip={item.label}
                  className="h-12 rounded-xl px-3 text-base font-bold data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground data-[active=true]:shadow-lg"
                >
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
      <SidebarFooter className="px-4 py-4 text-sm text-sidebar-foreground/70">
        {user ? (
          <div className="flex items-center gap-2">
            <span className="size-2 shrink-0 rounded-full bg-secondary" aria-hidden="true" />
            <span className="truncate">En línea: {user.name ?? user.email ?? user.id}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="size-2 shrink-0 rounded-full bg-sidebar-foreground/40" aria-hidden="true" />
            <span>Modo invitado</span>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
