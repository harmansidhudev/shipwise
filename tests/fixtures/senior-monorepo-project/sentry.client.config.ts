import * as Sentry from "@sentry/nextjs";

// TODO: Add Sentry DSN — get it from https://sentry.io/settings/<org>/projects/<project>/keys/
// Without a DSN, Sentry is installed but will NOT capture any errors.
Sentry.init({
  dsn: "",

  // Performance monitoring — set sample rate (0.0 to 1.0)
  tracesSampleRate: 0.1,

  // Session replay — disabled until DSN is configured
  replaysSessionSampleRate: 0.0,
  replaysOnErrorSampleRate: 0.0,

  // Debug mode for local development
  debug: process.env.NODE_ENV === "development",

  environment: process.env.NODE_ENV,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Filter out known noise
  ignoreErrors: [
    "ResizeObserver loop limit exceeded",
    "Non-Error exception captured",
  ],

  beforeSend(event) {
    // Drop events in development
    if (process.env.NODE_ENV === "development") {
      return null;
    }
    return event;
  },
});
