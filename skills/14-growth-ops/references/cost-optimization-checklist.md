# Cost Optimization Checklist

## When to use
Reference this guide when setting up cloud cost monitoring, configuring billing alerts, right-sizing infrastructure, or running weekly cost reviews. Use the alert configs to set up automated notifications before surprise bills arrive.

## Decision framework

```
Is my cloud spend optimized?
├── Do I know my monthly cloud cost? (check billing dashboard)
│   ├── No → Set up billing alerts immediately (see below)
│   └── Yes → Continue
├── Has cost increased >20% month-over-month?
│   ├── Yes, due to traffic growth → Expected. Check cost-per-user.
│   └── Yes, but traffic is flat → Investigate (idle resources, misconfig)
├── Am I paying for resources I don't use?
│   ├── Dev/staging running 24/7? → Schedule off-hours shutdown
│   ├── Oversized instances? → Right-size (check utilization)
│   ├── Orphaned volumes/snapshots? → Delete
│   └── Unused reserved capacity? → Sell or reallocate
├── Is my cost-per-user decreasing as I scale?
│   ├── Yes → Healthy unit economics
│   └── No → Architecture review needed (inefficient queries, missing cache)
└── Am I on the cheapest appropriate tier for each service?
    → Review annually or when contract renews
```

---

## Weekly cost review (15 min)

Run this every Monday morning. Keep a log of findings.

```markdown
# Weekly Cost Review — Week of YYYY-MM-DD

## Dashboard Check
- [ ] Total spend this week: $___
- [ ] Total spend last week: $___
- [ ] Week-over-week change: ___% (flag if >20%)

## Top 3 Cost Drivers
| Service | This Week | Last Week | Change |
|---------|-----------|-----------|--------|
| [CUSTOMIZE: e.g., Vercel] | $__ | $__ | __% |
| [CUSTOMIZE: e.g., Supabase] | $__ | $__ | __% |
| [CUSTOMIZE: e.g., AWS S3] | $__ | $__ | __% |

## Idle Resource Check
- [ ] Dev/staging environments: running / shut down
- [ ] Unused database instances: none / found [list]
- [ ] Orphaned storage: none / found [list]
- [ ] Old backups/snapshots beyond retention: none / found [list]

## Billing Alerts
- [ ] Any alerts fired this week? No / Yes: [details]

## Action Items
- [ ] [CUSTOMIZE: specific actions from this review]

## Notes
[Any observations or things to investigate next week]
```

---

## Right-sizing methodology

### Step-by-step process

```
For each compute resource:
1. Pull 7-day utilization metrics (CPU, memory, connections)
2. Calculate average and peak utilization
3. Apply right-sizing rules:

   CPU:
   ├── Average < 10% → Downsize 2 tiers (e.g., 4 vCPU → 1 vCPU)
   ├── Average < 20% → Downsize 1 tier
   ├── Average 20-70% → Correctly sized
   ├── Average > 70% → Monitor (may need upsize soon)
   └── Peak > 90% sustained → Upsize 1 tier

   Memory:
   ├── Average < 20% → Downsize 1 tier
   ├── Average 20-60% → Correctly sized
   ├── Average > 60% → Monitor
   └── Peak > 85% → Upsize or investigate leak

   Database connections:
   ├── Average < 10% of max → Smaller tier or use connection pooling
   ├── Average 10-50% → Correctly sized
   └── Average > 50% → Scale up or add connection pooler (PgBouncer)

   Storage:
   ├── Growing but <30% used → Provisioned too large, scale down
   ├── >80% used → Scale up before hitting limit
   └── Old data rarely accessed → Move to cold storage tier
```

### Reserved vs on-demand analysis

```
When to use reserved capacity:
├── Workload is predictable (steady baseline traffic)
├── You have been running the same instance size for 3+ months
├── Savings justify the commitment (typically 30-60% discount)
└── You can commit for 1 year minimum

When to stay on-demand:
├── Startup phase (requirements changing frequently)
├── Seasonal or spiky traffic
├── Uncertain about future resource needs
└── Cost is already small (<$100/month per resource)

Hybrid approach (recommended):
├── Reserved: production database, baseline compute
├── On-demand: burst capacity, dev/staging, workers
└── Spot/preemptible: batch processing, CI/CD, non-critical jobs
```

---

## Copy-paste: billing alert configs

### AWS billing alert (CloudWatch + SNS)

```json
{
  "Comment": "AWS Billing Alert — [CUSTOMIZE] thresholds and email",
  "AlarmName": "monthly-spend-80-pct",
  "AlarmDescription": "Alert when estimated monthly charges exceed 80% of budget",
  "MetricName": "EstimatedCharges",
  "Namespace": "AWS/Billing",
  "Statistic": "Maximum",
  "Period": 21600,
  "EvaluationPeriods": 1,
  "Threshold": 400,
  "ComparisonOperator": "GreaterThanThreshold",
  "ActionsEnabled": true,
  "AlarmActions": [
    "arn:aws:sns:us-east-1:ACCOUNT_ID:billing-alerts"
  ],
  "Dimensions": [
    {
      "Name": "Currency",
      "Value": "USD"
    }
  ]
}
```

```bash
# AWS CLI: Create billing alarm
# [CUSTOMIZE] Replace ACCOUNT_ID, threshold, and SNS topic ARN

# Step 1: Create SNS topic for billing alerts
aws sns create-topic --name billing-alerts --region us-east-1

# Step 2: Subscribe your email
aws sns subscribe \
  --topic-arn arn:aws:sns:us-east-1:ACCOUNT_ID:billing-alerts \
  --protocol email \
  --notification-endpoint your-email@example.com \
  --region us-east-1

# Step 3: Create 80% budget alarm
aws cloudwatch put-metric-alarm \
  --alarm-name "monthly-spend-80-pct" \
  --alarm-description "Monthly spend reached 80% of $500 budget" \
  --metric-name EstimatedCharges \
  --namespace AWS/Billing \
  --statistic Maximum \
  --period 21600 \
  --evaluation-periods 1 \
  --threshold 400 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions arn:aws:sns:us-east-1:ACCOUNT_ID:billing-alerts \
  --dimensions Name=Currency,Value=USD \
  --region us-east-1

# Step 4: Create 100% budget alarm
aws cloudwatch put-metric-alarm \
  --alarm-name "monthly-spend-100-pct" \
  --alarm-description "Monthly spend exceeded $500 budget" \
  --metric-name EstimatedCharges \
  --namespace AWS/Billing \
  --statistic Maximum \
  --period 21600 \
  --evaluation-periods 1 \
  --threshold 500 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions arn:aws:sns:us-east-1:ACCOUNT_ID:billing-alerts \
  --dimensions Name=Currency,Value=USD \
  --region us-east-1
```

### GCP billing alert (Budget API)

```yaml
# gcp-billing-budget.yaml
# [CUSTOMIZE] Replace project, amount, and notification channels

# Apply with: gcloud billing budgets create --billing-account=ACCOUNT_ID

displayName: "Monthly Cloud Budget"
budgetFilter:
  projects:
    - "projects/YOUR_PROJECT_ID"  # [CUSTOMIZE]
  calendarPeriod: MONTH
amount:
  specifiedAmount:
    currencyCode: "USD"
    units: "500"                   # [CUSTOMIZE] monthly budget
thresholdRules:
  - thresholdPercent: 0.5          # 50% alert
    spendBasis: CURRENT_SPEND
  - thresholdPercent: 0.8          # 80% alert
    spendBasis: CURRENT_SPEND
  - thresholdPercent: 1.0          # 100% alert
    spendBasis: CURRENT_SPEND
  - thresholdPercent: 1.2          # 120% overspend alert
    spendBasis: CURRENT_SPEND
notificationsRule:
  pubsubTopic: "projects/YOUR_PROJECT_ID/topics/billing-alerts"
  schemaVersion: "1.0"
  monitoringNotificationChannels:
    - "projects/YOUR_PROJECT_ID/notificationChannels/CHANNEL_ID"
```

### Vercel spend alert

```
Vercel does not have a native API for billing alerts.
Manual setup:

1. Go to Vercel Dashboard → Settings → Billing
2. Set Spend Management:
   - Hard limit: $X/month (stops services at limit)
   - OR soft limit: sends email notification at threshold
3. Check weekly: Dashboard → Usage tab
4. Set calendar reminder: "Check Vercel usage" every Monday

Alternative: Use Vercel API to poll usage
```

```ts
// scripts/check-vercel-usage.ts
// [CUSTOMIZE] Run via cron job or CI schedule

async function checkVercelUsage() {
  const res = await fetch('https://api.vercel.com/v1/usage', {
    headers: {
      Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
    },
  });
  const usage = await res.json();

  // [CUSTOMIZE] Send alert if usage exceeds threshold
  const BUDGET = 50; // dollars
  if (usage.total > BUDGET * 0.8) {
    // Send Slack/email alert
    console.warn(`Vercel usage at $${usage.total} (${Math.round(usage.total/BUDGET*100)}% of budget)`);
  }
}
```

### Railway billing alert

```
Railway setup:
1. Dashboard → Settings → Usage Limits
2. Set monthly usage limit (hard cap)
3. Railway will notify at 75% and 100% of limit
4. Services pause at 100% (prevents surprise bills)
```

---

## Cost tracking spreadsheet template

```markdown
# Cloud Cost Tracker — [CUSTOMIZE: Product Name]

## Monthly Summary
| Month | Total Cost | Users | Cost/User | MoM Change | Notes |
|-------|-----------|-------|-----------|------------|-------|
| 2026-01 | $XXX | XXX | $X.XX | — | Baseline |
| 2026-02 | $XXX | XXX | $X.XX | +X% | [notes] |
| 2026-03 | $XXX | XXX | $X.XX | +X% | [notes] |

## Cost by Service (current month)
| Service | Cost | % of Total | Last Month | Change | Action Needed |
|---------|------|-----------|------------|--------|---------------|
| [CUSTOMIZE: Hosting] | $XX | XX% | $XX | +X% | |
| [CUSTOMIZE: Database] | $XX | XX% | $XX | +X% | |
| [CUSTOMIZE: Storage] | $XX | XX% | $XX | +X% | |
| [CUSTOMIZE: Email] | $XX | XX% | $XX | +X% | |
| [CUSTOMIZE: Analytics] | $XX | XX% | $XX | +X% | |
| [CUSTOMIZE: Monitoring] | $XX | XX% | $XX | +X% | |
| **Total** | **$XXX** | **100%** | **$XXX** | **+X%** | |

## Cost Optimization Log
| Date | Action | Estimated Savings | Actual Savings |
|------|--------|------------------|----------------|
| YYYY-MM-DD | [CUSTOMIZE: e.g., Downsized staging DB] | $XX/mo | $XX/mo |
| YYYY-MM-DD | [CUSTOMIZE: e.g., Enabled auto-shutdown for dev] | $XX/mo | $XX/mo |
```

---

## Common cost traps

```
Top cost traps for early-stage startups:
├── Dev/staging environments running 24/7 ($50-200/mo wasted)
│   Fix: Schedule shutdown from 8pm-8am and on weekends
├── Oversized database tier "just in case" ($100-500/mo wasted)
│   Fix: Start small, scale up when utilization > 50%
├── Storing every file forever (S3/GCS grows silently)
│   Fix: Lifecycle rules to move to cold storage after 90 days
├── Unoptimized images (massive bandwidth costs)
│   Fix: Image CDN (Cloudinary/imgix) or Next.js Image optimization
├── Verbose logging in production (log storage costs)
│   Fix: Log only warn/error in production, use sampling for info
├── Abandoned feature flag infrastructure
│   Fix: Clean up old flags monthly, archive unused
└── Not using free tiers effectively
    Fix: PostHog, Sentry, Supabase, Vercel all have generous free tiers
```

---

## Customization notes

- **<$100/month total spend**: Do not over-optimize. Your time is more valuable than saving $10/month. Focus on billing alerts only.
- **$100-1K/month**: Weekly review + right-sizing + dev environment scheduling. Target 20% savings.
- **$1K+/month**: Full optimization program. Consider reserved instances, CDN tuning, query optimization, and architecture review.
- **Multi-cloud**: Use a cost management tool (Vantage, CloudHealth, Infracost) for unified visibility.

## Companion tools

- Infracost — show cloud cost estimates in pull requests
- Vantage — multi-cloud cost monitoring
- AWS Cost Explorer — native AWS cost analysis
- GCP Cost Table — BigQuery-based cost analysis
