# Monitoring Stack Selection

## When to use
Reference this guide when setting up observability for a new project, evaluating monitoring vendors, or consolidating a fragmented monitoring setup. Use the decision framework to pick the right tools for your stage and budget.

## Decision framework

```
What monitoring do you need?
├── Just launching (MVP / <100 users)?
│   ├── Error tracking: Sentry (free tier: 5K errors/mo)
│   ├── Uptime: Better Uptime (free tier: 5 monitors)
│   └── Logging: console + structured JSON (ship later)
│
├── Growing (100-1K users)?
│   ├── Error tracking: Sentry (Team plan)
│   ├── APM: Sentry Performance or Grafana Cloud (free tier)
│   ├── Uptime: Better Uptime or Checkly
│   └── Logging: Grafana Loki (free tier) or Datadog (free tier)
│
├── Scaling (1K-10K users)?
│   ├── Error tracking: Sentry (Business)
│   ├── APM: Datadog or Grafana Cloud
│   ├── Uptime: Checkly (synthetic + API monitoring)
│   ├── Logging: Datadog Logs or Grafana Loki
│   └── Tracing: OpenTelemetry -> vendor of choice
│
└── At scale (10K+ users)?
    ├── Full Datadog suite OR Grafana Cloud stack
    ├── OpenTelemetry for vendor-neutral instrumentation
    ├── Custom dashboards, SLO tracking, cost monitoring
    └── Consider self-hosted (Grafana/Prometheus/Loki) for cost control
```

---

## Provider comparison table

| Category | Tool | Free tier | Paid from | Best for | OpenTelemetry |
|----------|------|-----------|-----------|----------|---------------|
| **Error tracking** | Sentry | 5K errors/mo | $26/mo | All stages | Yes |
| **Error tracking** | Bugsnag | 7.5K events/mo | $59/mo | Mobile-heavy apps | Partial |
| **APM** | Datadog | 14-day trial | ~$15/host/mo | Full-stack visibility | Yes |
| **APM** | Grafana Cloud | 50GB logs, 10K metrics | $0.50/GB logs | Cost-conscious teams | Yes |
| **APM** | New Relic | 100GB/mo ingest | $0.30/GB over | Free tier is generous | Yes |
| **APM** | Sentry Performance | Included w/ Sentry | Included | Already using Sentry | Yes |
| **Uptime** | Better Uptime | 5 monitors, 3-min | $24/mo | Simple uptime + status | No |
| **Uptime** | Checkly | 5 checks | $30/mo | Synthetic + API monitoring | No |
| **Uptime** | UptimeRobot | 50 monitors, 5-min | $7/mo | Budget uptime | No |
| **Logging** | Datadog Logs | None (trial) | $0.10/GB | Unified with Datadog APM | Yes |
| **Logging** | Grafana Loki | 50GB/mo | $0.50/GB | Cost-effective log search | Yes |
| **Logging** | Axiom | 500GB/mo | $25/mo | Generous free tier | Yes |
| **Logging** | Better Stack | 1GB/mo | $24/mo | Nice UI, easy setup | Partial |

---

## Copy-paste template

### Recommended starter stack (most projects)

```ts
// monitoring-config.ts
// [CUSTOMIZE] This is a reference for which tools to set up — not runtime code

export const monitoringStack = {
  // Tier 1: Set up on day one (free)
  errorTracking: {
    tool: 'Sentry',
    plan: 'Developer (free)',
    setup: 'npx @sentry/wizard -i nextjs', // [CUSTOMIZE] framework
    config: {
      dsn: '[CUSTOMIZE] Your Sentry DSN from project settings',
      environment: process.env.NODE_ENV,
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    },
  },

  // Tier 1: Set up on day one (free)
  uptimeMonitoring: {
    tool: 'Better Uptime', // [CUSTOMIZE] or UptimeRobot, Checkly
    monitors: [
      { name: 'Website', url: 'https://[CUSTOMIZE].com', interval: '3min' },
      { name: 'API Health', url: 'https://[CUSTOMIZE].com/health/ready', interval: '1min' },
      { name: 'Auth Flow', url: 'https://[CUSTOMIZE].com/api/health', interval: '3min' },
    ],
  },

  // Tier 2: Add when you have paying users
  apm: {
    tool: 'Grafana Cloud', // [CUSTOMIZE] or Datadog, New Relic
    plan: 'Free tier',
    setup: 'OpenTelemetry SDK -> Grafana OTLP endpoint',
  },

  // Tier 2: Add when you have paying users
  logging: {
    tool: 'Grafana Loki', // [CUSTOMIZE] or Axiom, Datadog Logs
    plan: 'Free tier (50GB/mo)',
    format: 'JSON structured logs via pino',
  },

  // Tier 3: Add at scale
  tracing: {
    tool: 'OpenTelemetry',
    exporter: 'Grafana Tempo', // [CUSTOMIZE] or Datadog, Jaeger
    sampleRate: 0.05, // [CUSTOMIZE] 5% of traces in production
  },
};
```

### OpenTelemetry base setup (vendor-neutral)

```ts
// otel-setup.ts
// [CUSTOMIZE] Install: npm install @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node @opentelemetry/exporter-trace-otlp-http

import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';

const sdk = new NodeSDK({
  resource: new Resource({
    [ATTR_SERVICE_NAME]: '[CUSTOMIZE] your-service-name',
    [ATTR_SERVICE_VERSION]: process.env.APP_VERSION || '0.0.0',
  }),
  traceExporter: new OTLPTraceExporter({
    // [CUSTOMIZE] Your OTLP endpoint
    // Grafana Cloud: https://otlp-gateway-<region>.grafana.net/otlp
    // Datadog: https://otlp.datadoghq.com
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      // [CUSTOMIZE] Disable noisy instrumentations
      '@opentelemetry/instrumentation-fs': { enabled: false },
    }),
  ],
});

sdk.start();

process.on('SIGTERM', () => {
  sdk.shutdown().then(() => process.exit(0));
});
```

---

## Customization notes

- **Budget-first**: Start with Sentry (free) + UptimeRobot (free) + Axiom (free 500GB). Total cost: $0.
- **All-in-one preference**: Datadog covers error tracking, APM, logging, uptime, and dashboards in one platform — higher cost but less operational overhead.
- **Self-hosted preference**: Grafana + Prometheus + Loki + Tempo gives you the full stack open-source. More setup, but no per-GB charges.
- **OpenTelemetry first**: If you instrument with OpenTelemetry from day one, you can switch vendors without code changes. Worth the upfront investment.
- **Multi-region**: At scale, run monitoring in a separate region/account from your production workloads so monitoring survives regional outages.

## Companion tools

- `getsentry/sentry-for-claude` — Query Sentry issues and manage alerts from Claude Code
- `phrazzld/claude-config` -> `/check-observability` — Validate your monitoring configuration
