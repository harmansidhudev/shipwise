# Scenario O2: Onboarding Checklist Implementation

## Metadata
- **Date:** 2026-03-27
- **Skill(s) tested:** 02-product-design
- **User archetype:** mid-level developer
- **Interaction mode:** auto-trigger
- **Test fixture:** tests/fixtures/midlevel-saas-project/

## Objective
Verify the onboarding reference doc provides implementation guidance for building an onboarding checklist component with persistence, progress, and dismissal behavior.

## Test Prompt
```
Build an onboarding checklist component that shows the user 4 setup steps with a progress indicator. It should persist state and auto-dismiss when complete.
```

## Expected Behavior
- Persists to database (not localStorage)
- Progress indicator
- CTA per item
- Auto-dismiss
- Skip option

## Actual Behavior

### Trigger Match
The test prompt contains "onboarding checklist" which is an exact match in the SKILL.md trigger list. The skill would auto-trigger correctly.

### Validation Item Analysis

1. **Persists to database (not localStorage):** COVERED. Section 3 ("Onboarding checklist pattern") states explicitly: "Persist state to your database (not localStorage) so progress survives device switches." The checklist rules list includes "Persist state to user profile via API." This is a clear, direct recommendation against the common localStorage mistake.

2. **Progress indicator:** COVERED. The checklist rules include "Show progress visually (ring or bar)." The provided component implements a circular SVG progress ring with `strokeDasharray` based on completion percentage and a numeric `completedCount/total` display. This gives the developer both a visual and textual progress indicator to copy.

3. **CTA per item:** COVERED. The checklist rules state "Each item has: title, one-line description, CTA button." The `ChecklistStep` interface includes `ctaLabel: string` and `onAction: () => void`. The component renders a per-item CTA button with `{step.ctaLabel} ->` that only appears for incomplete steps, which is correct behavior.

4. **Auto-dismiss:** COVERED. The checklist rules include "Auto-dismiss when all items are complete." The component implements this with `if (completedCount === total) return null; // auto-dismiss` at the top of the render function. This is a clean, copy-pasteable implementation.

5. **Skip option:** COVERED. The checklist rules include "Allow manual dismiss ('Skip setup')." The component includes an `onDismiss` prop and renders a "Skip setup" button at the bottom: `<button onClick={onDismiss} className="...">Skip setup</button>`. The anti-patterns table in Section 8 also reinforces this with "No skip option on tours or checklists" listed as an anti-pattern.

## Verdict
PASS

## Findings

### Positive Observations
- All five validation items are explicitly addressed in both the checklist rules (as requirements) and the component code (as implementation). A developer can copy the component and have all five behaviors working.
- The `[CUSTOMIZE]` comment markers make it clear where the developer needs to modify the template for their own product.
- The `ChecklistStep` interface is well-typed and provides a clean contract for integrating with any backend.
- The anti-patterns table provides defense against common mistakes (replaying tours, no skip option) that complement the positive checklist guidance.

### Gaps
- The component does not include the API call for persisting state. While the rules say "Persist state to user profile via API," the component only manages local React state. A `useEffect` or callback showing the fetch/mutation to persist `completed` status would make the "not localStorage" guidance concrete in code.
- No guidance on animation for the auto-dismiss transition. The component returns `null` instantly, which would cause a jarring disappearance. A fade-out or slide-out transition would be expected for production quality.
- The component does not handle the 4-step constraint from the prompt specifically, but the rules say "3-5 items maximum" which encompasses it. This is adequate.
- No mention of keyboard accessibility for the checklist (focus management, arrow key navigation between items). The SKILL.md lists WCAG/accessibility as a coverage area, but the checklist component does not address it.
