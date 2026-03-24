# Shipwise

**Ship wisely.** The webapp launch lifecycle plugin for Claude Code.

Shipwise guides developers through the full launch lifecycle — from idea validation through post-launch growth — with contextual knowledge, automatic checkpoint gates, and codebase-aware readiness tracking.

## What it does

```
  MODE D          MODE B           MODE A          MODE C
  Scaffold        Checkpoint       Contextual      On-Demand
  (once)          Gates            Knowledge       Audit
                  (automatic)      (automatic)     (you invoke)

  /shipwise ──→ hooks fire ──→ skills load ──→ /launch-audit
  at project     on every         when Claude      before
  start          session/edit     detects match    milestones
                 /deploy
```

**Four modes, three commands to remember:**

| Command | What it does |
|---------|-------------|
| `/shipwise` | Scaffold your project, check status, or enter a phase flow |
| `/launch-audit` | Full codebase re-scan for launch readiness |
| `/launch-checklist <domain>` | Deep-dive a specific domain (security, billing, seo, etc.) |

## Quick start

```bash
# Install the plugin
/plugin install shipwise

# Run the scaffold
/shipwise
```

The scaffold asks 9 diagnostic questions, scans your codebase, and generates:
- `.claude/shipwise-state.json` — machine-readable launch readiness state
- CLAUDE.md context injection — persistent project + launch awareness
- Automatic hooks — checkpoint gates on every session, edit, and deploy

## The four phases

### Phase 1: DESIGN (Skills 01-03)
Idea validation, product design, business/legal foundation.

### Phase 2: BUILD (Skills 04-08)
Tech architecture, fullstack development, infrastructure, testing, security.

### Phase 3: SHIP (Skills 09-13)
Observability, SEO/performance, billing, legal compliance, launch execution.

### Phase 4: GROW (Skill 14)
Analytics, feedback loops, retention, email campaigns, referral, content strategy.

## How hooks work

| Hook | Fires on | What it does |
|------|----------|-------------|
| Session context | Every session start | Injects readiness score + top gaps |
| Post-edit check | File edits | Contextual whisper for auth, billing, CI/CD, API, secrets |
| Deploy gate | Deploy commands | Warns if P0 items are incomplete |
| Stop updater | Session end | Auto-detects completed checklist items |

## Experience levels

Shipwise adapts all output to your experience level (set during scaffold):

| | Beginner | Intermediate | Senior |
|---|----------|-------------|--------|
| Checklist | Full explanations | Standard terms | Terse |
| Whispers | Jargon explained | One-liners | Suppressed if obvious |
| Deploy gate | Guided remediation | Time estimates | Gap list only |

## By the numbers

- 15 domain skills + 1 orchestrator
- 2 specialized agents
- 4 lifecycle hooks
- 3 commands to remember
- 45+ reference documents with copy-paste templates

## Multi-agent compatibility

Shipwise skills work with any AI coding agent. Run the conversion script:

```bash
./scripts/convert.sh
```

This generates a combined knowledge file and Cursor rules file.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT
