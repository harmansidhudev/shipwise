# Retention Analysis Guide

## When to use
Reference this guide when setting up retention cohort tracking, analyzing churn patterns, building retention dashboards, or diagnosing why users leave. Use the SQL queries to build cohort tables from your database and the dashboard template for ongoing monitoring.

## Decision framework

```
How is my retention?
├── D1 retention < 25% (B2C) or < 40% (B2B)?
│   → Onboarding problem — users don't see value on day 1
├── D7 retention < 15% (B2C) or < 25% (B2B)?
│   → Activation problem — users don't complete core action
├── D30 retention < 8% (B2C) or < 15% (B2B)?
│   → Value problem — product doesn't create a habit
├── Retention curve never flattens?
│   → Leaky bucket — fix retention before investing in acquisition
├── Retention is improving cohort-over-cohort?
│   → Product changes are working — keep iterating
└── Retention is declining cohort-over-cohort?
│   → Something broke — check recent product changes, new user quality
```

---

## Cohort analysis methodology

### What is a cohort?

A cohort is a group of users who share a common characteristic in a defined time period. For retention analysis, cohorts are typically defined by signup week.

### Building a retention cohort table

```
Rows = signup cohort (grouped by week)
Columns = time period after signup (D1, D7, D14, D30, D60, D90)
Cells = % of users from that cohort who were active in that period

Example:
┌────────────┬───────┬──────┬──────┬──────┬──────┬──────┐
│ Cohort     │ Users │ D1   │ D7   │ D14  │ D30  │ D60  │
├────────────┼───────┼──────┼──────┼──────┼──────┼──────┤
│ Jan 1 week │ 200   │ 45%  │ 28%  │ 22%  │ 18%  │ 15%  │
│ Jan 8 week │ 250   │ 48%  │ 31%  │ 25%  │ 20%  │ 17%  │
│ Jan 15 week│ 180   │ 52%  │ 35%  │ 28%  │ 23%  │ —    │
│ Jan 22 week│ 300   │ 50%  │ 33%  │ 27%  │ —    │ —    │
│ Jan 29 week│ 220   │ 55%  │ 38%  │ —    │ —    │ —    │
└────────────┴───────┴──────┴──────┴──────┴──────┴──────┘

Reading this table:
- Each row is an independent cohort
- Compare DOWN columns to see if retention is improving over time
- Jan 29 cohort has better D1 (55%) than Jan 1 cohort (45%) = progress
```

### Retention benchmarks

#### B2B SaaS

| Metric | Poor | Below avg | Median | Good | Great |
|--------|------|-----------|--------|------|-------|
| D1 | < 30% | 30-40% | 40-50% | 50-60% | > 60% |
| D7 | < 15% | 15-25% | 25-35% | 35-45% | > 45% |
| D30 | < 10% | 10-15% | 15-25% | 25-35% | > 35% |
| Monthly logo churn | > 8% | 5-8% | 3-5% | 1-3% | < 1% |
| Net revenue retention | < 80% | 80-100% | 100-110% | 110-130% | > 130% |

#### B2C SaaS

| Metric | Poor | Below avg | Median | Good | Great |
|--------|------|-----------|--------|------|-------|
| D1 | < 15% | 15-25% | 25-35% | 35-45% | > 45% |
| D7 | < 8% | 8-15% | 15-20% | 20-30% | > 30% |
| D30 | < 4% | 4-8% | 8-12% | 12-20% | > 20% |
| Monthly logo churn | > 12% | 8-12% | 5-8% | 3-5% | < 3% |

---

## Retention curve analysis

### Healthy vs unhealthy curves

```
HEALTHY: Curve flattens after initial drop
- Sharp drop D0-D7 (normal: users exploring)
- Moderate drop D7-D30 (users deciding)
- Flattens after D30 (retained users stay)
- Action: Focus on moving the "flatten point" up

UNHEALTHY: Curve never flattens
- Continuous decline through D60, D90
- No stable retained cohort
- Action: Fix activation before spending on acquisition

IMPROVING: Each new cohort retains better
- Jan cohort D7 = 25%, Feb cohort D7 = 30%, Mar cohort D7 = 35%
- Product improvements are working
- Action: Keep iterating, document what changed

DEGRADING: Each new cohort retains worse
- Recent cohorts have lower retention than older ones
- Possible causes: lower quality traffic, product regression, market shift
- Action: Investigate user quality, check for bugs, review recent changes
```

### Segmented retention analysis

Segment your retention data to find patterns:

```
Useful segments:
├── By signup method: email vs Google vs GitHub
│   (Does OAuth signup lead to better retention?)
├── By activation status: activated vs not activated
│   (How much better is retention for activated users?)
├── By acquisition source: organic vs paid vs referral
│   (Which channel brings the stickiest users?)
├── By plan: free vs trial vs paid
│   (Do paying users retain better?)
├── By device: desktop vs mobile
│   (Is the mobile experience driving churn?)
├── By onboarding completion: completed vs abandoned
│   (Does onboarding actually help?)
└── By geography: top 5 countries
    (Is there a localization gap?)
```

---

## Churn prediction signals

Watch for these early warning signs that a user is about to churn:

```
High-risk signals (act within 48h):
├── No login for 7+ days (previously active daily)
├── Downgraded plan
├── Removed team members
├── Exported all data
├── Visited pricing page of competitors (if detectable)
└── Support tickets with frustration keywords

Medium-risk signals (act within 1 week):
├── Login frequency dropped by 50%+
├── Session duration dropped by 50%+
├── Stopped using core feature
├── Haven't used new features despite email announcements
└── NPS score dropped (was 9, now 6)

Low-risk signals (monitor):
├── Login frequency dropped by 25%
├── Switched from daily to weekly usage
├── Stopped engaging with email campaigns
└── Reduced team size on account
```

### Automated churn risk scoring

```ts
// lib/churn-risk.ts
// [CUSTOMIZE] Adjust weights and thresholds for your product

interface UserActivity {
  loginCountLast7Days: number;
  loginCountPrevious7Days: number;
  coreActionCountLast7Days: number;
  coreActionCountPrevious7Days: number;
  daysSinceLastLogin: number;
  accountAgeDays: number;
  plan: 'free' | 'starter' | 'pro' | 'enterprise';
  teamSize: number;
  lastNPSScore: number | null;
  hasExportedData: boolean;
  hasDowngraded: boolean;
}

export function calculateChurnRisk(activity: UserActivity): {
  score: number; // 0-100, higher = more likely to churn
  level: 'low' | 'medium' | 'high' | 'critical';
  signals: string[];
} {
  let score = 0;
  const signals: string[] = [];

  // Login frequency decline
  if (activity.loginCountPrevious7Days > 0) {
    const loginDecline = 1 - (activity.loginCountLast7Days / activity.loginCountPrevious7Days);
    if (loginDecline > 0.75) { score += 30; signals.push('Login frequency dropped >75%'); }
    else if (loginDecline > 0.50) { score += 20; signals.push('Login frequency dropped >50%'); }
    else if (loginDecline > 0.25) { score += 10; signals.push('Login frequency dropped >25%'); }
  }

  // Days since last login
  if (activity.daysSinceLastLogin > 14) { score += 25; signals.push('No login in 14+ days'); }
  else if (activity.daysSinceLastLogin > 7) { score += 15; signals.push('No login in 7+ days'); }

  // Core action decline
  if (activity.coreActionCountPrevious7Days > 0) {
    const actionDecline = 1 - (activity.coreActionCountLast7Days / activity.coreActionCountPrevious7Days);
    if (actionDecline > 0.50) { score += 15; signals.push('Core action usage dropped >50%'); }
  }

  // Churn intent signals
  if (activity.hasExportedData) { score += 20; signals.push('Exported data recently'); }
  if (activity.hasDowngraded) { score += 15; signals.push('Downgraded plan'); }

  // NPS detractor
  if (activity.lastNPSScore !== null && activity.lastNPSScore <= 6) {
    score += 10; signals.push(`NPS detractor (score: ${activity.lastNPSScore})`);
  }

  // Cap at 100
  score = Math.min(score, 100);

  const level = score >= 70 ? 'critical'
    : score >= 50 ? 'high'
    : score >= 25 ? 'medium'
    : 'low';

  return { score, level, signals };
}
```

---

## Copy-paste: SQL queries for cohort retention tables

### Weekly retention cohort (PostgreSQL)

```sql
-- Weekly retention cohort table
-- [CUSTOMIZE] Replace 'users' and 'user_events' with your table names
-- [CUSTOMIZE] Replace 'user_id' and 'created_at' with your column names

WITH cohorts AS (
  SELECT
    id AS user_id,
    DATE_TRUNC('week', created_at)::date AS cohort_week,
    created_at
  FROM users
  WHERE created_at >= NOW() - INTERVAL '12 weeks'
),
activity AS (
  SELECT DISTINCT
    user_id,
    DATE(event_timestamp) AS activity_date
  FROM user_events
  WHERE event_timestamp >= NOW() - INTERVAL '12 weeks'
    AND event_name IN ('page_viewed', 'feature_used', 'activation_completed')
    -- [CUSTOMIZE] Add your "active" event names
),
retention AS (
  SELECT
    c.cohort_week,
    COUNT(DISTINCT c.user_id) AS cohort_size,
    COUNT(DISTINCT CASE
      WHEN a.activity_date BETWEEN c.created_at::date + 1
        AND c.created_at::date + 1
      THEN a.user_id END) AS d1_active,
    COUNT(DISTINCT CASE
      WHEN a.activity_date BETWEEN c.created_at::date + 6
        AND c.created_at::date + 8
      THEN a.user_id END) AS d7_active,
    COUNT(DISTINCT CASE
      WHEN a.activity_date BETWEEN c.created_at::date + 13
        AND c.created_at::date + 15
      THEN a.user_id END) AS d14_active,
    COUNT(DISTINCT CASE
      WHEN a.activity_date BETWEEN c.created_at::date + 28
        AND c.created_at::date + 32
      THEN a.user_id END) AS d30_active,
    COUNT(DISTINCT CASE
      WHEN a.activity_date BETWEEN c.created_at::date + 58
        AND c.created_at::date + 62
      THEN a.user_id END) AS d60_active
  FROM cohorts c
  LEFT JOIN activity a ON c.user_id = a.user_id
  GROUP BY c.cohort_week
)
SELECT
  cohort_week,
  cohort_size,
  ROUND(d1_active::numeric / NULLIF(cohort_size, 0) * 100, 1) AS d1_retention_pct,
  ROUND(d7_active::numeric / NULLIF(cohort_size, 0) * 100, 1) AS d7_retention_pct,
  ROUND(d14_active::numeric / NULLIF(cohort_size, 0) * 100, 1) AS d14_retention_pct,
  ROUND(d30_active::numeric / NULLIF(cohort_size, 0) * 100, 1) AS d30_retention_pct,
  ROUND(d60_active::numeric / NULLIF(cohort_size, 0) * 100, 1) AS d60_retention_pct
FROM retention
ORDER BY cohort_week DESC;
```

### Monthly churn rate (PostgreSQL)

```sql
-- Monthly logo churn rate
-- [CUSTOMIZE] Define "active" for your product

WITH monthly_active AS (
  SELECT
    DATE_TRUNC('month', event_timestamp)::date AS month,
    user_id
  FROM user_events
  WHERE event_name IN ('page_viewed', 'feature_used')
  GROUP BY 1, 2
),
churn AS (
  SELECT
    curr.month AS month,
    COUNT(DISTINCT prev.user_id) AS prev_month_active,
    COUNT(DISTINCT prev.user_id) - COUNT(DISTINCT curr.user_id) AS churned,
    COUNT(DISTINCT CASE
      WHEN curr.user_id IS NOT NULL AND prev.user_id IS NULL
      THEN curr.user_id END) AS reactivated
  FROM monthly_active prev
  LEFT JOIN monthly_active curr
    ON prev.user_id = curr.user_id
    AND curr.month = prev.month + INTERVAL '1 month'
  GROUP BY curr.month
)
SELECT
  month,
  prev_month_active,
  churned,
  reactivated,
  ROUND(churned::numeric / NULLIF(prev_month_active, 0) * 100, 1) AS churn_rate_pct,
  ROUND(reactivated::numeric / NULLIF(prev_month_active, 0) * 100, 1) AS reactivation_rate_pct
FROM churn
WHERE month >= NOW() - INTERVAL '6 months'
ORDER BY month DESC;
```

### Retention by activation status

```sql
-- Compare retention for activated vs non-activated users
-- [CUSTOMIZE] Replace activation_events with your table/logic

WITH users_with_activation AS (
  SELECT
    u.id AS user_id,
    u.created_at,
    CASE WHEN a.user_id IS NOT NULL THEN 'activated' ELSE 'not_activated' END AS activation_status
  FROM users u
  LEFT JOIN (
    SELECT DISTINCT user_id
    FROM user_events
    WHERE event_name = 'activation_completed'
  ) a ON u.id = a.user_id
  WHERE u.created_at >= NOW() - INTERVAL '30 days'
),
activity AS (
  SELECT DISTINCT user_id, DATE(event_timestamp) AS activity_date
  FROM user_events
  WHERE event_timestamp >= NOW() - INTERVAL '60 days'
)
SELECT
  ua.activation_status,
  COUNT(DISTINCT ua.user_id) AS users,
  ROUND(
    COUNT(DISTINCT CASE
      WHEN a.activity_date BETWEEN ua.created_at::date + 6 AND ua.created_at::date + 8
      THEN a.user_id END)::numeric
    / NULLIF(COUNT(DISTINCT ua.user_id), 0) * 100, 1
  ) AS d7_retention_pct,
  ROUND(
    COUNT(DISTINCT CASE
      WHEN a.activity_date BETWEEN ua.created_at::date + 28 AND ua.created_at::date + 32
      THEN a.user_id END)::numeric
    / NULLIF(COUNT(DISTINCT ua.user_id), 0) * 100, 1
  ) AS d30_retention_pct
FROM users_with_activation ua
LEFT JOIN activity a ON ua.user_id = a.user_id
GROUP BY ua.activation_status;
```

---

## Retention dashboard template

Build this dashboard in your analytics tool or as a custom page.

```markdown
# Retention Dashboard — [CUSTOMIZE: Product Name]

## Key Metrics (top row)
| D1 Retention | D7 Retention | D30 Retention | Monthly Churn | NRR |
|:---:|:---:|:---:|:---:|:---:|
| [XX%] | [XX%] | [XX%] | [X.X%] | [XXX%] |
| vs last month: [+/-X%] | vs last month: [+/-X%] | vs last month: [+/-X%] | vs last month: [+/-X%] | vs last month: [+/-X%] |

## Cohort Table (main chart)
[Weekly cohort retention table — see SQL query above]

## Retention Curve (chart)
[Line chart: X axis = days since signup, Y axis = % retained]
[Overlay last 4 weekly cohorts to see trend]

## Retention by Segment (breakdown)
| Segment | D7 Retention | D30 Retention |
|---------|:---:|:---:|
| Activated users | XX% | XX% |
| Non-activated users | XX% | XX% |
| Organic signups | XX% | XX% |
| Paid signups | XX% | XX% |
| Desktop users | XX% | XX% |
| Mobile users | XX% | XX% |

## Churn Risk (table)
| User | Risk Score | Risk Level | Top Signal | Last Active |
|------|:---:|:---:|------|------|
| [user] | XX | High | [signal] | [date] |

## Action Items
- [ ] [What to fix based on data]
- [ ] [Next experiment to run]
```

---

## Customization notes

- **Early-stage (<500 users)**: Cohort tables will be noisy with small numbers. Focus on qualitative signals (user interviews, feedback) until you have 100+ users per weekly cohort.
- **Product-led growth (PLG)**: Segment retention by activation status aggressively. The gap between activated and non-activated retention tells you how much value activation delivers.
- **Revenue retention vs logo retention**: Track both. You can have low logo churn but still lose revenue if large customers downgrade. NRR > 100% means expansion revenue exceeds contraction + churn.
- **Reactivation**: Track users who come back after churning. If reactivation rate is high, your re-engagement emails are working.

## Companion tools

- PostHog Retention — built-in cohort retention visualization
- Amplitude Retention Analysis — retention with behavioral segmentation
- Mixpanel Retention — retention by custom events
- Metabase — open-source BI tool for custom retention queries
