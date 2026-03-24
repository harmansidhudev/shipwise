# OWASP Top 10 (2025) Checklist

## When to use
Reference this checklist during security audits, before launching to production, during code reviews of security-sensitive features, or when onboarding a new codebase. Walk through each category and verify your app is not vulnerable.

## Decision framework

```
Which OWASP category to prioritize first?
├── Handling user auth/sessions? → A01 (Access Control) + A07 (Auth Failures)
├── Accepting user input (forms, APIs)? → A03 (Injection) + A10 (SSRF)
├── Storing sensitive data (PII, passwords)? → A02 (Cryptographic Failures)
├── Using third-party packages? → A06 (Vulnerable Components) + A08 (Integrity)
├── Running in cloud/containers? → A05 (Security Misconfiguration)
├── Processing user-uploaded files/URLs? → A10 (SSRF) + A04 (Insecure Design)
└── All apps → A09 (Logging Failures) is always relevant
```

---

## Copy-paste template

### A01: Broken Access Control

**What it is**: Users can act outside their intended permissions — accessing other users' data, modifying records they shouldn't, or escalating privileges.

**Verification steps**:
1. Try accessing `/api/users/OTHER_USER_ID` while logged in as a different user
2. Try changing `?role=admin` in API requests as a regular user
3. Try accessing admin routes without admin privileges
4. Try IDOR attacks: increment IDs in API URLs to access other users' resources

**Remediation — Access control middleware**:

```ts
// middleware/authorize.ts
// [CUSTOMIZE] Adapt to your ORM and user model

import { Request, Response, NextFunction } from 'express';

/**
 * Verify the authenticated user owns the requested resource.
 * Prevents IDOR (Insecure Direct Object Reference) attacks.
 */
export function ownerOnly(resourceFetcher: (id: string) => Promise<{ userId: string } | null>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const resource = await resourceFetcher(req.params.id);

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    // [CUSTOMIZE] Replace req.user.id with your auth user accessor
    if (resource.userId !== req.user!.id) {
      // Log the unauthorized access attempt
      console.warn(`Access denied: user ${req.user!.id} tried to access resource owned by ${resource.userId}`);
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();
  };
}

/**
 * Role-based access control middleware.
 * [CUSTOMIZE] Adapt roles to your application's permission model
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    // [CUSTOMIZE] Replace req.user.role with your role accessor
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      console.warn(`Role check failed: user ${req.user?.id} with role ${req.user?.role} denied access requiring ${allowedRoles.join(',')}`);
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

// Usage:
// router.get('/api/posts/:id', authenticate, ownerOnly(getPostById), handler);
// router.delete('/api/admin/users/:id', authenticate, requireRole('admin'), handler);
```

**Default-deny access control pattern**:

```ts
// middleware/default-deny.ts
// [CUSTOMIZE] Define your public routes

const PUBLIC_ROUTES = [
  'GET /api/health',
  'POST /api/auth/login',
  'POST /api/auth/register',
  'POST /api/auth/forgot-password',
];

export function defaultDeny(req: Request, res: Response, next: NextFunction) {
  const routeKey = `${req.method} ${req.path}`;

  // Allow public routes
  if (PUBLIC_ROUTES.some(route => routeKey.startsWith(route))) {
    return next();
  }

  // Everything else requires authentication
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  next();
}
```

---

### A02: Cryptographic Failures

**What it is**: Sensitive data exposed due to weak or missing encryption — passwords stored in plain text, data transmitted over HTTP, weak hashing algorithms.

**Verification steps**:
1. Check that all passwords use Argon2id or bcrypt (never MD5, SHA-1, or SHA-256 alone)
2. Verify TLS is enforced everywhere (no HTTP endpoints)
3. Check that sensitive data at rest is encrypted (database fields for PII, SSN, etc.)
4. Ensure no secrets in source code or logs

**Remediation — Encryption utilities**:

```ts
// lib/crypto.ts
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

// [CUSTOMIZE] Store this in an environment variable, not in code
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!; // 32-byte hex string

/**
 * Encrypt sensitive data at rest (PII, tokens, etc.)
 * Uses AES-256-GCM for authenticated encryption
 */
export function encrypt(plaintext: string): string {
  const iv = randomBytes(16);
  const key = Buffer.from(ENCRYPTION_KEY, 'hex');
  const cipher = createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  // Format: iv:authTag:ciphertext
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decrypt(encryptedStr: string): string {
  const [ivHex, authTagHex, ciphertext] = encryptedStr.split(':');
  const key = Buffer.from(ENCRYPTION_KEY, 'hex');
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

  let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Generate a new encryption key: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### A03: Injection

**What it is**: Untrusted data sent to an interpreter as part of a command or query — SQL injection, NoSQL injection, OS command injection, XSS.

**Verification steps**:
1. Try `' OR 1=1 --` in login forms and search fields
2. Try `<script>alert(1)</script>` in text inputs that render output
3. Search codebase for string concatenation in SQL queries
4. Check that all ORM queries use parameterized inputs

**Remediation — Parameterized queries + input sanitization**:

```ts
// WRONG — vulnerable to SQL injection
const user = await db.query(`SELECT * FROM users WHERE email = '${email}'`);

// CORRECT — parameterized query
const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);

// CORRECT — ORM with parameterized input (Prisma)
const user = await prisma.user.findUnique({ where: { email } });

// CORRECT — ORM with parameterized input (Drizzle)
const user = await db.select().from(users).where(eq(users.email, email));
```

```ts
// lib/sanitize.ts
// [CUSTOMIZE] Install: npm install dompurify jsdom isomorphic-dompurify

import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize user-submitted HTML to prevent XSS.
 * Allows safe formatting tags, strips everything else.
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'code', 'pre'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    // [CUSTOMIZE] Add or remove allowed tags/attributes
  });
}

/**
 * Strip ALL HTML — for fields that should never contain markup.
 */
export function stripHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [] });
}
```

---

### A04: Insecure Design

**What it is**: Missing or ineffective security controls at the design level — no rate limiting, no account lockout, no abuse limits, predictable resource IDs.

**Verification steps**:
1. Can users create unlimited resources (spam, DoS)?
2. Are there business logic abuse scenarios (e.g., applying a coupon 1000 times)?
3. Are reset tokens sufficiently random and time-limited?
4. Is there a threat model document for critical flows?

**Remediation — Rate limiting and abuse prevention**:

```ts
// [CUSTOMIZE] Adapt limits to your use case
// See references/auth-hardening-checklist.md for full rate limiting setup

// Business logic abuse prevention pattern
export function validateBusinessRule(req: Request, res: Response, next: NextFunction) {
  // Example: Limit coupon usage
  const MAX_COUPONS_PER_ORDER = 1;
  if (req.body.coupons?.length > MAX_COUPONS_PER_ORDER) {
    return res.status(400).json({ error: 'Maximum one coupon per order' });
  }
  next();
}
```

---

### A05: Security Misconfiguration

**What it is**: Default credentials, unnecessary features enabled, overly permissive CORS, verbose error messages exposing stack traces, missing security headers.

**Verification steps**:
1. Check for default credentials on databases, admin panels, third-party services
2. Verify CORS is restrictive (`Access-Control-Allow-Origin` is NOT `*` in production)
3. Confirm error responses don't leak stack traces in production
4. Check that debug mode / development flags are OFF in production
5. Verify all security headers are present (see security-headers templates)

**Remediation — CORS and error handling config**:

```ts
// [CUSTOMIZE] Replace with your actual frontend origin(s)
const CORS_CONFIG = {
  origin: process.env.NODE_ENV === 'production'
    ? ['https://your-app.com']           // [CUSTOMIZE] Your production domain(s)
    : ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
};

// Production error handler — never leak stack traces
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;

  // Log full error internally
  console.error('Unhandled error:', err);

  // Return safe error to client
  res.status(statusCode).json({
    error: statusCode === 500 ? 'Internal server error' : err.message,
    // Never send stack traces in production
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});
```

---

### A06: Vulnerable and Outdated Components

**What it is**: Using libraries with known security vulnerabilities, or outdated frameworks that no longer receive security patches.

**Verification steps**:
1. Run `npm audit` — should show 0 high/critical
2. Check that Dependabot or Renovate is configured
3. Verify no end-of-life frameworks (e.g., Express 3.x, Node 14.x)
4. Run `npx is-website-vulnerable` against your production URL

**Remediation**: See `references/dependency-scanning-setup.md` for full setup.

---

### A07: Identification and Authentication Failures

**What it is**: Weak authentication mechanisms — no brute-force protection, weak passwords allowed, insecure session management, missing MFA.

**Verification steps**:
1. Try logging in >10 times rapidly with wrong password — should be rate-limited
2. Try setting password to "password123" — should be rejected
3. Check session tokens: are they random, sufficiently long, rotated on login?
4. Verify logout actually invalidates the session server-side

**Remediation**: See `references/auth-hardening-checklist.md` for complete auth hardening.

---

### A08: Software and Data Integrity Failures

**What it is**: Code and infrastructure that doesn't verify integrity — CI/CD pipelines without integrity checks, auto-updates without signature verification, deserialization of untrusted data.

**Verification steps**:
1. Is `package-lock.json` / `pnpm-lock.yaml` committed and verified in CI?
2. Are CI/CD pipeline dependencies pinned to specific versions/hashes?
3. Is there any use of `eval()`, `Function()`, or unsafe deserialization?
4. Are subresource integrity (SRI) hashes used for CDN scripts?

**Remediation — Lock file verification in CI**:

```yaml
# .github/workflows/ci.yml (add to existing CI)
# [CUSTOMIZE] Choose npm or pnpm

- name: Verify lock file integrity
  run: |
    # Fail if lock file is out of sync with package.json
    npm ci --ignore-scripts
    # Or for pnpm: pnpm install --frozen-lockfile

- name: Check for eval usage
  run: |
    # Fail if eval() or Function() constructor found in source
    if grep -rn 'eval(' --include='*.ts' --include='*.js' src/; then
      echo "ERROR: eval() usage detected. Remove it."
      exit 1
    fi
```

---

### A09: Security Logging and Monitoring Failures

**What it is**: Not logging security-relevant events, or not monitoring/alerting on them — failed logins, access control failures, input validation failures go unnoticed.

**Verification steps**:
1. Are failed login attempts logged with timestamp, IP, and username?
2. Are access control failures (403s) logged?
3. Are there alerts for >10 failed logins from one IP in 5 minutes?
4. Are logs stored securely and retained for at least 90 days?

**Remediation — Security event logging**:

```ts
// lib/security-logger.ts
// [CUSTOMIZE] Replace with your logging library (winston, pino, etc.)

interface SecurityEvent {
  event: string;
  userId?: string;
  ip: string;
  userAgent: string;
  details?: Record<string, unknown>;
  severity: 'info' | 'warn' | 'critical';
}

export function logSecurityEvent(event: SecurityEvent): void {
  const entry = {
    timestamp: new Date().toISOString(),
    type: 'SECURITY',
    ...event,
  };

  // [CUSTOMIZE] Send to your logging service (Datadog, Sentry, CloudWatch, etc.)
  if (event.severity === 'critical') {
    console.error(JSON.stringify(entry));
    // TODO: trigger alert (PagerDuty, Slack webhook, etc.)
  } else {
    console.log(JSON.stringify(entry));
  }
}

// Usage examples:
// logSecurityEvent({ event: 'LOGIN_FAILED', ip: req.ip, userAgent: req.headers['user-agent'], severity: 'warn' });
// logSecurityEvent({ event: 'ACCESS_DENIED', userId: req.user.id, ip: req.ip, userAgent: req.headers['user-agent'], severity: 'warn' });
// logSecurityEvent({ event: 'RATE_LIMIT_HIT', ip: req.ip, userAgent: req.headers['user-agent'], severity: 'critical' });
```

---

### A10: Server-Side Request Forgery (SSRF)

**What it is**: The application fetches a URL provided by the user without validation, allowing attackers to make the server access internal services (cloud metadata endpoints, internal APIs, localhost services).

**Verification steps**:
1. Does your app fetch URLs from user input (webhooks, image URLs, URL previews)?
2. Try submitting `http://169.254.169.254/latest/meta-data/` (AWS metadata)
3. Try submitting `http://localhost:3000/api/admin/` as a webhook URL
4. Try `http://[::1]:3000/` (IPv6 localhost)

**Remediation — SSRF protection**:

```ts
// lib/ssrf-guard.ts
import { URL } from 'url';
import dns from 'dns/promises';

// [CUSTOMIZE] Add any additional internal ranges for your infrastructure
const BLOCKED_RANGES = [
  /^127\./,                         // Loopback
  /^10\./,                          // Private
  /^172\.(1[6-9]|2\d|3[01])\./,    // Private
  /^192\.168\./,                    // Private
  /^169\.254\./,                    // Link-local / cloud metadata
  /^0\./,                           // Current network
  /^::1$/,                          // IPv6 loopback
  /^fc00:/i,                        // IPv6 private
  /^fe80:/i,                        // IPv6 link-local
];

/**
 * Validate a user-provided URL is safe to fetch (not internal/private).
 * Call this BEFORE making any server-side HTTP request to a user-supplied URL.
 */
export async function validateExternalUrl(urlString: string): Promise<{ safe: boolean; reason?: string }> {
  let parsed: URL;
  try {
    parsed = new URL(urlString);
  } catch {
    return { safe: false, reason: 'Invalid URL' };
  }

  // Only allow http and https
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return { safe: false, reason: 'Only HTTP(S) URLs are allowed' };
  }

  // Resolve DNS to check actual IP (prevents DNS rebinding)
  try {
    const addresses = await dns.resolve4(parsed.hostname);
    for (const addr of addresses) {
      if (BLOCKED_RANGES.some(range => range.test(addr))) {
        return { safe: false, reason: 'URL resolves to a private/internal address' };
      }
    }
  } catch {
    return { safe: false, reason: 'DNS resolution failed' };
  }

  return { safe: true };
}

// Usage:
// const { safe, reason } = await validateExternalUrl(req.body.webhookUrl);
// if (!safe) return res.status(400).json({ error: reason });
```

---

## Customization notes

- **Priority order**: Start with A01 (Access Control) and A03 (Injection) — they account for the majority of real-world breaches.
- **SaaS apps**: Pay extra attention to A01 (multi-tenant isolation) and A07 (auth).
- **API-only services**: Focus on A03 (injection), A05 (misconfiguration), and A10 (SSRF).
- **Static sites**: Primarily concerned with A06 (vulnerable dependencies) and A05 (security headers).

## Companion tools

- `agamm/claude-code-owasp` — Automated OWASP scanning integrated with Claude Code
- `unicodeveloper/shannon` — Interactive pen testing assistant
- `trailofbits/skills` — Security-focused analysis skills
- `anthropics/claude-code-security-review` — Automated security review
