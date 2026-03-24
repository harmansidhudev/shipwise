// Express.js Sentry Configuration
// Complete setup for error tracking, performance monitoring, request context, and user context.
//
// Install:
//   npm install @sentry/node @sentry/profiling-node
//
// [CUSTOMIZE] Search for [CUSTOMIZE] markers and adjust for your app

import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import express, { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// =============================================================================
// Step 1: Initialize Sentry BEFORE importing any other modules
// This must be at the very top of your entry file (e.g., src/index.ts)
// =============================================================================

Sentry.init({
  // [CUSTOMIZE] Your Sentry DSN from: Settings > Projects > [project] > Client Keys
  dsn: process.env.SENTRY_DSN || '[CUSTOMIZE]',

  // [CUSTOMIZE] Environment tag
  environment: process.env.NODE_ENV || 'development',

  // Release tracking — ties errors to specific deploys
  // [CUSTOMIZE] Set SENTRY_RELEASE in your CI/CD pipeline (e.g., git SHA)
  release: process.env.SENTRY_RELEASE,

  // ---------------------------------------------------------------------------
  // Performance Monitoring
  // ---------------------------------------------------------------------------

  // [CUSTOMIZE] Adjust sample rates for your traffic volume
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Profiling — shows CPU time per function (helps find slow code)
  // [CUSTOMIZE] Enable if on a plan that supports profiling
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  integrations: [
    // CPU profiling integration
    nodeProfilingIntegration(),

    // Capture breadcrumbs from console, HTTP, and DB queries
    Sentry.consoleIntegration(),
    Sentry.httpIntegration({ tracing: true }),

    // [CUSTOMIZE] Add database instrumentation
    // Sentry.prismaIntegration(),     // If using Prisma
    // Sentry.mongoIntegration(),      // If using MongoDB
    // Sentry.postgresIntegration(),   // If using pg
  ],

  // ---------------------------------------------------------------------------
  // Filtering
  // ---------------------------------------------------------------------------

  ignoreErrors: [
    // Health check "errors" (not real errors)
    'HealthCheckError',
    // Client disconnect (not your fault)
    'ECONNRESET',
    'EPIPE',
    // [CUSTOMIZE] Add your own patterns
  ],

  // ---------------------------------------------------------------------------
  // Before sending — scrub sensitive data
  // ---------------------------------------------------------------------------
  beforeSend(event) {
    // Remove sensitive headers
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
      delete event.request.headers['x-api-key'];
    }

    // Remove sensitive query params
    if (event.request?.query_string) {
      // [CUSTOMIZE] Add sensitive param names
      const sensitiveParams = ['token', 'key', 'secret', 'password'];
      const params = new URLSearchParams(event.request.query_string);
      sensitiveParams.forEach((p) => {
        if (params.has(p)) params.set(p, '[REDACTED]');
      });
      event.request.query_string = params.toString();
    }

    // Scrub emails from error messages
    if (event.message) {
      event.message = event.message.replace(
        /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
        '[EMAIL_REDACTED]'
      );
    }

    return event;
  },

  // ---------------------------------------------------------------------------
  // Before sending breadcrumbs — filter noisy breadcrumbs
  // ---------------------------------------------------------------------------
  beforeBreadcrumb(breadcrumb) {
    // Filter out health check requests from breadcrumbs
    if (
      breadcrumb.category === 'http' &&
      breadcrumb.data?.url?.includes('/health')
    ) {
      return null;
    }
    return breadcrumb;
  },
});

// =============================================================================
// Step 2: Express app setup with Sentry middleware
// =============================================================================

const app = express();

// Sentry request handler — MUST be the first middleware
// Adds request data to Sentry scope for every request
Sentry.setupExpressErrorHandler(app);

// ---------------------------------------------------------------------------
// Correlation ID middleware — generate or propagate a unique request ID
// ---------------------------------------------------------------------------
app.use((req: Request, res: Response, next: NextFunction) => {
  const correlationId =
    (req.headers['x-correlation-id'] as string) || crypto.randomUUID();

  req.headers['x-correlation-id'] = correlationId;
  res.setHeader('x-correlation-id', correlationId);

  // Attach correlation ID to Sentry scope
  Sentry.getCurrentScope().setTag('correlationId', correlationId);

  next();
});

// ---------------------------------------------------------------------------
// User context middleware — attach authenticated user to Sentry
// [CUSTOMIZE] Adapt to your auth system
// ---------------------------------------------------------------------------
app.use((req: Request, _res: Response, next: NextFunction) => {
  // [CUSTOMIZE] Replace with your auth user accessor
  const user = (req as any).user;

  if (user) {
    Sentry.setUser({
      id: user.id,
      // [CUSTOMIZE] Include email only if your privacy policy allows
      email: user.email,
      username: user.username,
    });
  }

  next();
});

// ---------------------------------------------------------------------------
// Your routes go here
// ---------------------------------------------------------------------------

// [CUSTOMIZE] Your application routes
// app.use('/api', apiRouter);

// ---------------------------------------------------------------------------
// Example: Manually capture errors with extra context
// ---------------------------------------------------------------------------

// In any route handler or service:
//
// try {
//   await someRiskyOperation();
// } catch (error) {
//   Sentry.withScope((scope) => {
//     scope.setTag('operation', 'payment_processing');
//     scope.setContext('payment', {
//       amount: order.amount,
//       currency: order.currency,
//       // Never log full card numbers, tokens, etc.
//       orderId: order.id,
//     });
//     scope.setLevel('error');
//     Sentry.captureException(error);
//   });
//
//   // Still handle the error for the user
//   res.status(500).json({ error: 'Payment processing failed' });
// }

// ---------------------------------------------------------------------------
// Global error handler — MUST be after all routes and other middleware
// ---------------------------------------------------------------------------
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  // Sentry already captured the error via setupExpressErrorHandler
  // This handler just sends the response

  const statusCode = (err as any).statusCode || 500;
  const correlationId = req.headers['x-correlation-id'];

  // [CUSTOMIZE] Adjust error response format
  res.status(statusCode).json({
    error: {
      message:
        process.env.NODE_ENV === 'production'
          ? 'Internal server error'
          : err.message,
      correlationId,
    },
  });
});

// =============================================================================
// Step 3: Graceful shutdown with Sentry flush
// =============================================================================

const server = app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
});

async function gracefulShutdown(signal: string) {
  console.log(`${signal} received. Starting graceful shutdown...`);

  // Stop accepting new connections
  server.close(() => {
    console.log('HTTP server closed');
  });

  // Flush pending Sentry events (give it 2 seconds)
  await Sentry.close(2000);

  process.exit(0);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// =============================================================================
// CI/CD: Source map upload (GitHub Actions)
// =============================================================================

// # .github/workflows/deploy.yml
// #
// # env:
// #   SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
// #   SENTRY_ORG: [CUSTOMIZE] your-sentry-org
// #   SENTRY_PROJECT: [CUSTOMIZE] your-sentry-project
// #
// # steps:
// #   - name: Build
// #     run: npm run build
// #
// #   - name: Upload source maps
// #     run: |
// #       npx @sentry/cli releases new ${{ github.sha }}
// #       npx @sentry/cli releases files ${{ github.sha }} upload-sourcemaps ./dist
// #       npx @sentry/cli releases set-commits ${{ github.sha }} --auto
// #       npx @sentry/cli releases finalize ${{ github.sha }}
// #
// #   - name: Deploy
// #     run: # your deploy command
// #
// #   - name: Mark deploy
// #     run: |
// #       npx @sentry/cli releases deploys ${{ github.sha }} new -e production

export default app;
