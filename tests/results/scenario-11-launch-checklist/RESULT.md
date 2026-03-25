# Scenario 11: /launch-checklist Domain Deep-Dive (RE-TEST Round 2)

## Metadata
- **Date:** 2026-03-24 (re-test round 2)
- **Command:** commands/launch-checklist.md
- **Skills tested:** 04-tech-architecture, 08-security-compliance, 11-billing-payments
- **Method:** Static file inspection verifying fixes for BUG-11-A, BUG-11-B

## Verdict: PASS

Both prior bugs are fixed. No new issues found.

---

## Bug Fix Verification

### BUG-11-A: Architecture skill had no checklist-format items (advisory only)
**STATUS: FIXED**

File: `skills/04-tech-architecture/SKILL.md`, lines 280-301

A dedicated "Checklist Items (for `/launch-checklist architecture`)" section now exists with:

**Table with 7 items:**

| # | Item | Check (state field) | Priority | Time |
|---|------|---------------------|----------|------|
| 1 | Frontend framework selected | project.stack.frontend is not null | P0 | 30 min |
| 2 | Backend / API strategy decided | project.stack.api_style is not null | P0 | 30 min |
| 3 | Database selected | project.stack.database is not null | P0 | 20 min |
| 4 | ORM selected | project.stack.orm is not null | P1 | 15 min |
| 5 | Auth provider chosen | project.stack.auth is not null | P0 | 30 min |
| 6 | Hosting platform chosen | project.stack.hosting is not null | P1 | 20 min |
| 7 | Full stack documented in state | All non-null fields in project.stack | P1 | 5 min |

**Dual-mode blocks (lines 294-301):**
- `<!-- beginner -->`: Explains how to read the checklist, what P0/P1 mean, mentions checkmarks from previous conversations
- `<!-- intermediate -->`: Points to decision matrices, mentions auto-save to state
- `<!-- senior -->`: Terse, directs to edit shipwise-state.json directly

This fully addresses BUG-11-A: skill 04 now has checklist-format items with P0/P1/P2 labels, time estimates, state cross-references, and experience-level blocks.

### BUG-11-B: Invalid domain not handled
**STATUS: FIXED (confirmed still working)**

File: `commands/launch-checklist.md`, lines 52-53

Explicit handling for unrecognized domains:
```
Respond: "Unknown domain: [domain]. Available domains: security, billing, seo, observability, legal, testing, infrastructure, architecture, design, growth, fullstack, launch, idea, business."
```

All 14 valid domains listed. Suggests no-argument form for discovery.

---

## Full Validation Checklist

| # | Check | Status | Evidence |
|---|-------|--------|----------|
| 1 | Skill 04 has "Checklist Items" section with checkbox items | PASS | Lines 280-293, 7-item table |
| 2 | P0/P1/P2 labels per item | PASS | Items 1,2,3,5 are P0; items 4,6,7 are P1 |
| 3 | Time estimates per item | PASS | 30min, 30min, 20min, 15min, 30min, 20min, 5min |
| 4 | Beginner/intermediate/senior dual-mode blocks | PASS | Lines 294-301, all three blocks present |
| 5 | Cross-references shipwise-state.json project.stack fields | PASS | "Check" column maps to specific state fields |
| 6 | Security checklist still excellent | PASS | Skill 08 has 6 sections, each with 3 experience blocks, copy-paste templates, verification steps |
| 7 | Billing checklist still excellent | PASS | Skill 11 mapped at line 35 of launch-checklist.md |
| 8 | Invalid domain ("cooking") handled | PASS | Lines 52-53: deterministic error with all 14 valid domains |

---

## Skeptical Observations

1. **Priority assignments are reasonable but could be debated.** ORM (P1) could be argued as P0 since database schema design depends on ORM choice. However, many projects start with raw SQL and add an ORM later, so P1 is defensible.

2. **No P2 items in architecture checklist.** All items are P0 or P1. This is appropriate since architecture decisions are foundational -- there are no "nice-to-have" stack decisions.

3. **Time estimates assume conversation-based decision-making,** not research time. "30 min" for framework selection assumes the developer is in dialogue with Claude, not independently researching. This is consistent with Shipwise's conversational model.

---

## New Bugs Found

None.
