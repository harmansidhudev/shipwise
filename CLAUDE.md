# Shipwise — Claude Code Launch Lifecycle Plugin

## What this is
Shipwise guides developers through the full webapp launch lifecycle: Design → Build → Ship → Grow. It provides contextual knowledge, automatic checkpoint gates, and codebase-aware readiness tracking.

## Architecture
- **15 skills** (14 domain + 1 orchestrator) across 4 phases
- **4 hooks** for automatic checkpoint gates (session context, post-edit whispers, deploy gate, stop updater)
- **7 agents** for codebase scanning and planning (see below)
- **3 commands** (/shipwise, /launch-audit, /launch-checklist)
- **78 reference docs** across the 15 skills

### Agents
`/launch-audit` fans out to 4 domain auditors in parallel, then merges results.
All agents run `model: haiku` with a turn cap — the fan-out is only affordable
because of this. Preserve both fields when editing agent frontmatter.

| Agent | Role |
|-------|------|
| `auditor-security` | Security, auth, input validation, dependencies, tests |
| `auditor-infrastructure` | CI/CD, Docker, env, secrets, error tracking, health, monitoring. Also returns the `stack` object |
| `auditor-ux-accessibility` | a11y, empty/loading states, contrast, labels, landmarks |
| `auditor-compliance-quality` | Legal, SEO, billing, code quality, launch readiness |
| `auditor-delta` | `/launch-audit quick` — scans only git-changed files |
| `launch-readiness-auditor` | Monolithic full scan; the per-domain fallback when a parallel auditor fails |
| `gap-analyzer` | Converts audit results into a prioritized plan |

Every auditor returns `{ category, items[], summary }`. Item status is one of
`done` | `partial` | `todo`, rendered as ✓ | ⚠ | ✗.

## State
- Machine-readable state: `.claude/shipwise-state.json`
- Human-readable status: `.claude/SHIPWISE-STATUS.md` (generated on demand from state.json)
- Experience levels: beginner | intermediate | senior (affects all output verbosity)
- Scale tiers: <100 | 100-1K | 1K-10K | 10K+ (affects priority weighting)

## Interaction modes
1. **Scaffold** (`/shipwise`) — one-time project setup with diagnostic interview
2. **Checkpoint Gates** — automatic hooks on session start, file edits, deploys, and session stop
3. **Contextual Skills** — auto-trigger based on what the developer is working on
4. **On-Demand Audit** (`/launch-audit`) — full parallel re-scan before milestones;
   `/launch-audit quick` for an incremental delta scan of changed files only

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
