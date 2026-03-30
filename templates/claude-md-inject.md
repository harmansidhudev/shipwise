<!-- Placeholder substitution guide:
  {{project_type}}    → shipwise-state.json → project.type (saas, marketplace, tool, api, other)
  {{audience}}        → shipwise-state.json → project.audience (b2c, b2b, developers, internal)
  {{stack_summary}}   → shipwise-state.json → project.stack (formatted as "frontend + backend + database + hosting")
  {{current_phase}}   → shipwise-state.json → current_phase (design, build, ship, grow)
  {{experience_level}} → shipwise-state.json → experience_level (beginner, intermediate, senior)
  {{expected_scale}}  → shipwise-state.json → expected_scale (<100, 100-1000, 1000-10000, 10000+)
  {{top_gaps}}        → First 3 items from auditor output where status="todo" and priority="P0", formatted as "- [item name] (~time_estimate)"
  Replace each {{placeholder}} with the corresponding value. Do not leave literal {{}} in the output.
-->
# Shipwise Launch Context

This project uses [Shipwise](https://github.com/harmansidhudev/shipwise) for launch lifecycle tracking.

## Project Profile
- **Type:** {{project_type}}
- **Audience:** {{audience}}
- **Stack:** {{stack_summary}}
- **Phase:** {{current_phase}}
- **Experience mode:** {{experience_level}}
- **Scale target:** {{expected_scale}}

## Active Guidance
Shipwise hooks run automatically in every session:

- **Session start:** Injects readiness score + top gaps into context
- **Post-edit whispers:** When you edit files matching these categories, a `[Shipwise]` tip appears:
  - `auth` — login, signup, session, token, password files → security checklist
  - `billing` — stripe, payment, checkout, subscription files → webhook/PCI reminders
  - `cicd` — workflow, deploy, Dockerfile files → pipeline checklist
  - `api` — API route files → validation/rate-limit checklist
  - `secrets` — .env, credential files → gitignore/vault warning (always warns)
  - `observability` — health, monitor files → deep health check guidance
- **Pre-deploy gate:** Warns if P0 items are incomplete when you run deploy commands
- **Session stop:** Auto-detects newly completed checklist items (CI config, Dockerfile, legal pages, etc.)

Whispers appear once per category per session (no spam). They adapt to your experience level.

## Quick Commands
- `/shipwise` — view status or re-run scaffold
- `/shipwise status` — regenerate readiness report
- `/launch-audit` — full codebase re-scan
- `/launch-checklist <domain>` — deep-dive a specific domain (security, billing, seo, etc.)

## Current Gaps
{{top_gaps}}
