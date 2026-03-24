# Marketing Highlights — Best Outputs from Testing

**Extracted from:** 12 QA scenarios, 2026-03-24
**Purpose:** Identify the most compelling demo moments and content for marketing materials

---

## 1. Hero Demo (Landing Page)

**Source:** Scenario 12 — Before/After Comparison

### What to capture

Run the auth prompt ("I'm building a B2B SaaS with Next.js and Postgres. Help me set up user authentication...") in two side-by-side Claude Code windows: one vanilla, one with Shipwise installed. Screenshot or record both responses.

The Shipwise response injects 23 distinct improvements across three skills (08-security-compliance, 05-fullstack-development, 04-tech-architecture). Key items that will be visually obvious in the side-by-side:

- Vanilla Claude: `bcrypt` with no parameter rationale
- Shipwise: Argon2id with exact parameters (`memoryCost: 65536`, `timeCost: 3`, `parallelism: 4`) plus `needsRehash()` upgrade pattern
- Vanilla Claude: no rate limiting
- Shipwise: three separate rate limiters with concrete numbers (login: 5/min per IP+email, password reset: 3/15min, general API: 100/min), Redis-backed
- Vanilla Claude: no MFA mention
- Shipwise: MFA explicitly required for B2B, full TOTP implementation with QR code generation
- Vanilla Claude: no HIBP check
- Shipwise: complete k-anonymity implementation with the SHA-1 prefix API

**The headline number:** 18/40 → 36/40 — a 100% improvement in overall score on security completeness, code quality, production readiness, and educational value.

### Why it's compelling

The auth scenario is the single most universally relatable prompt for any developer building a web app. Every SaaS needs auth. The gap between "functional" and "safe to ship to a paying enterprise customer" is exactly what Shipwise addresses, and this scenario makes that gap quantified and concrete rather than abstract.

The verification steps in the OWASP checklist (Scenario 12, Section from owasp-checklist.md) give the hero demo a finishing punch: after Shipwise generates the code, it also tells you how to manually verify it — "try >5 rapid login failures, inspect cookies, try SQL injection payloads." This is content that no vanilla LLM would produce unprompted.

---

## 2. Before/After (README and Twitter/X)

**Source:** Scenario 12 — Before/After Comparison (Gap Summary Table)

### What to capture

The Gap Summary Table in Scenario 12 is ready-to-screenshot. It has 22 rows covering every dimension where Shipwise outperforms vanilla Claude. The table format (Dimension | Session A | Session B) renders cleanly as an image.

For Twitter/X: the five "most significant gaps" listed in the Delta Analysis section are concise enough for a thread:

1. HaveIBeenPwned breach check — not mentioned at all in vanilla Claude
2. MFA required for B2B SaaS — not raised by vanilla Claude
3. Rate limiting on password reset endpoint — absent in vanilla Claude (email flooding DoS vector)
4. Security event logging — no audit trail in vanilla Claude
5. Argon2id vs bcrypt — 3-4x harder to crack on GPU, vanilla Claude doesn't explain why it matters

### Why it's compelling

"We took the same prompt, ran it twice. Here's what you're missing without Shipwise" is a clean, falsifiable claim. The gap table is not a feature list — it is a specific accounting of what vanilla Claude produces vs. what production-grade code requires. The framing matters: this is not "Shipwise makes you faster," it is "Shipwise makes you ship something that won't fail a security audit."

For a README hero image: the before/after table cropped to 6-8 rows (password hashing, rate limiting, CSRF, MFA, HIBP, structured errors) is a single screenshot that communicates the value proposition without text.

---

## 3. Codebase Audit (Landing Page)

**Source:** Scenario 10 — /launch-audit on Realistic Project

### What to capture

Run `/launch-audit` against the midlevel-saas-project fixture (a realistic, partially-built SaaS codebase with Stripe, Clerk, Prisma, Vitest). The output would show:

- 9 components correctly detected (Next.js, Prisma, Clerk, Stripe + webhook handler, Vercel, 16 test files, ESLint, Prettier, Zod)
- Readiness percentage: ~32% (honest for "beta, building" stage)
- 20 gaps identified and categorized

The most marketing-worthy part of the audit result is the P0 gap list with time estimates:
- Error tracking (no Sentry) — ~2 hours
- Security headers (no CSP/X-Frame-Options in next.config.js) — ~1 hour
- Error boundary / not-found page — ~1 hour
- CI/CD pipeline — ~2 hours

Total time to production-ready: ~6-8 hours of guided work with Shipwise vs. months of accumulated discovery without it.

### Why it's compelling

The audit demonstrates that Shipwise understands your specific codebase, not a generic template. It detected 9 real technologies from actual file contents (package.json, vercel.json, prisma/schema.prisma, app/api/webhooks/stripe/route.ts) and identified 20 real absences. The 32% readiness score is honest — it sets up the product's entire value: you have 6 weeks of work left to be production-ready, here is the exact list.

The "done in 1 hour" framing for security headers is particularly compelling because it is achievable. A screenshot of the audit output with time estimates next to each gap is a clear "you could fix all of this today" call to action.

---

## 4. Architecture Decision (Blog Post)

**Source:** Scenario 4 — Tech Stack Decision — Senior (tRPC vs GraphQL)

### What to capture

The `backend-api-decision-tree.md` reference doc resolves the tRPC vs. GraphQL question for a TypeScript monorepo in a single flowchart. The key insight — that real-time subscriptions are NOT a differentiator because both tRPC and GraphQL support them — is the kind of non-obvious, expert-level guidance that takes hours of research to arrive at independently.

The flowchart resolves to tRPC in two steps:
- Q1: Same TypeScript monorepo? YES
- Q2: Only client is a web app you control? YES
- Answer: tRPC

The comparison table surfaces the genuine trade-off: GraphQL requires Apollo/urql for caching (complex), tRPC uses SWR/React Query (already in your stack). The developer doesn't need to re-learn their tooling.

The "When to mix approaches" section — "tRPC for your web app, REST/OpenAPI for public developer API" — is a nuanced senior-level escape hatch that a blog post could expand into a full architectural principle.

### Why it's compelling

Most developers waste significant time on tRPC vs. GraphQL debates because the framing is wrong (comparing them on subscriptions, which both support). A blog post titled "The tRPC vs GraphQL debate ends here" with the Shipwise decision tree as the centerpiece is both SEO-valuable and demonstrates that the plugin gives developers expert guidance, not just code generation.

Note: the trigger gap (skill 04 does not auto-fire on "tRPC" or "GraphQL" prompts) must be fixed before this content is demoed in a live walkthrough. The reference doc content is excellent; it just needs to be reachable.

---

## 5. Security Depth (Trust Signal)

**Source:** Scenarios 11 and 12

### What to capture

**From Scenario 11 (/launch-checklist security):**

The security checklist coverage is the most impressive single piece of content in the plugin. The combination of:
- `references/owasp-checklist.md` — all 10 OWASP categories (A01-A10) with plain-English explanations, manual verification steps, and copy-paste TypeScript templates
- `references/auth-hardening-checklist.md` — 6 sections (Argon2id, rate limiting, session config, CSRF, HIBP, MFA/TOTP) each with production-ready implementations
- `references/security-headers/nextjs-headers.ts` — complete Next.js config with 7 headers, nonce-based CSP generation, and 3 framework variants

This is content depth that enterprise developers would pay for as a standalone security course. As a free plugin, it functions as a trust signal.

**From Scenario 12 (Before/After):**

The verification steps checklist is the most undervalued feature. After generating the auth implementation, Shipwise tells the developer exactly how to test it:
- Attempt >5 rapid login failures — should be rate limited
- Inspect cookies — httpOnly, Secure, SameSite=Strict must be present
- Try SQL injection payloads in login form
- Try `<script>alert(1)</script>` in text inputs
- Verify logout invalidates session server-side
- Check session tokens are rotated on login

No competing LLM-based tool provides systematic manual verification steps alongside generated code. This is the difference between "here is code" and "here is code you can trust."

### Why it's compelling as a trust signal

Enterprise procurement requires security questionnaires. A screenshot of the OWASP A01-A10 checklist with copy-paste implementations, paired with the quote "Session B (Shipwise) produces an implementation that a senior security engineer would recognize as production-appropriate" from the QA evaluation, is a credible trust signal for a developer making the case to their CTO or a customer making the case to their security team.

The framing: "Session A (vanilla Claude) would fail a security audit on at least six counts. Session B (Shipwise) would pass it with minor additions." This is the clearest articulation of ROI in the entire test suite.

---

## Quick Reference: Best Moments by Content Type

| Format | Scenario | Specific Content | Status |
|--------|----------|-----------------|--------|
| Landing page hero | 12 | 18/40 → 36/40 score comparison | Ready — needs live run |
| Side-by-side screenshot | 12 | Gap summary table (22 rows) | Ready — needs live run |
| Twitter thread | 12 | 5-item delta analysis | Ready — can be written from test data |
| README hero image | 12 | Before/after table cropped to 6-8 rows | Ready — needs live run |
| Audit demo video | 10 | /launch-audit on midlevel-saas-project | Ready — fixture is production-quality |
| Blog post centerpiece | 4 | backend-api-decision-tree.md flowchart | Blocked — trigger bug must be fixed first |
| Trust/security signal | 11, 12 | OWASP A01-A10 + auth hardening + verification steps | Ready — can screenshot reference docs directly |
| Guided mode demo | 1 | Beginner scaffold → "Here's your #1 priority" | Ready — beginner fixture exists |
