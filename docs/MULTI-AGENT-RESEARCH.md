# Shipwise Multi-Agent Architecture Research

> Deep research on how Claude Code handles agents, subagents, and parallel execution — and how Shipwise can leverage these capabilities for better performance and user experience.
>
> Date: 2026-03-31 | Research duration: ~25 minutes across 3 parallel research agents

---

## Table of Contents

1. [How Claude Code Agents Work](#1-how-claude-code-agents-work)
2. [Shipwise's Current Agent Architecture](#2-shipwises-current-agent-architecture)
3. [Bottleneck Analysis](#3-bottleneck-analysis)
4. [Multi-Agent Patterns Available](#4-multi-agent-patterns-available)
5. [Recommended Improvements by Use Case](#5-recommended-improvements-by-use-case)
6. [Agent Teams (Experimental)](#6-agent-teams-experimental)
7. [Cost Analysis](#7-cost-analysis)
8. [Implementation Roadmap](#8-implementation-roadmap)
9. [What NOT to Do](#9-what-not-to-do)

---

## 1. How Claude Code Agents Work

### 1.1 The Agent Tool

The `Agent` tool spawns a **subagent** — a separate Claude instance with its own context window. It is the primary mechanism for parallelism in Claude Code.

| Parameter | Description |
|-----------|-------------|
| `prompt` | Task description — the **only** channel from parent to subagent |
| `subagent_type` | Which agent definition to use (built-in or custom) |
| `model` | Optional model override (`sonnet`, `opus`, `haiku`, `inherit`) |
| `run_in_background` | Boolean — foreground (blocking) or background (concurrent) |
| `isolation` | `"worktree"` — gives the agent its own git worktree copy |

### 1.2 What Subagents Get vs Don't Get

| Receives | Does NOT receive |
|----------|-----------------|
| Its own system prompt (from agent definition markdown) | Parent's conversation history |
| The `prompt` parameter string | Parent's tool results |
| Project CLAUDE.md | Other subagents' context |
| Tool definitions (inherited or specified subset) | Skills (unless listed in `skills` field) |

**Critical**: The only data channel from parent → subagent is the `prompt` string. All file paths, decisions, and context must be explicitly included.

**Return**: The parent receives only the subagent's **final message**. All intermediate tool calls stay inside the subagent's context window.

### 1.3 Built-in Subagent Types

| Type | Model | Tools | Purpose |
|------|-------|-------|---------|
| **general-purpose** | Inherits | All | Complex multi-step tasks |
| **Explore** | Haiku (cheap) | Read-only | File discovery, codebase search |
| **Plan** | Inherits | Read-only | Design implementation approaches |

### 1.4 Custom Agent Definition Format (Plugin Agents)

Plugins define agents as markdown files in `agents/` with YAML frontmatter:

```yaml
---
name: my-auditor
description: Scans codebase for X
tools:
  - Read
  - Grep
  - Glob
model: haiku        # cheap for scanning tasks
maxTurns: 20        # cap to prevent runaway
---

# My Auditor

You scan the codebase for [specific thing]...
```

**Supported fields for plugin agents:** `name`, `description`, `model`, `effort`, `maxTurns`, `tools`, `disallowedTools`, `skills`, `memory`, `background`, `isolation`

**NOT supported for plugin agents (security):** `hooks`, `mcpServers`, `permissionMode`

### 1.5 Key Constraint: No Nested Subagents

**Subagents cannot spawn other subagents.** This is a hard architectural constraint. If you need nested delegation, you must chain subagents from the main conversation. This means Shipwise's orchestrator (running in main context) is the only entity that can fan out work.

### 1.6 Foreground vs Background

| Mode | Behavior | Use when |
|------|----------|----------|
| **Foreground** | Blocks main conversation until complete. Can ask user questions. | Need results before proceeding |
| **Background** | Runs concurrently. Cannot ask user. Auto-denies unpermitted tools. | Independent work while user continues |

### 1.7 Model Resolution Order

1. `CLAUDE_CODE_SUBAGENT_MODEL` env var
2. Per-invocation `model` parameter
3. Agent definition's `model` frontmatter
4. Main conversation's model

### 1.8 Agent Memory (Persistent)

Agents can have persistent memory across conversations:

| Scope | Location | Use case |
|-------|----------|----------|
| `user` | `~/.claude/agent-memory/<name>/` | Cross-project learnings |
| `project` | `.claude/agent-memory/<name>/` | Project-specific, shareable via VCS |
| `local` | `.claude/agent-memory-local/<name>/` | Project-specific, not version controlled |

First 200 lines of `MEMORY.md` auto-injected into agent context.

---

## 2. Shipwise's Current Agent Architecture

### 2.1 Current Inventory

| Component | Type | Count | Tools |
|-----------|------|-------|-------|
| Agents | Agent definitions in `agents/` | 2 | auditor: Read/Grep/Glob; gap-analyzer: Read/Write |
| Skills | Skill definitions in `skills/` | 15 | None (all conversational, no tool access) |
| Hooks | Shell scripts in `hooks/` | 4 | Shell only (jq, grep, find) |
| Commands | Command definitions in `commands/` | 3 | Invoke agents + present results |

### 2.2 Current Agent Flow

```
User → /shipwise
  └─ Interview (9 questions, sequential)
  └─ Spawn: launch-readiness-auditor (foreground, blocking)
       └─ Detect stack → Grep 10 categories sequentially → Return JSON
  └─ Generate: state.json, STATUS.md, CLAUDE.md inject (sequential)
  └─ Display: profile card + experience-level follow-up

User → /launch-audit
  └─ Spawn: launch-readiness-auditor (foreground, blocking)
  └─ Compare with existing state.json
  └─ Update state + history
  └─ Display diff

User → /launch-checklist [domain]
  └─ Map domain → skill (no agent spawn)
  └─ Load skill + cross-reference state.json
  └─ Display checklist
```

### 2.3 What's NOT Used

Shipwise currently does not use:
- **Background agents** (all foreground/blocking)
- **Parallel agent fan-out** (all sequential)
- **Agent memory** (state tracked via `shipwise-state.json` instead)
- **Model tiering** (no `model` specified in agent definitions — inherits parent model)
- **Git worktree isolation**
- **`maxTurns` caps** (no runaway protection)
- **`skills` injection** (agents don't have skills loaded)
- **Agent Teams** (experimental, not adopted)

---

## 3. Bottleneck Analysis

### 3.1 Scanning & Analysis

| Bottleneck | Current behavior | Impact | Solution |
|------------|-----------------|--------|----------|
| **Monolithic auditor** | All 10 categories scanned sequentially by one agent | 1-3 min for large repos | Fan-out: 4 parallel domain-specific auditor agents |
| **No incremental scan** | Full codebase re-scan on every `/launch-audit` | Same 3 min even if 1 file changed | Delta auditor: scan only git-changed files since last audit |
| **No model tiering** | Auditor inherits parent model (Opus) for simple grep work | Paying Opus prices for Haiku-level tasks | Set `model: haiku` on auditor (grep/glob doesn't need Opus reasoning) |

### 3.2 Hook Execution

| Bottleneck | Current behavior | Impact | Solution |
|------------|-----------------|--------|----------|
| **Single-category file matching** | `post-edit-check.sh` assigns ONE category per file | `src/auth/api.ts` gets "auth" but misses "api" | Multi-category matching |
| **File-only completion detection** | `stop-updater.sh` marks items "done" if file exists | Empty Dockerfile = "done" | Content validation (check file is non-trivial) |
| **Ephemeral whisper dedup** | Stored in `/tmp`, lost on session restart | Re-whispers everything next session | Persist to `.claude/shipwise-whispers.json` |
| **No pre-flight verification** | Deploy gate only lists P0 items | Doesn't verify CI passing, secrets configured | Parallel pre-flight checks |

### 3.3 Command Sequencing

| Bottleneck | Current behavior | Impact | Solution |
|------------|-----------------|--------|----------|
| **Interview blocks audit** | 9 questions asked THEN audit runs | User waits 2-3 min after answering | Start audit in background after Q1 (stack question) |
| **Sequential artifact generation** | state.json → STATUS.md → CLAUDE.md inject | 3 independent writes serialized | Could parallelize (all depend on same input) |
| **No streaming feedback** | Audit runs silently until complete | User thinks it hung | Progress messages already added (v0.4.0) — could add per-category streaming |

---

## 4. Multi-Agent Patterns Available

### 4.1 Fan-Out / Fan-In (Scatter-Gather)

**What**: Spawn N agents in parallel for independent subtasks, aggregate results.

**Shipwise application**: Split `launch-readiness-auditor` into 4 parallel workers:

```
Orchestrator spawns (in parallel):
  ├─ security-auditor (haiku) → security headers, auth, OWASP, input validation
  ├─ infra-auditor (haiku)    → CI/CD, Docker, IaC, env config, secrets
  ├─ ux-auditor (haiku)       → a11y, empty states, loading, contrast, headings
  └─ quality-auditor (haiku)  → testing, linting, SEO, legal, billing

Orchestrator: merges 4 JSON results → unified shipwise-state.json
```

**Expected improvement**: 3-4x faster audits (parallel execution + Haiku model = cheaper AND faster)

**Risk**: Race conditions on state writes. Mitigation: orchestrator collects all results in memory, writes state once.

### 4.2 Pipeline (Sequential Chain)

**What**: Agent A → output → Agent B → output → Agent C.

**Shipwise already does this**: auditor → gap-analyzer → orchestrator presentation. The pattern is correct; the optimization is making the pipeline stages cheaper (model tiering).

### 4.3 Specialist Delegation (Skills Pattern)

**What**: Route tasks to domain-expert agents based on task type.

**Shipwise already does this**: 14 domain skills with orchestrator routing table. This is the plugin's primary pattern and it works well. No changes needed to the pattern itself.

### 4.4 Evaluator-Optimizer (Critic/Generator)

**What**: One agent generates, another reviews, loop until passing.

**Shipwise application**: After post-edit whisper, if developer addresses the issue, re-check once. Currently whispers are fire-and-forget with no verification.

**Constraint**: Limited to 1 retry iteration (cap cost). Diminishing returns after iteration 1.

### 4.5 Background Prefetching

**What**: Spawn background agents to pre-load context the user will likely need next.

**Shipwise application**: When phase transition detected (design → build), spawn background agent to pre-analyze which build-phase skills are relevant to this specific project and prepare context summaries.

---

## 5. Recommended Improvements by Use Case

### 5.1 `/shipwise` (First-time Scaffold)

| Change | Type | Impact | Effort |
|--------|------|--------|--------|
| Start audit as background agent after Q4 (stack question) | Background agent | 2-3x faster perceived time | Low — add `run_in_background: true` |
| Set auditor `model: haiku` | Model tiering | 3-5x cheaper audit | Trivial — one frontmatter line |
| Add `maxTurns: 30` to auditor | Safety | Prevents runaway | Trivial |

### 5.2 `/launch-audit` (Re-scan)

| Change | Type | Impact | Effort |
|--------|------|--------|--------|
| Split into 4 parallel domain auditors | Fan-out | 3-4x faster | Medium — 4 new agent definitions + merge logic |
| Delta scanning (only changed files) | Incremental | 10-50x faster for small changes | Medium — git diff + selective scan |
| Run in background while user codes | Background agent | Zero perceived wait | Low — option in command |

### 5.3 `/launch-checklist [domain]` (Deep-dive)

| Change | Type | Impact | Effort |
|--------|------|--------|--------|
| Pre-load related skills in parallel | Background prefetch | Faster cross-domain transitions | Low |
| Spawn implementation sub-agent for P0 items | Specialist delegation | "Fix it for me" capability | Medium |

### 5.4 Post-Edit Whisper Hook

| Change | Type | Impact | Effort |
|--------|------|--------|--------|
| Multi-category matching (auth + api) | Logic fix | Better coverage | Low — shell script update |
| Persist dedup to `.claude/shipwise-whispers.json` | State fix | No re-whispers on restart | Low |

### 5.5 Pre-Deploy Gate

| Change | Type | Impact | Effort |
|--------|------|--------|--------|
| Parallel pre-flight checks (CI status, secrets, health endpoint) | Fan-out | Actionable deploy gate | Medium — new agent definitions |
| Add content validation to file detection | Quality | No false "done" marks | Low |

### 5.6 Session Stop (Auto-detection)

| Change | Type | Impact | Effort |
|--------|------|--------|--------|
| Validate detected files have real content | Quality | No empty-file false positives | Low |
| Phase transition → background prefetch next-phase context | Background agent | Smoother transitions | Low |

---

## 6. Agent Teams (Experimental)

Claude Code has an experimental **Agent Teams** feature (enable with `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`). This is a higher-level orchestration system where:

- A **team lead** coordinates multiple **teammates**
- Teammates have independent context windows and can message each other
- A shared **task list** tracks work items with dependency tracking
- Display modes: in-process (single terminal) or split panes (tmux/iTerm2)

### Relevance to Shipwise

Agent Teams could enable a "full lifecycle session" where multiple specialists work in parallel:

```
Team lead: Shipwise orchestrator
  ├─ Teammate 1: Security specialist (skill 08 context)
  ├─ Teammate 2: Infrastructure specialist (skill 06 context)
  ├─ Teammate 3: Frontend/UX specialist (skill 05 + 02 context)
  └─ Shared task list: P0 items from audit, assigned to specialists
```

### Why NOT to Adopt Yet

- **Experimental**: No session resumption with in-process teammates
- **Cost**: ~7x more tokens than standard sessions
- **Complexity**: One team per session, no nested teams, lead is fixed
- **Overkill**: Shipwise users are shipping MVPs, not coordinating 4 parallel workstreams

**Recommendation**: Monitor Agent Teams maturity. Revisit when it exits experimental. The subagent pattern (fan-out) is sufficient for Shipwise's current needs.

---

## 7. Cost Analysis

### 7.1 Current Cost

| Operation | Model | Est. tokens | Est. cost |
|-----------|-------|-------------|-----------|
| `/shipwise` scaffold | Opus (inherited) | ~50K | ~$0.75 |
| `/launch-audit` | Opus (inherited) | ~40K | ~$0.60 |
| `/launch-checklist` | Opus (main) | ~20K | ~$0.30 |
| Post-edit whisper | Shell only | 0 | $0 |
| Deploy gate | Shell only | 0 | $0 |

### 7.2 Optimized Cost (with model tiering)

| Operation | Model change | Est. tokens | Est. cost | Savings |
|-----------|-------------|-------------|-----------|---------|
| `/shipwise` scaffold | Auditor → Haiku | ~50K | ~$0.15 | **80%** |
| `/launch-audit` (fan-out) | 4× Haiku workers | ~60K total | ~$0.12 | **80%** |
| `/launch-checklist` | No change | ~20K | ~$0.30 | — |

**Key insight**: The auditor does grep/glob work that doesn't need Opus-level reasoning. Switching to `model: haiku` for scanning agents is the single highest-impact cost optimization — 80% cheaper with negligible quality loss for pattern-matching tasks.

### 7.3 Fan-Out Cost vs Speed Tradeoff

| Approach | Agents | Total tokens | Wall time | Cost |
|----------|--------|-------------|-----------|------|
| Current (1 Opus auditor) | 1 | ~40K | ~60s | ~$0.60 |
| Fan-out (4 Haiku auditors) | 4 | ~60K | ~15s | ~$0.12 |
| Fan-out (4 Sonnet auditors) | 4 | ~60K | ~20s | ~$0.18 |

Fan-out with Haiku is **4x faster AND 5x cheaper** than the current approach.

---

## 8. Implementation Roadmap

### Phase 1: Quick Wins (1-2 hours, high impact)

These are single-line or small changes with disproportionate impact:

1. **Add `model: haiku` to `launch-readiness-auditor.md`** — 80% cost reduction
2. **Add `maxTurns: 30` to both agent definitions** — runaway protection
3. **Persist whisper dedup** to `.claude/shipwise-whispers.json` — no re-whispers on restart
4. **Content validation in `stop-updater.sh`** — check files are non-empty before marking "done"

### Phase 2: Fan-Out Audit (4-6 hours, major improvement)

Split the monolithic auditor into domain-specific workers:

1. Create 4 new agent definitions:
   - `agents/auditor-security.md` (tools: Read, Grep, Glob; model: haiku)
   - `agents/auditor-infrastructure.md`
   - `agents/auditor-ux-quality.md`
   - `agents/auditor-compliance.md`
2. Update `commands/launch-audit.md` to spawn all 4 in parallel
3. Add merge logic in orchestrator to combine 4 JSON results
4. Keep `launch-readiness-auditor.md` as fallback for `/shipwise` first-run

### Phase 3: Background & Incremental (4-6 hours)

1. **Background audit during interview** — start scan after Q4, continue interview
2. **Delta scanning** — use git diff to scan only changed files
3. **Phase transition prefetch** — background agent pre-loads next-phase context

### Phase 4: Future (when Agent Teams stabilizes)

1. Multi-specialist implementation sessions
2. Parallel P0 item remediation
3. Cross-domain coordination for complex fixes

---

## 9. What NOT to Do

Based on research into multi-agent failure modes (79% of failures come from coordination issues):

| Anti-pattern | Why it fails | Shipwise implication |
|-------------|-------------|---------------------|
| **Inter-agent messaging** | Coordination tax grows exponentially (5 agents = 10 connections) | Keep agents independent; merge at orchestrator only |
| **Dynamic agent spawning** | LLM decides how many agents = unpredictable cost | Use deterministic routing tables |
| **Nested subagents** | Not supported in Claude Code; architectural constraint | Chain from main context only |
| **Map-Reduce over all files** | Cost explosion (100 files × 5K tokens = 500K input) | Filter with glob/grep first, then LLM-analyze |
| **Evaluator loops > 2 iterations** | Diminishing returns; cost scales linearly | Cap at 1-2 retries max |
| **Agent Teams for simple tasks** | 7x token cost for coordination overhead | Only for genuinely parallel workstreams |
| **Opus for scanning tasks** | Paying for reasoning that isn't needed | Haiku for grep/glob work; Opus for synthesis |
| **Swarm/Mesh patterns** | Emergent behavior is unpredictable | Shipwise needs deterministic, reproducible results |

### The 79% Rule

Research analyzing 2,766 multi-agent interactions found that **79% of multi-agent failures come from specification and coordination issues**, not technical implementation. Getting the prompts and boundaries right matters more than the architecture pattern. Shipwise's existing skill boundaries (clear trigger lists, explicit scope per skill) are the right foundation — the improvement is in execution speed and cost, not architecture change.

---

## Sources

- [Create custom subagents — Claude Code Docs](https://code.claude.com/docs/en/sub-agents)
- [Orchestrate teams of Claude Code sessions](https://code.claude.com/docs/en/agent-teams)
- [Claude Agent SDK overview](https://platform.claude.com/docs/en/agent-sdk/overview)
- [How we built our multi-agent research system — Anthropic Engineering](https://www.anthropic.com/engineering/multi-agent-research-system)
- [Building Effective AI Agents — Anthropic](https://resources.anthropic.com/building-effective-ai-agents)
- [Why Do Multi-Agent LLM Systems Fail? — arxiv](https://arxiv.org/abs/2503.13657)
- [The Code Agent Orchestra — Addy Osmani](https://addyosmani.com/blog/code-agent-orchestra/)
- [AI Agent Orchestration Patterns — Microsoft Azure](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns)
- [Developer's guide to multi-agent patterns — Google ADK](https://developers.googleblog.com/developers-guide-to-multi-agent-patterns-in-adk/)
- [Choosing the Right Multi-Agent Architecture — LangChain](https://blog.langchain.com/choosing-the-right-multi-agent-architecture/)
- [obra/superpowers — GitHub](https://github.com/obra/superpowers/)
- [Claude Code Sub-Agents: Best Practices](https://claudefa.st/blog/guide/agents/sub-agent-best-practices)
