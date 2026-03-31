# Shipwise Multi-Agent Architecture Research

> Combined research: Claude Code subagents, Agent Teams, parallel specialized instances, third-party orchestrators, and how Shipwise can leverage each pattern.
>
> Date: 2026-03-31 | Research: 3 rounds across 9 parallel research agents

---

## Table of Contents

1. [Three Ways to Run Parallel Agents in Claude Code](#1-three-ways-to-run-parallel-agents)
2. [Subagents (Current Shipwise Architecture)](#2-subagents)
3. [Agent Teams (Experimental — Parallel Specialized Instances)](#3-agent-teams)
4. [Worktrees + Third-Party Orchestrators](#4-worktrees--third-party-orchestrators)
5. [Shipwise's Current Architecture](#5-shipwises-current-architecture)
6. [Recommended Improvements — Phased Roadmap](#6-recommended-improvements)
7. [Cost Analysis](#7-cost-analysis)
8. [What NOT to Do](#8-what-not-to-do)

---

## 1. Three Ways to Run Parallel Agents

| Approach | How it works | Communication | Coordination | Cost | Best for |
|----------|-------------|---------------|-------------|------|----------|
| **Subagents** | Main agent spawns child agents via Agent tool | Child reports back to parent only | Parent manages all work | Lower (summarized results) | Focused tasks where only the result matters |
| **Agent Teams** | Team lead spawns teammates with shared task list | Direct peer messaging + mailbox | Automatic via shared tasks | ~7x single session | Complex parallel work needing coordination |
| **Worktrees** | Multiple independent Claude Code instances | None (independent sessions) | Manual or via third-party tools | N × single session | Fully independent parallel features |

---

## 2. Subagents

The `Agent` tool spawns a separate Claude instance with its own context window. This is what Shipwise currently uses.

### How it works

| Parameter | Description |
|-----------|-------------|
| `prompt` | Task description — **only** data channel from parent to child |
| `subagent_type` | Which agent definition to use |
| `model` | Override: `sonnet`, `opus`, `haiku`, `inherit` |
| `run_in_background` | Foreground (blocking) or background (concurrent) |
| `isolation` | `"worktree"` — agent gets its own git worktree |

### Key constraints

- **No nested subagents** — subagents cannot spawn their own subagents
- Parent receives only the subagent's **final message** (intermediate tool calls stay internal)
- Subagents don't get parent's conversation history, tool results, or skills (unless specified)

### Plugin agent definition format

```yaml
---
name: my-auditor
description: Scans codebase for X
tools:
  - Read
  - Grep
  - Glob
model: haiku
maxTurns: 30
---

# My Auditor
You scan the codebase for [specific thing]...
```

**Supported fields:** `name`, `description`, `model`, `effort`, `maxTurns`, `tools`, `disallowedTools`, `skills`, `memory`, `background`, `isolation`

**NOT supported for plugin agents (security):** `hooks`, `mcpServers`, `permissionMode`

### Model resolution order

1. `CLAUDE_CODE_SUBAGENT_MODEL` env var
2. Per-invocation `model` parameter
3. Agent definition's `model` frontmatter
4. Main conversation's model

---

## 3. Agent Teams

This is the "FE Engineer + BE Engineer + Platform Engineer running in parallel" pattern. It's an **experimental** first-party feature (since Claude Code v2.1.32, Feb 2026).

### Enable

```json
// ~/.claude/settings.json or .claude/settings.json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

### Architecture

| Component | Role |
|-----------|------|
| **Team Lead** | Main session — creates team, spawns teammates, coordinates |
| **Teammates** | Separate Claude Code instances with independent context windows |
| **Task List** | Shared work items with dependency tracking and file locking |
| **Mailbox** | Direct peer-to-peer messaging between agents |

### How to start a team

Natural language to the lead:

```
Create an agent team:
- Spawn a teammate using the fe-engineer agent type for React components
- Spawn a teammate using the be-engineer agent type for API endpoints
- Spawn a teammate using the platform-engineer type for CI/CD and infra
Require plan approval before they make changes.
```

Claude creates the team, spawns teammates, assigns tasks, and coordinates automatically.

### Creating specialized agent definitions

Store as markdown files in `~/.claude/agents/` (user scope) or `.claude/agents/` (project scope):

```markdown
---
name: fe-engineer
description: Frontend React/TypeScript specialist
tools: Read, Edit, Write, Bash, Grep, Glob
model: sonnet
---

You are a senior frontend engineer specializing in React and TypeScript.
Focus on component architecture, accessibility, and performance.
```

```markdown
---
name: be-engineer
description: Backend API and database specialist
tools: Read, Edit, Write, Bash, Grep, Glob
model: sonnet
---

You are a senior backend engineer. Focus on API design, database queries,
authentication, and error handling. Always validate inputs.
```

```markdown
---
name: platform-engineer
description: Infrastructure and DevOps specialist
tools: Read, Edit, Write, Bash, Grep, Glob
model: sonnet
---

You are a platform engineer. Focus on CI/CD, containerization, monitoring,
and deployment. Make infrastructure reproducible.
```

### Display modes

| Mode | How | Terminal requirement |
|------|-----|---------------------|
| **In-process** (default) | All teammates in main terminal. Shift+Down to cycle. | Any terminal |
| **Split panes** | Each teammate gets own pane. See all output simultaneously. | tmux or iTerm2 |
| **Auto** | Split if in tmux, in-process otherwise | — |

Configure: `claude --teammate-mode tmux` or in `~/.claude.json`:
```json
{ "teammateMode": "tmux" }
```

### How teammates communicate

- **Direct messaging** — teammates send messages to specific teammates
- **Broadcasting** — send to all (costly, use sparingly)
- **Shared task list** — agents self-claim available work
- **Auto-idle notifications** — finished teammates notify the lead
- **Task dependencies** — blocked tasks auto-unblock when deps complete

### Hook events for teams

| Event | When |
|-------|------|
| `TeammateIdle` | Teammate about to go idle (exit 2 to keep working) |
| `TaskCreated` | Task being created (exit 2 to block) |
| `TaskCompleted` | Task being marked complete (exit 2 to block) |

### Limitations

- No session resumption with in-process teammates
- One team per session, no nested teams
- Lead is fixed for team lifetime
- Not supported in VS Code terminal, Windows Terminal, Ghostty
- Task status can lag

### Cost

~7x more tokens than standard sessions. Each teammate has its own context window. Use Sonnet for teammates (not Opus). Keep teams to 3-5 members.

### Real-world example: Anthropic's C Compiler

16 parallel Claude agents built a 100,000-line Rust-based C compiler (compiles Linux 6.9 kernel) over ~2,000 sessions in two weeks, costing ~$20,000. Each agent specialized: deduplication, performance, code generation, architecture, documentation.

---

## 4. Worktrees + Third-Party Orchestrators

### Built-in worktree support

```bash
# Named worktree — each gets its own branch and working directory
claude --worktree frontend-work
claude --worktree backend-work
claude --worktree platform-work

# With tmux (survives terminal close)
claude --worktree frontend-work --tmux
```

Each instance gets isolated filesystem. Changes don't collide. Worktrees with no changes auto-cleanup.

### Claude Squad

**GitHub:** [smtg-ai/claude-squad](https://github.com/smtg-ai/claude-squad) (~6.7K stars)

Terminal TUI managing multiple AI agent sessions. Each task gets isolated git workspace + tmux session.

```bash
brew install claude-squad
cs        # Launch TUI
cs -y     # Auto-accept mode (fully autonomous)
```

Keys: `n` (new session), `N` (new with prompt), `D` (terminate), `s` (commit+push), `tab` (toggle diff)

### Other orchestrators

| Tool | What it does | Scale |
|------|-------------|-------|
| **claude_code_agent_farm** | 20-50 agents with lock-based coordination, tmux dashboard | Enterprise |
| **oh-my-claudecode** | Zero-config plugin, 32 specialized agents, automatic model routing | Simple |
| **ComposioHQ agent-orchestrator** | Agent-agnostic (Claude, Codex, Aider), auto CI-fix loop | Enterprise |
| **workmux** | Lightweight git worktrees + tmux windows | Simple |

### Boris Cherny's workflow (Claude Code creator)

- 5 instances locally in terminal tabs + 5-10 on website
- Each instance uses separate git worktree
- Uses `/batch` to fan out migration work to parallel agents
- Each agent creates its own PR independently
- System notifications for when Claude needs input

### Comparison: Claude Code vs Cursor vs Windsurf

| Dimension | Claude Code | Cursor | Windsurf |
|-----------|------------|--------|----------|
| Runtime | Local terminal / tmux | Cloud sandbox | Local IDE |
| Max parallel | 16+ agents, worktree-isolated | 8 cloud agents | Multi-pane worktrees |
| Coordination | Agent Teams (peer messaging) | Background queue | Independent panes |
| Unique strength | Fully programmable, composable, unlimited | Cloud sandbox + browser testing | IDE integration |
| Cost model | API tokens (pay per use) | Subscription + usage | Subscription |

---

## 5. Shipwise's Current Architecture

### What exists

| Component | Count | Model | Parallelism |
|-----------|-------|-------|-------------|
| Agents (auditor, gap-analyzer) | 2 | Opus (inherited) | Sequential, foreground |
| Skills | 15 | Conversational | N/A |
| Hooks | 4 | Shell (no LLM) | N/A |
| Commands | 3 | — | — |

### What's NOT used

- Background agents (all foreground/blocking)
- Parallel fan-out (all sequential)
- Model tiering (no `model: haiku` — paying Opus for grep work)
- `maxTurns` caps (no runaway protection)
- Git worktree isolation
- Agent memory
- Agent Teams

### Current audit flow

```
/launch-audit
  └─ Spawn 1 auditor (Opus, foreground, blocking)
     └─ Sequential: CI/CD → Testing → Security → UX → Observability → SEO → Legal → Billing → Quality
     └─ ~120 seconds, ~$0.60
```

---

## 6. Recommended Improvements

### Phase 1: Quick Wins (1-2 hours) — DO FIRST

| Change | File | Impact |
|--------|------|--------|
| Add `model: haiku` to auditor | `agents/launch-readiness-auditor.md` | **80% cost reduction** |
| Add `model: haiku` to gap-analyzer | `agents/gap-analyzer.md` | Cost reduction |
| Add `maxTurns: 30` to both agents | Both agent files | Runaway protection |
| Persist whisper dedup | `hooks/post-edit-check.sh` | No re-whispers on restart |
| Content validation (non-empty files) | `hooks/stop-updater.sh` | No false "done" marks |

### Phase 2: Fan-Out Audit (4-6 hours) — HIGH IMPACT

Split the monolithic auditor into 4 parallel domain-specific auditors:

```
/launch-audit
  ├─ auditor-security (haiku)      → auth, headers, OWASP, dependencies
  ├─ auditor-infrastructure (haiku) → CI/CD, Docker, env, monitoring
  ├─ auditor-ux-accessibility (haiku) → a11y, states, contrast, landmarks
  └─ auditor-compliance-quality (haiku) → legal, SEO, linting, testing

  Orchestrator: merge 4 JSON results → unified state.json
```

**New agent files to create:**
- `agents/auditor-security.md`
- `agents/auditor-infrastructure.md`
- `agents/auditor-ux-accessibility.md`
- `agents/auditor-compliance-quality.md`

**Results:**
| Metric | Current | Fan-out | Improvement |
|--------|---------|---------|-------------|
| Wall time | ~120s | ~30-45s | **3-4x faster** |
| Token cost | ~$0.60 | ~$0.12 | **5x cheaper** |
| Reasoning | Opus monolithic | Haiku per-domain | Better specialization |

### Phase 3: Background & Incremental (4-6 hours)

| Change | Impact |
|--------|--------|
| Background audit during `/shipwise` interview (start after Q4) | 33% faster perceived setup |
| Delta scanning (only git-changed files) | 10-50x faster incremental audits |
| Phase transition planner (background context prefetch) | Smoother phase transitions |

### Phase 4: Future — Agent Teams for Full Setup (when stable)

```
"Help me set up a Next.js SaaS from scratch"

Team Lead: Shipwise orchestrator
  ├─ FE Engineer (skills 02, 05) → design system + components
  ├─ BE Engineer (skills 04, 08) → API + auth + database
  └─ Platform Engineer (skills 06, 09) → CI/CD + monitoring
```

**Status:** Not recommended yet. Agent Teams is experimental, 7x token cost, overkill for MVP users. Revisit when stable.

### Phase 5: Future — Skill Implementer Agent

```
User: /launch-checklist security
  → Shows P0 item: "Security headers (15 min)"

User: "Fix security headers for me"
  → Spawn skill-implementer agent (Sonnet)
  → Agent reads skill, loads template, writes middleware
  → Verifies: npm run build ✓
  → "Security headers added to middleware.ts"
```

**Status:** Optional. High value but needs careful safety gates (user approval, no destructive operations).

---

## 7. Cost Analysis

### Current vs optimized

| Operation | Current | Phase 1 | Phase 2 |
|-----------|---------|---------|---------|
| `/shipwise` scaffold | $1.12 (Opus) | $0.67 (Haiku audit) | $0.52 (background + Haiku) |
| `/launch-audit` | $0.60 / 120s | $0.12 / 120s | $0.12 / 30-45s |
| `/launch-audit` (delta) | N/A | N/A | $0.03 / 10-15s |

### Model tier recommendations

| Task type | Model | Why |
|-----------|-------|-----|
| Grep/glob scanning | Haiku | Pattern matching doesn't need Opus reasoning |
| Gap analysis | Haiku | Structured JSON → prioritized list |
| Orchestration/synthesis | Opus (inherited) | Merging results needs strong reasoning |
| Code implementation | Sonnet | Balance of speed and quality |
| Agent Teams teammates | Sonnet | Cost-effective for parallel work |

---

## 8. What NOT to Do

Based on research: **79% of multi-agent failures come from coordination issues, not technical implementation.**

| Anti-pattern | Why | Shipwise rule |
|-------------|-----|---------------|
| Inter-agent messaging | Coordination tax grows O(n²) | Keep auditors independent; merge at orchestrator only |
| Dynamic agent spawning | Unpredictable cost | Always 4 auditors (deterministic) |
| Nested subagents | Not supported | Chain from main context only |
| Map-Reduce over all files | Cost explosion | Filter with glob/grep first |
| Evaluator loops > 2 iterations | Diminishing returns | Cap at 1 retry |
| Agent Teams for simple tasks | 7x token overhead | Only for genuinely parallel workstreams |
| Opus for scanning | Overkill | Haiku for all read-only agents |
| Swarm/Mesh patterns | Unpredictable behavior | Deterministic routing tables |

---

## Sources

### Official documentation
- [Agent Teams](https://code.claude.com/docs/en/agent-teams)
- [Custom subagents](https://code.claude.com/docs/en/sub-agents)
- [Git worktrees](https://code.claude.com/docs/en/common-workflows)
- [Agent SDK](https://platform.claude.com/docs/en/agent-sdk/overview)
- [Cost management](https://code.claude.com/docs/en/costs)
- [Plugin agents](https://code.claude.com/docs/en/plugins-reference)

### Case studies
- [Building a C compiler with parallel Claudes](https://www.anthropic.com/engineering/building-c-compiler) — 16 agents, 100K lines, $20K
- [How Boris Uses Claude Code](https://howborisusesclaudecode.com/) — 5 parallel worktrees
- [Building Effective AI Agents](https://resources.anthropic.com/building-effective-ai-agents)
- [Multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)

### Third-party tools
- [claude-squad](https://github.com/smtg-ai/claude-squad) — TUI for parallel agent sessions
- [claude_code_agent_farm](https://github.com/Dicklesworthstone/claude_code_agent_farm) — 20-50 parallel agents
- [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) — Zero-config 32-agent plugin
- [ComposioHQ/agent-orchestrator](https://github.com/ComposioHQ/agent-orchestrator) — CI-fix loop orchestration

### Research
- [Why Do Multi-Agent LLM Systems Fail?](https://arxiv.org/abs/2503.13657) — 79% coordination failures
- [The Code Agent Orchestra](https://addyosmani.com/blog/code-agent-orchestra/)
- [AI Agent Orchestration Patterns](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns)
- [Multi-agent patterns in ADK](https://developers.googleblog.com/developers-guide-to-multi-agent-patterns-in-adk/)
- [Choosing the Right Multi-Agent Architecture](https://blog.langchain.com/choosing-the-right-multi-agent-architecture/)
