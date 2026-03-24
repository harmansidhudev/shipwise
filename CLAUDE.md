# Shipwise — Claude Code Launch Lifecycle Plugin

## What this is
Shipwise guides developers through the full webapp launch lifecycle: Design → Build → Ship → Grow. It provides contextual knowledge, automatic checkpoint gates, and codebase-aware readiness tracking.

## Architecture
- **15 skills** (14 domain + 1 orchestrator) across 4 phases
- **4 hooks** for automatic checkpoint gates (session context, post-edit whispers, deploy gate, stop updater)
- **2 agents** for deep codebase scanning (launch-readiness-auditor, gap-analyzer)
- **3 commands** (/shipwise, /launch-audit, /launch-checklist)

## State
- Machine-readable state: `.claude/shipwise-state.json`
- Human-readable status: `.claude/SHIPWISE-STATUS.md` (generated on demand from state.json)
- Experience levels: beginner | intermediate | senior (affects all output verbosity)
- Scale tiers: <100 | 100-1K | 1K-10K | 10K+ (affects priority weighting)

## Interaction modes
1. **Scaffold** (`/shipwise`) — one-time project setup with diagnostic interview
2. **Checkpoint Gates** — automatic hooks on session start, file edits, deploys, and session stop
3. **Contextual Skills** — auto-trigger based on what the developer is working on
4. **On-Demand Audit** (`/launch-audit`) — full codebase re-scan before milestones

## Conventions
- Skills use dual-mode output (beginner/intermediate/senior blocks in SKILL.md)
- Reference docs must contain at least one copy-paste code template
- Hooks read from and write to shipwise-state.json (never modify markdown directly)
- All priorities follow P0 (critical) > P1 (important) > P2 (nice-to-have) scale

## Experience-level rendering contract
Skills use HTML comment blocks to tag content for different experience levels:
- `<!-- beginner -->` — content for beginners (new to coding, junior)
- `<!-- intermediate -->` — content for mid-level developers (3-5yr)
- `<!-- senior -->` — content for senior developers (5+yr)

**Rendering rules:**
1. Check `experience_level` from `.claude/shipwise-state.json`
2. Only include content from the matching experience block in your response
3. Content OUTSIDE any experience block renders for ALL levels (shared context)
4. If no state file exists, default to `intermediate`
5. Never show comparison tables or multi-option matrices to beginners — give one clear recommendation
