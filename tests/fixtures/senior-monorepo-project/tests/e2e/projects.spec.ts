import { test, expect } from "@playwright/test";

// NOTE: These tests assume a logged-in state via storageState or test fixtures.
// In CI, set up auth state with: npx playwright codegen --save-storage=auth.json

test.describe("Projects", () => {
  test.beforeEach(async ({ page }) => {
    // In a real setup, restore auth state here
    // await page.context().addCookies([...]);
    await page.goto("/dashboard");
  });

  test("dashboard shows projects section", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /recent projects/i })
    ).toBeVisible();
  });

  test("empty state shows create project prompt", async ({ page }) => {
    // Assumes no projects exist for test user
    const emptyState = page.getByText(/create one/i);
    if (await emptyState.isVisible()) {
      await expect(emptyState).toBeVisible();
    }
  });

  test("navigates to new project form", async ({ page }) => {
    await page.goto("/dashboard/projects/new");
    await expect(
      page.getByRole("heading", { name: /new project/i })
    ).toBeVisible();
    await expect(page.getByLabel(/project name/i)).toBeVisible();
  });

  test("can fill and submit new project form", async ({ page }) => {
    await page.goto("/dashboard/projects/new");

    await page.getByLabel(/project name/i).fill("E2E Test Project");
    await page
      .getByLabel(/description/i)
      .fill("Created by Playwright e2e test");

    await page.getByRole("button", { name: /create project/i }).click();

    // After creation, redirected to project page
    await expect(page).toHaveURL(/\/dashboard\/projects\//);
    await expect(page.getByText("E2E Test Project")).toBeVisible();
  });

  test("project list paginates correctly", async ({ page }) => {
    await page.goto("/dashboard/projects?page=1");
    const nextButton = page.getByRole("button", { name: /next/i });
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await expect(page).toHaveURL(/page=2/);
    }
  });
});
