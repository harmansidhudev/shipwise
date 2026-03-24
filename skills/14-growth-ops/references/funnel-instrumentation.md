# Funnel Instrumentation

## When to use
Reference this guide when setting up conversion funnel tracking, defining activation events, measuring drop-off rates, or optimizing your signup-to-payment pipeline. Use the code templates to instrument your funnel in PostHog or Mixpanel.

## Decision framework

```
Which funnel stage needs attention?
├── Visit → Signup conversion < 3%?
│   → Landing page problem (messaging, CTA, speed)
├── Signup → Activate conversion < 30%?
│   → Onboarding problem (too complex, unclear value, broken flow)
├── Activate → Engage conversion < 20%?
│   → Retention problem (not enough value, no habit loop)
├── Engage → Pay conversion < 3%?
│   → Monetization problem (pricing, timing, value perception)
├── Pay → Refer conversion < 2%?
│   → Delight problem (not remarkable enough to share)
└── All stages look OK but total conversion is low?
    → Fix the biggest absolute drop-off first (most users lost)
```

---

## Standard SaaS funnel definition

### The 6-stage funnel

```
Stage 1: VISIT
  Event: page_viewed (landing page)
  Question: "Are we attracting the right audience?"

Stage 2: SIGNUP
  Event: user_signed_up
  Question: "Does our value proposition convince visitors to try?"

Stage 3: ACTIVATE
  Event: activation_completed
  Question: "Do new users experience core value quickly?"
  [CUSTOMIZE] Define YOUR activation event — the first moment
  a user gets real value from your product.

Stage 4: ENGAGE
  Event: feature_used (core action, repeated)
  Question: "Do activated users come back and use the product regularly?"
  Definition: Used core feature 3+ times in 7 days

Stage 5: PAY
  Event: subscription_started
  Question: "Are engaged users willing to pay?"

Stage 6: REFER
  Event: referral_sent
  Question: "Are paying users enthusiastic enough to recommend us?"
```

### Funnel definition template

```markdown
# Funnel Definition — [CUSTOMIZE: Product Name]
# Last updated: YYYY-MM-DD

| Stage | Event Name | Definition | Time Window |
|-------|-----------|------------|-------------|
| Visit | page_viewed | Viewed landing page or marketing page | — |
| Signup | user_signed_up | Completed account creation | Within same session as visit |
| Activate | activation_completed | [CUSTOMIZE: First core action] | Within 7 days of signup |
| Engage | feature_used (3x) | [CUSTOMIZE: Core action repeated 3+ times] | Within 14 days of signup |
| Pay | subscription_started | Completed checkout for paid plan | Within 30 days of signup |
| Refer | referral_sent | Sent at least one referral invitation | Any time after payment |

## Activation Event Definition
[CUSTOMIZE: Be specific about what counts as activation]

Examples by product type:
- Project management: Created first project AND added first task
- Email marketing: Sent first campaign to 10+ recipients
- Analytics: Installed SDK AND received first 100 events
- Social: Followed 5+ users AND posted first update
- E-commerce marketplace: Listed first product
- Developer tool: Completed first successful API call
```

---

## Drop-off analysis methodology

### Step-by-step process

```
1. Pull funnel data for the past 30 days
2. Calculate conversion rate between each stage
3. Calculate absolute drop-off (users lost at each stage)
4. Identify the stage with the largest ABSOLUTE drop-off
   (not percentage — 50% drop from 10K users > 80% drop from 100 users)
5. Segment that stage by:
   - Signup method (email vs OAuth)
   - Device (desktop vs mobile)
   - Acquisition source (organic vs paid vs referral)
   - Time-to-convert (fast converters vs slow vs never)
6. Form hypothesis about why users drop off
7. Design intervention (UI change, email, tooltip, etc.)
8. Measure for 2 weeks
9. Repeat
```

### Drop-off analysis template

```markdown
# Funnel Drop-Off Analysis — Week of YYYY-MM-DD

## Funnel Overview
| Stage | Users | Conversion | Drop-off | Drop-off (absolute) |
|-------|-------|-----------|----------|---------------------|
| Visit | 10,000 | — | — | — |
| Signup | 500 | 5.0% | 95.0% | 9,500 |
| Activate | 200 | 40.0% | 60.0% | 300 |
| Engage | 80 | 40.0% | 60.0% | 120 |
| Pay | 16 | 20.0% | 80.0% | 64 |
| Refer | 3 | 18.8% | 81.3% | 13 |

## Biggest Absolute Drop-Off
Stage: Visit → Signup (9,500 users lost)

## Segmentation
| Segment | Visit → Signup | Notes |
|---------|---------------|-------|
| Desktop | 6.2% | Above average |
| Mobile | 3.1% | Below average — mobile landing page issue? |
| Google Ads | 4.8% | In line with average |
| Organic | 7.1% | Higher intent traffic |

## Hypothesis
Mobile visitors convert at half the rate of desktop. The signup form
may be hard to use on mobile or the landing page loads too slowly.

## Planned Intervention
- Optimize mobile landing page load time (target: LCP < 2.5s)
- Simplify mobile signup form (reduce to email + password only)

## Measurement Period
2 weeks starting YYYY-MM-DD
```

---

## Conversion rate benchmarks by industry

### SaaS (B2B)

| Stage | Bottom 25% | Median | Top 25% | Top 10% |
|-------|-----------|--------|---------|---------|
| Visit → Signup | < 2% | 3-5% | 5-8% | 8-12% |
| Signup → Activate | < 20% | 30-40% | 40-60% | 60-80% |
| Activate → Engage (D7) | < 15% | 20-30% | 30-45% | 45-60% |
| Engage → Pay | < 2% | 3-6% | 6-12% | 12-20% |
| Trial → Paid | < 10% | 15-25% | 25-40% | 40-60% |

### SaaS (B2C / PLG)

| Stage | Bottom 25% | Median | Top 25% | Top 10% |
|-------|-----------|--------|---------|---------|
| Visit → Signup | < 3% | 5-8% | 8-15% | 15-25% |
| Signup → Activate | < 15% | 25-35% | 35-50% | 50-70% |
| Activate → Engage (D7) | < 10% | 15-25% | 25-40% | 40-55% |
| Free → Paid | < 1% | 2-4% | 4-8% | 8-15% |

### E-commerce

| Stage | Bottom 25% | Median | Top 25% | Top 10% |
|-------|-----------|--------|---------|---------|
| Visit → Add to cart | < 3% | 5-8% | 8-12% | 12-18% |
| Add to cart → Checkout | < 30% | 40-55% | 55-70% | 70-85% |
| Checkout → Purchase | < 40% | 55-65% | 65-80% | 80-90% |

---

## Copy-paste: funnel tracking code

### PostHog funnel tracking

```ts
// analytics/funnel.ts
// [CUSTOMIZE] Replace activation and engagement definitions

import posthog from 'posthog-js';

// --- Stage 1: Visit ---
// Auto-tracked by PostHog if pageview capture is enabled
// posthog.init('YOUR_KEY', { capture_pageview: true });

// --- Stage 2: Signup ---
export function trackSignup(params: {
  method: 'email' | 'google' | 'github';
  referralCode?: string;
}) {
  posthog.capture('user_signed_up', {
    method: params.method,
    referral_code: params.referralCode || null,
  });

  // Identify the user (link anonymous_id to user_id)
  // [CUSTOMIZE] Call this with your user ID after signup
  // posthog.identify(userId, { email, created_at });
}

// --- Stage 3: Activate ---
// [CUSTOMIZE] Define what activation means for YOUR product
export function trackActivation(params: {
  action: string;          // e.g., "created_first_project"
  timeToActivateMs: number; // ms since signup
}) {
  posthog.capture('activation_completed', {
    activation_action: params.action,
    time_to_activate_seconds: Math.round(params.timeToActivateMs / 1000),
  });
}

// --- Stage 4: Engage ---
// Track core action usage (called every time user does the core action)
export function trackCoreAction(params: {
  action: string;        // [CUSTOMIZE] e.g., "task_completed"
  count: number;         // Nth time this session/period
}) {
  posthog.capture('feature_used', {
    feature_name: params.action,
    usage_count: params.count,
  });
}

// --- Stage 5: Pay ---
export function trackSubscriptionStarted(params: {
  planId: string;
  planName: string;
  priceCents: number;
  interval: 'monthly' | 'yearly';
  trial: boolean;
}) {
  posthog.capture('subscription_started', {
    plan_id: params.planId,
    plan_name: params.planName,
    price_cents: params.priceCents,
    interval: params.interval,
    trial: params.trial,
  });
}

// --- Stage 6: Refer ---
export function trackReferralSent(params: {
  channel: 'email' | 'link' | 'social';
  referralCode: string;
}) {
  posthog.capture('referral_sent', {
    channel: params.channel,
    referral_code: params.referralCode,
  });
}
```

### Mixpanel funnel tracking

```ts
// analytics/funnel-mixpanel.ts
// [CUSTOMIZE] Same funnel events, Mixpanel SDK

import mixpanel from 'mixpanel-browser';

// Initialize
// mixpanel.init('YOUR_PROJECT_TOKEN', { track_pageview: true });

// Stage 2: Signup
export function trackSignup(method: string, referralCode?: string) {
  mixpanel.track('user_signed_up', {
    method,
    referral_code: referralCode || null,
  });
  // Link anonymous to identified user
  // mixpanel.identify(userId);
  // mixpanel.people.set({ $email: email, $created: new Date() });
}

// Stage 3: Activate
export function trackActivation(action: string, timeToActivateSeconds: number) {
  mixpanel.track('activation_completed', {
    activation_action: action,
    time_to_activate_seconds: timeToActivateSeconds,
  });
}

// Stage 5: Pay
export function trackSubscriptionStarted(params: {
  planId: string;
  planName: string;
  priceCents: number;
  interval: string;
}) {
  mixpanel.track('subscription_started', params);
  mixpanel.people.set({
    plan: params.planName,
    plan_interval: params.interval,
    mrr_cents: params.interval === 'yearly'
      ? Math.round(params.priceCents / 12)
      : params.priceCents,
  });
}
```

### Building the funnel in PostHog UI

```
PostHog → Insights → New Insight → Funnel

Steps:
1. page_viewed (filter: url contains "/landing" or "/")
2. user_signed_up
3. activation_completed
4. feature_used (filter: usage_count >= 3)
5. subscription_started
6. referral_sent

Settings:
- Conversion window: 30 days
- Breakdown by: signup method, device type, or UTM source
- Order: Sequential (strict)

Save as: "Core Conversion Funnel"
```

---

## Time-to-convert analysis

Understanding how long each stage takes helps you set appropriate conversion windows and identify stalled users for re-engagement.

```sql
-- Time from signup to activation (PostgreSQL)
-- [CUSTOMIZE] Replace table/column names with your schema

SELECT
  percentile_cont(0.50) WITHIN GROUP (ORDER BY time_to_activate) AS median_hours,
  percentile_cont(0.75) WITHIN GROUP (ORDER BY time_to_activate) AS p75_hours,
  percentile_cont(0.90) WITHIN GROUP (ORDER BY time_to_activate) AS p90_hours,
  COUNT(*) AS activated_users,
  (SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL '30 days') AS total_signups,
  ROUND(
    COUNT(*)::numeric /
    (SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL '30 days') * 100,
    1
  ) AS activation_rate_pct
FROM (
  SELECT
    EXTRACT(EPOCH FROM (a.activated_at - u.created_at)) / 3600 AS time_to_activate
  FROM users u
  JOIN activation_events a ON a.user_id = u.id
  WHERE u.created_at >= NOW() - INTERVAL '30 days'
) t;
```

---

## Customization notes

- **Define activation carefully**: Your activation event is the single most important metric in the funnel. Spend time getting this right. It should represent the moment a user first gets real value, not just the first click.
- **Strict vs. loose ordering**: Use strict (sequential) ordering if you want each user to pass through stages in order. Use loose ordering if stages can happen in any order (rare for SaaS).
- **Conversion windows**: 30 days is standard for SaaS. Shorten to 7 days for consumer apps. Lengthen to 60-90 days for enterprise.
- **Avoid vanity metrics**: Track conversion rates, not just absolute numbers. 1000 signups with 1% activation is worse than 100 signups with 30% activation.

## Companion tools

- PostHog Funnels — built-in funnel visualization
- Mixpanel Funnels — funnel analysis with breakdown
- Amplitude Funnel Analysis — multi-step conversion tracking
- Google Analytics 4 — exploration funnels (free)
