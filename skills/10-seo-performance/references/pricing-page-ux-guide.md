# Pricing Page UX Guide

Visitors who reach your pricing page are already considering buying — it is your highest-intent conversion surface. This guide provides copy-paste React + Tailwind + TypeScript components for every pricing page pattern.

## When to use

Reference when building or auditing a SaaS pricing page during the SHIP phase. Covers pricing page UX patterns, not pricing strategy or revenue modeling.

---

## 1. Tier Layout Patterns

Choose your layout based on plan count. More tiers means more cognitive load.

### Decision tree

```
How many plans?
├── 2 plans (Free + Paid)
│   → Side-by-side cards, Paid highlighted
├── 3 plans (Free / Pro / Enterprise)
│   → 3-column cards, Pro highlighted (most common)
├── 4+ plans
│   → Reconsider. Can you merge two tiers? (4+ causes decision paralysis)
└── Usage-based only
    → Calculator/slider with estimated cost
```

### Visual emphasis

- If you have a recommended tier, give it a colored border, a "Most Popular" badge, and a slight `scale` transform. The recommended tier must stand out at a glance.

### Copy-paste: PricingTierCard

```tsx
// [CUSTOMIZE] tier data: name, price, features, highlighted flag, CTA text

interface PricingTier {
  name: string; price: string; period: string;
  description: string; features: string[]; cta: string; highlighted?: boolean;
}

function PricingTierCard({ tier }: { tier: PricingTier }) {
  const ring = tier.highlighted
    ? "scale-105 border-indigo-500 shadow-xl ring-2 ring-indigo-500"
    : "border-gray-200 shadow-sm";
  const btnStyle = tier.highlighted
    ? "bg-indigo-500 text-white hover:bg-indigo-600"
    : "bg-gray-50 text-gray-900 ring-1 ring-gray-200 hover:bg-gray-100";

  return (
    <div className={`relative flex flex-col rounded-2xl border p-8 ${ring}`}>
      {tier.highlighted && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-500 px-4 py-1 text-xs font-semibold text-white">
          Most Popular
        </span>
      )}
      <h3 className="text-lg font-semibold text-gray-900">{tier.name}</h3>
      <p className="mt-1 text-sm text-gray-500">{tier.description}</p>
      <div className="mt-6">
        <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
        <span className="text-sm text-gray-500">/{tier.period}</span>
      </div>
      <ul className="mt-8 flex-1 space-y-3">
        {tier.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
            <span className="mt-0.5 text-indigo-500">✓</span> {f}
          </li>
        ))}
      </ul>
      <button className={`mt-8 w-full rounded-lg px-4 py-3 text-sm font-semibold ${btnStyle}`}>
        {tier.cta}
      </button>
    </div>
  );
}
```

---

## 2. Monthly/Annual Toggle

Default to annual (higher LTV) but always show monthly. Show savings as percentage AND amount: "Save 20% ($48/yr)". Use a segmented control (two buttons), not a checkbox — switches imply on/off, not a choice.

### Copy-paste: PricingToggle

```tsx
// [CUSTOMIZE] savingsPercent, savingsAmount

import { useState } from "react";

type BillingCycle = "monthly" | "annual";

function PricingToggle({ onChange, savingsPercent, savingsAmount }: {
  onChange: (cycle: BillingCycle) => void;
  savingsPercent: number; // [CUSTOMIZE] e.g. 20
  savingsAmount: string;  // [CUSTOMIZE] e.g. "$48/yr"
}) {
  const [cycle, setCycle] = useState<BillingCycle>("annual");
  const set = (c: BillingCycle) => { setCycle(c); onChange(c); };
  const btn = (c: BillingCycle, label: string) => (
    <button onClick={() => set(c)} className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
      cycle === c ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
    }`}>{label}</button>
  );
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="inline-flex rounded-lg bg-gray-100 p-1">
        {btn("monthly", "Monthly")}{btn("annual", "Annual")}
      </div>
      {cycle === "annual" && (
        <span className="animate-fade-in text-sm font-medium text-green-600">
          Save {savingsPercent}% ({savingsAmount})
        </span>
      )}
    </div>
  );
}
```

---

## 3. Feature Comparison Matrix

Without a comparison table, users must mentally diff feature lists across cards. Follow these rules:

- Group features by category (e.g., "Core", "Collaboration", "Support").
- Use checkmarks (✓) and dashes (—), not "Yes" / "No" text.
- Dim features shared by all tiers. Highlight differentiating features.
- Collapse shared features: "All plans include: X, Y, Z."
- Sticky header so tier names stay visible while scrolling.

### Copy-paste: FeatureComparisonTable

```tsx
// [CUSTOMIZE] tierNames, categories, sharedFeatures

interface FeatureCategory {
  name: string;
  features: { name: string; tiers: Record<string, boolean | string> }[];
}

interface FeatureComparisonTableProps {
  tierNames: string[];            // [CUSTOMIZE] e.g. ["Free", "Pro", "Enterprise"]
  categories: FeatureCategory[];  // [CUSTOMIZE] grouped features
  sharedFeatures: string[];       // [CUSTOMIZE] features in ALL tiers
}

function FeatureComparisonTable({ tierNames, categories, sharedFeatures }: FeatureComparisonTableProps) {
  const renderCell = (value: boolean | string) => {
    if (value === true) return <span className="text-indigo-500">✓</span>;
    if (value === false) return <span className="text-gray-300">—</span>;
    return <span className="text-gray-700">{value}</span>;
  };

  return (
    <div className="mx-auto max-w-4xl">
      {sharedFeatures.length > 0 && (
        <p className="mb-6 text-center text-sm text-gray-500">
          All plans include: {sharedFeatures.join(", ")}
        </p>
      )}
      <table className="w-full text-left text-sm">
        <thead className="sticky top-0 bg-white">
          <tr className="border-b border-gray-200">
            <th className="py-4 pr-4 font-medium text-gray-500">Feature</th>
            {tierNames.map((t) => (
              <th key={t} className="px-4 py-4 text-center font-semibold text-gray-900">{t}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <>
              <tr key={cat.name}>
                <td colSpan={tierNames.length + 1} className="pt-6 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  {cat.name}
                </td>
              </tr>
              {cat.features.map((f) => {
                const allSame = tierNames.every((t) => f.tiers[t] === f.tiers[tierNames[0]]);
                return (
                  <tr key={f.name} className={`border-b border-gray-100 ${allSame ? "opacity-50" : ""}`}>
                    <td className="py-3 pr-4 text-gray-700">{f.name}</td>
                    {tierNames.map((t) => (
                      <td key={t} className="px-4 py-3 text-center">{renderCell(f.tiers[t])}</td>
                    ))}
                  </tr>
                );
              })}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## 4. Social Proof on Pricing Pages

Social proof reduces purchase anxiety. Place it BELOW tier cards, ABOVE FAQ. Use a testimonial from a customer on your recommended tier to reinforce that specific choice.

### Copy-paste: PricingSocialProof

```tsx
// [CUSTOMIZE] testimonial, logos, metric

interface PricingSocialProofProps {
  testimonial: { quote: string; author: string; role: string; company: string; avatarUrl?: string };
  logos: { name: string; src: string }[];  // [CUSTOMIZE] customer logos
  metric: string;                          // [CUSTOMIZE] e.g. "Join 2,400+ teams"
}

function PricingSocialProof({ testimonial, logos, metric }: PricingSocialProofProps) {
  return (
    <section className="mx-auto max-w-3xl py-16 text-center">
      <p className="text-sm font-semibold text-indigo-500">{metric}</p>
      <blockquote className="mt-8">
        <p className="text-lg leading-relaxed text-gray-700">&ldquo;{testimonial.quote}&rdquo;</p>
        <footer className="mt-4 flex items-center justify-center gap-3">
          {testimonial.avatarUrl && (
            <img src={testimonial.avatarUrl} alt={testimonial.author} className="h-10 w-10 rounded-full" />
          )}
          <div className="text-left text-sm">
            <p className="font-semibold text-gray-900">{testimonial.author}</p>
            <p className="text-gray-500">{testimonial.role}, {testimonial.company}</p>
          </div>
        </footer>
      </blockquote>
      <div className="mt-12 flex flex-wrap items-center justify-center gap-8 opacity-60 grayscale">
        {logos.map((logo) => (
          <img key={logo.name} src={logo.src} alt={logo.name} className="h-8" />
        ))}
      </div>
    </section>
  );
}
```

---

## 5. FAQ Section

An FAQ below pricing resolves last-minute objections. Without it, visitors leave to research answers.

### Standard questions to include

| Question | Why it matters |
|----------|---------------|
| What is your refund policy? | Reduces purchase risk |
| Can I upgrade or downgrade anytime? | Removes lock-in fear |
| Can I export my data? | Addresses vendor lock-in |
| How do I cancel? | Transparency builds trust |
| What payment methods do you accept? | Removes friction |
| Do you provide invoices? | Required for B2B buyers |

### Copy-paste: PricingFAQ

```tsx
// [CUSTOMIZE] items array with your actual questions and answers

function PricingFAQ({ items }: { items: { question: string; answer: string }[] }) {
  return (
    <section className="mx-auto max-w-2xl py-16">
      <h2 className="text-center text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
      <div className="mt-10 divide-y divide-gray-200">
        {items.map((item) => (
          <details key={item.question} className="group py-4">
            <summary className="flex cursor-pointer items-center justify-between text-left font-medium text-gray-900">
              {item.question}
              <span className="ml-4 text-gray-400 transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
```

---

## 6. Enterprise / Contact Sales CTA

- If any tier requires custom pricing or a demo, add this. If all tiers are self-serve, skip it.
- Place as a separate card or full-width row below tier cards.
- CTA: "Talk to Sales" or "Get a Demo" — never "Contact Us" (too vague).
- List 3-4 enterprise benefits (SSO, SLA, dedicated support, custom integrations).

### Copy-paste: EnterpriseCTA

```tsx
// [CUSTOMIZE] benefits, ctaText, ctaHref

function EnterpriseCTA({ benefits, ctaText, ctaHref }: { benefits: string[]; ctaText: string; ctaHref: string }) {
  return (
    <div className="mx-auto mt-12 max-w-4xl rounded-2xl border border-gray-200 bg-gray-50 p-8 sm:flex sm:items-center sm:justify-between">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Enterprise</h3>
        <p className="mt-1 text-sm text-gray-500">Custom pricing for teams with advanced needs.</p>
        <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600">
          {benefits.map((b) => (
            <li key={b} className="flex items-center gap-1.5"><span className="text-indigo-500">✓</span> {b}</li>
          ))}
        </ul>
      </div>
      <a href={ctaHref} className="mt-6 inline-block shrink-0 rounded-lg bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800 sm:mt-0">
        {ctaText}
      </a>
    </div>
  );
}
```

---

## 7. Conversion Psychology

Use these techniques ethically. Every claim must be true.

| Technique | How it works | Implementation |
|-----------|-------------|----------------|
| **Anchoring** | Show the most expensive tier first (left or top) so the middle tier feels reasonable by comparison. | Order tiers: Enterprise → Pro → Free (or right-to-left with Pro highlighted). |
| **Decoy effect** | Make the middle tier obviously the best value by giving it disproportionately more features than the cheapest tier. | Ensure Pro has 3-4x more features than Free, while Enterprise only adds 1-2 niche features. |
| **Loss aversion** | People fear losing access more than they desire gaining it. "Start free, upgrade anytime" reduces commitment anxiety. | Use "Start free" as CTA for the free tier, not "Sign up." |
| **Social proof** | "Most Popular" badge on the recommended tier tells visitors what peers chose. | Add a badge to the highlighted tier (see Section 1). |
| **Scarcity** | Only use if REAL. "Beta limited to 500 teams" works. Fake countdown timers destroy trust. | If you have a real cap, show "X of 500 spots taken" with a progress bar. |
| **Price framing** | "$1/day" feels smaller than "$29/month" even though it is the same. | Show per-day or per-user-per-day below the main price as secondary text. |

---

## 8. Free-to-Paid Conversion UX

In-app upgrade prompts drive most free-to-paid conversions, not the pricing page itself.

### Decision framework

- If user hits a usage limit → show a contextual upgrade prompt at the point of friction.
- If user views a locked feature → show a lock icon with a "Pro" badge and a one-click upgrade path.
- If you want to remind users about paid features → use a subtle banner, never a blocking popup.

### Copy-paste: UpgradePrompt + FeatureLock

```tsx
// [CUSTOMIZE] featureName, usageCount, usageLimit, upgradeHref

interface UpgradePromptProps {
  featureName: string; usageCount: number; usageLimit: number; upgradeHref: string;
}

function UpgradePrompt({ featureName, usageCount, usageLimit, upgradeHref }: UpgradePromptProps) {
  const remaining = usageLimit - usageCount;
  if (remaining > Math.floor(usageLimit * 0.2)) return null; // show at 80%+ usage
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
      <p className="text-sm text-amber-800">
        You&apos;ve used <strong>{usageCount}</strong> of <strong>{usageLimit}</strong> free {featureName}.
        {remaining === 0 ? " You've reached your limit." : ` ${remaining} remaining.`}
      </p>
      <a href={upgradeHref} className="mt-2 inline-block text-sm font-semibold text-amber-900 underline hover:text-amber-700">
        Upgrade for unlimited {featureName} →
      </a>
    </div>
  );
}

// [CUSTOMIZE] featureLabel, requiredTier, upgradeHref

function FeatureLock({ featureLabel, requiredTier, upgradeHref }: { featureLabel: string; requiredTier: string; upgradeHref: string }) {
  return (
    <a href={upgradeHref} className="group flex items-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3 hover:border-indigo-300 hover:bg-indigo-50">
      <span className="text-sm text-gray-400 group-hover:text-indigo-500">🔒</span>
      <span className="text-sm text-gray-500 group-hover:text-indigo-700">{featureLabel}</span>
      <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-xs font-medium text-indigo-700">{requiredTier}</span>
    </a>
  );
}
```

---

## 9. Anti-Patterns

| Anti-pattern | Why it hurts | Fix |
|-------------|-------------|-----|
| Hiding the price ("Contact us for pricing") | Destroys trust. Visitors assume it is expensive and leave. | Show a starting price. Use "Starting at $X/mo" if pricing varies. |
| Too many tiers (>4) | Causes decision paralysis. Visitors cannot compare 5+ options. | Merge similar tiers. Aim for 3. |
| Feature lists identical across tiers | Makes comparison useless. Visitors cannot see why they should upgrade. | Differentiate clearly. Each tier must have at least 2 unique features. |
| No free tier or trial | Creates friction. Visitors cannot evaluate before committing. | Offer a free tier, a free trial (14 days minimum), or a money-back guarantee. |
| Annual-only pricing | Feels like a trap. New users want monthly to reduce risk. | Always show monthly. Incentivize annual with a discount. |
| "Per seat" without team cost estimate | Forces mental math. "$12/seat" for a 10-person team is unclear. | Add a team size slider or show "Estimated cost for X seats: $Y/mo." |
| Fake urgency (countdown timers, "only 3 left") | Erodes trust permanently. Visitors who return and see the same timer feel deceived. | Only use scarcity if it is real and verifiable. |
| No FAQ below pricing | Leaves objections unresolved. Visitors leave to research answers. | Add an FAQ with the 6 standard questions (see Section 5). |

---

## Companion tools

- `anthropics/claude-code` → `frontend-design` skill — Implement pricing page
- `bencium/bencium-marketplace` → `controlled-ux-designer` — Pricing page visual design
- `coreyhaines31/marketingskills` → `page-cro` — Pricing page conversion optimization
