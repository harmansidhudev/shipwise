# Scenario M3: Skeleton vs Spinner Decision for Dashboard Loading

## Metadata
- **Date:** 2026-03-27
- **Skill(s) tested:** 02-product-design, 05-fullstack-development
- **User archetype:** mid-level developer
- **Interaction mode:** auto-trigger
- **Test fixture:** tests/fixtures/midlevel-saas-project/

## Objective
Verify that the micro-interaction reference doc provides clear guidance on choosing skeleton screens over spinners for dashboard loading, with a copy-paste implementation.

## Test Prompt
```
My dashboard takes 2-3 seconds to load data. Should I use a spinner or skeleton screens? Show me the implementation.
```

## Expected Behavior
- Skill 02 or 05 auto-triggers on "loading state" / "skeleton screen" / "dashboard"
- Recommends skeleton screens (dashboard has known layout structure)
- Skeleton shapes match actual content shapes (cards, text lines, charts)
- Pulse animation on skeletons
- Does NOT recommend a full-page spinner

## Actual Behavior

### Trigger analysis

| Phrase in prompt | Skill 02 triggers | Skill 05 triggers | Match? |
|-----------------|-------------------|-------------------|--------|
| "dashboard" | — | "dashboard" | YES — skill 05 fires |
| "skeleton screens" | "skeleton screen" | — | YES — skill 02 fires |
| "spinner" | — | — | No direct trigger, contextual |
| "loading" | "loading state" | — | YES — skill 02 fires |

Both skill 02 and skill 05 would fire. Skill 05 handles implementation, skill 02 provides the design decision framework.

### Reference doc coverage check

| Validation item | Covered? | Source |
|----------------|----------|--------|
| Recommends skeleton screens | YES | Section 3 decision tree: "Content with known structure → Skeleton screen" |
| Shapes match content | YES | Skeleton component with `variant` prop (line, circle, rectangle) |
| Pulse animation | YES | Component includes `animate-pulse` class on all variants |
| No full-page spinner | YES | Decision tree routes "Full page load → Skeleton of page layout" |
| Quick rule provided | YES | "if you can draw the shape before it loads → skeleton" |

## Verdict
PASS

## Findings
### Positive
- Decision tree provides clear, unambiguous recommendation for dashboard loading
- Copy-paste Skeleton component with 3 variants covers all common dashboard elements
- The "quick rule" is memorable and actionable
- Dashboard UX patterns doc (skill 05) cross-references skeleton loading

### Gaps (if any)
None. Full coverage for this scenario.
