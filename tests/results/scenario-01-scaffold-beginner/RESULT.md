# Scenario 1: Fresh Scaffold — Beginner Founder

## Metadata
- **Date:** 2026-03-24
- **Skill(s) tested:** 00-launch-assess/SKILL.md, commands/shipwise.md, agents/launch-readiness-auditor.md
- **User archetype:** beginner (New to coding)
- **Interaction mode:** scaffold
- **Test fixture:** tests/fixtures/beginner-nextjs-project/

## Objective
Validate that `/shipwise` correctly interviews a beginner founder, detects the minimal Next.js project from the fixture, generates appropriate state, injects CLAUDE.md context, presents plain-English output, offers guided mode, and scopes the checklist appropriately for <100 users.

## Test Prompt
`/shipwise` then answers: SaaS, B2C (actually B2B per scenario — noted), Building, Next.js, No users, Freemium, Solo, New to coding, <100 users.

## Expected Behavior
1. Questions asked one at a time
2. Auditor detects Next.js from package.json
3. `experience_level: "beginner"` in state.json
4. Context injected into CLAUDE.md via templates/claude-md-inject.md
5. Beginner output in plain English (jargon defined)
6. Guided mode offered after scaffold
7. Checklist scoped appropriately for <100 users (load testing, auto-scaling, CDN as P2/skip)

## Actual Behavior

### Interview Flow
The `/shipwise` command (commands/shipwise.md) explicitly instructs: "Ask these 9 questions **one at a time**, waiting for each answer." This is unambiguous. The skill `SKILL.md` reinforces it: "Ask questions one at a time — don't dump all 9 at once." Both sources agree. The flow would be smooth.

### Stack Detection
The auditor scanning procedure checks `package.json` for `next`, `nuxt`, `svelte`, etc. The beginner fixture's `package.json` contains `"next": "14.2.3"` — this is a clean, unambiguous hit. The auditor would correctly detect: framework=nextjs, language=typescript, no database (no prisma/drizzle), no hosting config (no vercel.json/fly.toml), package_manager=npm.

**What the auditor would find in the beginner fixture (actual file inventory):**
- `package.json` — next 14.2.3, react, tailwindcss only. No auth, no DB, no Stripe.
- `next.config.js` — empty (`const nextConfig = {}`). No security headers.
- `app/page.tsx` — static landing page. No metadata export, no og:title.
- `app/layout.tsx` — basic layout. No ClerkProvider, no metadata.
- `app/globals.css` — CSS only.
- No `.github/workflows/` — no CI/CD.
- No `tests/` directory — no tests.
- No `prisma/` — no database.
- No `.env.example` — no environment config.
- No `robots.txt`, `sitemap`, legal pages.
- No error tracking, health endpoints, or observability.

The auditor would produce a very low readiness score. Roughly: 0-1 items done out of ~25 checklist items (image optimization via `next/image` might register as present but there's no usage in the fixture). Readiness estimate: ~4-8%.

### experience_level mapping
SKILL.md states: `"New to coding" → beginner`. The user answers "New to coding." The mapping is explicit and correct. `shipwise-state.json` would contain `"experience_level": "beginner"`.

The state schema (`templates/shipwise-state-schema.json`) confirms `"beginner"` is a valid enum value. The SKILL.md JSON template shows where it goes. Generation would work correctly.

### CLAUDE.md Injection
SKILL.md (line 134) instructs: "inject a context block into the project's CLAUDE.md (create if it doesn't exist). Use the template at `templates/claude-md-inject.md`."

`templates/claude-md-inject.md` exists and contains a template with `{{project_type}}`, `{{audience}}`, `{{stack_summary}}`, `{{current_phase}}`, `{{experience_level}}`, `{{expected_scale}}`, and `{{top_gaps}}` placeholders. The template is well-formed and covers all needed fields.

**Gap found:** SKILL.md references `templates/claude-md-inject.md` but the template itself uses `{{mustache}}` style placeholders. There is no instruction in SKILL.md or the command specifying how Claude should fill these placeholders (string replacement vs. direct generation). This is implicit — Claude would be expected to interpolate them, but there is no explicit "replace `{{project_type}}` with..." instruction. In practice a capable LLM would do the right thing, but it is an underspecified step.

### Beginner-Mode Output
SKILL.md has a `<!-- beginner -->` block in the "Post-scaffold behavior" section:
> "Great! I've scanned your project and found your launch readiness score. Let's work through the most important items together. Here's your #1 priority — want me to help you set it up?"

The `references/experience-calibration.md` further specifies: checklist items should include "plain English 'why' + 'how to fix' with step-by-step," jargon should always be explained with parenthetical definitions, and deploy gate should offer "Want me to fix these?"

This beginner-mode guidance is well-documented and detailed. A model following these instructions would produce genuinely plain-English output.

### Guided Mode
SKILL.md's beginner post-scaffold block explicitly describes guided mode: walk through items one at a time, ask "Ready for the next one?" after each completion. `experience-calibration.md` confirms: "After scaffold, walk through items one at a time."

The `/shipwise` command (Step 4) also specifies beginner: `"You're X% ready. Let's start with the most important item. Say 'next' when ready."` — this aligns with guided mode. Guided mode would be offered.

### Scale-Based Priority Adjustments (<100 users)
SKILL.md contains an explicit scale table. For `<100` users:
- Load testing: P2
- Auto-scaling: skip
- CDN: P2
- Status page: P2
- Incident response: P2
- Error tracking: P0 (still critical)
- Backups: P0 (still critical)
- Auth hardening: P0 (still critical)

With no users and a bare project, the beginner checklist would correctly focus on fundamentals (error tracking, auth, backups) rather than performance items. This is appropriate scope.

**However:** The scale table in SKILL.md only covers 8 items. The auditor produces ~25 checklist items. The scale-priority override logic only adjusts a subset of items. Items like "CI/CD pipeline," "legal pages," "SEO metadata," and "security headers" have no scale-based adjustment — they default to the agent's own priority assignment (`P0 = security + error tracking + auth + backups, P1 = testing + CI + monitoring, P2 = SEO + legal + nice-to-have`). This is functional but the scale table has limited coverage.

## Verdict: ⚠️ PARTIAL

### Validation Checklist
- [x] **Interview flow — one at a time:** Both `shipwise.md` and `SKILL.md` explicitly instruct one question at a time. PASS.
- [x] **Detects Next.js from package.json:** Auditor procedure checks `package.json` for `next`. Fixture has `"next": "14.2.3"`. Clear detection. PASS.
- [x] **experience_level: "beginner" generated:** SKILL.md mapping `"New to coding" → beginner` is explicit. PASS.
- [x] **CLAUDE.md injection:** Template exists at `templates/claude-md-inject.md`, SKILL.md instructs its use. PASS (with caveat below).
- [x] **Beginner output in plain English:** `<!-- beginner -->` blocks and `experience-calibration.md` both define this behavior with good specificity. PASS.
- [x] **Guided mode offered:** Explicitly in SKILL.md beginner post-scaffold block and Step 4 of shipwise.md. PASS.
- [⚠️] **Checklist scoped for <100 users:** Scale table covers 8 items correctly, but ~17 checklist items have no scale adjustment. Partial coverage. PARTIAL.

## Findings

### Positive
- One-at-a-time interview is unambiguously specified in two places (command + skill), reducing risk of the model dumping all questions at once.
- Experience level mapping is a crisp 4-entry table with no ambiguity. "New to coding" → `beginner` is immediately clear.
- `templates/claude-md-inject.md` is a fully formed template that produces useful persistent context across sessions — this is a strong design.
- Beginner post-scaffold guided mode is spelled out in natural language in both SKILL.md and the calibration reference, giving two reinforcing sources.
- The auditor for this fixture would produce a very low score (~4-8%), which is honest and sets appropriate expectations for a bare create-next-app project.
- `experience-calibration.md` is thorough — it covers whispers, deploy gate, session context, and post-scaffold output per level.

### Negative
- The `templates/claude-md-inject.md` placeholder substitution mechanism is unspecified. There is no instruction telling Claude explicitly how to interpolate `{{top_gaps}}` from the auditor's JSON output. A model could leave the literal `{{top_gaps}}` string in CLAUDE.md.
- The scale-priority table in SKILL.md covers only 8 of ~25 checklist items. Items like "legal pages," "security headers," and "CI/CD" have no scale adjustment. For a <100-user beginner project, CI/CD might reasonably be P2 rather than P1, but the table doesn't say so.
- The beginner fixture has no `.env.example`, no auth, no database — the auditor will produce ~20+ "todo" items. The beginner guided mode will walk through these one at a time, but there is no guidance in SKILL.md on how to prioritize which item to present first. The skill says "your #1 priority" but does not specify whether that is the first P0 item from the auditor output or something else.
- No `not-found.tsx`, `error.tsx`, or `loading.tsx` in the beginner fixture — the auditor would flag these as missing, but there is no beginner-specific explanation of what these files do or why they matter, beyond what `experience-calibration.md` implies.

### Marketing-Worthy Outputs
- [ ] The guided mode walkthrough ("Here's your #1 priority — want me to help you set it up?") is a compelling product moment for beginner founders if it works as intended.
- [ ] The CLAUDE.md injection creating persistent session context is a differentiating feature worth demonstrating.

## Bugs / Issues to File
- [ ] **BUG-001: Placeholder substitution unspecified.** `templates/claude-md-inject.md` uses `{{mustache}}` placeholders but neither SKILL.md nor shipwise.md instructs how to fill them. Risk: literal `{{top_gaps}}` appears in the user's CLAUDE.md.
- [ ] **BUG-002: Scale table incomplete.** SKILL.md scale table covers only 8 items. The remaining ~17 auditor items (CI/CD, legal, SEO, error boundaries, etc.) receive no scale-based adjustment. Recommendation: expand the table or add a default rule for items not listed.
- [ ] **BUG-003: No first-item prioritization rule for guided mode.** The beginner post-scaffold says "Let's start with the most important item" but there is no rule specifying the ordering or selection criteria for "most important." The auditor's priority field (P0 > P1 > P2) is the implicit tie-breaker, but this is not stated.
