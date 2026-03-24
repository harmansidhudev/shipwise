# Shipwise — Marketing Highlights (Final)

**Date:** 2026-03-24
**Source:** 12 QA scenarios — **12/12 PASS**

---

## Validated Marketing Claims

| Claim | Evidence | Scenario |
|-------|----------|----------|
| "106% improvement on auth security" | 18/40 to 37/40 | #12 |
| "Understands your specific codebase" | 9/9 component detections, scoped gap analysis | #10 |
| "11/11 security dimensions covered" | Rate limiting, Argon2id, CSRF, HIBP, MFA, security headers, session config, Zod, error handling, requestId, account lockout | #12 |
| "OWASP A01-A10 + auth hardening with 7 code templates" | Full checklist with copy-paste implementations | #11 |
| "Adapts to your experience level" | Beginner: ONE recommendation. Senior: decision matrices | #3, #4 |
| "Zero false triggers" | 4 off-topic + 1 adjacent prompt, 15 skills, 0 false positives | #7, #8 |
| "12/12 test scenarios pass" | Full QA suite clean | All |

---

## Tier 1: Ready to Capture Now (All Unblocked)

### Hero Demo: Before/After Auth (Scenario 12)

| Dimension | Vanilla Claude | With Shipwise | Delta |
|-----------|---------------|---------------|-------|
| Security completeness | 4/10 | 9.5/10 | +5.5 |
| Code quality | 6/10 | 9/10 | +3 |
| Production readiness | 3/10 | 9.5/10 | +6.5 |
| Educational value | 5/10 | 9/10 | +4 |
| **Total** | **18/40** | **37/40** | **+19** |

11 security dimensions covered: Argon2id hashing, 3-tier rate limiting, CSRF double-submit, secure session config, HIBP k-anonymity, MFA/TOTP, security headers, input validation (Zod), structured errors with requestId, account lockout, bcrypt fallback guidance.

### Codebase Audit: `/launch-audit` (Scenario 10)
9 components detected (incl. static metadata, ESLint/Prettier). Scoped gap analysis — only relevant items counted toward readiness %. Gap-analyzer with prioritized action plan.

### Architecture Decision: tRPC vs GraphQL (Scenario 4)
Decision tree resolving in 2 steps. Verbatim stack confirmation with next-step routing. All API technology terms trigger correctly.

### Security Depth (Scenarios 11 + 12)
OWASP A01-A10 + 7-section auth hardening (Argon2id, rate limiting, sessions, CSRF, HIBP, MFA, account lockout). Three framework-specific security header configs. Verification steps for manual testing.

### `/shipwise` First-Run (Scenario 1)
Beginner scaffold with infra items auto-skipped for solo projects. Guided mode: one item at a time.

### Cross-Skill Flow (Scenario 9)
Architecture -> schema -> API in 3 prompts. Stack decisions persist to state. Prisma template with User/Project/Task/TeamMember models.

### `/launch-checklist architecture` (Scenario 11)
7-item checklist with P0/P1/P2 labels, time estimates, state cross-reference, and experience-level blocks. All 14 domains routed correctly.

---

## Headline Options for Landing Page

1. **"18/40 to 37/40. Same prompt. Same model. Better code."**
2. **"11 security dimensions vanilla Claude misses."**
3. **"12/12 tests pass. Zero false triggers. Production-ready guidance."**
4. **"Your code, understood. Beginner? One answer. Senior? Full matrix."**
