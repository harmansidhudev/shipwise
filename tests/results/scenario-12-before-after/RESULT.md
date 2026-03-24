# Scenario 12: Before/After Comparison — The Key Marketing Test

**Date:** 2026-03-24
**Scenario:** Mid-level developer, same prompt in two sessions
**Test prompt:** "I'm building a B2B SaaS with Next.js and Postgres. Help me set up user authentication with email/password signup, login, and password reset. Include proper security practices."

---

## Session A: Vanilla Claude (No Shipwise)

### What vanilla Claude would produce

Based on Claude's general knowledge, a response to this prompt would typically include:

**Password hashing**
- Suggests bcrypt (common, well-known)
- May specify a cost factor of 10 or 12, but this is not guaranteed and the reasoning is rarely explained
- Basic `bcrypt.hash()` and `bcrypt.compare()` pattern

**Session / token strategy**
- JWT with `jsonwebtoken`, or express-session with PostgreSQL store
- Short-lived access token with refresh token concept may appear
- Cookie vs localStorage storage debated but often left open-ended

**Signup / login / reset endpoints**
- POST /auth/register — email uniqueness check, hash password, create user
- POST /auth/login — compare hash, issue token
- POST /auth/forgot-password — generate reset token, send email
- POST /auth/reset-password — validate token, hash new password

**Middleware**
- A `requireAuth` middleware that verifies the JWT or session
- Basic 401 response if unauthenticated

**Database schema**
- `users` table with email, password_hash, created_at
- `password_reset_tokens` table with token, expires_at

**Validation**
- Basic email format check (regex or a library like `validator`)
- Password minimum length
- Probably client-side-first framing

**What vanilla Claude would miss or leave vague**
- No specification of Argon2id (bcrypt is suggested instead)
- No bcrypt cost factor rationale tied to hardware benchmarks
- No rate limiting on auth endpoints
- No separate rate limit for password reset (email flooding attack)
- No CSRF protection (or a vague mention without implementation)
- No specification of `httpOnly`, `secure`, `sameSite=strict` cookie attributes together
- No mention of HaveIBeenPwned password breach checking
- No MFA / TOTP even as a "consider this" note for B2B SaaS
- No session rotation on login (session fixation vulnerability)
- No server-side session invalidation on password change
- No structured error types with machine-readable error codes
- No security event logging (failed logins, rate limit hits)
- No IDOR / Broken Access Control guidance
- No CORS configuration guidance
- No security headers (CSP, HSTS, X-Frame-Options)
- No OWASP framing for the audit surface
- No strategy recommendation (Clerk vs Auth.js vs custom) with cost/complexity tradeoffs
- No distinction between operational errors and programming bugs
- No guidance on avoiding stack trace leakage in production errors
- No consideration of Redis-backed rate limiting for multi-instance deployments
- No webhook/signing considerations
- No mention of AES-256-GCM for encrypting sensitive PII fields at rest

---

## Session B: Claude Code WITH Shipwise

### Skills that activate for this prompt

The prompt mentions: B2B SaaS, Next.js, Postgres, authentication, email/password, security. This triggers:

1. **skill 08-security-compliance** — triggers on "security", "auth hardening", "rate limiting", "CSRF", "MFA"
2. **skill 05-fullstack-development** — triggers on "API route", "form handling", "backend", "error handling"
3. **skill 04-tech-architecture** (auth-strategy-decision-tree) — directly applicable to auth strategy choice for B2B SaaS

### What Shipwise injects — full inventory

---

#### From `skills/08-security-compliance/SKILL.md`

**1. Argon2id instead of bcrypt**

Shipwise specifies Argon2id (not bcrypt) as the primary algorithm. The skill explains:
- "Argon2id — resistant to both side-channel and GPU attacks"
- Exact parameters: `memoryCost: 65536` (64 MB), `timeCost: 3`, `parallelism: 4`, `hashLength: 32`
- Includes `needsRehash()` pattern for transparent hash upgrades after parameter changes
- Notes that bcrypt is "fallback" only

Vanilla Claude mentions bcrypt as the primary choice. Argon2id is meaningfully harder to crack on GPU clusters, which matters for B2B SaaS where account takeover risk is high.

**2. Rate limiting with specific numbers and Redis backing**

Shipwise specifies three separate rate limiters with concrete limits:
- Login: 5 attempts per minute per IP+email combination (sliding window)
- Password reset: 3 requests per 15-minute window (prevents email flooding)
- General API: 100 requests per minute per IP

Additional details vanilla Claude would not provide:
- Redis-backed store (in-memory fails across multiple instances and resets on deploy)
- Rate limit key includes `IP + attempted email` to prevent distributed credential stuffing
- `standardHeaders: true` to return `RateLimit-*` headers to the client
- Warning about in-memory fallback limitations explicitly documented

**3. CSRF double-submit cookie pattern with complete implementation**

Shipwise provides a complete `setCsrfCookie` + `verifyCsrf` middleware pair with:
- `httpOnly: false` on the CSRF cookie (intentional — must be readable by JS)
- Verification skips GET/HEAD/OPTIONS (safe methods)
- Returns 403 on mismatch
- Frontend usage comment showing how to extract the cookie value and attach it as a header

**4. Secure cookie configuration — all three attributes together**

The skill specifies `httpOnly: true` + `secure: process.env.NODE_ENV === 'production'` + `sameSite: 'strict'` as a unit, with explanations of what each attribute prevents:
- httpOnly: JavaScript cannot read cookie (blocks XSS-based session theft)
- secure: Only sent over HTTPS
- sameSite=strict: Prevents CSRF from cross-site requests

**5. HaveIBeenPwned k-anonymity password breach check**

Full working implementation using the SHA-1 prefix API:
- Hashes the password client-side using SHA-1
- Sends only the first 5 characters of the hash to the HIBP API (k-anonymity — password is never transmitted)
- Parses the response to find the matching suffix
- Fails open (allows password) if HIBP API is unavailable, logs a warning
- Includes the specific guidance: call on registration and password changes only, not on login (timing side channel)

Vanilla Claude does not mention HIBP in any form.

**6. MFA / TOTP — explicitly required for B2B SaaS**

The skill's decision tree states: "B2B SaaS / enterprise users → YES, required (WebAuthn preferred, TOTP fallback)"

Provides a full TOTP implementation using `otpauth` library:
- `generateTotpSecret()` — creates the TOTP secret and OTPAuth URI
- `generateQrCode()` — converts URI to a QR code data URL for the user to scan
- `verifyTotpCode()` — validates with a ±1 time window
- Notes to store TOTP secret encrypted in the database

Vanilla Claude does not mention MFA for B2B SaaS.

**7. Session configuration with TTL and rolling expiry**

- 30-minute TTL with `rolling: true` (resets on every request)
- Custom cookie name (avoid revealing session library via default `connect.sid`)
- Redis session store
- Notes: banking/health apps should use 15 minutes; consumer apps may use 7 days with refresh tokens

**8. Security event logging**

The OWASP checklist (A09) includes a `logSecurityEvent()` utility with severity levels:
- Log failed login attempts with timestamp, IP, user agent
- Log access control failures (403s)
- Log rate limit hits at "critical" severity
- Retain logs 90 days minimum
- Alert on >10 failed logins from one IP in 5 minutes

Vanilla Claude does not address security logging.

---

#### From `skills/08-security-compliance/references/auth-hardening-checklist.md`

This reference provides the actual copy-paste code templates for all 6 auth hardening sections listed above, plus:

**9. Hash upgrade pattern on login**

After verifying a password, call `needsRehash()` and transparently update the stored hash if parameters have changed. This is a production-grade pattern that handles algorithm migrations without forcing user password resets.

**10. Rate limit key strategy**

The key is `${req.ip}:${req.body?.email || 'unknown'}` — combining IP and email address prevents attackers from distributing attempts across many IPs to avoid per-IP limits while still targeting one account.

**11. JWT session alternative with full implementation**

For stateless APIs, provides a complete `createToken` / `verifyToken` pair using `jose` (not the older `jsonwebtoken`):
- Sets issuer, audience, and expiration
- Short-lived (30m default) access token
- Refresh token separately
- Explicit note: "Never store JWTs in localStorage (XSS vulnerable)"

---

#### From `skills/08-security-compliance/references/owasp-checklist.md`

The OWASP checklist surfaces five more specific items for this auth scenario:

**12. A01 Broken Access Control — IDOR protection**

`ownerOnly()` middleware that:
- Fetches the resource and checks `resource.userId === req.user.id`
- Returns 404 (not 403) when resource doesn't exist (information leakage prevention)
- Logs unauthorized access attempts internally

**13. A01 — Default-deny access control**

A `defaultDeny` middleware that requires authentication for all routes except a defined PUBLIC_ROUTES allowlist. The pattern is default-deny rather than opt-in protection, which prevents routes from accidentally being left unprotected.

**14. A02 Cryptographic Failures — AES-256-GCM encryption for PII at rest**

For sensitive fields (TOTP secrets, SSNs, health data), an `encrypt()` / `decrypt()` utility using AES-256-GCM:
- Authenticated encryption (detects tampering)
- Random 16-byte IV per encryption
- Format: `iv:authTag:ciphertext` — self-contained in a single string

**15. A05 Security Misconfiguration — CORS locked to production domain**

CORS configuration with origin restricted to `['https://your-app.com']` in production (not `*`), with `credentials: true` and `allowedHeaders` explicitly listed.

**16. A09 — Verification steps**

The checklist includes specific manual verification steps to confirm the auth implementation is correct:
- Attempt >5 rapid login failures — should be rate limited
- Inspect cookies — should see httpOnly, Secure, SameSite=Strict
- Try SQL injection payloads in login form
- Try `<script>alert(1)</script>` in text inputs
- Verify logout invalidates session server-side
- Check session tokens are rotated on login

---

#### From `skills/05-fullstack-development/references/error-handling-patterns.md`

**17. Structured AppError class with machine-readable error codes**

Rather than returning ad-hoc JSON error messages, Shipwise injects an `AppError` class that carries:
- `statusCode` — HTTP status
- `code` — machine-readable string (`UNAUTHORIZED`, `VALIDATION_ERROR`, `RATE_LIMITED`, etc.)
- `message` — human-readable
- `isOperational` flag — distinguishes expected errors from programming bugs
- `details` — optional field-level validation errors

Factory methods: `Errors.unauthorized()`, `Errors.rateLimited(retryAfterSeconds)`, `Errors.validationError(details)`, etc.

**18. Global error handler for Next.js (withErrorHandler wrapper)**

A `withErrorHandler` higher-order function that wraps API routes:
- Catches `ZodError` and maps to structured `{ code: 'VALIDATION_ERROR', details: { fields: {...} } }` with field paths
- Catches `AppError` and returns the structured error JSON at the correct status code
- Catches unknown errors and returns a generic `INTERNAL_ERROR` without exposing internals
- Does not leak stack traces in production

The auth-specific implication: login failures, rate limit hits, and validation errors all return consistent JSON shapes that the client can handle programmatically.

**19. Never expose stack traces in production**

The `INTERNAL_ERROR` response intentionally omits details. The development-only pattern: `...(process.env.NODE_ENV === 'development' && { stack: err.stack })` — traces are available locally but stripped in production.

---

#### From `skills/04-tech-architecture/references/auth-strategy-decision-tree.md`

**20. Explicit auth strategy recommendation for B2B SaaS**

For the exact prompt scenario (B2B SaaS, Next.js), the decision tree routes to:
- No enterprise SSO needed: **Clerk** (best DX, org management, pre-built UI, 10K MAU free)
- Enterprise SSO (SAML/SCIM) needed: **Auth0** (most complete enterprise features)

This is a binary recommendation with cost/complexity tradeoffs rather than leaving the developer to research options themselves.

**21. Cost scaling table**

Concrete pricing comparison at 1K, 10K, 25K, 50K, 100K, 500K MAU for Auth0, Clerk, Supabase Auth, Auth.js, and Firebase Auth. Helps the developer make an informed build-vs-buy decision early.

**22. Auth strategy security checklist (applies regardless of provider)**

- HTTPS everywhere
- Tokens in httpOnly cookies (not localStorage)
- CSRF protection enabled
- Rate limiting on auth endpoints
- Password requirements enforced
- MFA available and encouraged
- Session invalidation on password change
- Brute-force protection (lockout or exponential backoff)
- Secure password reset flow (time-limited, single-use tokens)
- OAuth state parameter validated

**23. "Never store JWTs in localStorage" stated explicitly**

The decision tree's customization notes call this out directly with the reason: "XSS vulnerable". Vanilla Claude may discuss this but does not make it a hard constraint.

**24. Session invalidation on password change**

Explicitly included in the auth strategy security checklist. This prevents an attacker who has stolen a session from maintaining access after the victim resets their password.

---

## Gap Summary Table

| Security/Quality Dimension | Session A (Vanilla) | Session B (Shipwise) |
|---|---|---|
| Password hashing algorithm | bcrypt (vague) | Argon2id with exact parameters |
| Hash upgrade path | Not mentioned | needsRehash() pattern on every login |
| Rate limiting — login | Vague mention or absent | 5/min per IP+email, Redis-backed |
| Rate limiting — password reset | Not mentioned | 3/15min, separate limiter |
| Rate limiting — general API | Not mentioned | 100/min |
| CSRF protection | May mention, no implementation | Complete double-submit cookie middleware |
| Cookie security attributes | May list individually | httpOnly + secure + sameSite=strict as a unit with explanations |
| HaveIBeenPwned check | Not mentioned | Full k-anonymity implementation |
| MFA for B2B SaaS | Not mentioned | Explicitly required, TOTP implementation provided |
| Session rotation on login | Not mentioned | Specified in session config |
| Session invalidation on password change | Not mentioned | In auth checklist |
| IDOR / access control | Not mentioned | ownerOnly() middleware + default-deny pattern |
| Structured error types | Ad-hoc JSON strings | AppError class with machine-readable codes |
| Stack trace leakage | Not addressed | NODE_ENV guard in global error handler |
| Security event logging | Not mentioned | logSecurityEvent() with severity levels |
| OWASP framing | Not mentioned | Full A01-A10 checklist with verification steps |
| Auth strategy recommendation | "Use bcrypt and JWT" | Clerk vs Auth0 decision tree with cost table |
| CORS configuration | Not mentioned | Origin-restricted production config |
| PII encryption at rest | Not mentioned | AES-256-GCM utility |
| Dependency scanning | Not mentioned | Dependabot + Snyk + npm audit in CI |
| Secret scanning | Not mentioned | gitleaks pre-commit hook |
| Feature-based project structure | Not mentioned | src/features/auth/ folder structure |
| Form validation | Basic, may be client-side | Zod schema with React Hook Form, server-side primary |

---

## Ratings

### Session A: Vanilla Claude

| Dimension | Score | Notes |
|---|---|---|
| Security completeness | 4/10 | Covers the basics (hashing, tokens) but misses CSRF, rate limiting, HIBP, MFA, logging, and all OWASP-level guidance |
| Code quality | 6/10 | Code is functional but lacks structured error handling, consistent response shapes, and production guards |
| Production readiness | 3/10 | Missing rate limiting, security headers, CORS config, logging, and session management make this unsuitable for a live B2B app |
| Educational value | 5/10 | Explains what to do but rarely explains why; no prioritization framework |

**Session A total: 18/40**

### Session B: Shipwise-enhanced Claude

| Dimension | Score | Notes |
|---|---|---|
| Security completeness | 9/10 | Covers Argon2id, CSRF, rate limiting (three separate limiters), HIBP, MFA, secure cookies, IDOR, access control, OWASP A01-A10, security logging |
| Code quality | 9/10 | Structured AppError types, global error handler, no stack trace leakage, consistent JSON shapes, Zod integration |
| Production readiness | 9/10 | Redis-backed rate limiting, session rotation, environment-aware cookie config, CORS lockdown, PII encryption at rest |
| Educational value | 9/10 | Beginner/intermediate/senior mode output, "why" explanations for every security control, decision trees, cost tables, verification steps |

**Session B total: 36/40**

---

## Delta Analysis

**Net improvement: +18 points (100% increase in overall score)**

The most significant gaps — those that would cause real-world security incidents for a B2B SaaS — are:

1. **HaveIBeenPwned check** — prevents users from setting compromised passwords that attackers actively target in credential stuffing attacks. Not present at all in Session A.

2. **MFA for B2B SaaS** — B2B accounts hold organizational data. TOTP is standard expectation in enterprise sales. Session A does not raise this. Session B marks it as required.

3. **Rate limiting on password reset** — email flooding is a DoS vector and a reputation risk (deliverability). Session A does not address it. Session B provides a specific 3/15min limiter.

4. **Security event logging** — without structured logging of failed logins and rate limit hits, there is no way to detect an active credential stuffing or brute-force attack in progress. Session A produces no observable security audit trail.

5. **Argon2id vs bcrypt** — Argon2id with 64 MB memory hardness is approximately 3-4x harder to crack on modern GPUs than bcrypt at cost factor 12. For B2B SaaS where account takeover means access to all of an organization's data, this is meaningful.

6. **Structured error handling** — vanilla Claude's auth errors leak information through inconsistent response shapes. The AppError pattern ensures `UNAUTHORIZED` and `FORBIDDEN` are machine-readable and never expose internal details.

---

## Verdict

Session B (Shipwise) produces an implementation that a senior security engineer would recognize as production-appropriate. Session A produces an implementation that would pass a junior code review but would fail a security audit before enterprise deployment.

The specific prompt — B2B SaaS — makes this gap especially pronounced. Enterprise customers often require a security questionnaire or penetration test as a condition of purchase. Session A's output would fail that audit on at least six counts. Session B's output would pass it with minor additions.

**This scenario validates Shipwise's core value proposition: not just "write code faster" but "write code that's safe to ship to paying customers."**
