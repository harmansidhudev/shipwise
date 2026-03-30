# Revenue Analytics Setup

Calculate, track, and dashboard the SaaS metrics that matter: MRR, NRR, LTV, churn rate, ARPU, and payback period. Includes Stripe webhook integration and SQL templates for revenue cohort analysis.

## When to use

Reference this guide when you have paying customers and need to track revenue health, build investor-ready dashboards, calculate unit economics, or connect Stripe data to your analytics platform. This complements the event taxonomy (tracks user behavior) and funnel instrumentation (tracks conversion) with the revenue layer.

---

## 1. Core SaaS metrics

| Metric | Formula | What it tells you | Healthy benchmark |
|--------|---------|-------------------|-------------------|
| **MRR** | Sum of all active monthly subscription values | Current revenue run rate | Growing month-over-month |
| **ARR** | MRR × 12 | Annual revenue for planning | — |
| **NRR** | (Start MRR + Expansion - Contraction - Churn) / Start MRR × 100 | Revenue retention without new customers | >100% (best SaaS), >90% (good), <85% (problem) |
| **Gross churn** | Churned MRR / Start MRR × 100 | Revenue lost from cancellations | <3% monthly (B2B), <7% monthly (B2C) |
| **ARPU** | MRR / Active paying customers | Average revenue per user | Trending up = pricing power |
| **LTV** | ARPU / Monthly churn rate | Lifetime value of a customer | LTV:CAC > 3:1 |
| **CAC** | Total acquisition spend / New customers | Cost to acquire one customer | CAC payback < 12 months |
| **Payback** | CAC / ARPU (monthly) | Months to recover acquisition cost | <12 months (funded), <3 months (bootstrapped) |

---

## 2. MRR calculation from Stripe

### Stripe webhook → database pipeline

```typescript
// app/api/webhooks/stripe/route.ts
// [CUSTOMIZE] Replace with your webhook secret and database calls
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      await upsertSubscriptionRecord({
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        status: subscription.status,
        mrr: calculateMRR(subscription),
        planId: subscription.items.data[0]?.price.id,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        canceledAt: subscription.canceled_at
          ? new Date(subscription.canceled_at * 1000)
          : null,
      });
      break;
    }

    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice;
      await recordRevenueEvent({
        stripeCustomerId: invoice.customer as string,
        amount: invoice.amount_paid / 100, // cents to dollars
        currency: invoice.currency,
        invoiceId: invoice.id,
        paidAt: new Date(invoice.status_transitions?.paid_at! * 1000),
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}

// [CUSTOMIZE] Adapt this to your subscription model
function calculateMRR(subscription: Stripe.Subscription): number {
  return subscription.items.data.reduce((total, item) => {
    const price = item.price;
    const quantity = item.quantity || 1;
    const unitAmount = (price.unit_amount || 0) / 100;

    switch (price.recurring?.interval) {
      case 'month': return total + unitAmount * quantity;
      case 'year':  return total + (unitAmount * quantity) / 12;
      case 'week':  return total + unitAmount * quantity * 4.33;
      default:      return total;
    }
  }, 0);
}
```

### Subscription database schema

```sql
-- [CUSTOMIZE] Add to your migration — adapt column types to your ORM
CREATE TABLE subscription_events (
  id            SERIAL PRIMARY KEY,
  customer_id   TEXT NOT NULL,
  subscription_id TEXT NOT NULL,
  event_type    TEXT NOT NULL, -- 'new', 'upgrade', 'downgrade', 'churn', 'reactivation'
  mrr_before    DECIMAL(10,2) DEFAULT 0,
  mrr_after     DECIMAL(10,2) DEFAULT 0,
  mrr_delta     DECIMAL(10,2) GENERATED ALWAYS AS (mrr_after - mrr_before) STORED,
  occurred_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata      JSONB DEFAULT '{}'
);

CREATE INDEX idx_sub_events_date ON subscription_events(occurred_at);
CREATE INDEX idx_sub_events_customer ON subscription_events(customer_id);
```

---

## 3. MRR movement analysis

MRR isn't just one number — it has components that tell you where growth comes from.

```sql
-- Monthly MRR movement breakdown
-- [CUSTOMIZE] Adjust table/column names to match your schema
SELECT
  date_trunc('month', occurred_at) AS month,
  SUM(CASE WHEN event_type = 'new' THEN mrr_delta ELSE 0 END) AS new_mrr,
  SUM(CASE WHEN event_type = 'upgrade' THEN mrr_delta ELSE 0 END) AS expansion_mrr,
  SUM(CASE WHEN event_type = 'reactivation' THEN mrr_delta ELSE 0 END) AS reactivation_mrr,
  SUM(CASE WHEN event_type = 'downgrade' THEN mrr_delta ELSE 0 END) AS contraction_mrr,
  SUM(CASE WHEN event_type = 'churn' THEN mrr_delta ELSE 0 END) AS churned_mrr,
  SUM(mrr_delta) AS net_new_mrr
FROM subscription_events
WHERE occurred_at >= NOW() - INTERVAL '12 months'
GROUP BY 1
ORDER BY 1;
```

**Reading the output:**
- `net_new_mrr > 0` every month = healthy growth
- `expansion_mrr > churned_mrr` = NRR > 100% (best-in-class)
- `churned_mrr` increasing month-over-month = retention problem
- `new_mrr` is your only growth driver = no expansion revenue (pricing problem)

---

## 4. Net Revenue Retention (NRR)

```sql
-- Monthly NRR calculation
-- [CUSTOMIZE] Adjust table/column names
WITH monthly AS (
  SELECT
    date_trunc('month', occurred_at) AS month,
    SUM(CASE WHEN event_type = 'new' THEN mrr_after ELSE 0 END) AS new_mrr,
    SUM(CASE WHEN event_type = 'upgrade' THEN mrr_delta ELSE 0 END) AS expansion,
    ABS(SUM(CASE WHEN event_type = 'downgrade' THEN mrr_delta ELSE 0 END)) AS contraction,
    ABS(SUM(CASE WHEN event_type = 'churn' THEN mrr_delta ELSE 0 END)) AS churned
  FROM subscription_events
  GROUP BY 1
),
running AS (
  SELECT
    month,
    SUM(new_mrr) OVER (ORDER BY month) AS cumulative_mrr,
    expansion,
    contraction,
    churned
  FROM monthly
)
SELECT
  month,
  cumulative_mrr AS start_mrr,
  ROUND(
    (cumulative_mrr + expansion - contraction - churned) / NULLIF(cumulative_mrr, 0) * 100,
    1
  ) AS nrr_pct
FROM running
ORDER BY month;
```

**Benchmarks by stage:**
| Stage | Good NRR | Great NRR | Best-in-class |
|-------|----------|-----------|---------------|
| Pre-seed / Seed | >85% | >95% | >100% |
| Series A | >100% | >110% | >120% |
| Series B+ | >110% | >120% | >130% |

---

## 5. LTV calculation

### Simple LTV

```typescript
// Quick LTV estimate — good enough for early-stage
// [CUSTOMIZE] Pull these from your database
function simpleLTV(arpu: number, monthlyChurnRate: number): number {
  if (monthlyChurnRate === 0) return arpu * 60; // cap at 5 years
  return arpu / monthlyChurnRate;
}

// Example: $49/mo ARPU, 5% monthly churn
// LTV = $49 / 0.05 = $980
```

### Cohort-based LTV (more accurate)

```sql
-- Revenue retained by signup cohort over time
-- [CUSTOMIZE] Adjust table/column names and join conditions
WITH cohorts AS (
  SELECT
    customer_id,
    date_trunc('month', MIN(occurred_at)) AS cohort_month
  FROM subscription_events
  WHERE event_type = 'new'
  GROUP BY customer_id
),
monthly_revenue AS (
  SELECT
    c.cohort_month,
    date_trunc('month', se.occurred_at) AS revenue_month,
    EXTRACT(MONTH FROM AGE(se.occurred_at, c.cohort_month)) AS months_since_signup,
    SUM(se.mrr_after) AS mrr
  FROM subscription_events se
  JOIN cohorts c ON se.customer_id = c.customer_id
  WHERE se.event_type != 'churn'
  GROUP BY 1, 2, 3
)
SELECT
  cohort_month,
  months_since_signup,
  mrr,
  ROUND(mrr / FIRST_VALUE(mrr) OVER (PARTITION BY cohort_month ORDER BY months_since_signup) * 100, 1) AS retention_pct
FROM monthly_revenue
WHERE months_since_signup <= 24
ORDER BY cohort_month, months_since_signup;
```

**Reading the output:** If the Jan 2026 cohort retains 80% of MRR at month 6, your cohort-based LTV at 6 months = ARPU × 0.80 × 6. Extrapolate the retention curve to estimate full LTV.

---

## 6. Revenue dashboard template

Build this dashboard with your analytics tool (PostHog, Metabase, or custom):

```
┌─────────────────────────────────────────────────┐
│  REVENUE OVERVIEW            Period: Last 30d    │
├──────────┬──────────┬──────────┬────────────────┤
│ MRR      │ NRR      │ ARPU     │ Active Customers│
│ $12,400  │ 108%     │ $47      │ 264            │
│ ▲ +8.2%  │ ▲ +3pp   │ ▲ +$2   │ ▲ +12          │
├──────────┴──────────┴──────────┴────────────────┤
│  MRR MOVEMENT                                    │
│  New: +$2,100  Expansion: +$800                  │
│  Contraction: -$300  Churn: -$650                │
│  Net new: +$1,950                                │
├─────────────────────────────────────────────────┤
│  REVENUE COHORT RETENTION (% of initial MRR)     │
│           M0    M1    M3    M6    M12            │
│  Jan-26   100%  92%   85%   78%   —              │
│  Feb-26   100%  94%   88%   —     —              │
│  Mar-26   100%  91%   —     —     —              │
├─────────────────────────────────────────────────┤
│  UNIT ECONOMICS                                  │
│  LTV: $940  │  CAC: $210  │  LTV:CAC: 4.5x      │
│  Payback: 4.5 months                             │
└─────────────────────────────────────────────────┘
```

---

## 7. Sending revenue events to PostHog

```typescript
// [CUSTOMIZE] Call this from your Stripe webhook handler
import posthog from 'posthog-js';

function trackRevenueEvent(event: {
  type: 'new' | 'upgrade' | 'downgrade' | 'churn' | 'reactivation';
  customerId: string;
  mrrBefore: number;
  mrrAfter: number;
  planId: string;
}) {
  posthog.capture(`subscription_${event.type}`, {
    customer_id: event.customerId,
    mrr_before: event.mrrBefore,
    mrr_after: event.mrrAfter,
    mrr_delta: event.mrrAfter - event.mrrBefore,
    plan_id: event.planId,
    $set: {
      mrr: event.mrrAfter,
      plan: event.planId,
      customer_status: event.type === 'churn' ? 'churned' : 'active',
    },
  });
}
```

---

## 8. Implementation checklist

- [ ] Set up Stripe webhook endpoint (Section 2)
- [ ] Create subscription_events table (Section 2)
- [ ] Record MRR on every subscription change (new/upgrade/downgrade/churn)
- [ ] Build MRR movement query (Section 3)
- [ ] Calculate NRR monthly (Section 4)
- [ ] Calculate LTV (simple first, then cohort-based when you have 6+ months of data)
- [ ] Build revenue dashboard (Section 6)
- [ ] Pipe revenue events to analytics platform (Section 7)
- [ ] Set up alerts: MRR drops >10% month-over-month, NRR drops below 90%
- [ ] Review revenue dashboard weekly (add to your weekly ops cadence)
