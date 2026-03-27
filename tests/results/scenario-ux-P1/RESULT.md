# Scenario P1: Three-Tier SaaS Pricing Page Design

## Metadata
- **Date:** 2026-03-27
- **Skill(s) tested:** 10 (seo-performance)
- **User archetype:** mid-level developer
- **Interaction mode:** auto-trigger
- **Test fixture:** tests/fixtures/midlevel-saas-project/

## Objective
Validates that the pricing-page-ux-guide reference doc provides complete guidance for designing a 3-tier SaaS pricing page with layout, billing toggle, feature comparison, social proof, FAQ, and conversion psychology techniques.

## Test Prompt
```
Design a pricing page for my SaaS. I have three tiers: Free (5 extractions/month), Pro ($12/mo, unlimited), and Team ($29/mo/user, collaboration features). What layout and UX should I use?
```

## Expected Behavior
- Recommends 3-column card layout with Pro tier highlighted ("Most Popular" badge, scale transform, colored border)
- Includes monthly/annual toggle showing savings as percentage and dollar amount
- Provides feature comparison matrix with grouped features, checkmarks/dashes, sticky header
- Includes social proof section (testimonial, logos, metric) placed below tier cards
- Includes FAQ section with standard pricing questions
- Addresses decoy effect and anchoring from conversion psychology

## Actual Behavior

### Trigger analysis
The prompt contains "pricing page", "pricing tier", and "tiers" which match skill 10's trigger list ("pricing page", "pricing tier", "pricing table", "feature comparison"). Skill 10 (seo-performance) fires. Skill 02 (product-design) also has "pricing model" as a trigger but is focused on pricing strategy/methodology rather than page UX, so skill 10 is the primary match for page design.

### Reference doc coverage check

**3-tier layout with Pro highlighted:**
Covered. Section 1 "Tier Layout Patterns" decision tree: "3 plans (Free / Pro / Enterprise) -> 3-column cards, Pro highlighted (most common)." Visual emphasis guidance: "give it a colored border, a 'Most Popular' badge, and a slight scale transform." The PricingTierCard component implements `highlighted` prop with `scale-105`, `border-indigo-500`, `ring-2`, and an absolutely-positioned "Most Popular" badge.

**Monthly/annual toggle with savings:**
Covered. Section 2 "Monthly/Annual Toggle" states: "Default to annual (higher LTV) but always show monthly. Show savings as percentage AND amount: 'Save 20% ($48/yr)'. Use a segmented control (two buttons), not a checkbox." The PricingToggle component takes `savingsPercent` and `savingsAmount` props and defaults to "annual" billing cycle. The savings message uses `animate-fade-in` for visual emphasis.

**Feature comparison matrix:**
Covered. Section 3 "Feature Comparison Matrix" provides detailed rules: "Group features by category", "Use checkmarks and dashes, not 'Yes' / 'No' text", "Dim features shared by all tiers", "Collapse shared features: 'All plans include: X, Y, Z'", "Sticky header so tier names stay visible while scrolling." The FeatureComparisonTable component implements all of these with `categories`, `tierNames`, `sharedFeatures` props, opacity dimming for shared rows, and sticky header via `sticky top-0`.

**Social proof:**
Covered. Section 4 "Social Proof on Pricing Pages" states: "Place it BELOW tier cards, ABOVE FAQ. Use a testimonial from a customer on your recommended tier." The PricingSocialProof component includes testimonial (quote, author, role, company, avatar), customer logos (grayscale), and a metric string.

**FAQ:**
Covered. Section 5 "FAQ Section" provides a table of 6 standard questions (refund policy, upgrade/downgrade, data export, cancellation, payment methods, invoices) with rationale for each. The PricingFAQ component uses `<details>` accordion pattern.

**Decoy effect / anchoring:**
Covered. Section 7 "Conversion Psychology" table includes: "Anchoring -- Show the most expensive tier first (left or top) so the middle tier feels reasonable" and "Decoy effect -- Make the middle tier obviously the best value by giving it disproportionately more features than the cheapest tier. Ensure Pro has 3-4x more features than Free, while Enterprise only adds 1-2 niche features." Also covers loss aversion, social proof badges, scarcity (only if real), and price framing.

## Verdict
PASS

## Findings
### Positive
- All six validation checkboxes are comprehensively covered with both strategic guidance and copy-paste components
- The decision tree naturally routes the user's 3-tier structure to the correct layout pattern
- Conversion psychology section provides ethical guardrails alongside techniques (e.g., scarcity: "Only use if REAL")
- Anti-patterns section (Section 9) covers common pricing page mistakes including hidden pricing, too many tiers, fake urgency, and missing FAQ
- The per-seat pricing concern for the Team tier is addressed in anti-patterns: "'Per seat' without team cost estimate -> Forces mental math -> Add a team size slider"

### Gaps (if any)
- The reference doc does not provide a specific component for per-seat pricing calculators/sliders, even though the anti-patterns section identifies this as a problem. The user's Team tier at $29/mo/user would benefit from an interactive team-size estimator component.
- No guidance on how to handle the Free tier's usage limit display (5 extractions/month) on the pricing card itself. The UpgradePrompt in Section 8 covers in-app limit displays but not how to present limits on the pricing page card.
