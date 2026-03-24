# Scenario 11: /launch-checklist Domain Deep-Dive — Test Results

**Date:** 2026-03-24
**Tested by:** QA (automated file inspection)
**Method:** Direct file reads of all referenced command and skill files

---

## Summary

| Prompt | Domain | Maps to Skill | Status |
|--------|--------|---------------|--------|
| A | security | 08-security-compliance | PASS |
| B | architecture | 04-tech-architecture | PASS with gap |
| C | billing | 11-billing-payments | PASS |
| D | cooking (invalid) | — | PARTIAL — no explicit error handler |

---

## Prompt A: `/launch-checklist security`

### Routing

The command file (`commands/launch-checklist.md`) contains a domain-to-skill mapping table. "security" maps to `08-security-compliance`. The mapping is unambiguous and explicit. PASS.

### Checklist items in skill 08

The `SKILL.md` contains 6 checklist items across named sections:

1. OWASP Top 10 Compliance
2. Security Headers
3. Auth Hardening
4. Input Validation
5. Dependency Scanning
6. Secret Scanning

Each item has three dual-mode blocks (`<!-- beginner -->`, `<!-- intermediate -->`, `<!-- senior -->`) with progressively terse output and varying detail level. A Verification Steps section follows, with 6 concrete test steps. Companion tools are listed.

### Validation: OWASP Top 10

**PASS.** `SKILL.md` explicitly names OWASP Top 10 (2025) coverage in the Coverage section and the checklist item. `references/owasp-checklist.md` contains a full walkthrough of all 10 categories (A01–A10), each with:
- Plain-English explanation of the risk
- Manual verification steps
- Copy-paste code templates (TypeScript, YAML)

Categories covered: A01 Broken Access Control, A02 Cryptographic Failures, A03 Injection, A04 Insecure Design, A05 Security Misconfiguration, A06 Vulnerable Components, A07 Authentication Failures, A08 Software/Data Integrity, A09 Logging Failures, A10 SSRF. A decision framework guides which to prioritize first.

### Validation: Auth Hardening

**PASS.** `references/auth-hardening-checklist.md` covers 6 sections:
1. Argon2id Password Hashing — with full TypeScript implementation including rehash-on-login pattern
2. Rate Limiting — Redis-backed, per-IP+username keyed; separate limiters for auth, API, and password reset
3. Secure Session Configuration — httpOnly/secure/sameSite/short-TTL cookie config and JWT variant
4. CSRF Protection — double-submit cookie pattern with full middleware implementation
5. HaveIBeenPwned Password Check — k-anonymity API call, full implementation
6. MFA / TOTP — decision tree on when MFA is required, full TOTP setup with QR code generation

All items have copy-paste TypeScript templates with `[CUSTOMIZE]` markers.

### Validation: Security Headers

**PASS.** `SKILL.md` lists CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, and Permissions-Policy. `references/security-headers/` contains:
- `nextjs-headers.ts` — full Next.js config with all 7 headers, nonce-based CSP generation via middleware, and App Router layout integration
- `express-helmet.ts` — helmet-based Express config (file confirmed in directory listing)
- `nginx-headers.conf` — nginx config variant (file confirmed in directory listing)

The Next.js template includes X-XSS-Protection as a seventh header. HSTS includes `max-age=31536000; includeSubDomains; preload`. CSP uses nonce-based generation per request.

### Validation: Dependency Scanning

**PASS.** `references/dependency-scanning-setup.md` covers 7 sections with full copy-paste YAML/TOML/bash:
1. Dependabot configuration (`.github/dependabot.yml`) — with grouping rules, automerge, vulnerability alert schedule
2. Renovate configuration (`renovate.json`) — for non-GitHub platforms, semantic commits, automerge logic
3. Snyk CI integration — GitHub Actions workflow with both SCA and SAST modes, Socket alternative included
4. npm audit in CI — standalone YAML snippet
5. gitleaks pre-commit hook — `.gitleaks.toml` with allowlists, `.pre-commit-config.yaml`, install commands
6. trufflehog historical scanning — GitHub Actions workflow, local scan commands
7. Combined CI security workflow — single `security.yml` running all three tools

### Cross-cutting: Experience Level Rendering

**PASS.** All 6 checklist items in security use the `<!-- beginner -->` / `<!-- intermediate -->` / `<!-- senior -->` comment pattern. Beginner blocks include analogies and rationale. Intermediate blocks list specific parameters and tool names. Senior blocks are terse references. The command procedure step 4 states: "Present the checklist with ... priority indicators (P0/P1/P2)". However, the `SKILL.md` does not assign explicit P0/P1/P2 labels to individual items — the priority indicators are specified in the command but not pre-labeled in the skill content. Minor gap.

### Cross-cutting: State Cross-Reference

**PASS (specification).** The command procedure step 3 says: "Cross-reference with `.claude/shipwise-state.json` to mark completed items." The command defines the cross-reference behavior. No `shipwise-state.json` file exists in this worktree (it would be created during actual project scaffold), so completion marking cannot be verified statically. The intent is specified correctly.

---

## Prompt B: `/launch-checklist architecture`

### Routing

"architecture" maps to `04-tech-architecture` in the domain-to-skill mapping table. PASS.

### Checklist items in skill 04

**Partial pass — skill is advisory, not checklist-formatted.** Unlike skill 08 (security), skill 04 (`04-tech-architecture/SKILL.md`) is structured as an **architecture advisor** with decision trees, comparison matrices, and recommendation logic — not a traditional checklist with items to tick off. There are no `<!-- beginner -->` / `<!-- intermediate -->` / `<!-- senior -->` dual-mode blocks in the same checklist-item format.

The skill does cover the expected domains:

- **Stack decisions:** Frontend framework matrix (Next.js, Astro, SvelteKit, Vue/Nuxt with project-type recommendations), backend/API strategy (tRPC, REST, GraphQL, gRPC decision tree), database selection (PostgreSQL as default with deviation signals)
- **Hosting:** Quick-picks table (Vercel/Railway/Fly.io/AWS SST/Cloudflare Pages) with cost brackets from $0 to $200+/mo
- **Auth strategy:** 8-option decision tree (Auth0, Clerk, Supabase, Auth.js, Firebase, Lucia, Custom JWT, Custom session)
- **CI/CD:** Referenced implicitly; routing to `06-platform-infrastructure` is noted for deployment setup. No explicit CI/CD checklist within the skill itself.
- **Environments:** Not covered within the tech-architecture skill. Environment management lives in `06-platform-infrastructure/references/environment-management.md`, not here.

**Gap identified:** The command routes `/launch-checklist architecture` to skill 04, but skill 04 is a decision-support advisor (present recommendations and scaffold), not a checklist-format file. When rendered as a checklist, it lacks:
- Pre-formatted checklist items with checkboxes
- P0/P1/P2 priority indicators
- Time estimates
- "Want me to implement this now?" prompts per item

The skill works well for interactive guidance but does not produce a structured checklist on demand. This is a structural mismatch between the command's stated output format and the skill's content format.

**Environments and CI/CD noted gap:** CI/CD is absent from skill 04. Architecture decisions about CI/CD strategy (e.g., choosing GitHub Actions vs CircleCI, branching strategy) are not addressed in this skill. Environment strategy (staging, preview, production separation) is in skill 06, not skill 04. A user running `/launch-checklist architecture` would not see those items.

---

## Prompt C: `/launch-checklist billing`

### Routing

"billing" maps to `11-billing-payments` in the domain-to-skill mapping table. PASS.

### Checklist items in skill 11

The `SKILL.md` contains 7 checklist items:

1. Payment Processor Selection
2. Subscription Architecture
3. Billing Portal
4. Webhook Architecture
5. Tax Compliance Strategy
6. Dunning & Retry Logic
7. Free Trial Design

All items use the `<!-- beginner -->` / `<!-- intermediate -->` / `<!-- senior -->` dual-mode blocks. A Verification Steps section has 7 concrete test steps using Stripe test mode. Companion tools are listed. PASS.

### Validation: Processor Selection

**PASS.** Checklist item covers Stripe, Paddle, Lemon Squeezy. `references/processor-comparison-matrix.md` contains:
- Decision flowchart (tax handling preference, API flexibility, revenue scale, solo founder path)
- Full comparison matrix (25 criteria rows: fees, tax handling, payout schedule, payment methods, subscription billing, fraud protection, PCI compliance, API quality, etc.)
- Two cost comparison scenarios (US-only 100 customers; international 500 customers)
- Copy-paste Stripe and Paddle config templates with plan definitions, dunning config, billing portal config

### Validation: Subscription Management

**PASS.** Checklist item covers plan tiers, billing periods, upgrades/downgrades with proration, cancellation (`cancel_at_period_end`), webhook sync, plan versioning. `references/pricing-model-frameworks.md` covers:
- Pricing model decision framework (per-seat, usage-based, tiered, flat-rate, freemium, hybrid)
- Model comparison table with pros/cons
- Tier design patterns and the 3-tier rule
- Annual vs monthly discount guidance (15–25%)
- Van Westendorp price sensitivity methodology
- Feature gating middleware (TypeScript) with `PLAN_FEATURES` and `PLAN_LIMITS` records, `requireFeature()` and `requireLimit()` middleware factories
- Pricing page component data structure (TypeScript interface + sample tiers array)

### Validation: Webhooks

**PASS.** Checklist item covers HMAC verification, idempotent processing, async handling, critical event list. `references/dunning-strategy.md` contains:
- A complete TypeScript webhook handler (`app/api/webhooks/stripe/route.ts`) with:
  - Raw body parsing for HMAC verification
  - `stripe.webhooks.constructEvent()` signature check
  - Event deduplication pattern with `checkEventProcessed()` / `markEventProcessed()` stubs
  - 7 event handlers: checkout.session.completed, customer.subscription.created, customer.subscription.updated, customer.subscription.deleted, invoice.payment_succeeded, invoice.payment_failed, customer.subscription.trial_will_end
  - Full dunning flow: `startDunningFlow()`, `endDunningFlow()`, `sendDunningEmail()` with template mapping by attempt count, `suspendAccount()`
  - Card expiry cron job template

### Validation: Tax Compliance

**PASS.** Checklist item covers MoR (Paddle/Lemon Squeezy), Stripe Tax, and manual (TaxJar/Avalara) strategies. `references/tax-compliance-guide.md` contains:
- Full decision tree (US only vs EU vs international) with nexus threshold analysis
- US economic nexus thresholds table (10 states with rates and SaaS taxability)
- EU VAT rates by country (11 countries), OSS registration, B2B reverse charge
- EU VAT-compliant invoice requirements checklist
- Three-approach comparison (MoR vs Stripe Tax vs manual) with effort/cost/coverage summary
- Copy-paste Stripe Tax TypeScript implementation: `createTaxAwareCheckout()`, `createTaxAwareSubscription()`, `validateTaxId()`, `setCustomerTaxExempt()`, `handleTaxIdVerified()`, product tax code configuration
- Stripe Tax setup checklist (9 steps)

---

## Prompt D: `/launch-checklist cooking` (invalid domain)

### How the command handles unknown domains

**GAP — error handling is unspecified.** The command file defines:
- A domain-to-skill mapping table with 14 entries
- Procedure steps 1–5 that assume a valid domain is provided
- A single edge case: "If no domain specified: Show the list of available domains with their completion percentages."

There is **no explicit handling for an unrecognized domain** such as "cooking". The command does not state:
- "Unknown domain — show an error message"
- "Fuzzy-match to nearest domain"
- "Respond with available domain list"

The 14-entry mapping table lists: security, billing, seo, observability, legal, testing, infrastructure, architecture, design, growth, fullstack, launch, idea, business. "cooking" does not appear.

**Expected behavior (inferred):** A model executing this command would likely fall through to a generic error or default behavior since the procedure assumes a valid mapping. The closest specified behavior is the "no domain specified" case — showing available domains — but this applies to a missing argument, not an invalid one.

**Recommendation:** The command should add an explicit fallback clause such as: "If the domain is not in the mapping table: Respond with 'Unknown domain: [domain]. Available domains are: [list]. Try `/launch-checklist security`, `/launch-checklist billing`, etc.'"

---

## Cross-Cutting Analysis

### Experience Level Rendering

| Skill | Dual-Mode Blocks Present | P0/P1/P2 Labels in Skill |
|-------|-------------------------|--------------------------|
| 08-security-compliance | YES — all 6 items | NO — not labeled in skill |
| 04-tech-architecture | NO — uses section headings, not checklist blocks | NO |
| 11-billing-payments | YES — all 7 items | NO — not labeled in skill |

The command specifies rendering with priority indicators. Neither security nor billing skills pre-label items with P0/P1/P2. The architecture skill uses a different structural format entirely. The model executing the command would need to infer priorities at runtime rather than read them from the skill content. This is a consistent gap across all three domains.

### State Cross-Reference

The command specifies: "Cross-reference with `.claude/shipwise-state.json` to mark completed items." No `shipwise-state.json` exists in this worktree (it is created during `/shipwise` scaffold). The cross-reference behavior is specified but cannot be statically validated. The command's intent is correct but would be a no-op until a state file exists.

### Offer to Implement P0 Items

The command specifies: "For each incomplete P0 item, offer: 'Want me to implement this now?'" This is a runtime behavior dependent on which items are P0 and which are incomplete. Since items are not pre-labeled P0/P1/P2 in skill content, the model must determine this dynamically. The mechanism is specified but leaves classification to runtime inference.

---

## Findings Summary

### Passes

1. Domain routing table covers 14 domains and is complete for all tested valid domains (security, architecture, billing). PASS.
2. Security checklist (skill 08) — OWASP Top 10 fully covered (A01–A10 with code templates). PASS.
3. Security checklist (skill 08) — Auth hardening fully covered (Argon2id, rate limiting, session config, CSRF, HIBP, MFA). PASS.
4. Security checklist (skill 08) — Security headers fully covered (CSP, HSTS, XFO, XCTO, Referrer-Policy, Permissions-Policy; 3 framework variants). PASS.
5. Security checklist (skill 08) — Dependency scanning fully covered (Dependabot, Renovate, Snyk, Socket, npm audit, gitleaks, trufflehog). PASS.
6. Billing checklist (skill 11) — Processor selection covered (Stripe vs Paddle vs Lemon Squeezy with 25-criteria matrix and cost scenarios). PASS.
7. Billing checklist (skill 11) — Subscription management covered (plans, proration, cancellation, versioning, feature gating). PASS.
8. Billing checklist (skill 11) — Webhooks covered (HMAC verification, idempotency, async handling, 7 event handlers with full TypeScript template). PASS.
9. Billing checklist (skill 11) — Tax compliance covered (MoR vs Stripe Tax vs manual; US nexus, EU VAT, invoice requirements, copy-paste implementation). PASS.
10. Experience level dual-mode output present in security and billing skills. PASS.

### Gaps

1. **Prompt D — invalid domain handling unspecified.** The command handles missing domain but not invalid domain. No error message or fallback list is defined for unrecognized inputs like "cooking". Medium severity.
2. **Prompt B — skill 04 is not checklist-formatted.** The architecture skill is a decision advisor, not a pre-formatted checklist. When invoked via `/launch-checklist architecture`, the output format will differ structurally from security or billing. No checklist items with time estimates or checkboxes exist in the skill. Medium severity.
3. **Prompt B — CI/CD and environments absent from skill 04.** These architecture-adjacent concerns live in skill 06. A user invoking `/launch-checklist architecture` expecting a complete architecture readiness list will not see CI/CD or environment strategy items. Low-medium severity.
4. **P0/P1/P2 labels absent from skill content.** The command specifies priority rendering but no skill pre-labels items. Priorities must be inferred at runtime. The behavior is implementation-dependent. Low severity — the model can infer these reasonably.
5. **State cross-reference requires a pre-existing shipwise-state.json.** On a fresh project without having run `/shipwise`, completion marking will silently do nothing. This is expected behavior but warrants a note in the command or skill. Low severity.
