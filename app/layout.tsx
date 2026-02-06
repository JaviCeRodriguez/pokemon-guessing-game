import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";

import { AppShell, type AppShellUser } from "@/components/app-shell";
import { ThemeProvider } from "@/components/theme-provider";
import { createClient } from "@/utils/supabase/server";

import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pókemon Guesser",
  description: "Pon a prueba tu conocimiento pokémon",
  generator: "v0.app",
};

async function getInitialUser(): Promise<AppShellUser | null> {
  const supabase = createClient(cookies());
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return null;

  const metadata = user.user_metadata as Record<string, unknown> | null;
  const name =
    (typeof metadata?.full_name === "string" && metadata.full_name) ||
    (typeof metadata?.name === "string" && metadata.name) ||
    null;
  const avatarUrl =
    (typeof metadata?.avatar_url === "string" && metadata.avatar_url) ||
    (typeof metadata?.picture === "string" && metadata.picture) ||
    null;

  return {
    id: user.id,
    email: user.email ?? null,
    name,
    avatarUrl,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getInitialUser();
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppShell user={user}>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  )
}
