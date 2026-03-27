# Scenario D2: Empty Dashboard for New Signup

## Metadata
- **Date:** 2026-03-27
- **Skill(s) tested:** 05 (fullstack-development), 02 (product-design)
- **User archetype:** mid-level developer
- **Interaction mode:** auto-trigger
- **Test fixture:** tests/fixtures/midlevel-saas-project/

## Objective
Validates that the reference docs correctly distinguish first-time empty states from returning-empty states, recommend sample data or onboarding CTAs, connect to onboarding patterns, and never leave the user with a blank page.

## Test Prompt
```
A new user just signed up and their dashboard is completely empty. What should they see?
```

## Expected Behavior
- Distinguishes first-time user (no data ever) from returning user with no data for selected period
- Recommends sample data or onboarding CTA for first-time users
- Connects to onboarding flow or checklist pattern
- Never shows a blank page

## Actual Behavior

### Trigger analysis
The prompt contains "dashboard" (triggers skill 05) and "empty" / "signed up" which relates to empty states and onboarding. Skill 05 fires as primary via "dashboard" trigger. Skill 02 (product-design) is a secondary match via "empty state", "first-time user", "onboarding flow", and "onboarding checklist" triggers. Both skills have relevant coverage.

### Reference doc coverage check

**First-time vs returning-empty distinction:**
Covered. Dashboard-ux-patterns.md Section 3 explicitly distinguishes: "If user is brand new (no data ever) -> show welcome state with sample data and a call to action" versus "If user has data but none for selected period -> show no-data state with hint to change filters." The DashboardEmptyState component takes a `variant` prop of `"first-time" | "no-data"` implementing both branches.

**Sample data or onboarding CTA:**
Covered. The first-time variant in the copy-paste component shows: a welcome illustration, the heading "Welcome! Your dashboard is ready.", body text "Once you [action], metrics appear here.", and a primary CTA button (customizable label, defaults to "Get started"). The `actionLabel` prop allows customization. The anti-patterns table also warns: "No empty state for new users -> Blank screen feels broken -> Add welcome message with clear first action."

**Connects to onboarding:**
Partially covered. The dashboard-ux-patterns.md component provides an `onAction` callback for the CTA button, which would link to onboarding. However, the dashboard reference doc itself does not explicitly cross-reference the onboarding flow patterns in skill 02 or skill 10. Skill 02 (product-design) SKILL.md covers "Onboarding UX patterns (checklists, tooltip tours, progressive disclosure, activation metrics)" and the intermediate block mentions "Checklist pattern (3-5 items max, start with one pre-completed)" and "Empty states with CTAs (not blank screens)." The micro-interaction-patterns.md does not specifically address onboarding connection from empty states. The connection exists across skills but is not explicitly linked in the dashboard reference doc.

**No blank page:**
Covered. Anti-patterns table in Section 9 of dashboard-ux-patterns.md explicitly calls out: "No empty state for new users | Blank screen feels broken | Add welcome message with clear first action." The first-time variant of DashboardEmptyState ensures a non-blank page with illustration, heading, body text, and CTA.

## Verdict
PASS

## Findings
### Positive
- The first-time vs returning-empty distinction is cleanly modeled as a variant prop with different UI for each case
- The anti-patterns table reinforces the "no blank page" rule from a negative angle
- The CTA button with customizable `actionLabel` and `onAction` callback provides a clear hook into onboarding flows
- Skill 02's SKILL.md coverage of onboarding patterns (checklist, progressive disclosure, activation metrics) complements the dashboard empty state well

### Gaps (if any)
- The dashboard-ux-patterns.md does not explicitly cross-reference skill 02's onboarding patterns or the onboarding section of skill 10. A "See also: onboarding flow design in skill 02/10" note would strengthen the connection between empty state and onboarding.
- No sample/demo data pattern is provided. The doc mentions "sample data" in the decision text but the component only shows a CTA, not an example of pre-populated demo metrics. A "show sample data" toggle or placeholder metrics would strengthen this guidance.
