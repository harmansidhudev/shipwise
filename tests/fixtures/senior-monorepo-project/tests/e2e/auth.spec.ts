import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("redirects unauthenticated users to sign-in", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("sign-in page renders correctly", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page).toHaveTitle(/Sign in/i);
    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
  });

  test("sign-up page renders correctly", async ({ page }) => {
    await page.goto("/sign-up");
    await expect(page).toHaveTitle(/Sign up/i);
  });

  test("home page has sign-in and sign-up links", async ({ page }) => {
    await page.goto("/");
    const signInLink = page.getByRole("link", { name: /sign in/i });
    const signUpLink = page.getByRole("link", { name: /get started/i });

    await expect(signInLink).toBeVisible();
    await expect(signUpLink).toBeVisible();
  });

  test("sign-in link navigates to /sign-in", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /sign in/i }).click();
    await expect(page).toHaveURL("/sign-in");
  });
});
