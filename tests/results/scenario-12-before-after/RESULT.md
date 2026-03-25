# Scenario 12: Before/After Comparison (RE-TEST Round 2)

## Metadata
- **Date:** 2026-03-24 (re-test round 2)
- **Skills tested:** 08-security-compliance, 05-fullstack-development
- **Method:** Static file inspection verifying fixes for BUG-12-A, BUG-12-B

## Verdict: PASS

Both prior bugs are fixed. No new issues found.

---

## Bug Fix Verification

### BUG-12-A: No account lockout implementation template
**STATUS: FIXED**

File: `skills/08-security-compliance/references/auth-hardening-checklist.md`, lines 423-504

Section 7 "Account Lockout" now exists with a full Redis-backed TypeScript implementation.

**Coverage verification:**

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Tracking per account (not per IP) | PASS | Line 500: "Account-level, not IP-level" as explicit design decision. Keys: `lockout:{accountId}`, `locked:{accountId}` |
| 5-attempt threshold | PASS | Line 434: `MAX_FAILED_ATTEMPTS = 5` with [CUSTOMIZE] tag |
| 15-minute lockout | PASS | Line 435: `LOCKOUT_DURATION_SEC = 15 * 60` with [CUSTOMIZE] tag |
| Email notification on lockout | PASS | Line 492: `await sendLockoutNotification(user.email, result.lockoutEndsAt)` in usage example. Line 502: "Notification on lockout" design decision |
| Admin unlock | PASS | Line 503: "Admin unlock: Provide an admin endpoint to manually unlock accounts for support cases" |

**Additional quality checks:**
- Attempt window: 30-minute sliding window (line 436) -- attempts expire after 30 min even without lockout
- Clear on success: `clearFailedAttempts()` function resets both lockout and locked keys (lines 479-482)
- Fail-open on Redis failure documented (line 501) -- does not lock everyone out if Redis goes down
- Return type includes `remainingAttempts` and `lockoutEndsAt` for client-side display
- Three exported functions: `recordFailedAttempt`, `isAccountLocked`, `clearFailedAttempts`

**Relationship to rate limiting (Section 2):**
The design decisions section (lines 499-503) explicitly distinguishes account lockout from rate limiting:
- Rate limiting = IP-based, prevents volumetric attacks
- Account lockout = account-based, prevents distributed attacks from many IPs targeting one account

This is the correct separation of concerns.

### BUG-12-B: No bcrypt cost factor guidance for fallback case
**STATUS: FIXED**

Two locations now document bcrypt cost factor:

**1. SKILL.md line 85 (beginner auth hardening block):**
```
Use Argon2id (or bcrypt with cost factor >= 12 as fallback)
```
Explicitly states >= 12, not the insecure default of 10.

**2. auth-hardening-checklist.md line 510 (Customization notes):**
```
Bcrypt fallback: If Argon2id is unavailable (e.g., platform restrictions on native modules),
use bcrypt with cost factor >= 12 (not the default 10). At cost factor 12, hashing takes
~250ms on modern hardware, which is acceptable for auth endpoints. Never go below 10.
```

This provides:
- Clear threshold (>= 12)
- Reason the default is insufficient ("not the default 10")
- Performance context (~250ms at cost 12)
- Hard floor ("Never go below 10")
- Use case for fallback (platform restrictions on native modules)

---

## Full Validation Checklist

| # | Check | Status | Evidence |
|---|-------|--------|----------|
| 1 | Section 7 "Account Lockout" with Redis implementation | PASS | Lines 423-504, full TS/Redis implementation |
| 2 | Per-account tracking, 5 attempts, 15-min lockout, email, admin unlock | PASS | All 5 requirements verified (see table above) |
| 3 | bcrypt cost factor >= 12 in SKILL.md | PASS | Line 85: "bcrypt with cost factor >= 12" |
| 4 | bcrypt cost factor >= 12 in auth-hardening customization notes | PASS | Line 510: detailed fallback guidance |
| 5 | Account lockout in beginner auth hardening block | PASS | SKILL.md line 90: beginner-friendly explanation of lockout |
| 6 | 11/11 security dimensions covered | PASS | See dimension list below |

### Security Dimension Coverage (11/11)

| # | Dimension | Source |
|---|-----------|--------|
| 1 | OWASP Top 10 | SKILL.md lines 49-61 + references/owasp-checklist.md |
| 2 | Security headers | SKILL.md lines 66-78 + references/security-headers/ |
| 3 | Password hashing (Argon2id + bcrypt fallback) | auth-hardening-checklist.md Sections 1 + customization notes |
| 4 | Rate limiting (IP-based) | auth-hardening-checklist.md Section 2 |
| 5 | Secure session/cookie config | auth-hardening-checklist.md Section 3 |
| 6 | CSRF protection | auth-hardening-checklist.md Section 4 |
| 7 | Password breach checking (HIBP) | auth-hardening-checklist.md Section 5 |
| 8 | MFA/TOTP | auth-hardening-checklist.md Section 6 |
| 9 | Input validation | SKILL.md lines 104-117 |
| 10 | Dependency scanning | SKILL.md lines 120-133 |
| 11 | Account lockout (per-account) | auth-hardening-checklist.md Section 7 |

### Updated Session B Scores

With account lockout (BUG-12-A) and bcrypt guidance (BUG-12-B) fixed:

| Dimension | Prior Score | Updated Score | Delta |
|-----------|-------------|---------------|-------|
| Security completeness | 9/10 (10/11 dimensions) | 10/10 (11/11 dimensions) | +1 |
| Code quality | 9/10 | 9/10 | 0 |
| Production readiness | 9/10 | 9/10 | 0 |
| Educational value | 9/10 | 9/10 | 0 |
| **Total** | **36/40** | **37/40** | **+1** |

**Session A (vanilla Claude): 18/40**
**Session B (Claude + Shipwise): 37/40**
**Delta: +19 points (106% improvement)**

---

## New Bugs Found

None.
