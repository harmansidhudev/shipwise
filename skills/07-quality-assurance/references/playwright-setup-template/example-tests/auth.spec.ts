import { test, expect, type Page, type Locator } from '@playwright/test';

// ─── Page Objects ────────────────────────────────────────────────
// [CUSTOMIZE] Update selectors to match your app's actual UI

class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly forgotPasswordLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.submitButton = page.getByRole('button', { name: 'Sign in' });
    this.errorMessage = page.getByRole('alert');
    this.forgotPasswordLink = page.getByRole('link', { name: 'Forgot password' });
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}

class SignupPage {
  readonly page: Page;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.getByLabel('Full name');
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password', { exact: true });
    this.confirmPasswordInput = page.getByLabel('Confirm password');
    this.submitButton = page.getByRole('button', { name: 'Create account' });
    this.errorMessage = page.getByRole('alert');
  }

  async goto() {
    await this.page.goto('/signup');
  }

  async signup(name: string, email: string, password: string) {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(password);
    await this.submitButton.click();
  }
}

class DashboardPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly userMenu: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Dashboard' });
    this.userMenu = page.getByRole('button', { name: 'User menu' });
    this.logoutButton = page.getByRole('menuitem', { name: 'Log out' });
  }

  async expectLoaded() {
    await expect(this.heading).toBeVisible();
    await expect(this.page).toHaveURL(/.*dashboard/);
  }

  async logout() {
    await this.userMenu.click();
    await this.logoutButton.click();
  }
}

// ─── Tests ───────────────────────────────────────────────────────

// [CUSTOMIZE] Replace test credentials with your test user data
const TEST_USER = {
  name: 'Test User',
  email: 'testuser@example.com',
  password: 'SecureP@ssw0rd!',
};

test.describe('Authentication', () => {
  test('successful login redirects to dashboard', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboard = new DashboardPage(page);

    await loginPage.goto();
    await loginPage.login(TEST_USER.email, TEST_USER.password);

    await dashboard.expectLoaded();
  });

  test('login with wrong password shows error', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(TEST_USER.email, 'WrongPassword123!');

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText(/invalid|incorrect/i);
    await expect(page).toHaveURL(/.*login/);
  });

  test('login with empty fields shows validation errors', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.submitButton.click();

    // Browser or app-level validation should prevent submission
    await expect(page).toHaveURL(/.*login/);
  });

  test('signup creates account and redirects to dashboard', async ({ page }) => {
    const signupPage = new SignupPage(page);
    const dashboard = new DashboardPage(page);

    // [CUSTOMIZE] Use a unique email per test run to avoid conflicts
    const uniqueEmail = `test-${Date.now()}@example.com`;

    await signupPage.goto();
    await signupPage.signup(TEST_USER.name, uniqueEmail, TEST_USER.password);

    await dashboard.expectLoaded();
  });

  test('logout returns to login page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboard = new DashboardPage(page);

    // Login first
    await loginPage.goto();
    await loginPage.login(TEST_USER.email, TEST_USER.password);
    await dashboard.expectLoaded();

    // Logout
    await dashboard.logout();

    await expect(page).toHaveURL(/.*login/);
  });

  test('protected page redirects unauthenticated user to login', async ({ page }) => {
    // [CUSTOMIZE] Replace with a protected route in your app
    await page.goto('/dashboard');

    await expect(page).toHaveURL(/.*login/);
  });
});
