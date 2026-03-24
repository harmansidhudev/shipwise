---
name: launch-audit
description: Full codebase re-scan — update launch readiness state and show current gaps
user_invocable: true
---

# /launch-audit

Run a full codebase re-scan to update launch readiness.

## Procedure:
1. Run the `launch-readiness-auditor` agent
2. Compare new results with existing `.claude/shipwise-state.json`
3. Update state.json with any newly completed or regressed items
4. Log readiness % to history
5. Regenerate `.claude/SHIPWISE-STATUS.md`
6. Present a diff summary: "Since last audit: +3 items completed, 1 new gap found"
7. Show current P0 gaps with time estimates

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
