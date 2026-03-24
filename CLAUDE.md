# Shipwise — Claude Code Launch Lifecycle Plugin

## What this is
Shipwise guides developers through the full webapp launch lifecycle: Design → Build → Ship → Grow. It provides contextual knowledge, automatic checkpoint gates, and codebase-aware readiness tracking.

## Architecture
- **16 skills** across 4 phases + 1 orchestrator (00-launch-assess)
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
