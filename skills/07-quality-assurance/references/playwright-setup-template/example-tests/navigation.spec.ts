import { test, expect, type Page, type Locator } from '@playwright/test';

// ─── Page Objects ────────────────────────────────────────────────
// [CUSTOMIZE] Update selectors and URLs to match your app

class NavBar {
  readonly page: Page;
  readonly homeLink: Locator;
  readonly dashboardLink: Locator;
  readonly settingsLink: Locator;
  readonly mobileMenuButton: Locator;
  readonly mobileMenu: Locator;

  constructor(page: Page) {
    this.page = page;
    this.homeLink = page.getByRole('link', { name: 'Home' });
    this.dashboardLink = page.getByRole('link', { name: 'Dashboard' });
    this.settingsLink = page.getByRole('link', { name: 'Settings' });
    this.mobileMenuButton = page.getByRole('button', { name: 'Menu' });
    this.mobileMenu = page.getByRole('navigation', { name: 'Mobile menu' });
  }
}

class HomePage {
  readonly page: Page;
  readonly heading: Locator;
  readonly ctaButton: Locator;

  constructor(page: Page) {
    this.page = page;
    // [CUSTOMIZE] Replace with your actual homepage heading
    this.heading = page.getByRole('heading', { level: 1 });
    this.ctaButton = page.getByRole('link', { name: /get started|sign up/i });
  }

  async expectLoaded() {
    await expect(this.heading).toBeVisible();
    await expect(this.page).toHaveURL('/');
  }
}

class SettingsPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly profileTab: Locator;
  readonly billingTab: Locator;
  readonly notificationsTab: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Settings' });
    this.profileTab = page.getByRole('tab', { name: 'Profile' });
    this.billingTab = page.getByRole('tab', { name: 'Billing' });
    this.notificationsTab = page.getByRole('tab', { name: 'Notifications' });
  }

  async expectLoaded() {
    await expect(this.heading).toBeVisible();
    await expect(this.page).toHaveURL(/.*settings/);
  }
}

// ─── Tests ───────────────────────────────────────────────────────

// [CUSTOMIZE] These tests assume the user is already authenticated.
// Use a storageState fixture or beforeEach login step.

test.describe('Core navigation', () => {
  test.beforeEach(async ({ page }) => {
    // [CUSTOMIZE] Either use storageState for auth or login here
    // Example: await loginAsTestUser(page);
    await page.goto('/');
  });

  test('navigates between main sections via navbar', async ({ page }) => {
    const nav = new NavBar(page);

    // Navigate to Dashboard
    await nav.dashboardLink.click();
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    // Navigate to Settings
    await nav.settingsLink.click();
    await expect(page).toHaveURL(/.*settings/);
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();

    // Navigate back to Home
    await nav.homeLink.click();
    await expect(page).toHaveURL('/');
  });

  test('settings page tabs work correctly', async ({ page }) => {
    const settings = new SettingsPage(page);

    await page.goto('/settings');
    await settings.expectLoaded();

    // Switch to Billing tab
    await settings.billingTab.click();
    await expect(page).toHaveURL(/.*settings.*billing/);

    // Switch to Notifications tab
    await settings.notificationsTab.click();
    await expect(page).toHaveURL(/.*settings.*notifications/);

    // Switch back to Profile tab
    await settings.profileTab.click();
    await expect(page).toHaveURL(/.*settings.*profile/);
  });

  test('browser back/forward navigation works', async ({ page }) => {
    const nav = new NavBar(page);

    // Build navigation history
    await nav.dashboardLink.click();
    await expect(page).toHaveURL(/.*dashboard/);

    await nav.settingsLink.click();
    await expect(page).toHaveURL(/.*settings/);

    // Go back to Dashboard
    await page.goBack();
    await expect(page).toHaveURL(/.*dashboard/);

    // Go forward to Settings
    await page.goForward();
    await expect(page).toHaveURL(/.*settings/);
  });

  test('404 page displays for unknown routes', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');

    // [CUSTOMIZE] Match your 404 page content
    await expect(page.getByText(/not found|404/i)).toBeVisible();
  });
});

test.describe('Mobile navigation', () => {
  test.use({ viewport: { width: 375, height: 812 } }); // iPhone viewport

  test('mobile menu opens and closes', async ({ page }) => {
    const nav = new NavBar(page);

    await page.goto('/');

    // Open mobile menu
    await nav.mobileMenuButton.click();
    await expect(nav.mobileMenu).toBeVisible();

    // Navigate via mobile menu
    await nav.dashboardLink.click();
    await expect(page).toHaveURL(/.*dashboard/);

    // Menu should close after navigation
    await expect(nav.mobileMenu).not.toBeVisible();
  });

  test('mobile menu closes on outside click', async ({ page }) => {
    const nav = new NavBar(page);

    await page.goto('/');

    // Open mobile menu
    await nav.mobileMenuButton.click();
    await expect(nav.mobileMenu).toBeVisible();

    // Click outside the menu (on the page body)
    await page.locator('main').click();
    await expect(nav.mobileMenu).not.toBeVisible();
  });
});
