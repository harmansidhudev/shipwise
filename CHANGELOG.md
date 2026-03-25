# Changelog

All notable changes to Shipwise will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [1.0.0] - 2026-03-25

### Added
- 15 domain skills covering the full webapp launch lifecycle (Design → Build → Ship → Grow)
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
- Before/After auth test: 18/40 → 36/40 (24 specific security improvements)
- Codebase auditor: 9/9 tech component detections in realistic SaaS fixture
- Zero false triggers on 4 off-topic prompts
- Correct skill boundary routing (fullstack vs architecture triggers)
