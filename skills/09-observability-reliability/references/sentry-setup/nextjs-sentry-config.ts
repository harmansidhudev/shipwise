// Next.js Sentry Configuration
// Complete setup for error tracking, performance monitoring, source maps, releases, and user context.
//
// Install:
//   npx @sentry/wizard -i nextjs
//   — OR manually —
//   npm install @sentry/nextjs
//
// Files created by this config:
//   - sentry.client.config.ts (this file pattern — client-side)
//   - sentry.server.config.ts (server-side)
//   - sentry.edge.config.ts (edge runtime)
//   - next.config.ts (withSentryConfig wrapper)
//   - instrumentation.ts (Node.js instrumentation hook)
//
// [CUSTOMIZE] Search for [CUSTOMIZE] markers and adjust for your app

// =============================================================================
// sentry.client.config.ts — Client-side Sentry initialization
// =============================================================================

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  // [CUSTOMIZE] Your Sentry DSN from: Settings > Projects > [project] > Client Keys
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || '[CUSTOMIZE]',

  // [CUSTOMIZE] Environment tag — used to filter issues in Sentry dashboard
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV,

  // Release tracking — ties errors to specific deploys
  // [CUSTOMIZE] Set SENTRY_RELEASE in your CI/CD pipeline (e.g., git SHA)
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE || process.env.VERCEL_GIT_COMMIT_SHA,

  // ---------------------------------------------------------------------------
  // Performance Monitoring
  // ---------------------------------------------------------------------------

  // [CUSTOMIZE] Adjust sample rates for your traffic volume
  // Development: 1.0 (capture everything)
  // Production <1K users: 0.2-0.5
  // Production >1K users: 0.05-0.1
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Session Replay — records user sessions for error reproduction
  // [CUSTOMIZE] Adjust sample rates based on plan limits
  replaysSessionSampleRate: 0.01, // 1% of sessions
  replaysOnErrorSampleRate: 1.0,  // 100% of sessions with errors

  integrations: [
    // Captures console breadcrumbs
    Sentry.breadcrumbsIntegration({
      console: true,
      dom: true,
      fetch: true,
      history: true,
    }),

    // Session replay for debugging
    Sentry.replayIntegration({
      // [CUSTOMIZE] Privacy settings
      maskAllText: false,      // Set true for HIPAA/sensitive apps
      blockAllMedia: false,    // Set true to hide images/videos
      maskAllInputs: true,     // Always mask input fields
    }),
  ],

  // ---------------------------------------------------------------------------
  // Filtering
  // ---------------------------------------------------------------------------

  // Ignore known non-actionable errors
  ignoreErrors: [
    // Browser extensions
    /extensions\//i,
    /^chrome-extension:\/\//,
    // Network errors (user's connection, not your fault)
    'Network request failed',
    'Failed to fetch',
    'NetworkError',
    'AbortError',
    // Next.js hydration (usually harmless)
    /hydration/i,
    // [CUSTOMIZE] Add your own patterns
  ],

  // Don't send events from these URLs
  denyUrls: [
    /extensions\//i,
    /^chrome:\/\//i,
    /^moz-extension:\/\//i,
    // [CUSTOMIZE] Add third-party scripts you don't control
  ],

  // ---------------------------------------------------------------------------
  // Before sending — last chance to modify or drop events
  // ---------------------------------------------------------------------------
  beforeSend(event, hint) {
    // Strip PII from error messages
    if (event.message) {
      // [CUSTOMIZE] Add patterns for your app's sensitive data
      event.message = event.message.replace(
        /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
        '[EMAIL_REDACTED]'
      );
    }
    return event;
  },
});

// =============================================================================
// sentry.server.config.ts — Server-side Sentry initialization
// =============================================================================

// import * as Sentry from '@sentry/nextjs';
//
// Sentry.init({
//   dsn: process.env.SENTRY_DSN || '[CUSTOMIZE]',
//   environment: process.env.VERCEL_ENV || process.env.NODE_ENV,
//   release: process.env.SENTRY_RELEASE || process.env.VERCEL_GIT_COMMIT_SHA,
//   tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
//
//   // Server-side specific: capture unhandled promise rejections
//   integrations: [
//     Sentry.extraErrorDataIntegration({ depth: 5 }),
//   ],
//
//   beforeSend(event) {
//     // [CUSTOMIZE] Scrub server-side PII (DB connection strings, tokens, etc.)
//     if (event.request?.headers) {
//       delete event.request.headers['authorization'];
//       delete event.request.headers['cookie'];
//     }
//     return event;
//   },
// });

// =============================================================================
// instrumentation.ts — Next.js instrumentation hook (required for App Router)
// =============================================================================

// export async function register() {
//   if (process.env.NEXT_RUNTIME === 'nodejs') {
//     await import('./sentry.server.config');
//   }
//   if (process.env.NEXT_RUNTIME === 'edge') {
//     await import('./sentry.edge.config');
//   }
// }
//
// export const onRequestError = Sentry.captureRequestError;

// =============================================================================
// next.config.ts — Wrap your Next.js config with Sentry
// =============================================================================

// import { withSentryConfig } from '@sentry/nextjs';
//
// const nextConfig: NextConfig = {
//   // [CUSTOMIZE] Your existing Next.js config
// };
//
// export default withSentryConfig(nextConfig, {
//   // Upload source maps to Sentry during build
//   // [CUSTOMIZE] Set these in your CI environment variables
//   org: '[CUSTOMIZE] your-sentry-org',
//   project: '[CUSTOMIZE] your-sentry-project',
//   authToken: process.env.SENTRY_AUTH_TOKEN,
//
//   // Silences source map upload logs during build
//   silent: !process.env.CI,
//
//   // Hides source maps from clients (recommended for production)
//   hideSourceMaps: true,
//
//   // Automatically instrument API routes and server components
//   autoInstrumentServerFunctions: true,
//   autoInstrumentMiddleware: true,
//   autoInstrumentAppDirectory: true,
//
//   // Tree-shake Sentry logger in production
//   disableLogger: true,
//
//   // [CUSTOMIZE] Widen the upload scope if using a monorepo
//   // widenClientFileUpload: true,
//
//   // Tunnel Sentry events through your Next.js server to avoid ad-blockers
//   // [CUSTOMIZE] Uncomment if ad-blockers are dropping your error reports
//   // tunnelRoute: '/monitoring',
// });

// =============================================================================
// User context — Call this after authentication
// =============================================================================

// import * as Sentry from '@sentry/nextjs';
//
// /** Call after login / session validation to attach user to all future events */
// export function setSentryUser(user: { id: string; email?: string; username?: string }) {
//   Sentry.setUser({
//     id: user.id,
//     // [CUSTOMIZE] Include email only if your privacy policy allows it
//     email: user.email,
//     username: user.username,
//   });
// }
//
// /** Call on logout */
// export function clearSentryUser() {
//   Sentry.setUser(null);
// }

// =============================================================================
// Custom error boundary — Catch React rendering errors with a friendly UI
// =============================================================================

// // app/global-error.tsx (App Router)
// 'use client';
//
// import * as Sentry from '@sentry/nextjs';
// import { useEffect } from 'react';
//
// export default function GlobalError({
//   error,
//   reset,
// }: {
//   error: Error & { digest?: string };
//   reset: () => void;
// }) {
//   useEffect(() => {
//     Sentry.captureException(error);
//   }, [error]);
//
//   return (
//     <html>
//       <body>
//         {/* [CUSTOMIZE] Style this to match your app's design */}
//         <div style={{ padding: '2rem', textAlign: 'center' }}>
//           <h2>Something went wrong</h2>
//           <p>Our team has been notified and is working on a fix.</p>
//           <button onClick={reset}>Try again</button>
//         </div>
//       </body>
//     </html>
//   );
// }

// =============================================================================
// CI/CD: Source map upload (GitHub Actions example)
// =============================================================================

// # .github/workflows/deploy.yml (add to your existing workflow)
// #
// # env:
// #   SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
// #   SENTRY_ORG: [CUSTOMIZE] your-sentry-org
// #   SENTRY_PROJECT: [CUSTOMIZE] your-sentry-project
// #   SENTRY_RELEASE: ${{ github.sha }}
// #
// # steps:
// #   - name: Build with source maps
// #     run: npm run build
// #     env:
// #       NEXT_PUBLIC_SENTRY_RELEASE: ${{ github.sha }}
// #
// #   - name: Create Sentry release
// #     run: |
// #       npx @sentry/cli releases new ${{ github.sha }}
// #       npx @sentry/cli releases set-commits ${{ github.sha }} --auto
// #       npx @sentry/cli releases finalize ${{ github.sha }}
// #
// #   - name: Deploy
// #     run: # your deploy command
// #
// #   - name: Notify Sentry of deploy
// #     run: |
// #       npx @sentry/cli releases deploys ${{ github.sha }} new -e production
