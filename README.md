<div align="center">

# Shipwise

**Ship wisely.**

The webapp launch lifecycle plugin for Claude Code.

15 skills · 7 audit agents · 4 automatic hooks · 78 copy-paste templates

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tests: 25/25](https://img.shields.io/badge/Tests-25%2F25_passing-brightgreen.svg)](#tested)
[![Version: 0.6.4](https://img.shields.io/badge/Version-0.6.4-blue.svg)](CHANGELOG.md)

[Install](#quick-start) · [How it works](#how-it-works) · [Skills](#skills) · [Audit architecture](#audit-architecture) · [Docs](https://harmansidhudev.github.io/shipwise/)

</div>

---

## The 30-second pitch

Shipwise makes Claude Code's answers production-ready. It auto-loads security
best practices when you write auth code, warns you before deploying with missing
error tracking, and tracks your launch readiness across sessions. One command to
set up, then it works in the background.

In our Before/After test, the same auth prompt scored 18/40 without Shipwise and
37/40 with it — a 106% improvement covering all 11 security dimensions, including
rate limiting, CSRF protection, session hardening, and password breach checking.

## Quick Start

```bash
# Install
/plugin install shipwise

# Initialize (one-time scaffold — 9 questions, codebase scan, profile card)
/shipwise

# That's it. Hooks are active. Skills auto-trigger.
# Build your app — Shipwise watches your back.

# Helpful commands:
/shipwise help                  # Show commands, skills, hooks
/shipwise status                # Readiness score + history
/shipwise set-level senior      # Change experience level
/shipwise pause                 # Temporarily disable (keeps state)
/shipwise resume                # Re-enable hooks and skills
/launch-audit                   # Full codebase re-scan (4 agents in parallel)
/launch-audit quick             # Incremental scan of changed files only
/launch-checklist security      # Deep-dive a domain
```

### Status line (optional)

Show Shipwise readiness in the CLI status bar:

```bash
# Download the status line script into your project
curl -o .claude/shipwise-statusline.sh https://raw.githubusercontent.com/harmansidhudev/shipwise/main/scripts/statusline.sh
chmod +x .claude/shipwise-statusline.sh
```

Then add to `.claude/settings.json`:
```json
{
  "statusLine": {
    "type": "command",
    "command": ".claude/shipwise-statusline.sh"
  }
}
```

Result: `opus · 25% ctx | ⛵ build ████░░░░░░ 42% · 3 P0 gaps`

## How It Works

| Mode | How it works | Your effort |
|------|-------------|-------------|
| **Scaffold** | `/shipwise` scans your codebase, detects your stack, shows a project profile card with readiness score and top gaps, generates a personalized checklist. The scan starts in the background after question 4, so it finishes while you're still answering. | Once, at project start |
| **Checkpoint Gates** | Hooks fire on session start, file edits, and deploys. Whispers tips on auth, billing, API, CI/CD, secrets, and observability code — deduplicated across restarts. Warns before deploying with P0 gaps. | Zero — fully automatic |
| **Contextual Skills** | 15 domain skills auto-load based on your task. Auth code → security patterns. Payment code → billing best practices. | Zero — Claude decides |
| **On-Demand Audit** | `/launch-audit` fans out to 4 specialized agents in parallel. `/launch-audit quick` scans only what changed. `/launch-checklist security` dives into a specific domain. | When you choose |

### Experience calibration

Shipwise adapts to your level. Set during scaffold, changeable anytime with
`/shipwise set-level`. Beginner gets full explanations and guided remediation,
senior gets terse output and code-first responses.

| | Beginner | Intermediate | Senior |
|---|----------|-------------|--------|
| Checklist | Full explanations, step-by-step | Standard terms, links to docs | Terse, code-first |
| Whispers | Jargon explained inline | One-liner reminders | Suppressed if obvious |
| Deploy gate | Guided remediation with examples | Time estimates per item | Gap list only |
| Audit | One clear recommendation | Options with tradeoffs | Decision matrix |

### Scale-aware priorities

Shipwise adjusts priority weighting based on your user scale:

- **< 100 users** — Focus on shipping. Skip SOC 2, skip multi-region.
- **100 - 1K users** — Add error tracking, basic monitoring, privacy policy.
- **1K - 10K users** — Rate limiting, load testing, incident response, backup/DR.
- **10K+ users** — Full observability, SOC 2 readiness, multi-region, cost optimization.

## Audit Architecture

`/launch-audit` doesn't run one big scan. It fans out to four specialized agents
that scan different domains at the same time, then merges their findings into a
single readiness state.

```
/launch-audit
     │
     ├─→ auditor-security            security headers, auth, input validation, deps, tests
     ├─→ auditor-infrastructure      CI/CD, Docker, env, secrets, error tracking, health
     ├─→ auditor-ux-accessibility    a11y, empty/loading states, contrast, labels, landmarks
     └─→ auditor-compliance-quality  legal, SEO, billing, code quality, launch readiness
                    │
                    ▼
          merge → state.json → SHIPWISE-STATUS.md
```

All agents run on Haiku with a turn cap, which is what makes the fan-out cheap
enough to run often.

| Mode | What it does | Time | Cost |
|------|-------------|------|------|
| `/launch-audit` | 4 agents in parallel across all domains | ~30-45s | ~$0.12 |
| `/launch-audit quick` | `auditor-delta` scans only git-changed files | ~10-15s | ~$0.03 |
| Background scan | Fires during the `/shipwise` interview after Q4 | Free (overlapped) | — |

**Quick mode** returns only items whose status changed — improved or regressed.
If it detects more than 50 changed files, it automatically falls back to a full
parallel scan.

**Fallback:** if any of the four auditors fails or times out, that domain falls
back to the monolithic `launch-readiness-auditor`, so a partial failure never
produces a partial audit.

### The agents

| Agent | Role |
|-------|------|
| `auditor-security` | Security and auth evidence |
| `auditor-infrastructure` | CI/CD, containerization, env config, observability |
| `auditor-ux-accessibility` | UX and accessibility evidence |
| `auditor-compliance-quality` | Legal, SEO, billing, code quality |
| `auditor-delta` | Incremental scan of `git diff` output only |
| `launch-readiness-auditor` | Monolithic full-checklist scan — the fallback path |
| `gap-analyzer` | Turns audit results into a prioritized plan with time estimates and sequencing |

## Skills

Fourteen domain skills plus `launch-assess`, an orchestrator that detects your
project phase and routes to the right domain skill. You never invoke these
directly — Claude loads them when your task matches.

### Phase 1: Design

| Skill | What it covers |
|-------|---------------|
| `validate-idea` | JTBD framework, Lean Canvas, user interview scripts, competitive analysis, TAM/SAM/SOM calculator, landing page tests |
| `product-design` | MVP scoping (RICE), user stories, wireframe pipeline, 50-item WCAG 2.2 AA checklist, 14-dimension design audit workflow, form UX patterns (multi-step, validation, autosave), onboarding UX (checklist, tooltip tours, activation metrics), micro-interaction patterns (button states, toasts, skeletons, optimistic UI), color system design, motion/animation spec |
| `business-legal-foundation` | Entity formation decision tree, co-founder agreements, IP assignment, trademark, banking, accounting, insurance |

### Phase 2: Build

| Skill | What it covers |
|-------|---------------|
| `tech-architecture` | SaaS boilerplate comparison (5 starters), framework matrix, database selection, auth decision tree, hosting comparison, monorepo guidance |
| `fullstack-development` | Component architecture, state management, API design patterns, multi-tenancy patterns (RLS, Clerk Orgs), database migrations, caching, error handling, dashboard UX patterns (bento grid, KPI cards, zero-data states) |
| `platform-infrastructure` | CI/CD templates (3 stacks), Docker, Terraform, environment management, secrets rotation, DNS/SSL/CDN, preview environments |
| `quality-assurance` | Testing pyramid, Playwright setup + example tests, k6 load test scripts (smoke/spike/soak), cross-browser checklist |
| `security-compliance` | OWASP Top 10, auth hardening (519 lines), CORS config, security headers (Next.js/Express/Nginx), dependency scanning, secret scanning. Detects managed auth (Clerk/Auth0) and skips irrelevant items |

### Phase 3: Ship

| Skill | What it covers |
|-------|---------------|
| `observability-reliability` | Sentry config templates, health endpoints (Next.js/Express), structured logging, alerting architecture, backup/DR with RTO/RPO, incident response playbook, status page setup |
| `seo-performance` | Technical SEO (507-line checklist), structured data templates, Lighthouse targets, Core Web Vitals, Web Vitals RUM (real-user monitoring with `web-vitals` library), bundle optimization, landing page UX guide, pricing page UX guide (tier layouts, comparison matrix, conversion psychology) |
| `billing-payments` | Stripe vs Paddle vs Lemon Squeezy matrix, subscription architecture, webhook HMAC, dunning strategy, tax compliance, free trial design |
| `legal-compliance-final` | Privacy policy requirements, TOS framework, cookie consent, GDPR/CCPA checklist, data retention, SOC 2 readiness, OSS license audit |
| `launch-execution` | Staging regression checklist, pre-ship state verification (25+ binary pass/fail checks per page + global), rollback plan template, war room setup, launch-day timeline (T-2h to T+4h), support channel setup |

### Phase 4: Grow

| Skill | What it covers |
|-------|---------------|
| `growth-ops` | Event taxonomy, funnel instrumentation, conversion funnel audit (5-funnel friction scoring), A/B testing, retention cohorts, privacy-first analytics (Umami/Plausible/OpenPanel setup, consent-aware loading, ad-blocker bypass), revenue analytics (MRR/NRR/LTV from Stripe, SQL templates, revenue dashboard), email lifecycle campaigns (onboarding→win-back), referral program design, cost optimization, content strategy |

### Orchestrator

| Skill | What it covers |
|-------|---------------|
| `launch-assess` | Detects your project phase, assesses readiness, and routes to the right domain skill. The one skill that decides which of the other fourteen you get — it triggers on launch planning, readiness assessment, and "what do I need to ship" queries |

## Tested

Shipwise was tested across 25 scenarios covering trigger accuracy, content
quality, and structural correctness — using 3 test fixture projects (beginner,
mid-level, senior) across beginner, mid-level, and senior developer archetypes.
Includes 13 UX-specific scenarios covering form validation, onboarding flows,
dashboard layouts, pricing pages, and micro-interactions.

**Result: 25/25 scenarios passed.** [Full test results →](tests/)

The key test: same auth prompt, same project — 18/40 without Shipwise, 37/40
with it. +19 points, 11/11 security dimensions covered.

| Test category | Scenarios | Result |
|--------------|-----------|--------|
| Scaffold accuracy | Beginner first-run, senior codebase detection | 2/2 |
| Skill triggering | Stack selection, API patterns, accessibility, auth hardening | 4/4 |
| Boundary checks | Off-topic silence (4 prompts), correct skill routing | 2/2 |
| Cross-skill flow | Architecture → fullstack transition, multi-prompt coherence | 1/1 |
| Audit commands | `/launch-audit` full scan, `/launch-checklist security` deep dive | 2/2 |
| Before/After | Same auth prompt, with and without Shipwise | 1/1 |
| UX & accessibility | Forms (3), onboarding (3), dashboards (2), pricing (2), micro-interactions (3) | 13/13 |

### Before/After breakdown

| Category | Without Shipwise | With Shipwise |
|----------|-----------------|---------------|
| Password hashing | bcrypt (default) | Argon2id, with bcrypt fallback guidance |
| Rate limiting | None | 3-tier (per-route, per-IP, global) |
| CSRF protection | None | Double-submit token |
| Session security | Default cookies | Hardened flags, rotation |
| Breach checking | None | HaveIBeenPwned (k-anonymity) |
| Account lockout | None | Progressive delays |
| MFA / TOTP | None | Enrollment + verification flow |
| Input validation | Ad hoc | Zod schemas |
| Error handling | Raw messages | Structured errors with requestId |
| **Total score** | **18/40** | **37/40** |

## Companion Tools

Shipwise references 25+ ecosystem tools. It tells you what to use and when —
then points you to the best tool for the job.

| Domain | Companion | What Shipwise adds |
|--------|-----------|-------------------|
| Security scanning | `agamm/claude-code-owasp` | Checklist layer + managed auth awareness |
| Pen testing | `unicodeveloper/shannon` | When to run it in your launch timeline |
| Marketing execution | `coreyhaines31/marketingskills` | Engineering + legal + ops that marketing skills miss |
| Accessibility auditing | `AccessLint/claude-marketplace` | Design-phase a11y primer (50 items) |
| Terraform patterns | `antonbabenko/terraform-skill` | IaC within full infrastructure checklist |
| Development workflow | `obra/superpowers` | Lifecycle context for the dev workflow |
| Visual design | `bencium/bencium-marketplace` | Aesthetic direction + anti-generic-AI rules |

## Portable to Other AI Tools

Shipwise skills follow the Agent Skills open standard. Run the conversion script
to use them outside Claude Code:

```bash
./scripts/convert.sh
```

Note: only the skills port. Hooks, commands, and the [audit agents](#audit-architecture)
are Claude Code features and stay behind.

Supported tools:

- Claude Code (native)
- Codex
- Cursor
- Gemini CLI
- Windsurf
- Aider
- OpenCode
- Augment
- Antigravity

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines. Look for issues tagged
`good first issue` for newcomers.

Contributions welcome:

- New skills (especially non-JS stacks)
- Reference doc improvements
- Additional CI/CD templates
- Test fixtures for Python, Go, Ruby, and other ecosystems

---

<div align="center">

**[Website](https://harmansidhudev.github.io/shipwise/)** ·
**[Changelog](CHANGELOG.md)** ·
**[Discussions](https://github.com/harmansidhudev/shipwise/discussions)** ·
**[Contributing](CONTRIBUTING.md)** ·
**[License](LICENSE)**

Built by [Harman Sidhu](https://harmansidhudev.com)

<!--
  Scarf install tracking pixel — disabled until a real pixel ID exists.
  Register at scarf.sh, then uncomment and replace the ID below.
  <img referrerpolicy="no-referrer-when-downgrade" src="https://static.scarf.sh/a.png?x-pxid=YOUR_PIXEL_ID" alt="" />
-->

</div>
