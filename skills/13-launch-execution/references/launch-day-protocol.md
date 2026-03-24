# Launch Day Protocol

## When to use
Follow this protocol from 7 days before launch through 30 days after — it turns the chaotic launch window into a repeatable process with clear checklists, monitoring thresholds, and response procedures at every phase.

## Decision framework

```
Where are you in the launch timeline?
├── T-7 days: Staging regression, monitoring setup, rollback tested, support ready
├── T-3 days: Code freeze, final staging smoke test, load test review
├── T-1 day: Production deploy (feature-flagged off), health verify, team brief
├── Launch day: Monitoring protocol active, thresholds enforced, response procedures ready
├── Day 1: First review — metrics, bugs, user feedback
├── Week 1: Pattern review — retention, conversion, performance trends
└── Month 1: Full review — growth metrics, technical debt, roadmap adjustment
```

---

## Copy-paste template

### T-7 Days — Foundation Checklist

```markdown
# T-7 Day Checklist
**Launch date:** [CUSTOMIZE: YYYY-MM-DD]
**Completed by:** [CUSTOMIZE: name]

## Staging & Testing
- [ ] Staging environment matches production configuration
- [ ] Full staging regression completed (see staging-regression-checklist.md)
- [ ] All P0 issues from regression resolved
- [ ] Automated test suite passing (unit + integration + e2e)
- [ ] Cross-browser testing complete (Chrome + Safari + Firefox)
- [ ] Mobile testing complete (iOS Safari + Android Chrome)

## Monitoring & Alerting
- [ ] Error tracking active and verified (Sentry / Bugsnag)
- [ ] Uptime monitoring configured (Better Uptime / Checkly)
- [ ] Alert thresholds configured:
  - Error rate > 1% → warning notification
  - Error rate > 5% → critical page
  - p95 latency > 2x baseline → warning notification
  - p95 latency > 5x baseline → critical page
  - Uptime < 100% → critical page
  - CPU > 80% sustained 5 min → warning notification
- [ ] Alert routing verified (test alert sent and received)
- [ ] Monitoring dashboard created with key metrics (link: [CUSTOMIZE: URL])

## Rollback Readiness
- [ ] Rollback plan written (see rollback-plan-template.md)
- [ ] Rollback tested on staging (actually executed, not just read)
- [ ] Rollback time measured: [CUSTOMIZE: X minutes]
- [ ] Database backup strategy confirmed and tested
- [ ] Feature flags configured for new features (can kill without redeploy)

## Support & Communication
- [ ] Support channels operational (in-app chat, support email, status page)
- [ ] Canned responses prepared for common launch-day questions
- [ ] Status page configured with service components
- [ ] War room channel created and roles assigned (see war-room-setup.md)
- [ ] External communication templates prepared (status page, email, social)
```

---

### T-3 Days — Hardening Checklist

```markdown
# T-3 Day Checklist
**Completed by:** [CUSTOMIZE: name]

## Code Freeze
- [ ] Code freeze announced to team — no new features merged after this point
- [ ] Only bug fixes and launch-critical changes allowed
- [ ] All launch-critical PRs merged and deployed to staging
- [ ] Release branch created (if using release branches): `release/[CUSTOMIZE: version]`

## Final Staging Verification
- [ ] Fresh staging deploy of exact release candidate
- [ ] Smoke test: signup → core action → payment (end-to-end)
- [ ] Transactional emails verified (welcome, receipt, password reset)
- [ ] Third-party integrations verified (payment provider, auth provider, email service)
- [ ] Error tracking shows zero new errors on staging

## Load & Performance
- [ ] Load test results reviewed: [CUSTOMIZE: tool — k6 / Artillery / Locust]
  - Target: [CUSTOMIZE: expected concurrent users, e.g., 100 / 500 / 1000]
  - p95 response time under load: [CUSTOMIZE: Xms]
  - Error rate under load: [CUSTOMIZE: X%]
  - Breaking point identified: [CUSTOMIZE: N concurrent users]
- [ ] Auto-scaling configured (if applicable): [CUSTOMIZE: min/max instances]
- [ ] CDN caching verified for static assets
- [ ] Database connection pooling configured for expected load

## Stakeholder Readiness
- [ ] Marketing assets finalized (PH listing, social posts, email drafts)
- [ ] Support team briefed on new features and known issues
- [ ] Launch sequence timeline reviewed and agreed by all role holders
```

---

### T-1 Day — Final Prep Checklist

```markdown
# T-1 Day Checklist
**Completed by:** [CUSTOMIZE: name]

## Production Deploy (feature-flagged OFF)
- [ ] Deploy release candidate to production with feature flags OFF
- [ ] Health check endpoint returns 200: [CUSTOMIZE: https://yourapp.com/api/health]
- [ ] Verify production logs are flowing to aggregator
- [ ] Verify error tracking is capturing (trigger a test error, then resolve it)
- [ ] Verify uptime monitor is checking production URL
- [ ] Smoke test production (existing features only — new features are flagged off)

## Team Brief
- [ ] Launch sequence reviewed with all role holders (see launch-day-sequence.md)
- [ ] Each person confirms their assignments and timing
- [ ] War room channel tested — all members can post and receive notifications
- [ ] Rollback owner identified and confirmed: @[CUSTOMIZE: name]
- [ ] On-call schedule confirmed for first 24 hours post-launch

## Communication Prep
- [ ] Status page set to "Scheduled Maintenance" or "Upcoming" for launch window
- [ ] Social media posts drafted and scheduled (or ready to post manually)
- [ ] Product Hunt listing finalized (if applicable)
- [ ] Waitlist email drafted and loaded in email tool (not sent yet)
- [ ] Blog post / changelog drafted and ready to publish

## Personal Prep
- [ ] Launch day calendar cleared — no meetings during T-2h to T+4h
- [ ] Laptop charged, internet stable, backup hotspot available
- [ ] Food and water at desk (you will not want to leave during the first 2 hours)
- [ ] Get a good night's sleep. Seriously.
```

---

### Launch Day — Monitoring Protocol

```markdown
# Launch Day Monitoring Protocol

## Metric Thresholds

| Metric | Green | Yellow (investigate) | Red (rollback candidate) |
|--------|-------|---------------------|--------------------------|
| Error rate | < 0.5% | 0.5% - 1% | > 1% |
| p95 latency | < [CUSTOMIZE: 500ms] | 1-2x baseline | > 2x baseline |
| p99 latency | < [CUSTOMIZE: 2s] | 2-3x baseline | > 3x baseline |
| Signup conversion | > [CUSTOMIZE: 5%] of visitors | 50-100% of expected | < 50% of expected |
| Payment success | > 95% | 90-95% | < 90% |
| CPU utilization | < 60% | 60-80% | > 80% sustained 5 min |
| Memory utilization | < 70% | 70-85% | > 85% |
| Uptime | 100% | Single blip (< 30s) | Any downtime > 30s |

## Monitoring Cadence

| Window | Check frequency | Who | What to check |
|--------|----------------|-----|---------------|
| T-2h to T-0 | Every 15 min | @engineering-lead | Staging green, production health, team ready |
| T-0 to T+15m | Every 2 min | @engineering-lead | Error rate, first signups, health check |
| T+15m to T+1h | Every 5 min | @engineering-lead | All metrics, signup funnel, payment flow |
| T+1h to T+4h | Every 15 min | @engineering-lead | All metrics, trending, capacity |
| T+4h to T+24h | Every 1 hour | @engineering-lead (or on-call) | All metrics, overnight stability |
| T+24h onward | Automated alerts | On-call rotation | Alert-driven only |

## Response Procedures

### Yellow alert — Investigate
1. Identify which metric crossed the yellow threshold
2. Check Sentry for new error types — is it one error repeating or many different errors?
3. Check if the issue correlates with a specific user action or traffic spike
4. Post in war room: "[ENG] Yellow alert: [metric] at [value]. Investigating."
5. If trending toward red: begin preparing rollback
6. Time-box investigation to 15 minutes. If not resolved, escalate to IC.

### Red alert — Rollback candidate
1. Post in war room: "[ENG] Red alert: [metric] at [value]. Recommending rollback."
2. IC makes rollback decision within 5 minutes
3. If rollback approved: execute rollback plan (see rollback-plan-template.md)
4. If rollback not approved (e.g., metric is high but stable and declining): monitor every 2 min for 10 min
5. Comms Lead: update status page within 10 minutes of red alert
6. Support Lead: begin using incident canned responses

### Payment failure spike
1. Check Stripe dashboard — is it a Stripe outage? (status.stripe.com)
2. If Stripe is healthy: check webhook handler logs for errors
3. If webhook handler is failing: rollback if code change caused it, or fix forward if configuration issue
4. If Stripe is down: post status page update, enable graceful degradation if available
5. NEVER silently lose payment events — verify webhook replay after resolution

### Signup/auth broken
1. This is ALWAYS a red alert — you are losing every new visitor
2. Check auth provider status (Auth0, Clerk, Supabase Auth, etc.)
3. If auth provider is healthy: check your auth middleware / callback handlers
4. Rollback immediately if caused by your deploy
5. If auth provider is down: post status page, wait, consider fallback auth if available
```

---

### Post-Launch Review Templates

```markdown
# Day 1 Review (T+24h)
**Date:** [CUSTOMIZE: YYYY-MM-DD]
**Attendees:** [CUSTOMIZE: names]

## Metrics Summary
- Total signups: [CUSTOMIZE]
- Signup conversion rate: [CUSTOMIZE: signups / unique visitors]
- Paid conversions: [CUSTOMIZE]
- Revenue: [CUSTOMIZE]
- Peak concurrent users: [CUSTOMIZE]
- Error rate (24h avg): [CUSTOMIZE]
- p95 latency (24h avg): [CUSTOMIZE]
- Uptime: [CUSTOMIZE]
- Support tickets opened: [CUSTOMIZE]

## Incidents
| Time | Severity | Description | Resolution | Duration |
|------|----------|-------------|------------|----------|
| [CUSTOMIZE] | [SEV1/2/3] | [CUSTOMIZE] | [CUSTOMIZE] | [CUSTOMIZE] |

## User Feedback Themes
1. [CUSTOMIZE: top positive feedback]
2. [CUSTOMIZE: top negative feedback / friction points]
3. [CUSTOMIZE: most requested feature or improvement]

## Immediate Action Items
- [ ] [CUSTOMIZE: P0 bugs to fix today]
- [ ] [CUSTOMIZE: quick wins from user feedback]
- [ ] [CUSTOMIZE: monitoring adjustments needed]

---

# Week 1 Review (T+7d)
**Date:** [CUSTOMIZE: YYYY-MM-DD]

## Growth Metrics
- Total signups (7d): [CUSTOMIZE]
- Daily active users (DAU): [CUSTOMIZE]
- Day 1 retention: [CUSTOMIZE: % of D0 users who returned on D1]
- Day 7 retention: [CUSTOMIZE: % of D0 users who returned on D7]
- Paid conversion rate: [CUSTOMIZE: % of signups who paid]
- Revenue (7d): [CUSTOMIZE]
- Churn (if subscription): [CUSTOMIZE]

## Technical Health
- Average error rate (7d): [CUSTOMIZE]
- p95 latency trend: [stable / improving / degrading]
- Incidents this week: [CUSTOMIZE: count and brief descriptions]
- Technical debt identified: [CUSTOMIZE: list items]

## Channel Performance
- Product Hunt: [CUSTOMIZE: rank, upvotes, comments]
- Hacker News: [CUSTOMIZE: points, comments]
- Social media: [CUSTOMIZE: impressions, engagement]
- Organic search: [CUSTOMIZE: impressions, clicks]
- Email: [CUSTOMIZE: open rate, click rate]

## Week 2 Priorities
1. [CUSTOMIZE: top priority based on data]
2. [CUSTOMIZE: ...]
3. [CUSTOMIZE: ...]

---

# Month 1 Review (T+30d)
**Date:** [CUSTOMIZE: YYYY-MM-DD]

## Business Metrics
- Total signups (30d): [CUSTOMIZE]
- Monthly active users (MAU): [CUSTOMIZE]
- Day 30 retention: [CUSTOMIZE]
- Monthly recurring revenue (MRR): [CUSTOMIZE]
- Customer acquisition cost (CAC): [CUSTOMIZE: total spend / paying customers]
- Lifetime value estimate (LTV): [CUSTOMIZE: avg revenue per user * expected months]

## Technical Health
- Uptime (30d): [CUSTOMIZE: target 99.9%]
- Average error rate (30d): [CUSTOMIZE]
- p95 latency (30d avg): [CUSTOMIZE]
- Total incidents: [CUSTOMIZE: count by severity]
- Mean time to resolve (MTTR): [CUSTOMIZE]

## What Worked
1. [CUSTOMIZE]
2. [CUSTOMIZE]
3. [CUSTOMIZE]

## What Didn't Work
1. [CUSTOMIZE]
2. [CUSTOMIZE]
3. [CUSTOMIZE]

## Roadmap Adjustment
Based on 30 days of real user data, adjust priorities:
- [ ] [CUSTOMIZE: features to prioritize based on usage data]
- [ ] [CUSTOMIZE: features to deprioritize based on low adoption]
- [ ] [CUSTOMIZE: technical investments needed (scaling, reliability, performance)]
- [ ] [CUSTOMIZE: growth experiments to run in month 2]
```

---

## Customization notes

- **Scale the checklists**: Solo founders shipping to <100 users can skip load testing and shift handoffs. Teams targeting 1K+ users on launch day should complete everything.
- **Adjust thresholds**: The metric thresholds in the monitoring protocol are defaults for a typical SaaS. If your baseline p95 is 50ms, a 2x threshold is 100ms. If your baseline is 800ms, 2x is 1.6s. Set thresholds relative to YOUR baselines.
- **Load test targets**: Base your concurrent user estimate on your waitlist size and marketing reach. Rule of thumb: 5-10% of your launch-day unique visitors will be concurrent at peak.
- **Post-launch reviews are not optional**: The Day 1 review catches fires. The Week 1 review catches trends. The Month 1 review catches strategic misses. Skip them and you are flying blind.

## Companion tools

- Sentry — error tracking and performance monitoring
- Better Uptime / Checkly — uptime monitoring and status pages
- Grafana / Datadog — custom monitoring dashboards
- k6 / Artillery — load testing
- Stripe Dashboard — payment monitoring
- Google Analytics / PostHog / Plausible — signup and conversion tracking
