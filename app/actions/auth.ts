"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";

import { createClient } from "@/utils/supabase/server";

export type DevEmailAuthState = {
  status: "idle" | "error" | "authenticated" | "confirmation_required";
  message: string;
};

const credentialsSchema = z.object({
  email: z.string().trim().email("Ingresá un email válido."),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres.")
    .max(72, "La contraseña es demasiado larga."),
  intent: z.enum(["sign-in", "sign-up"]),
});

function isDevEmailAuthEnabled() {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.ENABLE_DEV_EMAIL_AUTH === "true"
  );
}

function authErrorMessage(message: string) {
  if (message === "Invalid login credentials") {
    return "Email o contraseña incorrectos.";
  }
  if (message === "Email not confirmed") {
    return "Confirmá el email de la cuenta antes de ingresar.";
  }
  if (message.toLowerCase().includes("already registered")) {
    return "Ese email ya está registrado. Probá iniciar sesión.";
  }
  return "No se pudo completar la autenticación de desarrollo.";
}

export async function authenticateWithDevEmail(
  _previousState: DevEmailAuthState,
  formData: FormData,
): Promise<DevEmailAuthState> {
  if (!isDevEmailAuthEnabled()) {
    return {
      status: "error",
      message: "El acceso por email sólo está disponible en desarrollo.",
    };
  }

  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    intent: formData.get("intent"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Revisá los datos ingresados.",
    };
  }

  const supabase = createClient(await cookies());
  const { email, password, intent } = parsed.data;

  if (intent === "sign-up") {
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      return { status: "error", message: authErrorMessage(error.message) };
    }

    if (!data.session) {
      return {
        status: "confirmation_required",
        message: "Cuenta creada. Confirmá el email antes de iniciar sesión.",
      };
    }
  } else {
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return { status: "error", message: authErrorMessage(error.message) };
    }
  }

  revalidatePath("/", "layout");
  return { status: "authenticated", message: "Sesión iniciada." };
}
