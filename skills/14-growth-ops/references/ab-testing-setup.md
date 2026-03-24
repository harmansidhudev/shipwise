# A/B Testing Setup

## When to use
Reference this guide when setting up your first A/B testing infrastructure, designing an experiment, calculating sample sizes, or implementing feature-flag-based experiments. Use the code templates to integrate GrowthBook or build a lightweight experiment wrapper.

## Decision framework

```
Should I A/B test this change?
├── Is the change reversible and low-risk?
│   ├── Yes, and it affects a key metric (signup, activation, payment)?
│   │   → A/B test it
│   ├── Yes, but it is a minor UI tweak?
│   │   → Ship it, monitor metrics for regression
│   └── Not sure?
│       → A/B test if you have enough traffic (see sample size calculator)
├── Is it a large infrastructure or backend change?
│   → Feature flag for gradual rollout, but NOT a traditional A/B test
├── Is it a bug fix?
│   → Ship it directly, no test needed
└── Do you have <1000 weekly active users?
    → A/B tests will take too long. Ship changes, compare before/after cohorts
```

---

## A/B testing methodology

### The experiment lifecycle

```
1. HYPOTHESIS
   "Changing [X] will improve [metric] by [Y]% because [reason]"
   Example: "Changing the CTA button from 'Get Started' to 'Start Free Trial'
   will improve signup rate by 15% because it sets clearer expectations"

2. DESIGN
   - Primary metric: ONE metric you are trying to improve
   - Guardrail metrics: Metrics that must NOT degrade (e.g., activation rate)
   - Sample size: Calculate minimum users needed (see below)
   - Duration: Estimate based on traffic
   - Traffic split: 50/50 (control/variant) for fastest results

3. IMPLEMENT
   - Wrap variant behind a feature flag
   - Ensure random, sticky assignment (same user always sees same variant)
   - Log experiment_assigned event with variant

4. RUN
   - Let it reach statistical significance (95% confidence)
   - Do NOT peek at results daily and stop early
   - Minimum 2 weeks even if significance reached sooner (weekday/weekend effects)

5. ANALYZE
   - Check primary metric: statistically significant improvement?
   - Check guardrail metrics: any degradation?
   - Check segments: does the variant help all users or just some?

6. DECIDE
   - Significant improvement + no guardrail regression → Ship variant
   - No significant difference → Ship either (simplest implementation wins)
   - Guardrail regression → Reject variant, investigate
   - Inconclusive → Extend test or redesign variant

7. DOCUMENT
   - Log results in experiment tracker
   - Share learnings with team
```

### Sample size calculator

```
Minimum sample size per variant:

  n = (Z_alpha + Z_beta)^2 * 2 * p * (1 - p) / MDE^2

Where:
  Z_alpha = 1.96 (for 95% confidence)
  Z_beta  = 0.84 (for 80% power)
  p       = baseline conversion rate
  MDE     = minimum detectable effect (absolute)

Simplified lookup table:
┌──────────────┬──────────┬──────────┬──────────┬──────────┐
│ Baseline     │ MDE ±1%  │ MDE ±2%  │ MDE ±5%  │ MDE ±10% │
│ Conversion   │ (per var)│ (per var)│ (per var)│ (per var)│
├──────────────┼──────────┼──────────┼──────────┼──────────┤
│ 2%           │ 3,800    │ 1,000    │ 160      │ 40       │
│ 5%           │ 9,200    │ 2,300    │ 380      │ 95       │
│ 10%          │ 17,300   │ 4,300    │ 700      │ 175      │
│ 20%          │ 30,700   │ 7,700    │ 1,230    │ 310      │
│ 50%          │ 47,800   │ 12,000   │ 1,920    │ 480      │
└──────────────┴──────────┴──────────┴──────────┴──────────┘

Example:
  Baseline signup rate: 5%
  Want to detect a 2% absolute increase (5% → 7%)
  Need ~2,300 visitors PER VARIANT (4,600 total)
  At 500 visitors/day → ~10 days to reach significance
```

### Test duration estimator

```
Duration (days) = (sample_size_per_variant * 2) / daily_traffic

Rules:
├── Minimum duration: 14 days (captures weekday + weekend patterns)
├── Maximum duration: 8 weeks (avoid seasonal drift)
├── If > 8 weeks needed: either increase MDE or increase traffic
└── Never stop early because results "look significant"
    (peeking inflates false positive rate)
```

---

## GrowthBook setup guide

### Installation

```bash
npm install @growthbook/growthbook-react
```

### Provider setup (React)

```tsx
// app/providers/growthbook-provider.tsx
// [CUSTOMIZE] Replace apiHost and clientKey with your GrowthBook instance

'use client';

import { GrowthBook, GrowthBookProvider } from '@growthbook/growthbook-react';
import { useEffect, ReactNode } from 'react';

const gb = new GrowthBook({
  apiHost: 'https://cdn.growthbook.io', // [CUSTOMIZE] or self-hosted URL
  clientKey: process.env.NEXT_PUBLIC_GROWTHBOOK_CLIENT_KEY!,
  enableDevMode: process.env.NODE_ENV === 'development',

  // Track experiment assignments
  trackingCallback: (experiment, result) => {
    // [CUSTOMIZE] Send to your analytics tool
    posthog.capture('experiment_assigned', {
      experiment_id: experiment.key,
      variant: result.key,
      variant_value: result.value,
    });
  },
});

export function GrowthBookWrapper({ children }: { children: ReactNode }) {
  useEffect(() => {
    gb.init({ streaming: true }); // Real-time feature flag updates
  }, []);

  return (
    <GrowthBookProvider growthbook={gb}>
      {children}
    </GrowthBookProvider>
  );
}

// Call after user authenticates to enable targeting
export function setGrowthBookUser(userId: string, attributes: Record<string, unknown>) {
  gb.setAttributes({
    id: userId,
    ...attributes,
    // [CUSTOMIZE] Add attributes for targeting
    // plan: 'free',
    // country: 'US',
    // signupDate: '2026-01-15',
  });
}
```

### Layout integration (Next.js)

```tsx
// app/layout.tsx
import { GrowthBookWrapper } from './providers/growthbook-provider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <GrowthBookWrapper>
          {children}
        </GrowthBookWrapper>
      </body>
    </html>
  );
}
```

---

## Copy-paste: experiment wrapper component (React)

```tsx
// components/experiment.tsx
// [CUSTOMIZE] Generic experiment wrapper — works with any A/B test

'use client';

import { useFeatureIsOn, useFeatureValue } from '@growthbook/growthbook-react';
import { ReactNode } from 'react';

// --- Simple boolean experiment (show/hide) ---
interface BooleanExperimentProps {
  featureKey: string;
  control: ReactNode;
  variant: ReactNode;
}

export function Experiment({ featureKey, control, variant }: BooleanExperimentProps) {
  const isOn = useFeatureIsOn(featureKey);
  return <>{isOn ? variant : control}</>;
}

// Usage:
// <Experiment
//   featureKey="new-signup-cta"
//   control={<button>Get Started</button>}
//   variant={<button>Start Free Trial</button>}
// />

// --- Multi-variant experiment ---
interface MultiVariantExperimentProps {
  featureKey: string;
  variants: Record<string, ReactNode>;
  fallback?: ReactNode;
}

export function MultiVariantExperiment({
  featureKey,
  variants,
  fallback,
}: MultiVariantExperimentProps) {
  const value = useFeatureValue(featureKey, 'control');
  return <>{variants[value as string] || fallback || variants['control']}</>;
}

// Usage:
// <MultiVariantExperiment
//   featureKey="pricing-page-layout"
//   variants={{
//     control: <PricingLayoutA />,
//     horizontal: <PricingLayoutB />,
//     comparison: <PricingLayoutC />,
//   }}
// />
```

---

## Copy-paste: server-side experiment helper

```ts
// lib/experiments.ts
// [CUSTOMIZE] Server-side experiment evaluation (API routes, RSC)

import { GrowthBook } from '@growthbook/growthbook';

export async function getServerExperiment(
  userId: string,
  featureKey: string,
  attributes: Record<string, unknown> = {},
) {
  const gb = new GrowthBook({
    apiHost: 'https://cdn.growthbook.io', // [CUSTOMIZE]
    clientKey: process.env.GROWTHBOOK_CLIENT_KEY!,
    trackingCallback: (experiment, result) => {
      // [CUSTOMIZE] Server-side tracking — send to analytics
      // Example: queue event for async processing
      console.log('Experiment assigned:', {
        experiment_id: experiment.key,
        variant: result.key,
        user_id: userId,
      });
    },
  });

  await gb.init({ timeout: 3000 });

  gb.setAttributes({
    id: userId,
    ...attributes,
  });

  const value = gb.getFeatureValue(featureKey, 'control');
  const isOn = gb.isOn(featureKey);

  gb.destroy(); // Clean up

  return { value, isOn };
}

// Usage in API route:
// const { value } = await getServerExperiment(userId, 'checkout-flow-v2');
// if (value === 'streamlined') {
//   // Serve streamlined checkout
// }

// Usage in React Server Component:
// const { isOn } = await getServerExperiment(userId, 'new-dashboard');
// return isOn ? <NewDashboard /> : <OldDashboard />;
```

---

## Experiment log template

Track every experiment you run in a shared document or database.

```markdown
# Experiment Log — [CUSTOMIZE: Product Name]

## EXP-001: [Experiment Name]
- **Status**: Running | Completed | Cancelled
- **Dates**: YYYY-MM-DD to YYYY-MM-DD
- **Feature key**: `new-signup-cta`
- **Hypothesis**: Changing the CTA from "Get Started" to "Start Free Trial"
  will increase signup rate by 15% because it sets clearer expectations
  about what happens after clicking.
- **Primary metric**: Signup conversion rate (page_viewed → user_signed_up)
- **Guardrail metrics**: Activation rate (must not decrease by >5%)
- **Traffic split**: 50% control / 50% variant
- **Sample size needed**: 4,600 visitors total (2,300 per variant)
- **Actual sample**: [fill after completion]
- **Results**:
  - Control: X.X% conversion (N users)
  - Variant: X.X% conversion (N users)
  - Lift: +X.X% (95% CI: [lower, upper])
  - p-value: 0.XXX
  - Statistically significant: Yes / No
- **Guardrail check**: Activation rate [unchanged / degraded by X%]
- **Decision**: Ship variant / Keep control / Extend test
- **Learnings**: [What did we learn? What should we test next?]
```

---

## Common pitfalls

1. **Peeking**: Checking results daily and stopping when they look significant inflates false positives to 30%+. Decide sample size upfront and stick to it.
2. **Too many variants**: Each variant needs its own sample size. 4 variants = 4x the traffic needed. Stick to 2-3 variants maximum.
3. **Testing too many things at once**: Change one thing per experiment. If you change the CTA text AND the button color AND the layout, you cannot tell which change drove the result.
4. **Ignoring guardrails**: A 20% increase in signups is worthless if activation drops 30%. Always monitor guardrail metrics.
5. **Underpowered tests**: Running a test with too little traffic leads to inconclusive results. Use the sample size calculator before starting.
6. **Seasonal effects**: Run tests for at least 2 full weeks to capture weekday/weekend variation. Avoid running during holidays or product launches.

---

## Customization notes

- **Low traffic sites (<500 visitors/day)**: A/B testing may not be practical. Consider before/after cohort analysis instead: ship the change, compare the week before to the week after.
- **Self-hosted GrowthBook**: Run `docker-compose up` with the GrowthBook Docker image for full control over experiment data. Required for healthcare, finance, or GDPR-strict environments.
- **Statsig alternative**: Replace GrowthBook with Statsig if you want automatic statistical analysis and larger free tier (1M events/month). SDK is similar.

## Companion tools

- GrowthBook — open-source feature flags and experimentation
- Statsig — feature flags + auto-analyzed experiments
- PostHog experiments — integrated with PostHog analytics
- Evan Miller sample size calculator — evanmiller.org/ab-testing/sample-size.html
