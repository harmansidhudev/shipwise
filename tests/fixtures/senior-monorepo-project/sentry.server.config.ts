import * as Sentry from "@sentry/nextjs";

// TODO: Add Sentry DSN — get it from https://sentry.io/settings/<org>/projects/<project>/keys/
// Without a DSN, Sentry is installed but will NOT capture any server-side errors.
Sentry.init({
  dsn: "",

  // Performance monitoring
  tracesSampleRate: 0.1,

  // Enable distributed tracing
  tracePropagationTargets: [
    "localhost",
    /^https:\/\/app\.acme\.com/,
    /^https:\/\/api\.acme\.com/,
  ],

  debug: process.env.NODE_ENV === "development",

  environment: process.env.NODE_ENV,

  // Capture unhandled promise rejections
  integrations: [
    Sentry.prismaIntegration(),
  ],

  beforeSend(event, hint) {
    // Scrub PII from error events
    if (event.request?.cookies) {
      event.request.cookies = {};
    }
    if (event.user) {
      delete event.user.ip_address;
    }
    return event;
  },
});
