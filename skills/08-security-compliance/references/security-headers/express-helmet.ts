// Express.js Security Headers with Helmet + Rate Limiting
//
// Install: npm install helmet express-rate-limit
// Optional: npm install rate-limit-redis ioredis (for production rate limiting)
//
// [CUSTOMIZE] Search for [CUSTOMIZE] markers and adjust for your app

import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';

const app = express();

// ---------------------------------------------------------------------------
// 1. Helmet — Security Headers
// ---------------------------------------------------------------------------
// Helmet sets a comprehensive set of HTTP security headers automatically.
// The configuration below customizes the defaults for production use.

app.use(
  helmet({
    // Content Security Policy — the most important security header
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],

        // [CUSTOMIZE] Add trusted script sources (CDN, analytics, etc.)
        scriptSrc: [
          "'self'",
          // Nonce will be added per-request (see middleware below)
          (req, res) => `'nonce-${(res as any).locals.cspNonce}'`,
          "'strict-dynamic'",
        ],

        // [CUSTOMIZE] Remove 'unsafe-inline' if you can use nonce-based styles
        styleSrc: ["'self'", "'unsafe-inline'"],

        // [CUSTOMIZE] Add your image CDN domain
        imgSrc: ["'self'", "data:", "https:"],

        // [CUSTOMIZE] Add font CDN domains (e.g., fonts.gstatic.com)
        fontSrc: ["'self'"],

        // [CUSTOMIZE] Add external API domains your frontend calls
        connectSrc: ["'self'"],

        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },

    // HSTS: Force HTTPS for 1 year
    // [CUSTOMIZE] Remove preload until you've verified HTTPS on all subdomains
    strictTransportSecurity: {
      maxAge: 31536000,          // 1 year in seconds
      includeSubDomains: true,
      preload: true,
    },

    // Prevent clickjacking
    frameguard: { action: 'deny' },

    // Prevent MIME type sniffing
    noSniff: true,

    // Control referrer information
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin',
    },

    // Remove X-Powered-By header (information disclosure)
    hidePoweredBy: true,

    // Prevent IE from executing downloads in the site's context
    ieNoOpen: true,

    // XSS filter for older browsers
    xssFilter: true,

    // Don't set X-Download-Options (IE only, mostly obsolete)
    // Don't set X-Permitted-Cross-Domain-Policies (Flash only, obsolete)

    // Cross-Origin policies for resource isolation
    crossOriginEmbedderPolicy: false,   // [CUSTOMIZE] Set to true if you need SharedArrayBuffer
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginResourcePolicy: { policy: 'same-origin' },
  })
);

// ---------------------------------------------------------------------------
// 2. Permissions-Policy (not covered by Helmet)
// ---------------------------------------------------------------------------
// [CUSTOMIZE] Enable features your app actually uses

app.use((req, res, next) => {
  res.setHeader(
    'Permissions-Policy',
    [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'interest-cohort=()',
      'payment=()',            // [CUSTOMIZE] Remove if you use Payment Request API
      'usb=()',
      'bluetooth=()',
      'serial=()',
    ].join(', ')
  );
  next();
});

// ---------------------------------------------------------------------------
// 3. CSP Nonce Middleware
// ---------------------------------------------------------------------------
// Generates a unique nonce per request for inline scripts.
// Use the nonce in your templates: <script nonce="<%= res.locals.cspNonce %>">

app.use((req, res, next) => {
  res.locals.cspNonce = crypto.randomBytes(16).toString('base64');
  next();
});

// ---------------------------------------------------------------------------
// 4. Rate Limiting
// ---------------------------------------------------------------------------

// General API rate limit
// [CUSTOMIZE] Adjust windowMs and max based on your traffic
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,        // 1 minute
  max: 100,                    // [CUSTOMIZE] 100 requests per minute per IP
  message: { error: 'Too many requests. Please try again later.' },
  standardHeaders: true,       // Return RateLimit-* headers
  legacyHeaders: false,        // Disable X-RateLimit-* headers
});

// Strict rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 60 * 1000,        // 1 minute
  max: 5,                      // [CUSTOMIZE] 5 attempts per minute
  message: { error: 'Too many login attempts. Please try again in 1 minute.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

// Password reset rate limit
const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 3,                      // [CUSTOMIZE] 3 reset requests per 15 min
  message: { error: 'Too many password reset requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiters
// [CUSTOMIZE] Adjust route paths to match your API structure
app.use('/api/', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', resetLimiter);

// ---------------------------------------------------------------------------
// 5. Additional Security Middleware
// ---------------------------------------------------------------------------

// Parse JSON bodies with size limit (prevent large payload attacks)
// [CUSTOMIZE] Adjust limit based on your expected payload sizes
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// Disable ETag fingerprinting (optional, minor information disclosure)
app.disable('etag');

// ---------------------------------------------------------------------------
// 6. Production Error Handler (never leak stack traces)
// ---------------------------------------------------------------------------

app.use(
  (
    err: Error & { statusCode?: number },
    req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    const statusCode = err.statusCode || 500;

    // Log full error internally
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}:`, err);

    // Return safe error to client — never expose stack traces in production
    res.status(statusCode).json({
      error: statusCode === 500 ? 'Internal server error' : err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }
);

// ---------------------------------------------------------------------------
// Verification
// ---------------------------------------------------------------------------
// After deploying, verify headers with:
//   curl -I https://your-domain.com
//
// Or use: https://securityheaders.com
// Or use: https://observatory.mozilla.org

export default app;
