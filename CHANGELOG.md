# Changelog

All notable changes to Shipwise will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.6.4] - 2026-04-01

### Added
- Multi-agent audit architecture — `/launch-audit` now fans out to 4 specialized
  auditors in parallel instead of running one monolithic scan: `auditor-security`,
  `auditor-infrastructure`, `auditor-ux-accessibility`, `auditor-compliance-quality`
  (~30-45s and ~$0.12, down from ~120s and ~$0.60)
- `auditor-delta` agent and `/launch-audit quick` mode — scans only git-changed
  files (~10-15s, ~$0.03), auto-upgrading to a full scan past 50 changed files
- Background audit during the `/shipwise` interview, starting after question 4 so
  the scan overlaps the remaining questions
- Persistent whisper deduplication via `.claude/shipwise-whispers.json`, surviving
  session restarts

### Changed
- All agents now run `model: haiku` with a turn cap (~80% cost reduction)
- `stop-updater` hook validates content before writing (non-empty files only)
- Agent count is now 7 (was 2); reference doc count is now 78 (was 45+)

### Fixed
- Version drift: `marketplace.json` reported 1.0.0 while `plugin.json` reported
  0.6.4; both now track the same version
- README and landing page understated the Before/After result as 36/40 — the
  final measured score is 37/40 (+19 points, 106%), covering 11/11 security
  dimensions. The "24 security improvements" figure was unsupported by the test
  data and has been replaced with the measured dimension count
- Landing page claimed 12 test scenarios in one place and 25 in another; the
  carousel now shows all 25
- Removed placeholder analytics that shipped live: the Umami snippet pointed at
  `YOUR_UMAMI_INSTANCE` and the README Scarf pixel at `REPLACE_WITH_SCARF_PIXEL_ID`
- README status line install referenced a `node_modules/` path that never exists
  for a Claude Code plugin

## [0.6.0] - 2026-03-31

### Added
- Status line script (`scripts/statusline.sh`) showing phase, readiness bar, and P0
  gap count in the CLI status bar
- `/shipwise pause` and `/shipwise resume` — disable and re-enable hooks and skills
  without uninstalling or losing state
- Contextual triggers for the UI/UX audit reference docs
- UI/UX audit knowledge captured from real-world validation

### Fixed
- Status line script used the wrong state field and had a non-portable progress bar (0.6.1)

## [0.5.0] - 2026-03-30

### Added
- Privacy-first analytics reference doc (Umami, Plausible, OpenPanel — consent-aware
  loading and ad-blocker bypass)
- Revenue analytics reference doc (MRR/NRR/LTV from Stripe with SQL templates)
- Web Vitals RUM reference doc for real-user performance monitoring
- Telemetry, feedback, and analytics infrastructure

## [0.4.0] - 2026-03-30

### Added
- Project profile card shown after scaffold, with readiness score and top gaps
- Scan progress feedback during `/shipwise`
- `/shipwise help` command
- Hook documentation surfaced to the user

### Fixed
- `bump-version` workflow lacked `contents:write` permission

## [0.3.0] - 2026-03-30

### Added
- UX and accessibility auditing in the launch readiness auditor
- 14-dimension design audit workflow reference doc

## [0.2.0] - 2026-03-30

### Added
- Tier 2A UX reference docs: form UX patterns, onboarding UX, dashboard UX,
  pricing page UX, and micro-interaction patterns
- 13 UX test scenarios covering forms, onboarding, dashboards, pricing, and
  micro-interactions — bringing the suite to 25/25 passing
- JTBD framework and Lean Canvas template for idea validation
- SaaS boilerplate comparison (5 open-source starters with coverage mapping)

### Changed
- Accessibility design checklist expanded from 30 to 50 items (WCAG 2.2 AA)
- Scaffold now scans before the interview and pre-fills detectable answers

### Fixed
- `marketplace.json` schema corrected (owner object + plugins array)
- `plugin.json` author field is an object, not a string
- Orchestrator routing table skill names missing number prefixes

## [0.1.0] - 2026-03-25

Initial release.

<!-- Originally published in this file as "[1.0.0]". Version 1.0.0 was never
     released — plugin.json went 0.1.0 → 0.6.4 — so this entry is renumbered to
     the version that actually shipped on this date. -->

### Added
- 14 domain skills covering the full webapp launch lifecycle (Design → Build → Ship → Grow)
- 1 orchestrator skill with 9-question diagnostic interview and codebase scanner
- 4 lifecycle hooks: session context, post-edit whispers, deploy gate, auto-progress tracking
- 2 specialized agents: launch-readiness-auditor, gap-analyzer
- 3 commands: /shipwise, /launch-audit, /launch-checklist
- 45+ reference documents with copy-paste templates
- Experience-level calibration (beginner/intermediate/senior)
- Scale-aware priority adjustment (< 100 to 10K+ users)
- Managed auth provider detection (Clerk, Auth0, Supabase — skips irrelevant security items)
- SaaS boilerplate comparison (5 open-source starters with checklist coverage mapping)
- Multi-tenancy patterns (shared DB, Postgres RLS, schema-per-tenant, Clerk Organizations)
- JTBD framework and Lean Canvas template for idea validation
- 50-item WCAG 2.2 AA accessibility design checklist (expanded from 30)
- CORS configuration guide for Next.js, Express, and Nginx
- Landing page UX guide with visitor archetype methodology
- Companion tool references for 25+ ecosystem skills and tools
- GitHub Pages landing page with terminal mockup and phase visualization
- Multi-agent compatibility via convert.sh (Cursor, Codex, Gemini CLI, Windsurf, Aider)
- 12-scenario QA test suite with 3 test fixtures (beginner, mid-level, senior)
- CI workflow for plugin structure validation

### Tested
- 12/12 QA scenarios passed (trigger accuracy, content quality, structural correctness)
- Before/After auth test: 18/40 → 37/40 (+19 points, 11/11 security dimensions)
  <!-- Originally published as "36/40, 24 specific security improvements". 36/40 was the
       pre-fix score and the improvement count was never substantiated; corrected in 0.6.4
       against tests/results/scenario-12-before-after/RESULT.md. -->
- Codebase auditor: 9/9 tech component detections in realistic SaaS fixture
- Zero false triggers on 4 off-topic prompts
- Correct skill boundary routing (fullstack vs architecture triggers)
