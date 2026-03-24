# Pricing Model Frameworks

## When to use
Reference this guide when designing your SaaS pricing strategy, choosing a pricing model, structuring plan tiers, or implementing feature gating. Use the decision framework to select the right model, then follow the implementation patterns to build it.

## Decision framework

```
Which pricing model fits your SaaS?
│
├── Is your product's value tied to team size?
│   ├── YES → Per-seat pricing (Slack, Notion, Linear)
│   │   └── Predictable revenue, scales with customer growth
│   └── NO ↓
│
├── Is your product's value tied to consumption/volume?
│   ├── YES → Usage-based pricing (Twilio, Vercel, AWS)
│   │   └── Fair pricing, aligns cost with value, harder to predict revenue
│   └── NO ↓
│
├── Do you serve distinct customer segments with different needs?
│   ├── YES → Tiered flat-rate (Basecamp, Notion, most SaaS)
│   │   └── Simple to understand, clear upgrade path
│   └── NO ↓
│
├── Is your product a single-feature tool with broad appeal?
│   ├── YES → Single flat-rate (Basecamp classic, Hey)
│   │   └── Simplest pricing, limits revenue from power users
│   └── NO ↓
│
├── Can users get value from a limited free version forever?
│   ├── YES → Freemium + paid tiers (Figma, Notion, Slack)
│   │   └── Large funnel, low conversion (2-5%), product must sell itself
│   └── NO ↓
│
└── Complex use case with varying needs?
    └── Hybrid model (base + usage, per-seat + feature tiers)
        └── Most flexible, most complex to implement and communicate
```

---

## Pricing models compared

| Model | Example | Pros | Cons | Best for |
|-------|---------|------|------|----------|
| **Flat-rate** | $49/mo, all features | Simple, predictable | Leaves money on table | Simple tools |
| **Tiered flat-rate** | Free / $19 / $49 / $99 | Clear upgrade path, good segmentation | Requires thoughtful tier design | Most SaaS products |
| **Per-seat** | $12/user/mo | Scales with customer, predictable | Discourages adoption | Collaboration tools |
| **Usage-based** | $0.01 per API call | Fair, aligns with value | Unpredictable revenue, complex billing | APIs, infrastructure |
| **Hybrid** | $29/mo + $0.005/request | Predictable base + upside | Complex to communicate | Platforms with variable usage |
| **Freemium** | Free tier + paid upgrade | Massive funnel | Low conversion, support cost | Products with network effects |

---

## Tier design patterns

### Naming conventions that work

| Pattern | Tiers | Best for |
|---------|-------|----------|
| **Good/Better/Best** | Starter / Pro / Business | Most SaaS products |
| **Size-based** | Solo / Team / Enterprise | Collaboration tools |
| **Persona-based** | Hobby / Professional / Agency | Developer tools |
| **Capability-based** | Basic / Advanced / Ultimate | Feature-heavy products |

### The 3-tier rule

Most successful SaaS products use exactly 3 paid tiers (plus optional free):

```
[Free]        →  [Starter: $19]  →  [Pro: $49]   →  [Business: $99]
│                │                   │                │
│ Try before     │ Individuals,      │ Growing teams,  │ Established orgs,
│ you buy        │ solopreneurs      │ power users     │ advanced needs
│                │                   │                 │
│ Limited usage  │ Core features,    │ All features,   │ Everything +
│ Basic features │ reasonable limits │ higher limits   │ priority support,
│                │                   │                 │ SSO, audit logs
└── Conversion   └── Anchor          └── Most popular  └── Revenue
    funnel           (makes Pro          (highlight      maximizer
                     look like           this tier)
                     great value)
```

### Annual vs monthly pricing

```
Monthly: $49/mo
Annual:  $39/mo (billed $468/yr) — save 20%

Rules of thumb:
- Offer 15-25% discount for annual billing
- Show monthly price even for annual (not total)
- Default the toggle to annual on the pricing page
- Annual improves cash flow and reduces churn by ~30%
```

---

## Van Westendorp price sensitivity survey

Use this methodology to find your optimal price range before launch. Ask your target customers these four questions:

```
1. At what price would [PRODUCT] be so cheap that you'd question its quality?
   → "Too cheap" threshold

2. At what price would [PRODUCT] be a bargain — a great buy for the money?
   → "Cheap / good value" threshold

3. At what price would [PRODUCT] start to seem expensive — you'd still consider
   buying, but would need to think about it?
   → "Expensive but acceptable" threshold

4. At what price would [PRODUCT] be too expensive — you'd never consider buying it?
   → "Too expensive" threshold
```

Plot the four cumulative distribution curves. The intersections define:
- **Point of Marginal Cheapness**: "too cheap" meets "expensive" — floor of acceptable range
- **Point of Marginal Expensiveness**: "too expensive" meets "cheap" — ceiling of acceptable range
- **Optimal Price Point**: "too cheap" meets "too expensive" — minimizes resistance
- **Indifference Price Point**: "cheap" meets "expensive" — equal pull in both directions

> Survey 30-50 target customers. Use the acceptable range to set your tiers.

---

## Copy-paste template

### Feature gating middleware (TypeScript)

```ts
// middleware/feature-gate.ts
// [CUSTOMIZE] Feature gating middleware for Express/Next.js API routes

import { NextRequest, NextResponse } from 'next/server';

// [CUSTOMIZE] Define your plan hierarchy and feature entitlements
const PLAN_FEATURES: Record<string, Set<string>> = {
  free: new Set([
    'basic_analytics',
    'up_to_3_projects',
    'community_support',
  ]),
  starter: new Set([
    'basic_analytics',
    'up_to_10_projects',
    'email_support',
    'export_csv',
    'custom_domain',
  ]),
  pro: new Set([
    'advanced_analytics',
    'unlimited_projects',
    'priority_support',
    'export_csv',
    'export_pdf',
    'custom_domain',
    'api_access',
    'webhooks',
    'team_members_up_to_10',
  ]),
  business: new Set([
    'advanced_analytics',
    'unlimited_projects',
    'priority_support',
    'export_csv',
    'export_pdf',
    'custom_domain',
    'api_access',
    'webhooks',
    'unlimited_team_members',
    'sso',
    'audit_log',
    'custom_branding',
    'sla',
  ]),
};

// [CUSTOMIZE] Define numeric limits per plan
const PLAN_LIMITS: Record<string, Record<string, number>> = {
  free:     { projects: 3,  apiCallsPerMonth: 1000,   teamMembers: 1,  storageGB: 1 },
  starter:  { projects: 10, apiCallsPerMonth: 10000,  teamMembers: 3,  storageGB: 10 },
  pro:      { projects: -1, apiCallsPerMonth: 100000, teamMembers: 10, storageGB: 100 },
  business: { projects: -1, apiCallsPerMonth: -1,     teamMembers: -1, storageGB: 1000 },
  // -1 means unlimited
};

// Feature check function
export function hasFeature(userPlan: string, feature: string): boolean {
  const features = PLAN_FEATURES[userPlan];
  if (!features) return false;
  return features.has(feature);
}

// Limit check function
export function getLimit(userPlan: string, limitKey: string): number {
  const limits = PLAN_LIMITS[userPlan];
  if (!limits) return 0;
  return limits[limitKey] ?? 0;
}

export function isWithinLimit(userPlan: string, limitKey: string, currentUsage: number): boolean {
  const limit = getLimit(userPlan, limitKey);
  if (limit === -1) return true; // unlimited
  return currentUsage < limit;
}

// [CUSTOMIZE] Middleware factory for API route protection
export function requireFeature(feature: string) {
  return async (req: NextRequest) => {
    // [CUSTOMIZE] Replace with your auth/session logic
    const user = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasFeature(user.plan, feature)) {
      return NextResponse.json(
        {
          error: 'Feature not available on your current plan',
          feature,
          currentPlan: user.plan,
          requiredPlan: getMinimumPlanForFeature(feature),
          upgradeUrl: '/settings/billing', // [CUSTOMIZE] your billing page URL
        },
        { status: 403 }
      );
    }

    return null; // Access granted — continue to route handler
  };
}

// [CUSTOMIZE] Middleware factory for limit enforcement
export function requireLimit(limitKey: string) {
  return async (req: NextRequest) => {
    const user = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // [CUSTOMIZE] Replace with your usage tracking logic
    const currentUsage = await getCurrentUsage(user.id, limitKey);

    if (!isWithinLimit(user.plan, limitKey, currentUsage)) {
      const limit = getLimit(user.plan, limitKey);
      return NextResponse.json(
        {
          error: `You have reached your ${limitKey} limit`,
          currentUsage,
          limit,
          currentPlan: user.plan,
          upgradeUrl: '/settings/billing',
        },
        { status: 403 }
      );
    }

    return null; // Within limits — continue
  };
}

// Helper: find the cheapest plan that includes a feature
function getMinimumPlanForFeature(feature: string): string {
  const planOrder = ['free', 'starter', 'pro', 'business']; // [CUSTOMIZE] your plan order
  for (const plan of planOrder) {
    if (PLAN_FEATURES[plan]?.has(feature)) {
      return plan;
    }
  }
  return 'business';
}

// [CUSTOMIZE] Replace these stubs with your actual implementations
async function getUserFromRequest(req: NextRequest): Promise<{ id: string; plan: string } | null> {
  // Your auth logic here — e.g., verify JWT, look up session
  throw new Error('Implement getUserFromRequest');
}

async function getCurrentUsage(userId: string, limitKey: string): Promise<number> {
  // Your usage tracking logic here — e.g., count from database
  throw new Error('Implement getCurrentUsage');
}
```

### Usage in API routes

```ts
// app/api/projects/route.ts
// [CUSTOMIZE] Example of feature-gated API route

import { NextRequest, NextResponse } from 'next/server';
import { requireFeature, requireLimit } from '@/middleware/feature-gate';

export async function POST(req: NextRequest) {
  // Check feature access
  const featureCheck = await requireFeature('api_access')(req);
  if (featureCheck) return featureCheck; // Returns 403 if not allowed

  // Check usage limit
  const limitCheck = await requireLimit('projects')(req);
  if (limitCheck) return limitCheck; // Returns 403 if over limit

  // [CUSTOMIZE] Your route logic here
  const body = await req.json();
  // ... create project ...

  return NextResponse.json({ success: true });
}
```

### Pricing page component data structure

```ts
// pricing-data.ts
// [CUSTOMIZE] Data structure for your pricing page

export interface PricingTier {
  id: string;
  name: string;
  description: string;
  priceMonthly: number | null; // null = "Contact us"
  priceAnnual: number | null;
  features: Array<{
    text: string;
    included: boolean;
    tooltip?: string;   // [CUSTOMIZE] explanation for each feature
  }>;
  cta: string;          // Button text
  highlighted: boolean; // "Most popular" badge
  badge?: string;       // Optional badge text
}

export const pricingTiers: PricingTier[] = [
  {
    id: 'free',
    name: 'Free',                          // [CUSTOMIZE]
    description: 'For individuals getting started', // [CUSTOMIZE]
    priceMonthly: 0,
    priceAnnual: 0,
    features: [
      { text: 'Up to 3 projects', included: true },
      { text: 'Basic analytics', included: true },
      { text: 'Community support', included: true },
      { text: 'API access', included: false },
      { text: 'Custom domain', included: false },
      { text: 'Team members', included: false },
    ],
    cta: 'Get started free',
    highlighted: false,
  },
  {
    id: 'pro',
    name: 'Pro',                           // [CUSTOMIZE]
    description: 'For professionals and small teams', // [CUSTOMIZE]
    priceMonthly: 49,                      // [CUSTOMIZE]
    priceAnnual: 39,                       // [CUSTOMIZE] (shown as /mo)
    features: [
      { text: 'Unlimited projects', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Priority support', included: true },
      { text: 'API access', included: true },
      { text: 'Custom domain', included: true },
      { text: 'Up to 10 team members', included: true },
    ],
    cta: 'Start free trial',
    highlighted: true,
    badge: 'Most popular',
  },
  {
    id: 'business',
    name: 'Business',                      // [CUSTOMIZE]
    description: 'For growing organizations', // [CUSTOMIZE]
    priceMonthly: 99,                      // [CUSTOMIZE]
    priceAnnual: 79,                       // [CUSTOMIZE]
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Unlimited team members', included: true },
      { text: 'SSO / SAML', included: true },
      { text: 'Audit log', included: true },
      { text: 'Custom branding', included: true },
      { text: 'SLA guarantee', included: true },
    ],
    cta: 'Start free trial',
    highlighted: false,
  },
];
```

---

## Pricing page design patterns

### Layout rules

1. **3 columns** — the most tested and effective layout for SaaS pricing
2. **Highlight the middle tier** — use a different background, "Most Popular" badge, slight elevation
3. **Monthly/annual toggle** — default to annual, show savings percentage
4. **Feature comparison table** — below the cards, full comparison with checkmarks
5. **FAQ section** — below the table, address common objections
6. **Enterprise CTA** — "Need more? Contact sales" below the tiers

### Conversion tips

- Show the monthly price even for annual plans (e.g., "$39/mo, billed annually")
- Use a strikethrough on the monthly price when annual is selected
- Put the CTA above the fold — users should not have to scroll to find the button
- Use social proof near pricing ("Trusted by 5,000+ teams")
- Show a "money-back guarantee" badge to reduce purchase anxiety
- List features in order of perceived value (most valuable first)

---

## Customization notes

- **Developer tools**: Per-seat or usage-based models work well. Developers expect transparent pricing and generous free tiers.
- **B2B SaaS**: Tiered flat-rate with per-seat component. Enterprise tier should be "Contact Sales" to enable custom deals.
- **Consumer/prosumer**: Freemium with a clear upgrade trigger (e.g., Canva: watermark removal, Figma: team features).
- **API products**: Usage-based with a minimum monthly commitment. Provide a pricing calculator on the page.
- **Early stage**: Start with a single paid tier. Add tiers when you understand your customer segments. It is easier to add tiers later than to remove them.
- **Price anchoring**: The highest tier makes the middle tier look reasonable. Even if few buy Business, it makes Pro feel like a deal.

## Companion tools

- `coreyhaines31/marketingskills` -> `pricing-strategy` — Competitive pricing analysis and pricing page copywriting
- `wrsmith108/stripe-mcp-skill` — Create Stripe Products and Prices directly from Claude Code
