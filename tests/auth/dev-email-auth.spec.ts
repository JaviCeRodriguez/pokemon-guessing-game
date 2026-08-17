import { expect, test } from "@playwright/test";

test.describe("Autenticación por email en desarrollo", () => {
  test("muestra los controles de acceso por email y contraseña", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Iniciar sesión" }).click();

    await expect(
      page.getByRole("heading", { name: "Acceso de entrenador" }),
    ).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Contraseña")).toBeVisible();
    await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Crear cuenta de prueba" }),
    ).toBeVisible();
  });

  test("inicia una sesión con las credenciales E2E", async ({ page }) => {
    const email = process.env.E2E_EMAIL;
    const password = process.env.E2E_PASSWORD;

    test.skip(!email || !password, "Requiere E2E_EMAIL y E2E_PASSWORD.");

    await page.goto("/");
    await page.getByRole("button", { name: "Iniciar sesión" }).click();
    await page.getByLabel("Email").fill(email!);
    await page.getByLabel("Contraseña").fill(password!);
    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page.getByRole("button", { name: email! })).toBeVisible();

    await page.goto("/profile");
    await expect(
      page.getByRole("heading", { name: "Perfil bloqueado" }),
    ).toHaveCount(0);
  });
});
