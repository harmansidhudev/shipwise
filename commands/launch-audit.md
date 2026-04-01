---
name: launch-audit
description: Full codebase re-scan — update launch readiness state and show current gaps
user_invocable: true
---

# /launch-audit

Run a full codebase re-scan to update launch readiness.

## Procedure:

### Step 1: Parallel codebase scan
Tell the user: "Scanning your codebase across 4 domains in parallel..."

Spawn these 4 agents **in parallel** (all foreground, wait for all to complete):
1. `auditor-security` — security headers, auth, input validation, dependencies, tests
2. `auditor-infrastructure` — CI/CD, Docker, env, secrets, error tracking, health, monitoring
3. `auditor-ux-accessibility` — a11y, empty/loading states, contrast, labels, landmarks
4. `auditor-compliance-quality` — legal, SEO, billing, code quality, launch readiness

Each returns JSON with `{ category, items[], summary }`.

### Step 2: Merge results
Combine all 4 agent responses into a single items array:
- Concatenate all `items` arrays
- If an item ID appears in multiple auditors, keep the one with the most detailed evidence
- Use the `stack` object from `auditor-infrastructure` (it detects the tech stack)
- Calculate unified summary: total, done, partial, todo, readiness_pct

### Step 3: Update state
Compare merged results with existing `.claude/shipwise-state.json`:
- Items that went from "todo" → "done": mark as completed
- Items that went from "done" → "todo": flag as regression
- New items not in previous state: add them
- Log readiness % to history array

### Step 4: Regenerate status
Regenerate `.claude/SHIPWISE-STATUS.md` from updated state.json.

### Step 5: Present results
Present a diff summary: "Since last audit: +X items completed, Y new gaps found"
Show current P0 gaps with time estimates.

**Fallback:** If any of the 4 auditors fails or times out, fall back to the monolithic `launch-readiness-auditor` agent for that domain's categories.

## Quick mode: `/launch-audit quick`

For incremental checks (when only a few files changed since last audit):

1. Spawn the `auditor-delta` agent instead of the 4 parallel auditors
2. It uses `git diff` to scan only changed files
3. Returns only items that changed status (improved or regressed)
4. Much faster (~10-15s vs 30-45s) and cheaper (~$0.03 vs $0.12)
5. If delta detects >50 changed files, automatically falls back to full parallel scan

Tell the user: "Running quick audit on [N] changed files..."

## Output format:

### Status symbols
Display mapping for auditor JSON status values:
- `"done"` → ✓
- `"partial"` → ⚠
- `"todo"` → ✗

### Experience-level variants
Based on experience level:
- **Beginner:** Friendly summary with explanations of each gap
- **Intermediate:** Table of changes + current P0/P1 gaps
- **Senior:** Compact diff + gap count

### Visual audit follow-up
After presenting the automated scan results, add this note:
"The automated scan covers code-level UX (contrast, labels, landmarks, states). For a full visual and interaction review (14 dimensions including typography, spacing, navigation, content quality), ask me to run a design audit."

### Feedback nudge
At the end of the audit output, occasionally (not every time — roughly 1 in 3 audits) include:
"Feedback or feature ideas? → github.com/harmansidhudev/shipwise/discussions"
