---
name: observability-reliability
description: "Monitoring, error tracking, structured logging, alerting, health endpoints, backups, disaster recovery, status page, and incident response."
triggers:
  - "monitoring"
  - "Sentry"
  - "error tracking"
  - "logging"
  - "health check"
  - "health endpoint"
  - "alerting"
  - "backup"
  - "disaster recovery"
  - "status page"
  - "incident response"
  - "observability"
---

# Observability & Reliability

> Phase 3: SHIP | Sprint 3 (planned)

## Coverage

- Monitoring stack selection (Sentry for errors, Datadog/Grafana for APM, Better Uptime for synthetic)
- Sentry setup checklist (SDK, source maps, releases, user context, alerts)
- Structured logging (JSON, correlation IDs, log levels, no PII)
- Alerting (P1-P4 severity, escalation, alert fatigue prevention)
- Health endpoints (/health/live, /health/ready, /health/detailed)
- Backup strategy (automated daily, PITR, tested restores monthly)
- Disaster recovery (RTO/RPO definitions, failover, runbooks)
- Status page (Instatus/Statuspage.io)
- Incident response (detect → triage → communicate → mitigate → resolve → post-mortem)

## Checklist Items

### Error Tracking
<!-- beginner -->
**Set up error tracking (Sentry)** — When your app crashes in production, you need to know about it before your users tell you. Sentry captures every error with the exact line of code, the user affected, and what they did before the crash. Without this, you're flying blind.
→ Time: ~10 min
→ To fix: `npm install @sentry/nextjs` then run `npx @sentry/wizard -i nextjs`

<!-- intermediate -->
**Error tracking (Sentry)** — Install SDK, upload source maps in CI, configure release tracking and user context. Set alert rules for new issues.
→ ~10 min

<!-- senior -->
**Error tracking** → `@sentry/nextjs` + source maps + release tracking.

### Health Endpoints
<!-- beginner -->
**Add health check endpoints** — Health endpoints let your hosting platform and monitoring tools know if your app is running. A good health endpoint checks the app AND its dependencies (database, cache). If the database is down, the health check should report it.

<!-- intermediate -->
**Health endpoints** — /health/live (basic), /health/ready (dependencies), /health/detailed (metrics). Return JSON.

<!-- senior -->
**Health endpoints** → live/ready/detailed with dependency checks.

## Companion tools
- `getsentry/sentry-for-claude`
- `phrazzld/claude-config` → `/check-observability`
- `julianobarbosa/claude-code-skills`
