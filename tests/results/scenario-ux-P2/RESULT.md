# Scenario P2: Free-to-Paid Conversion UX Patterns

## Metadata
- **Date:** 2026-03-27
- **Skill(s) tested:** 10 (seo-performance), 02 (product-design)
- **User archetype:** mid-level developer
- **Interaction mode:** auto-trigger
- **Test fixture:** tests/fixtures/midlevel-saas-project/

## Objective
Validates that the reference docs provide guidance on in-app upgrade patterns for converting free users to paid, including usage limit prompts, feature gating, pricing page references, and avoiding aggressive pop-ups.

## Test Prompt
```
How do I get free users to upgrade to Pro? What UX patterns should I use?
```

## Expected Behavior
- Recommends usage limits with contextual upgrade prompts at the point of friction
- Covers feature gating with lock icon and "Pro" badge
- References the pricing page as part of the upgrade path
- Explicitly avoids aggressive or blocking pop-ups

## Actual Behavior

### Trigger analysis
The prompt contains "upgrade" and "free users" which relates to "free to paid" and "upgrade prompt" triggers in skill 10's trigger list. Skill 10 fires. Skill 02 also matches via "feature gates" and "pricing model" triggers. The prompt is primarily about in-app conversion UX, which is covered in skill 10's pricing-page-ux-guide Section 8.

### Reference doc coverage check

**Usage limits with upgrade prompts:**
Covered. Section 8 "Free-to-Paid Conversion UX" states: "If user hits a usage limit -> show a contextual upgrade prompt at the point of friction." The UpgradePrompt component implements this with `usageCount`, `usageLimit`, `featureName`, and `upgradeHref` props. It shows at 80%+ usage (`remaining > Math.floor(usageLimit * 0.2)`) and displays remaining count with an upgrade link. The copy reads: "You've used X of Y free [feature]. Z remaining." with "Upgrade for unlimited [feature]" CTA.

**Feature gating:**
Covered. Section 8 states: "If user views a locked feature -> show a lock icon with a 'Pro' badge and a one-click upgrade path." The FeatureLock component implements this with a lock emoji, feature label, `requiredTier` badge (styled as "Pro"), and an `upgradeHref` link. Hover state changes colors to indicate interactivity.

**Pricing page reference:**
Partially covered. The UpgradePrompt and FeatureLock components both accept an `upgradeHref` prop that would link to the pricing page. Section 8 opens with "In-app upgrade prompts drive most free-to-paid conversions, not the pricing page itself" -- establishing the relationship between in-app prompts and the pricing page. However, there is no explicit guidance on when to link to the full pricing page vs. a direct checkout/upgrade flow.

**No aggressive pop-ups:**
Covered. Section 8 decision framework explicitly states: "If you want to remind users about paid features -> use a subtle banner, never a blocking popup." This directly addresses the anti-aggressive-popup requirement. The anti-patterns table in Section 9 also warns against fake urgency and reinforces trust-based conversion.

## Verdict
PASS

## Findings
### Positive
- The decision framework in Section 8 provides clear, actionable rules for three distinct upgrade trigger scenarios (usage limit, locked feature, reminder)
- The 80% usage threshold in UpgradePrompt is a sensible default that warns before the limit, not just at the limit
- The explicit "never a blocking popup" guidance prevents dark patterns
- Both components (UpgradePrompt and FeatureLock) are copy-paste ready with customizable props
- The framing that "In-app upgrade prompts drive most free-to-paid conversions, not the pricing page itself" correctly sets expectations

### Gaps (if any)
- No guidance on upgrade prompt frequency or dismissal behavior. If a user dismisses an upgrade prompt, should it reappear? After how long? A "dismiss and do not show for X days" pattern would prevent notification fatigue.
- No A/B testing guidance for upgrade prompts. The pricing page section mentions conversion psychology, but Section 8 does not discuss testing different prompt copy, timing, or placement.
- The connection between in-app prompts and the pricing page could be more explicit -- when should the user land on the pricing page vs. a streamlined single-tier checkout?
