"use client";

import * as React from "react";

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
  user,
}: {
  children: React.ReactNode;
  user: AppShellUser | null;
}) {
  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <TopNav user={user} />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}

