import { defineConfig, devices } from '@playwright/test';

// [CUSTOMIZE] Set your app's base URL
const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.ts',

  /* Run tests in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Retry failed tests in CI to reduce flake impact */
  retries: process.env.CI ? 2 : 0,

  /* Limit parallel workers in CI to avoid resource contention */
  workers: process.env.CI ? 2 : undefined,

  /* Reporter configuration */
  reporter: process.env.CI
    ? [['html', { open: 'never' }], ['github']]
    : [['html', { open: 'on-failure' }]],

  /* Shared settings for all projects */
  use: {
    baseURL: BASE_URL,

    /* Collect trace on first retry for debugging flaky tests */
    trace: 'on-first-retry',

    /* Screenshot on failure for debugging */
    screenshot: 'only-on-failure',

    /* Video on first retry (useful for CI debugging) */
    video: 'on-first-retry',

    /* Default timeout for actions (click, fill, etc.) */
    actionTimeout: 10_000,

    /* Default timeout for navigation */
    navigationTimeout: 30_000,
  },

  /* Global timeout per test */
  timeout: 60_000,

  /* Configure projects for major browsers + mobile */
  projects: [
    /* ── Desktop browsers ─────────────────────────── */
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* ── Mobile browsers ──────────────────────────── */
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 14'] },
    },
  ],

  /* [CUSTOMIZE] Start your dev server before running tests */
  webServer: {
    command: 'npm run dev',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
