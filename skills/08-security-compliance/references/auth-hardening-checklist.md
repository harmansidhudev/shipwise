# Auth Hardening Checklist

## When to use
Reference this when implementing authentication for a new project, reviewing auth security of an existing app, or hardening login/session/password flows before a production launch.

## Decision framework

```
What auth component are you working on?
├── Password storage → Argon2id hashing (Section 1)
├── Login endpoint → Rate limiting (Section 2)
├── Session management → Secure cookie config (Section 3)
├── Forms / state changes → CSRF protection (Section 4)
├── Password policy → HaveIBeenPwned check (Section 5)
└── High-value accounts → MFA / TOTP (Section 6)
```

---

## Copy-paste template

### 1. Argon2id Password Hashing

```ts
// lib/password.ts
// Install: npm install argon2
// [CUSTOMIZE] Tune parameters based on your server's CPU/RAM

import argon2 from 'argon2';

const HASH_OPTIONS: argon2.Options = {
  type: argon2.argon2id,     // Argon2id — resistant to both side-channel and GPU attacks
  memoryCost: 65536,          // 64 MB — [CUSTOMIZE] increase if server has >4 GB RAM
  timeCost: 3,                // 3 iterations — [CUSTOMIZE] increase for higher security (slower)
  parallelism: 4,             // 4 threads — [CUSTOMIZE] match your CPU core count
  hashLength: 32,             // 256-bit output
};

/**
 * Hash a password for storage. Returns a string containing algorithm,
 * parameters, salt, and hash — safe to store directly in your database.
 */
export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, HASH_OPTIONS);
}

/**
 * Verify a password against a stored hash.
 * Returns true if the password matches.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    return await argon2.verify(storedHash, password);
  } catch {
    return false;
  }
}

/**
 * Check if a hash needs to be re-hashed (e.g., after changing parameters).
 * Call this on successful login to transparently upgrade old hashes.
 */
export function needsRehash(storedHash: string): boolean {
  return argon2.needsRehash(storedHash, HASH_OPTIONS);
}

// Usage in login handler:
// const isValid = await verifyPassword(inputPassword, user.passwordHash);
// if (isValid && needsRehash(user.passwordHash)) {
//   user.passwordHash = await hashPassword(inputPassword);
//   await user.save();
// }
```

---

### 2. Rate Limiting

```ts
// middleware/rate-limit.ts
// Install: npm install express-rate-limit rate-limit-redis ioredis
// [CUSTOMIZE] Adjust limits based on your traffic patterns

import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

// [CUSTOMIZE] Use your Redis connection string
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

/**
 * Strict rate limit for authentication endpoints.
 * Prevents brute-force password attacks.
 */
export const authRateLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
  windowMs: 60 * 1000,       // 1-minute window
  max: 5,                     // [CUSTOMIZE] 5 attempts per minute per IP
  message: { error: 'Too many login attempts. Please try again in 1 minute.' },
  standardHeaders: true,      // Return RateLimit-* headers
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit by IP + attempted username to prevent distributed attacks
    return `${req.ip}:${req.body?.email || 'unknown'}`;
  },
  skipSuccessfulRequests: false,  // Count ALL requests (not just failures)
});

/**
 * General API rate limit — prevents abuse of regular endpoints.
 */
export const apiRateLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
  windowMs: 60 * 1000,       // 1-minute window
  max: 100,                    // [CUSTOMIZE] 100 requests per minute per IP
  message: { error: 'Rate limit exceeded. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Password reset rate limit — prevent email flooding.
 */
export const passwordResetLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
  windowMs: 15 * 60 * 1000,  // 15-minute window
  max: 3,                     // [CUSTOMIZE] 3 reset requests per 15 min
  message: { error: 'Too many password reset requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Usage:
// app.post('/api/auth/login', authRateLimiter, loginHandler);
// app.post('/api/auth/forgot-password', passwordResetLimiter, forgotPasswordHandler);
// app.use('/api/', apiRateLimiter);
```

**In-memory fallback (no Redis)**:

```ts
// For development or apps without Redis
// Install: npm install express-rate-limit

import rateLimit from 'express-rate-limit';

export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: 'Too many login attempts. Please try again in 1 minute.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// WARNING: In-memory store resets on server restart and doesn't work
// with multiple server instances. Use Redis in production.
```

---

### 3. Secure Session Configuration

```ts
// lib/session.ts
// Install: npm install express-session connect-redis ioredis
// [CUSTOMIZE] Set SESSION_SECRET in your environment variables

import session from 'express-session';
import RedisStore from 'connect-redis';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export const sessionConfig: session.SessionOptions = {
  store: new RedisStore({ client: redis }),
  secret: process.env.SESSION_SECRET!,   // [CUSTOMIZE] Use a 64+ char random string
  name: '__session',                      // [CUSTOMIZE] Custom cookie name (don't use 'connect.sid')
  resave: false,
  saveUninitialized: false,
  rolling: true,                          // Reset expiration on every request

  cookie: {
    httpOnly: true,         // JavaScript cannot access this cookie (prevents XSS theft)
    secure: process.env.NODE_ENV === 'production',  // Only sent over HTTPS in production
    sameSite: 'strict',     // Cookie only sent on same-site requests (CSRF protection)
    maxAge: 30 * 60 * 1000, // [CUSTOMIZE] 30 minutes — shorter = more secure
    domain: process.env.COOKIE_DOMAIN,  // [CUSTOMIZE] Your domain (e.g., '.your-app.com')
    path: '/',
  },
};

// Usage:
// app.use(session(sessionConfig));
```

**JWT-based session config (for stateless APIs)**:

```ts
// lib/jwt-session.ts
// Install: npm install jose
// [CUSTOMIZE] Set JWT_SECRET in your environment variables

import { SignJWT, jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!); // [CUSTOMIZE] 64+ char random
const ISSUER = 'your-app';          // [CUSTOMIZE] Your app name
const AUDIENCE = 'your-app-users';   // [CUSTOMIZE] Your audience
const EXPIRY = '30m';                // [CUSTOMIZE] Token lifetime

export async function createToken(payload: { userId: string; role: string }): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setExpirationTime(EXPIRY)
    .sign(SECRET);
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, SECRET, {
    issuer: ISSUER,
    audience: AUDIENCE,
  });
  return payload as { userId: string; role: string };
}
```

---

### 4. CSRF Protection

```ts
// middleware/csrf.ts
// Double-submit cookie pattern — works with SPAs and server-rendered apps
// [CUSTOMIZE] Adapt to your frontend framework's CSRF token handling

import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

const CSRF_COOKIE = 'csrf_token';
const CSRF_HEADER = 'x-csrf-token';

/**
 * Set CSRF cookie on every GET request.
 * The cookie is readable by JavaScript (not httpOnly) so the frontend
 * can send it back as a header.
 */
export function setCsrfCookie(req: Request, res: Response, next: NextFunction) {
  if (req.method === 'GET' && !req.cookies[CSRF_COOKIE]) {
    const token = crypto.randomBytes(32).toString('hex');
    res.cookie(CSRF_COOKIE, token, {
      httpOnly: false,    // Must be readable by JavaScript
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
  }
  next();
}

/**
 * Verify CSRF token on state-changing requests (POST, PUT, DELETE, PATCH).
 */
export function verifyCsrf(req: Request, res: Response, next: NextFunction) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const cookieToken = req.cookies[CSRF_COOKIE];
  const headerToken = req.headers[CSRF_HEADER];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }

  next();
}

// Frontend usage:
// const csrfToken = document.cookie.match(/csrf_token=([^;]+)/)?.[1];
// fetch('/api/resource', {
//   method: 'POST',
//   headers: { 'X-CSRF-Token': csrfToken, 'Content-Type': 'application/json' },
//   credentials: 'include',
//   body: JSON.stringify(data),
// });
```

---

### 5. HaveIBeenPwned Password Check

```ts
// lib/password-breach-check.ts
// Uses k-anonymity — only the first 5 chars of the SHA-1 hash are sent to the API.
// Your users' passwords are NEVER transmitted.

import crypto from 'crypto';

/**
 * Check if a password has appeared in known data breaches.
 * Uses the HaveIBeenPwned Passwords API with k-anonymity.
 * Returns the number of times the password was found in breaches (0 = safe).
 */
export async function checkPasswordBreach(password: string): Promise<number> {
  const sha1 = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
  const prefix = sha1.slice(0, 5);
  const suffix = sha1.slice(5);

  const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
    headers: {
      'User-Agent': 'YourApp-PasswordCheck',  // [CUSTOMIZE] Your app name
    },
  });

  if (!response.ok) {
    // API is down — fail open (allow the password) and log the error
    console.warn('HaveIBeenPwned API unavailable');
    return 0;
  }

  const text = await response.text();
  const lines = text.split('\n');

  for (const line of lines) {
    const [hashSuffix, count] = line.split(':');
    if (hashSuffix.trim() === suffix) {
      return parseInt(count.trim(), 10);
    }
  }

  return 0;
}

// Usage in registration/password-change handler:
// const breachCount = await checkPasswordBreach(newPassword);
// if (breachCount > 0) {
//   return res.status(400).json({
//     error: `This password has appeared in ${breachCount} data breaches. Please choose a different password.`
//   });
// }
```

---

### 6. MFA / TOTP Consideration Guide

```
Should you add MFA?
├── B2B SaaS / enterprise users → YES, required (WebAuthn preferred, TOTP fallback)
├── B2C with sensitive data (health, finance) → YES, strongly recommended
├── B2C general (social, content) → OPTIONAL, offer but don't require
├── Internal admin panels → YES, always
└── Public API-only → Use API keys + IP allowlisting instead
```

```ts
// lib/totp.ts
// Install: npm install otpauth qrcode
// [CUSTOMIZE] Set your app name and issuer

import { TOTP } from 'otpauth';
import QRCode from 'qrcode';

/**
 * Generate a new TOTP secret for a user.
 * Store the returned secret in your database (encrypted).
 */
export function generateTotpSecret(userEmail: string) {
  const totp = new TOTP({
    issuer: 'YourApp',        // [CUSTOMIZE] Your app name
    label: userEmail,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
  });

  return {
    secret: totp.secret.base32,       // Store this (encrypted) in your DB
    uri: totp.toString(),             // Used to generate QR code
  };
}

/**
 * Generate a QR code image (data URL) for the user to scan with their authenticator app.
 */
export async function generateQrCode(otpauthUri: string): Promise<string> {
  return QRCode.toDataURL(otpauthUri);
}

/**
 * Verify a TOTP code from the user.
 * Returns true if the code is valid within the current or adjacent time window.
 */
export function verifyTotpCode(secret: string, code: string): boolean {
  const totp = new TOTP({
    secret,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
  });

  const delta = totp.validate({ token: code, window: 1 });
  return delta !== null;
}

// Usage:
// 1. Setup: const { secret, uri } = generateTotpSecret(user.email);
//           const qr = await generateQrCode(uri);
//           // Show QR to user, store secret encrypted in DB
// 2. Verify: const isValid = verifyTotpCode(user.totpSecret, req.body.code);
```

---

### 7. Account Lockout

```ts
// lib/account-lockout.ts
// [CUSTOMIZE] Adjust thresholds and lockout duration for your risk profile
// Requires: Redis (or database) for tracking failed attempts per account

import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const MAX_FAILED_ATTEMPTS = 5;           // [CUSTOMIZE] Lock after 5 failures
const LOCKOUT_DURATION_SEC = 15 * 60;    // [CUSTOMIZE] 15-minute lockout
const ATTEMPT_WINDOW_SEC = 30 * 60;      // [CUSTOMIZE] Track attempts over 30 minutes

/**
 * Record a failed login attempt for an account.
 * Returns { locked: boolean, remainingAttempts: number, lockoutEndsAt?: Date }
 */
export async function recordFailedAttempt(accountId: string) {
  const key = `lockout:${accountId}`;
  const attempts = await redis.incr(key);

  if (attempts === 1) {
    // First failure — set expiry window
    await redis.expire(key, ATTEMPT_WINDOW_SEC);
  }

  if (attempts >= MAX_FAILED_ATTEMPTS) {
    // Lock the account
    const lockKey = `locked:${accountId}`;
    await redis.set(lockKey, '1', 'EX', LOCKOUT_DURATION_SEC);
    return {
      locked: true,
      remainingAttempts: 0,
      lockoutEndsAt: new Date(Date.now() + LOCKOUT_DURATION_SEC * 1000),
    };
  }

  return {
    locked: false,
    remainingAttempts: MAX_FAILED_ATTEMPTS - attempts,
  };
}

/**
 * Check if an account is currently locked out.
 */
export async function isAccountLocked(accountId: string): Promise<boolean> {
  const lockKey = `locked:${accountId}`;
  return (await redis.exists(lockKey)) === 1;
}

/**
 * Clear failed attempts after a successful login.
 */
export async function clearFailedAttempts(accountId: string) {
  await redis.del(`lockout:${accountId}`);
  await redis.del(`locked:${accountId}`);
}

// Usage in login handler:
// if (await isAccountLocked(user.id)) {
//   return res.status(423).json({ error: 'Account temporarily locked. Try again later.' });
// }
// if (!passwordValid) {
//   const result = await recordFailedAttempt(user.id);
//   if (result.locked) {
//     // [CUSTOMIZE] Send email notification to account owner
//     await sendLockoutNotification(user.email, result.lockoutEndsAt);
//   }
//   return res.status(401).json({ error: 'Invalid credentials', ...result });
// }
// await clearFailedAttempts(user.id);  // Success — reset counter
```

**Key design decisions:**
- **Account-level, not IP-level**: Rate limiting (Section 2) handles IP-based attacks. Account lockout handles distributed attacks targeting a single account from many IPs.
- **Fail-open on Redis failure**: If Redis is down, skip the lockout check rather than locking everyone out. Log the Redis error for investigation.
- **Notification on lockout**: Email the account owner when their account is locked. This alerts legitimate users to potential attack attempts.
- **Admin unlock**: Provide an admin endpoint to manually unlock accounts for support cases.

---

## Customization notes

- **Argon2id parameters**: The defaults (64 MB, 3 iterations, 4 threads) are suitable for most apps. If you're on a dedicated server with >8 GB RAM, increase `memoryCost` to `131072` (128 MB) for stronger security.
- **Bcrypt fallback**: If Argon2id is unavailable (e.g., platform restrictions on native modules), use bcrypt with cost factor >= 12 (not the default 10). At cost factor 12, hashing takes ~250ms on modern hardware, which is acceptable for auth endpoints. Never go below 10.
- **Rate limit storage**: Always use Redis in production for rate limiting. In-memory stores don't work with multiple server instances and reset on deploys.
- **Session TTL**: 30 minutes is a good default. For banking/health apps, use 15 minutes. For low-risk consumer apps, up to 7 days with refresh tokens.
- **CSRF**: If your API is purely token-based (JWT in Authorization header, no cookies), you may not need CSRF protection since the browser won't automatically send the token.
- **HIBP check**: Call on registration and password changes only — not on login (would leak timing information).

## Companion tools

- `agamm/claude-code-owasp` — Automated OWASP scanning
- `anthropics/claude-code-security-review` — Auth-focused security review
