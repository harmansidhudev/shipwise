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
Shipwise hooks are active. They provide:
- Session start: readiness score + top gaps injected into context
- Post-edit: contextual whispers when editing auth, billing, CI/CD, API, secrets, or observability code
- Pre-deploy: warning gate if P0 items are incomplete
- Session stop: auto-detection of completed checklist items

## Quick Commands
- `/shipwise` — view status or re-run scaffold
- `/shipwise status` — regenerate readiness report
- `/launch-audit` — full codebase re-scan
- `/launch-checklist <domain>` — deep-dive a specific domain (security, billing, seo, etc.)

## Current Gaps
{{top_gaps}}
