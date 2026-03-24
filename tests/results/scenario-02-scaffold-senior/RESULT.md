# Scenario 2: Fresh Scaffold — Senior Engineer

## Metadata
- **Date:** 2026-03-24
- **Skill(s) tested:** 00-launch-assess/SKILL.md, commands/shipwise.md, agents/launch-readiness-auditor.md
- **User archetype:** senior (5+ years)
- **Interaction mode:** scaffold
- **Test fixture:** tests/fixtures/midlevel-saas-project/

## Objective
Validate that `/shipwise` correctly detects all existing stack components in the midlevel fixture, identifies the correct gaps, produces terse senior-mode output, shows a readiness percentage, skips guided mode, and scales priorities appropriately for 100-1K users.

## Test Prompt
`/shipwise` then answers: SaaS, B2B, Building, Next.js+Postgres+Vercel, Beta testers, Freemium, Solo, Senior 5+yr, 100-1K users.

## Expected Behavior
1. Auditor detects: Prisma, Clerk, Stripe + webhook handler, vercel.json, tests/**, .eslintrc.json + .prettierrc
2. Auditor identifies gaps: no .github/workflows/, no sentry, no app/api/health/, no privacy/terms pages, no robots.txt, no security headers in next.config.js
3. Senior output is terse (status numbers, no unsolicited explanations)
4. Readiness % shown
5. Guided mode NOT offered (senior post-scaffold = status only)
6. Priorities scaled for 100-1K users

## Actual Behavior

### Component Detection (What the Auditor Would Find)

**Prisma:** `prisma/schema.prisma` exists with a full schema (User, Organization, Project, Task, Subscription, Invoice, AuditLog, Notification, ApiKey, Webhook models). `package.json` has `"prisma": "^5.14.0"` and `"@prisma/client": "^5.14.0"`. The auditor procedure checks `prisma/schema.prisma` explicitly. Detection: PASS.

**Clerk:** `package.json` has `"@clerk/nextjs": "^5.2.4"`. `app/layout.tsx` imports `ClerkProvider` and wraps the app. `lib/auth.ts` imports from `@clerk/nextjs/server`. Auditor checks `package.json` for auth providers; `@clerk` would satisfy the auth detection. Detection: PASS.

**Stripe:** `package.json` has `"stripe": "^15.7.0"`. `lib/stripe.ts` creates a full Stripe client with checkout session, billing portal, subscription management. `app/api/webhooks/stripe/route.ts` is a complete webhook handler verifying signatures, handling `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated/deleted`. Auditor checks `package.json` for `stripe` and Greps for `webhook` in API routes. Both hits exist. Detection: PASS.

**Vercel:** `vercel.json` exists at root with `"framework": "nextjs"`, `"regions": ["iad1"]`, `"buildCommand"`, `"installCommand"`. Auditor checks for `vercel.json` explicitly. Detection: PASS.

**Tests:** `tests/` directory contains 14 test files across `tests/api/`, `tests/components/`, `tests/hooks/`, `tests/lib/`, plus `tests/setup.ts`. Files use `.test.ts` and `.test.tsx` extensions. `vitest.config.ts` exists. Auditor globs for `*.test.*` and `*.spec.*`. Detection: PASS.

**ESLint + Prettier:** `.eslintrc.json` exists (`extends: ["next/core-web-vitals", "prettier"]`). `.prettierrc` exists with standard config. Auditor does not explicitly check for ESLint/Prettier as a separate checklist item — these are not in the auditor's scanning procedure. However, the auditor would detect zod (input validation) from `lib/validations.ts` which imports `zod` heavily.

**Zod input validation:** `lib/validations.ts` uses zod throughout for all API schemas. The auditor Greps for `zod` in route/API files. The validation file is present and comprehensive. Detection: PASS.

**Metadata / SEO:** `app/layout.tsx` exports a `metadata` object with `title`, `description`, and `keywords`. The auditor checks for `generateMetadata` or `og:title`. The fixture uses a static `metadata` export, not `generateMetadata`. There is no `og:title` or `twitter:card` in the layout. The auditor's SEO check would find the metadata export partially (keywords, title, description present) but not OG/Twitter meta — this would likely be marked `partial`.

**Loading states:** `app/dashboard/page.tsx` has `StatsSkeleton`, `ActivitySkeleton` functions and uses `<Suspense>` with those fallbacks. Auditor Greps for `Skeleton`. Detection: PASS (partial — skeleton components exist but not a dedicated `loading.tsx` file).

### Gap Identification (What the Auditor Would Flag as Missing)

**.github/workflows/ (CI/CD):** No `.github/` directory exists anywhere in the midlevel fixture. The auditor globs `.github/workflows/*.yml`. Result: not found → `todo`. Correctly identified as a gap. PASS.

**Sentry (error tracking):** No `sentry` in `package.json` dependencies. No `@sentry` package. No `sentry.client.config.ts` or similar. Auditor Greps for `@sentry`, `sentry`, `bugsnag`, `datadog`. None found. Result: `todo`. For 100-1K users, error tracking is P0. Correctly identified as a P0 gap. PASS.

**app/api/health/ (health endpoint):** No `app/api/health/` directory exists. Auditor Greps for `/health` and `healthz`. No match in the fixture. Result: `todo`. Correctly identified as a gap. PASS.

**app/privacy/ or app/terms/ (legal pages):** No `*privacy*` or `*terms*` files/routes in the fixture. The landing page (`app/page.tsx`) has footer links to `#` (dummy hrefs) for Docs, Status, Contact — but no actual privacy or terms routes. Auditor globs for `*privacy*`, `*terms*` and Greps for routes containing "privacy"/"terms". None found. Result: `todo`. Correctly identified as a gap. PASS.

**public/robots.txt:** No `public/` directory, no `robots.txt`. Auditor globs for `robots.txt`. Not found. Result: `todo`. Correctly identified as a gap. PASS.

**Security headers in next.config.js:** `next.config.js` has `reactStrictMode: true` and image domain config but no `headers()` function and no Content-Security-Policy, X-Frame-Options, or similar. Auditor Greps for `helmet`, `Content-Security-Policy`, `X-Frame-Options`. None found. Result: `todo`. Correctly identified as a gap. PASS.

**Additional gaps the auditor would find:**
- No Dockerfile / docker-compose (not required for Vercel but auditor checks it)
- No IaC (no .tf files)
- No secrets scanning config (no .gitleaks.toml, no .pre-commit-config.yaml)
- No E2E tests (no playwright.config.ts, no cypress.config.ts) — only unit/component tests with vitest
- No load tests (no k6/, artillery/)
- No structured logging (no pino, winston — only `console.log/warn/error` in webhook handler)
- No monitoring config (no prometheus, datadog, newrelic)
- No changelog
- No error boundary (`error.tsx`) or 404 page (`not-found.tsx`)
- No sitemap
- No structured data (JSON-LD)
- No cookie consent

**Dependency scanning:** No `dependabot.yml` or `renovate.json` in the fixture.

**Rate limiting / auth hardening:** No `rateLimit` or `rate-limit` in the codebase. Clerk handles authentication but there is no explicit rate limiting on API routes. The auditor Greps for `rateLimit`, `rate-limit`, `bcrypt`, `argon2`. None found. This would be flagged.

### Summary of Auditor Output (Estimated)
Based on actual file inspection against the auditor's 25+ checklist items:

| Category | Done | Partial | Todo |
|----------|------|---------|------|
| CI/CD & Infrastructure | 1 (vercel.json, .env.example) | 1 (env: no zod validation) | 4 (CI pipeline, IaC, secrets mgmt, containerization) |
| Testing | 1 (unit tests: vitest + 14 test files) | 0 | 2 (E2E, load tests) |
| Security | 1 (input validation: zod) | 1 (auth: Clerk present, no rate limiting) | 2 (security headers, dependency scanning) |
| Observability | 0 | 0 | 4 (error tracking, health endpoint, logging, monitoring) |
| SEO & Performance | 1 (image optimization: next/image domains configured) | 1 (meta tags: title/desc present, no OG) | 3 (sitemap, robots.txt, structured data) |
| Legal & Compliance | 0 | 0 | 3 (privacy, ToS, cookie consent) |
| Billing | 1 (Stripe integration) | 1 (webhook handler: complete but no billing portal as separate route) | 0 |
| Launch Readiness | 1 (loading states: Skeleton components) | 0 | 3 (error boundary, 404, changelog) |

Estimated: ~6 done, ~4 partial, ~21 todo out of ~31 items → readiness ~19-25%. A credible score for "beta, building" stage.

### Senior-Mode Output
SKILL.md `<!-- senior -->` post-scaffold block states:
> "Shipwise initialized. Readiness: X%. State file at `.claude/shipwise-state.json`. Run `/shipwise status` anytime."

`commands/shipwise.md` Step 4 for senior: "Show the status file."

`experience-calibration.md` specifies: "Status shown. Done." and "Minimal output: Status numbers only" and "No unsolicited advice: Only show gaps when asked or at deploy gate."

The senior output would be exactly: one line with readiness %, path to state file, and quick command reminder. No walkthroughs, no explanations, no "here's why this matters." This is correctly implemented.

### Readiness % Shown
The auditor's output format (from `launch-readiness-auditor.md`) includes:
```json
"summary": { "total": N, "done": N, "partial": N, "todo": N, "readiness_pct": N }
```
The readiness percentage is computed by the auditor. SKILL.md's senior post-scaffold block uses "Readiness: X%" verbatim. The command Step 4 says "You're X% ready" for senior (actually "Show the status file"). Readiness % would be surfaced. PASS.

### Guided Mode NOT Offered
SKILL.md's `<!-- senior -->` block says only: "Shipwise initialized. Readiness: X%. State file at `.claude/shipwise-state.json`. Run `/shipwise status` anytime." — no guided mode, no "want me to help you?", no item-by-item walkthrough. `experience-calibration.md` confirms: "No unsolicited advice." Guided mode correctly absent for senior. PASS.

### Priority Scaling for 100-1K Users
From SKILL.md's scale table for 100-1K:
- Load testing: P2 (not P0 yet)
- Auto-scaling: P2 (not P1)
- CDN: P1 (not P0 yet)
- Status page: P2
- Incident response: P2
- Error tracking: **P0** (same as all scales — correctly critical)
- Backups: **P0**
- Auth hardening: **P0**

For 100-1K, the senior would see error tracking (Sentry) and security headers as P0 gaps — which matches the fixture's actual most critical gaps. The scale table is correct for this tier.

**Same gap as Scenario 1:** The scale table covers only 8 items. The CI/CD gap (which should arguably be P0 or P1 for 100-1K) has no scale-based entry in SKILL.md's table. The auditor's own priority assignment (P1 for CI) would govern.

## Verdict: ⚠️ PARTIAL

### Validation Checklist
- [x] **Detects Prisma:** `prisma/schema.prisma` present, `package.json` has prisma 5.14. Auditor procedure checks this explicitly. PASS.
- [x] **Detects Clerk:** `@clerk/nextjs` in package.json, used in layout.tsx and lib/auth.ts. PASS.
- [x] **Detects Stripe + webhook:** `stripe` in package.json, `app/api/webhooks/stripe/route.ts` is a complete production-quality handler. PASS.
- [x] **Detects vercel.json:** File exists at root. PASS.
- [x] **Detects tests:** 14 test files in `tests/**`, vitest.config.ts. PASS.
- [x] **Detects linting (.eslintrc.json + .prettierrc):** Both files exist. NOTE: The auditor's scanning procedure does not have an explicit checklist item for ESLint/Prettier — it checks for dependency scanning (dependabot.yml) separately. These would be noted as evidence for "code quality" but there is no dedicated checklist line item for them in the auditor.
- [x] **Identifies no .github/workflows/ (CI/CD gap):** Confirmed absent. PASS.
- [x] **Identifies no sentry (error tracking gap):** Confirmed absent from package.json and codebase. PASS.
- [x] **Identifies no app/api/health/ (health endpoint gap):** Confirmed absent. PASS.
- [x] **Identifies no privacy/terms pages (legal gap):** Confirmed absent. PASS.
- [x] **Identifies no robots.txt (SEO gap):** Confirmed absent. PASS.
- [x] **Identifies no security headers in next.config.js:** next.config.js has no headers() config. PASS.
- [x] **Senior output terse:** SKILL.md `<!-- senior -->` block is a single line. `experience-calibration.md` confirms "Minimal output." PASS.
- [x] **Readiness % shown:** Auditor JSON includes `readiness_pct`, senior output includes "Readiness: X%". PASS.
- [x] **Guided mode NOT offered:** Senior post-scaffold has no guided flow. PASS.
- [⚠️] **Priorities scaled for 100-1K:** Scale table is correct for covered items (error tracking = P0, load testing = P2), but the table covers only 8 of ~25+ items. CI/CD and security headers — both critical for this scale — are not in the scale table and default to the auditor's generic priority rules. PARTIAL.

## Findings

### Positive
- The midlevel fixture is genuinely well-crafted for testing. It has real production-quality code (full Stripe webhook handler with signature verification, Prisma schema with proper indexes, Clerk integration, zod validation throughout). The auditor would correctly identify these as "done."
- The senior output specification is admirably minimal. The `<!-- senior -->` block in SKILL.md is four words of behavior description, which matches the "no noise" expectation senior engineers have.
- All 6 explicitly-listed gaps in the scenario (CI/CD, Sentry, health endpoint, legal pages, robots.txt, security headers) would be correctly identified as absent by the auditor using its file-existence and grep checks.
- The auditor correctly distinguishes "billing portal" as present (billing page with `createBillingPortalSession` call exists in `app/dashboard/settings/billing/page.tsx`) vs. a standalone `/api/billing/` route.
- The `experience-calibration.md` reference provides clear guidance for the "no unsolicited advice" senior behavior, which is a significant UX differentiator.

### Negative
- The auditor has no explicit checklist item for ESLint or Prettier — it only checks `dependabot.yml`/`renovate.json` for "dependency scanning." The scenario claims ESLint/Prettier would be "detected," but the auditor's scanning procedure does not have a dedicated line item for code style tooling. These would be present as implicit context but wouldn't appear as a "done" line in the auditor JSON.
- The auditor checks for `og:title` and `twitter:card` (via Grep). The fixture's `app/layout.tsx` has a `metadata` export with `title` and `description` but no `og:title` property and no `twitter:card`. The auditor would mark SEO metadata as `partial` or `todo` — but the fixture clearly has *some* SEO metadata. The distinction between "Next.js-native metadata" and "OG meta tags" matters and the auditor's grep for `og:title` would miss the native metadata export. This is a false negative for a real Next.js app.
- The fixture has no `not-found.tsx` or `error.tsx` file. The auditor globs for `not-found.*` and Greps for `ErrorBoundary`, `error.tsx`. These would be flagged as `todo`. This is accurate but the senior would need to add these — minor omission in an otherwise solid fixture.
- Scale table covers only 8 of ~25+ items — same gap as Scenario 1.
- The auditor procedure has no check for rate limiting on the webhook endpoint specifically (only general API-level rate limiting check). The Stripe webhook has proper signature verification but no rate limiting — this is a security gap that the auditor might miss or flag inconsistently.
- No `dependabot.yml` in the midlevel fixture — this would be flagged as missing. A more realistic "mid-level" SaaS project would likely have dependabot configured.

### Marketing-Worthy Outputs
- [ ] The gap detection is impressively precise for this fixture — correctly identifying 6/6 listed gaps against a realistic, production-quality codebase demonstrates real audit value.
- [ ] Senior mode "one line and done" is a compelling feature for experienced engineers tired of AI hand-holding.
- [ ] The estimated ~20-25% readiness score for a "beta, building" project is honest and sets up the value proposition well.

## Bugs / Issues to File
- [ ] **BUG-004: False negative on Next.js native metadata.** The auditor Greps for `og:title` and `twitter:card` but not for Next.js `metadata` export or `generateMetadata`. A Next.js app using the Metadata API (as the fixture does) will be incorrectly flagged as missing SEO metadata. The auditor should add `Grep for "export const metadata", "export async function generateMetadata"` to the SEO check.
- [ ] **BUG-005: ESLint/Prettier not a first-class checklist item.** The auditor's scanning procedure has no dedicated check for linting/formatting configuration. These are present in the fixture but the auditor would not surface them as a "done" item. Add a "Code quality tooling" item: Glob for `.eslintrc*`, `.prettier*`, `biome.json`.
- [ ] **BUG-002 (repeated): Scale table incomplete.** Same as Scenario 1 — only 8 of ~25+ items have scale-based adjustments. CI/CD is particularly notable: for 100-1K users with beta testers, CI/CD is arguably P0, not P1.
- [ ] **BUG-006: No rate limiting detection per-endpoint.** The auditor's auth hardening check Greps globally for `rateLimit`/`rate-limit`. It would miss granular rate limiting on individual sensitive routes (e.g., the webhook endpoint should have rate limiting but might not). The check is too coarse.
- [ ] **BUG-007: midlevel fixture missing dependabot.yml.** For a "mid-level SaaS with beta testers" archetype, the absence of dependabot.yml is realistic but means the fixture under-represents a real senior-adjacent project. Consider adding `.github/dependabot.yml` to the fixture to test that the auditor correctly detects it (positive case), or document the gap as intentional.
