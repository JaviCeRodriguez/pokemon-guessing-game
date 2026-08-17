"use client";

import type { ReactNode } from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { TopNav } from "@/components/top-nav";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export interface AppShellUser {
  id: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
}

export function AppShell({
  children,
  devEmailAuthEnabled,
  user,
}: {
  children: ReactNode;
  devEmailAuthEnabled: boolean;
  user: AppShellUser | null;
}) {
  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset className="min-w-0 bg-transparent">
        <TopNav devEmailAuthEnabled={devEmailAuthEnabled} user={user} />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
