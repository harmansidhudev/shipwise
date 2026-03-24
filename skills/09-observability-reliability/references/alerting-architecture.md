# Alerting Architecture

## When to use
Reference this guide when setting up alerting for a new project, defining severity levels, configuring on-call rotations, or combating alert fatigue. Use the severity matrix as your team's shared language for incident priority.

## Decision framework

```
How should this alert be routed?
├── Is the service completely down for all users?
│   └── P1 — Page immediately (PagerDuty/Opsgenie), wake people up
│
├── Is a major feature broken or error rate >5%?
│   └── P2 — Page with 15-min delay, ack required
│
├── Is performance degraded or a non-critical feature broken?
│   └── P3 — Slack #alerts, fix during business hours
│
├── Is it a warning or non-urgent anomaly?
│   └── P4 — Slack #alerts-low, ticket for next sprint
│
└── Is it informational (deploy succeeded, backup completed)?
    └── Not an alert — log it, don't notify
```

---

## Copy-paste template

### Severity definitions

```ts
// alerting/severity.ts
// [CUSTOMIZE] Adjust thresholds and escalation targets for your team

export const SEVERITY_MATRIX = {
  P1: {
    name: 'Critical',
    description: 'Complete service outage, data loss, or security breach',
    examples: [
      'All API requests returning 5xx',
      'Database unreachable',
      'Security breach detected',
      'Payment processing down',
      'Data corruption or loss',
    ],
    response: {
      notification: 'PagerDuty/Opsgenie — immediate page',
      ackDeadline: '5 minutes',
      updateFrequency: 'Every 15 minutes',
      statusPage: 'Update within 5 minutes',
      escalation: 'If no ack in 5 min → escalate to engineering lead',
    },
    thresholds: {
      errorRate: '>10% of requests',
      latencyP99: '>10s',
      availability: '<99%',
    },
  },

  P2: {
    name: 'Major',
    description: 'Major feature broken, significant user impact',
    examples: [
      'Auth system intermittently failing',
      'Error rate >5% on critical endpoints',
      'Search completely broken',
      'Email/notification delivery failing',
    ],
    response: {
      notification: 'PagerDuty/Opsgenie — 15-min delayed page',
      ackDeadline: '15 minutes',
      updateFrequency: 'Every 30 minutes',
      statusPage: 'Update within 15 minutes',
      escalation: 'If no ack in 15 min → escalate to engineering lead',
    },
    thresholds: {
      errorRate: '5-10% of requests',
      latencyP99: '5-10s',
      availability: '99-99.5%',
    },
  },

  P3: {
    name: 'Minor',
    description: 'Degraded performance or non-critical feature broken',
    examples: [
      'Elevated latency (P99 > 2s)',
      'Non-critical API errors',
      'Background job backlog growing',
      'Cache hit rate dropping',
    ],
    response: {
      notification: 'Slack #alerts',
      ackDeadline: '1 hour (business hours)',
      updateFrequency: 'As needed',
      statusPage: 'Optional — degraded performance notice',
      escalation: 'If unresolved in 4 hours → escalate to P2',
    },
    thresholds: {
      errorRate: '1-5% of requests',
      latencyP99: '2-5s',
      availability: '99.5-99.9%',
    },
  },

  P4: {
    name: 'Low',
    description: 'Warning or non-urgent anomaly',
    examples: [
      'Disk usage approaching threshold',
      'Certificate expiring in 14 days',
      'Dependency deprecation warnings',
      'Non-critical background job failures',
    ],
    response: {
      notification: 'Slack #alerts-low',
      ackDeadline: 'Next business day',
      updateFrequency: 'N/A',
      statusPage: 'No update needed',
      escalation: 'Create ticket, prioritize in next sprint',
    },
    thresholds: {
      errorRate: '<1% of requests',
      diskUsage: '>80%',
      certExpiry: '<14 days',
    },
  },
} as const;
```

### Alert rule templates

```ts
// alerting/rules.ts
// [CUSTOMIZE] Adapt to your monitoring vendor's alert rule format

export const ALERT_RULES = [
  // --- P1 Alerts ---
  {
    name: 'API Error Rate Critical',
    severity: 'P1',
    condition: 'error_rate > 10% for 2 minutes',
    query: 'sum(rate(http_requests_total{status=~"5.."}[2m])) / sum(rate(http_requests_total[2m])) > 0.10',
    channel: 'pagerduty-critical', // [CUSTOMIZE] your PagerDuty service
    cooldown: '5m', // Don't re-alert for 5 min after firing
  },
  {
    name: 'Database Connection Failed',
    severity: 'P1',
    condition: 'health check /health/ready returns unhealthy for 1 minute',
    query: 'probe_success{job="health-ready"} == 0 for 1m',
    channel: 'pagerduty-critical', // [CUSTOMIZE]
    cooldown: '5m',
  },

  // --- P2 Alerts ---
  {
    name: 'API Error Rate Elevated',
    severity: 'P2',
    condition: 'error_rate > 5% for 5 minutes',
    query: 'sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) > 0.05',
    channel: 'pagerduty-high', // [CUSTOMIZE]
    cooldown: '15m',
  },
  {
    name: 'Sentry New Issue Spike',
    severity: 'P2',
    condition: 'More than 50 new Sentry issues in 10 minutes',
    // Configured in Sentry UI: Alerts > Create Alert > Issue Alert
    channel: 'pagerduty-high', // [CUSTOMIZE]
    cooldown: '15m',
  },

  // --- P3 Alerts ---
  {
    name: 'Latency P99 Elevated',
    severity: 'P3',
    condition: 'p99 latency > 2s for 10 minutes',
    query: 'histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[10m])) > 2',
    channel: 'slack-alerts', // [CUSTOMIZE] #alerts channel webhook
    cooldown: '30m',
  },
  {
    name: 'Background Job Backlog',
    severity: 'P3',
    condition: 'Queue depth > 1000 for 15 minutes',
    query: 'job_queue_depth > 1000 for 15m',
    channel: 'slack-alerts', // [CUSTOMIZE]
    cooldown: '30m',
  },

  // --- P4 Alerts ---
  {
    name: 'Disk Usage Warning',
    severity: 'P4',
    condition: 'disk usage > 80%',
    query: 'disk_usage_percent > 80',
    channel: 'slack-alerts-low', // [CUSTOMIZE]
    cooldown: '6h',
  },
  {
    name: 'SSL Certificate Expiry',
    severity: 'P4',
    condition: 'certificate expires in < 14 days',
    query: 'ssl_cert_expires_in_days < 14',
    channel: 'slack-alerts-low', // [CUSTOMIZE]
    cooldown: '24h',
  },
];
```

### Escalation matrix

```
Escalation paths:
[CUSTOMIZE] Replace names/roles with your team structure

P1 (Critical):
  0 min  → Page on-call engineer (PagerDuty/Opsgenie)
  5 min  → If no ack → Page engineering lead
  15 min → If no ack → Page CTO / VP Engineering
  30 min → Incident Commander takes over, status page updated

P2 (Major):
  0 min  → Page on-call engineer (15-min delay)
  15 min → If no ack → Page engineering lead
  30 min → If no ack → Slack @engineering-team

P3 (Minor):
  0 min  → Slack #alerts
  4 hr   → If unresolved → Escalate to P2

P4 (Low):
  0 min  → Slack #alerts-low
  24 hr  → Auto-create ticket in project tracker
```

### On-call rotation setup

```yaml
# [CUSTOMIZE] PagerDuty / Opsgenie on-call schedule template
on_call_schedule:
  name: "Engineering On-Call"
  timezone: "America/Los_Angeles" # [CUSTOMIZE] your team's timezone
  rotation_type: "weekly"         # weekly | daily | custom

  # [CUSTOMIZE] Add your team members
  participants:
    - name: "Engineer A"
      email: "engineer-a@company.com"
    - name: "Engineer B"
      email: "engineer-b@company.com"
    - name: "Engineer C"
      email: "engineer-c@company.com"

  # Handoff time
  handoff:
    day: "Monday"
    time: "09:00"

  # Override rules
  overrides:
    - holidays: "swap with next person in rotation"
    - pto: "team member arranges swap in advance"

  # Escalation policy
  escalation:
    - level: 1
      target: "current on-call"
      timeout: "5 min"
    - level: 2
      target: "engineering lead"
      timeout: "15 min"
    - level: 3
      target: "cto"
      timeout: "never (final escalation)"
```

---

## Alert fatigue prevention strategies

### 1. Cooldown periods
Every alert rule should have a cooldown (minimum re-alert interval). Prevents the same alert from firing every 30 seconds.

### 2. Composite alerts
Instead of alerting on individual symptoms, combine signals. Example: alert on "error rate >5% AND latency >2s" instead of two separate alerts.

### 3. Alert grouping
Group related alerts into a single notification. Example: if 10 endpoints all start failing at once, send one alert about "API degradation" instead of 10 separate alerts.

### 4. Business-hours routing for P3/P4
Route non-critical alerts to Slack only during business hours. Queue overnight P3/P4 alerts for morning summary.

### 5. Weekly alert review
Review all alerts that fired in the past week. For each: Was it actionable? Did it lead to a real fix? If not, tune or remove the alert.

### 6. Alert-to-incident ratio
Track how many alerts result in actual incidents. If the ratio is below 30%, you have too many false positives — tighten thresholds.

---

## Customization notes

- **Solo founder / tiny team**: Skip PagerDuty. Route P1/P2 to phone via Better Uptime (free tier includes phone calls). Route P3/P4 to Slack or email.
- **No on-call budget**: Use Sentry's built-in alert routing (Slack + email). Upgrade to PagerDuty when you have 3+ engineers.
- **Multiple services**: Create separate alert channels per service (e.g., `#alerts-api`, `#alerts-web`, `#alerts-workers`) to reduce noise.
- **Compliance (SOC 2)**: Document your escalation matrix, on-call schedule, and alert response SLAs. Auditors will ask for these.

## Companion tools

- `getsentry/sentry-for-claude` — Configure Sentry alert rules from Claude Code
- `phrazzld/claude-config` -> `/check-observability` — Validate alerting configuration
