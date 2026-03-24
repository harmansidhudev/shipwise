# Payment Processor Comparison Matrix

## When to use
Reference this guide when choosing a payment processor for your SaaS product. Use the decision flowchart to narrow your choice, then compare detailed criteria in the matrix. Revisit when scaling internationally or when tax compliance requirements change.

## Decision flowchart

```
Which payment processor should I use?
│
├── Do you want to handle tax compliance yourself?
│   ├── NO (want it fully handled)
│   │   ├── Is API flexibility and deep customization critical?
│   │   │   ├── YES → Paddle
│   │   │   └── NO → Lemon Squeezy
│   │   │
│   │   └── Revenue > $1M/year?
│   │       ├── YES → Paddle (negotiate fees, dedicated support)
│   │       └── NO → Lemon Squeezy (simplest setup, good for <$1M)
│   │
│   └── YES (want full control)
│       ├── Need advanced billing (metered, usage-based, complex proration)?
│       │   ├── YES → Stripe (best billing API in the industry)
│       │   └── NO → Stripe (still the best default for control)
│       │
│       └── Tax automation needed?
│           ├── YES → Stripe + Stripe Tax (or TaxJar/Avalara)
│           └── NO → Stripe (add tax later)
│
├── Are you selling primarily to EU/international customers?
│   ├── YES, and you want zero tax headaches → Paddle or Lemon Squeezy (MoR)
│   └── YES, and you want control → Stripe + Stripe Tax
│
└── Are you a solo founder wanting the fastest setup?
    └── YES → Lemon Squeezy (can migrate to Stripe/Paddle later)
```

---

## Comparison matrix

| Criteria | Stripe | Paddle | Lemon Squeezy |
|----------|--------|--------|---------------|
| **Model** | Direct processor | Merchant of Record (MoR) | Merchant of Record (MoR) |
| **Transaction fees** | 2.9% + $0.30 (US cards) | 5% + $0.50 (standard) | 5% + $0.50 |
| **International cards** | +1.5% for cross-border | Included in 5% | Included in 5% |
| **Currency conversion** | +1% | Included | Included |
| **Effective rate (international)** | ~5.4% + $0.30 | 5% + $0.50 | 5% + $0.50 |
| **Tax handling** | Self-manage or Stripe Tax (+0.5%) | Fully handled (included in MoR fee) | Fully handled (included in MoR fee) |
| **Tax filing/remittance** | You file (or use TaxJar/Avalara) | Paddle files and remits globally | Lemon Squeezy files and remits globally |
| **VAT invoicing** | You generate compliant invoices | Paddle generates compliant invoices | Lemon Squeezy generates compliant invoices |
| **Payout schedule** | 2-day rolling (US), 7-day (international) | Net-15 (monthly, 2 weeks after month end) | Net-14 (every 2 weeks) |
| **Payout currencies** | 135+ currencies, local bank payouts | USD, EUR, GBP (limited set) | USD, EUR, GBP |
| **Supported countries (sellers)** | 47 countries | 200+ (MoR model) | 200+ (MoR model) |
| **Supported countries (buyers)** | 195+ | 200+ | 200+ |
| **Payment methods** | Cards, ACH, SEPA, iDEAL, Klarna, etc. (35+) | Cards, PayPal, Apple Pay, Google Pay, wire | Cards, PayPal, Apple Pay, Google Pay |
| **Subscription billing** | Full API (proration, metered, tiered, usage) | Subscriptions with basic proration | Subscriptions with basic proration |
| **Usage-based billing** | Native (metered billing API) | Limited | Not supported natively |
| **Billing portal** | Hosted Customer Portal (configurable) | Hosted checkout + management overlay | Hosted checkout + customer portal |
| **Checkout experience** | Stripe Checkout (hosted) or Elements (embedded) | Paddle Checkout overlay | Hosted checkout page |
| **API quality** | Industry-leading, comprehensive docs | Good API, solid docs | Simple API, good docs |
| **Webhook reliability** | Excellent (configurable retries, event logs) | Good (automatic retries) | Good (automatic retries) |
| **Fraud protection** | Stripe Radar (ML-based, included) | Included in MoR | Included in MoR |
| **Chargeback handling** | You handle (Stripe assists with evidence) | Paddle handles (MoR responsibility) | Lemon Squeezy handles (MoR responsibility) |
| **PCI compliance** | SAQ-A with Checkout, SAQ-A-EP with Elements | Handled (MoR) | Handled (MoR) |
| **Documentation** | Best-in-class | Good | Good, improving |
| **Self-serve signup** | Yes, instant | Yes, approval process | Yes, instant |
| **Enterprise/sales motion** | Yes (Stripe Billing Scale, custom pricing) | Yes (negotiate at volume) | Limited |
| **Startup pricing** | No special startup program | Paddle for Startups (reduced fees) | No special program |
| **SDK/library support** | Every major language, first-party SDKs | JavaScript SDK, REST API | JavaScript SDK, REST API |
| **Test mode** | Full test mode with test card numbers | Sandbox environment | Test mode available |
| **Revenue recovery (dunning)** | Smart Retries (ML-optimized) | Automatic retries + dunning emails | Automatic retries |
| **Reporting/analytics** | Stripe Dashboard, Sigma (SQL), Revenue Recognition | Paddle Dashboard, ProfitWell integration | Basic dashboard |
| **Integrations** | 700+ integrations, Zapier, all major tools | Growing ecosystem, Zapier | Growing ecosystem, Zapier |

---

## Cost comparison scenarios

### Scenario 1: US-only SaaS, $50/mo plan, 100 customers

| | Stripe | Paddle | Lemon Squeezy |
|---|--------|--------|---------------|
| Monthly revenue | $5,000 | $5,000 | $5,000 |
| Processing fees | $175 (3.5%) | $300 (6%) | $300 (6%) |
| Tax compliance cost | $0-50/mo (DIY or TaxJar) | $0 (included) | $0 (included) |
| **Net to you** | **~$4,775-$4,825** | **~$4,700** | **~$4,700** |

### Scenario 2: International SaaS, $100/mo plan, 500 customers (40% international)

| | Stripe | Paddle | Lemon Squeezy |
|---|--------|--------|---------------|
| Monthly revenue | $50,000 | $50,000 | $50,000 |
| Processing fees (domestic) | $1,020 (3.4%) | N/A | N/A |
| Processing fees (international) | $1,380 (5.75%) | N/A | N/A |
| Processing fees (blended) | $2,400 (4.8%) | $2,750 (5.5%) | $2,750 (5.5%) |
| Stripe Tax | +$250 (0.5%) | $0 | $0 |
| Tax filing service | $100-300/mo | $0 | $0 |
| **Net to you** | **~$47,000-$47,350** | **~$47,250** | **~$47,250** |

> At international scale, the total cost of ownership often converges. Stripe is cheaper on raw processing but you pay for tax compliance separately.

---

## Copy-paste template

### Stripe setup (most common for SaaS)

```ts
// billing-config.ts
// [CUSTOMIZE] Core billing configuration

export const billingConfig = {
  processor: 'stripe' as const,

  // [CUSTOMIZE] Your Stripe API keys (store in environment variables)
  stripeSecretKey: process.env.STRIPE_SECRET_KEY!,
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,

  // [CUSTOMIZE] Your plan definitions — create these in Stripe Dashboard first
  plans: {
    free: {
      name: 'Free',
      stripePriceIdMonthly: null,
      stripePriceIdAnnual: null,
      features: ['Up to 3 projects', 'Basic analytics', 'Community support'],
      limits: { projects: 3, apiCalls: 1000 },
    },
    pro: {
      name: 'Pro',
      stripePriceIdMonthly: 'price_[CUSTOMIZE]', // [CUSTOMIZE] from Stripe Dashboard
      stripePriceIdAnnual: 'price_[CUSTOMIZE]',   // [CUSTOMIZE] annual price ID
      features: ['Unlimited projects', 'Advanced analytics', 'Email support', 'API access'],
      limits: { projects: -1, apiCalls: 50000 },
    },
    business: {
      name: 'Business',
      stripePriceIdMonthly: 'price_[CUSTOMIZE]',
      stripePriceIdAnnual: 'price_[CUSTOMIZE]',
      features: ['Everything in Pro', 'Team management', 'Priority support', 'Custom integrations'],
      limits: { projects: -1, apiCalls: 500000 },
    },
  },

  // [CUSTOMIZE] Trial settings
  trial: {
    enabled: true,
    durationDays: 14,
    requireCard: false, // [CUSTOMIZE] true = card-upfront, false = no-card
  },

  // [CUSTOMIZE] Billing portal settings
  portal: {
    allowPlanChanges: true,
    allowCancellation: true,
    allowPaymentMethodUpdate: true,
    returnUrl: 'https://[CUSTOMIZE].com/settings/billing',
  },

  // [CUSTOMIZE] Dunning settings
  dunning: {
    gracePeriodDays: 14,
    retrySchedule: [1, 3, 5, 7, 14], // days after failure
  },
};

// Plan type helper
export type PlanId = keyof typeof billingConfig.plans;

// Feature check helper
export function hasFeature(planId: PlanId, feature: string): boolean {
  return billingConfig.plans[planId].features.includes(feature);
}

export function getPlanLimit(planId: PlanId, limitKey: string): number {
  const limits = billingConfig.plans[planId].limits as Record<string, number>;
  return limits[limitKey] ?? 0;
}
```

### Paddle setup (MoR — simplest tax compliance)

```ts
// billing-config-paddle.ts
// [CUSTOMIZE] Paddle billing configuration

export const billingConfig = {
  processor: 'paddle' as const,

  // [CUSTOMIZE] Paddle API credentials (store in environment variables)
  paddleApiKey: process.env.PADDLE_API_KEY!,
  paddleWebhookSecret: process.env.PADDLE_WEBHOOK_SECRET!,
  paddleEnvironment: (process.env.PADDLE_ENVIRONMENT || 'sandbox') as 'sandbox' | 'production',

  // [CUSTOMIZE] Paddle price IDs from Paddle Dashboard
  plans: {
    free: {
      name: 'Free',
      paddlePriceIdMonthly: null,
      paddlePriceIdAnnual: null,
    },
    pro: {
      name: 'Pro',
      paddlePriceIdMonthly: 'pri_[CUSTOMIZE]',  // [CUSTOMIZE] from Paddle Dashboard
      paddlePriceIdAnnual: 'pri_[CUSTOMIZE]',
    },
    business: {
      name: 'Business',
      paddlePriceIdMonthly: 'pri_[CUSTOMIZE]',
      paddlePriceIdAnnual: 'pri_[CUSTOMIZE]',
    },
  },

  // [CUSTOMIZE] Webhook endpoint
  webhookEndpoint: '/api/webhooks/paddle',

  // Note: Tax is fully handled by Paddle as MoR — no tax configuration needed
};
```

---

## Customization notes

- **Solo founder, under $10K MRR**: Start with Lemon Squeezy for zero tax headaches. Migrate to Stripe if you need advanced billing features.
- **VC-backed, US-focused**: Stripe is the standard. Investors and acquirers are most familiar with Stripe metrics and reporting.
- **International customer base (>30% non-US)**: Paddle or Lemon Squeezy MoR saves significant tax compliance costs. Or Stripe + Stripe Tax if you want control.
- **Usage-based billing**: Stripe is the only option with native metered billing support. Paddle and Lemon Squeezy require workarounds.
- **Enterprise sales motion**: Stripe supports invoicing, quotes, net terms, and custom contracts. Paddle has limited enterprise features.
- **Marketplace/platform**: Stripe Connect is purpose-built for platforms and marketplaces with split payments.
- **Migration**: All three processors support customer migration. Stripe has the most tooling for importing customer/subscription data.

## Companion tools

- `wrsmith108/stripe-mcp-skill` — Create and manage Stripe products, prices, and checkout sessions from Claude Code
- `coreyhaines31/marketingskills` -> `pricing-strategy` — Pricing page design, competitive pricing analysis
