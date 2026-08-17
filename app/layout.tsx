import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Bungee, Geist, Geist_Mono } from "next/font/google";

import { AppShell, type AppShellUser } from "@/components/app-shell";
import { ThemeProvider } from "@/components/theme-provider";
import { createClient } from "@/utils/supabase/server";

import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });
const bungee = Bungee({ subsets: ["latin"], weight: "400", variable: "--font-display" });

export const metadata: Metadata = {
  title: "Pokémon Guesser · Laboratorio de campo",
  description: "Reconoce al Pokémon por su grito, tipo y silueta.",
};

async function getInitialUser(): Promise<AppShellUser | null> {
  const supabase = createClient(await cookies());
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
  const devEmailAuthEnabled =
    process.env.NODE_ENV === "development" &&
    process.env.ENABLE_DEV_EMAIL_AUTH === "true";

  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${geist.variable} ${geistMono.variable} ${bungee.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppShell devEmailAuthEnabled={devEmailAuthEnabled} user={user}>
            {children}
          </AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
