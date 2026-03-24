// Next.js Security Headers Configuration
// Add this to your next.config.js (or next.config.ts)
//
// Install: No additional packages needed
// [CUSTOMIZE] Search for [CUSTOMIZE] markers and adjust for your app

import type { NextConfig } from 'next';
import crypto from 'crypto';

// ---------------------------------------------------------------------------
// Content Security Policy (CSP)
// ---------------------------------------------------------------------------
// Nonce-based CSP: every page load generates a unique nonce. Only scripts
// with that nonce are allowed to execute, blocking injected scripts (XSS).
// ---------------------------------------------------------------------------

/**
 * Generate CSP header value with a nonce for inline scripts.
 * [CUSTOMIZE] Add your CDN domains, analytics domains, etc.
 */
function generateCsp(nonce: string): string {
  const directives = [
    // Only allow resources from your own origin by default
    `default-src 'self'`,

    // Scripts: self + nonce-based inline scripts
    // [CUSTOMIZE] Add trusted script sources (analytics, CDN, etc.)
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,

    // Styles: self + inline styles (needed for most CSS-in-JS libraries)
    // [CUSTOMIZE] Remove 'unsafe-inline' if you can use nonce-based styles
    `style-src 'self' 'unsafe-inline'`,

    // Images: self + data URIs (for inline images) + your CDN
    // [CUSTOMIZE] Add your image CDN domain
    `img-src 'self' data: https:`,

    // Fonts: self + Google Fonts (if used)
    // [CUSTOMIZE] Add font CDN domains
    `font-src 'self'`,

    // API connections: self only (adjust for external APIs)
    // [CUSTOMIZE] Add external API domains
    `connect-src 'self'`,

    // Frames: none by default (prevents clickjacking)
    `frame-src 'none'`,

    // Object/embed: none (prevents Flash/plugin attacks)
    `object-src 'none'`,

    // Base URI: self only (prevents base tag hijacking)
    `base-uri 'self'`,

    // Form actions: self only
    // [CUSTOMIZE] Add external form submission targets if needed
    `form-action 'self'`,

    // Prevent your site from being framed
    `frame-ancestors 'none'`,

    // Block mixed content (HTTP resources on HTTPS page)
    `upgrade-insecure-requests`,
  ];

  return directives.join('; ');
}

// ---------------------------------------------------------------------------
// Security Headers
// ---------------------------------------------------------------------------

const securityHeaders = [
  // HSTS: Force HTTPS for 1 year, include subdomains, allow preload list
  // [CUSTOMIZE] Remove 'preload' until you've verified HTTPS works on all subdomains
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload',
  },

  // Prevent clickjacking — do not allow your site to be embedded in iframes
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },

  // Prevent MIME type sniffing (browser guessing file types)
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },

  // Control how much referrer information is sent
  // strict-origin-when-cross-origin: sends origin only on cross-origin requests
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },

  // Restrict browser features your app doesn't need
  // [CUSTOMIZE] Enable features your app actually uses
  {
    key: 'Permissions-Policy',
    value: [
      'camera=()',           // Disable camera
      'microphone=()',       // Disable microphone
      'geolocation=()',      // Disable geolocation
      'interest-cohort=()',  // Disable FLoC tracking
      'payment=()',          // Disable Payment API — [CUSTOMIZE] remove if you use Payment Request API
      'usb=()',              // Disable USB access
      'bluetooth=()',        // Disable Bluetooth
      'serial=()',           // Disable Serial API
    ].join(', '),
  },

  // Prevent XSS in older browsers (largely superseded by CSP)
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
];

// ---------------------------------------------------------------------------
// Next.js Configuration
// ---------------------------------------------------------------------------

const nextConfig: NextConfig = {
  // Apply security headers to all routes
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },

  // [CUSTOMIZE] Other Next.js config options
  // poweredBy: false removes the X-Powered-By header (information disclosure)
  poweredBy: false,
};

export default nextConfig;

// ---------------------------------------------------------------------------
// Middleware for nonce-based CSP (Next.js 13+ App Router)
// ---------------------------------------------------------------------------
// Create this as middleware.ts in your project root

/*
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Generate a unique nonce for this request
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

  // Build the CSP header with the nonce
  const cspHeader = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: https:`,
    `font-src 'self'`,
    `connect-src 'self'`,       // [CUSTOMIZE] Add external API domains
    `frame-src 'none'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `upgrade-insecure-requests`,
  ].join('; ');

  // Clone the request headers and add the nonce
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  // Create the response with the CSP header
  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  response.headers.set('Content-Security-Policy', cspHeader);

  return response;
}

// [CUSTOMIZE] Adjust the matcher to exclude static files and API routes if needed
export const config = {
  matcher: [
    // Match all paths except static files and Next.js internals
    {
      source: '/((?!_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
*/

// ---------------------------------------------------------------------------
// Using the nonce in your layout (App Router)
// ---------------------------------------------------------------------------

/*
// app/layout.tsx
import { headers } from 'next/headers';
import Script from 'next/script';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const nonce = headersList.get('x-nonce') || '';

  return (
    <html lang="en">
      <body>
        {children}
        {/* Example: Analytics script with nonce *\/}
        <Script
          nonce={nonce}
          strategy="afterInteractive"
          src="https://analytics.example.com/script.js"  // [CUSTOMIZE]
        />
      </body>
    </html>
  );
}
*/
