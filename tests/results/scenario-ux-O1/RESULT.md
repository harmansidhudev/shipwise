# Scenario O1: First-Time User Experience Design

## Metadata
- **Date:** 2026-03-27
- **Skill(s) tested:** 02-product-design
- **User archetype:** mid-level developer
- **Interaction mode:** auto-trigger
- **Test fixture:** tests/fixtures/midlevel-saas-project/

## Objective
Verify the onboarding reference doc provides guidance for designing first-time user experience on an empty dashboard.

## Test Prompt
```
Design the first-time user experience for a SaaS dashboard. After signup, the user sees an empty dashboard. What should they see and how do I guide them to their first success?
```

## Expected Behavior
- Recommends empty-state-as-onboarding
- Suggests defining an activation metric
- Distinguishes first-time empty state from returning empty
- Includes checklist or progressive disclosure pattern
- Avoids anti-patterns (blocking tours, info collection before value)

## Actual Behavior

### Trigger Match
The test prompt contains the phrases "first-time user", "empty state", and "onboarding" concepts. The SKILL.md trigger list includes `first-time user`, `empty state`, `onboarding flow`, and `activation metric` -- all of which match. The skill would auto-trigger correctly.

### Validation Item Analysis

1. **Recommends empty-state-as-onboarding:** COVERED. Section 2 ("Empty state as onboarding") directly addresses this. It provides a copywriting pattern table with a specific "Empty dashboard" row ("No data yet" / "Connect a data source to see your first chart.") and a full React + Tailwind `EmptyStateOnboarding` component with `variant: "first-time" | "returning"`. The decision tree in Section 1 also maps "Simple tool (1 core action)" to "Empty state with single CTA, no tour."

2. **Suggests defining an activation metric:** COVERED. Section 6 ("Activation metrics") defines activation as "the first meaningful action" and includes a table of activation events by product type (Analytics -> "First dashboard viewed, < 3 min"). It also provides a fill-in-the-blank activation metric definition template and an analytics tracking snippet.

3. **Distinguishes first-time empty state from returning empty:** COVERED. Section 2 opens with "First-time users and returning users who cleared data need different messaging." The copywriting table has separate rows for "First project" vs "Returning empty" ("All caught up"). The component uses a `variant` prop with `"first-time"` and `"returning"` values that render different secondary content.

4. **Includes checklist or progressive disclosure pattern:** COVERED. Section 3 ("Onboarding checklist pattern") provides checklist rules (3-5 items, progress indicator, CTA per item, skip option, auto-dismiss) and a complete component. Section 5 ("Progressive disclosure") adds a decision framework and a `FeatureGate` component. Section 1's decision tree recommends "Checklist + contextual tooltips" for "Medium SaaS (3-5 features)" which matches the test prompt's SaaS dashboard scenario.

5. **Avoids anti-patterns (blocking tours, info collection before value):** COVERED. Section 8 ("Anti-patterns") includes 10 items with explicit entries for "Onboarding that blocks the core action", "Asking for info you don't need yet (company size at signup)", "No skip option on tours or checklists", and "Generic 'Welcome!' with no next step." Each has a "Why it hurts" column and a "Fix" column.

## Verdict
PASS

## Findings

### Positive Observations
- The decision tree in Section 1 gives a mid-level developer a fast path to the right pattern without requiring them to read all sections.
- The distinction between first-time and returning empty states is handled at both the copywriting level (table) and the component level (variant prop), which is thorough.
- Activation metrics are tied to concrete product types with target timeframes, making the guidance actionable rather than theoretical.
- Anti-patterns are presented as a scannable table rather than prose, which suits the intermediate audience well.

### Gaps
- No guidance on combining patterns (e.g., empty state + checklist sidebar for a medium-complexity SaaS dashboard). The decision tree presents patterns as mutually exclusive choices, but the test prompt's "SaaS dashboard" scenario would likely benefit from both empty-state messaging and a checklist.
- No mention of A/B testing or measuring which empty-state variant converts better. The activation metrics section covers tracking but not experimentation.
- No sample user flow diagram showing signup -> empty state -> first action -> activation. A visual would help mid-level developers see the full picture.
