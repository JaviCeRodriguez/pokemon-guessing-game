import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

export const createClient = (cookieStore: ReturnType<typeof cookies>) => {
  return createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll: async () => {
        return (await cookieStore).getAll();
      },
      setAll: async (cookiesToSet) => {
        cookiesToSet.forEach(async ({ name, value, options }) =>
          (await cookieStore).set(name, value, options),
        );
      },
    },
  });
};
