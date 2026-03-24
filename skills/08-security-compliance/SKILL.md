---
name: security-compliance
description: "OWASP Top 10, auth hardening, input validation, security headers, dependency management, and pre-commit secret scanning."
triggers:
  - "security"
  - "OWASP"
  - "auth hardening"
  - "rate limiting"
  - "CSRF"
  - "XSS"
  - "SQL injection"
  - "security headers"
  - "CSP"
  - "vulnerability"
  - "pen test"
---

# Security & Compliance

> Phase 2: BUILD | Sprint 2 (planned)

## Coverage

- OWASP Top 10 (2025) checklist with verification steps
- Auth hardening (Argon2id, rate limiting, session security, MFA, HaveIBeenPwned)
- Input validation (server-side Zod/Joi, DOMPurify, file upload security)
- Security headers (CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy)
- Dependency management (Dependabot/Renovate, Snyk/Socket, lock files)
- Pre-commit secret scanning (gitleaks/trufflehog)

## Checklist Items

### Security Headers
<!-- beginner -->
**Add security headers** — Security headers tell browsers how to protect your users. CSP (Content Security Policy) prevents malicious script injection. HSTS forces HTTPS. X-Frame-Options prevents your site from being embedded in malicious iframes. Without these, your users are vulnerable to common attacks.
→ Time: ~15 min
→ Template: See `references/security-headers/`

<!-- intermediate -->
**Security headers** — CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy. Use helmet (Express) or next.config.js headers.
→ ~15 min

<!-- senior -->
**Security headers** → CSP/HSTS/XFO/Referrer/Permissions-Policy.

### Auth Hardening
<!-- beginner -->
**Harden your authentication** — Use bcrypt or Argon2id for password hashing (never MD5/SHA). Add rate limiting to login endpoints (max 5 attempts per minute) so attackers can't guess passwords. Set cookies to httpOnly (JavaScript can't read them) and sameSite=strict (prevents CSRF attacks).

<!-- intermediate -->
**Auth hardening** — Argon2id hashing, rate limiting (5/min login), httpOnly+sameSite cookies, CSRF tokens, consider MFA.

<!-- senior -->
**Auth hardening** → Argon2id, rate limit, session config, CSRF, MFA.

## Companion tools
- `agamm/claude-code-owasp` (52K stars)
- `unicodeveloper/shannon` (pen testing)
- `trailofbits/skills`
- `anthropics/claude-code-security-review`
