# Rollback Plan Template

## When to use
Write a rollback plan BEFORE every production deployment — fill in this template, share it in your war room channel, and keep it open during deploy so you can act in seconds, not minutes.

## Decision framework

```
Something is wrong after deploy — should we rollback?
│
├── Are users experiencing data corruption or data loss?
│   → YES: Rollback IMMEDIATELY. This is the highest severity.
│
├── Are payment flows broken (charges failing, double-charging, webhooks lost)?
│   → YES: Kill feature flag if flagged. Otherwise rollback IMMEDIATELY.
│
├── Is the error rate > 5% of requests?
│   → YES: Rollback now. Investigate after stable.
│
├── Is the error rate > 1% but < 5%?
│   → Is it climbing? → YES: Rollback now.
│   → Is it stable/declining? → Monitor for 10 min. Rollback if not resolved.
│
├── Is p95 latency > 3x baseline?
│   → Is it affecting user experience? → YES: Rollback.
│   → Is it only on non-critical paths? → Monitor, consider rollback if sustained > 15 min.
│
├── Are users unable to sign up or log in?
│   → YES: Rollback IMMEDIATELY. You are losing every new visitor.
│
├── Is the issue cosmetic only (typo, wrong color, layout shift)?
│   → NO rollback. Deploy a hotfix.
│
└── Not sure what is happening?
    → Rollback anyway. You can always re-deploy after investigation.
    → The cost of an unnecessary rollback is minutes.
    → The cost of staying deployed while broken is users.
```

**The golden rule**: When in doubt, roll back. A rollback costs you 2-5 minutes. Staying deployed while broken costs you users, revenue, and trust.

---

## Copy-paste template

```markdown
# Rollback Plan
**Release:** [CUSTOMIZE: version or release name]
**Deploy date:** [CUSTOMIZE: YYYY-MM-DD HH:MM timezone]
**Author:** [CUSTOMIZE: name]
**Rollback owner:** [CUSTOMIZE: name — person authorized to execute rollback]

---

## 1. Pre-deploy snapshot

Before deploying, record the current state so you know what "before" looks like.

- [ ] Current production commit: `[CUSTOMIZE: git rev-parse HEAD output]`
- [ ] Current deployment ID: `[CUSTOMIZE: Vercel deployment URL / ECS task def / Railway deploy ID]`
- [ ] Database migration version: `[CUSTOMIZE: current migration ID or timestamp]`
- [ ] Feature flag states: [CUSTOMIZE: list flags and their current on/off state]
- [ ] Database backup taken: [ ] Yes — backup ID: `[CUSTOMIZE: backup identifier]`
- [ ] Screenshot of current metrics baseline: [ ] Saved (error rate, p95 latency, CPU)

---

## 2. What changed in this deploy

| Change type | Description | Reversible? |
|-------------|-------------|-------------|
| Code | [CUSTOMIZE: summary of code changes] | Yes (git revert) |
| DB migration | [CUSTOMIZE: migration description or "none"] | [CUSTOMIZE: Yes (has down migration) / No (destructive)] |
| Feature flags | [CUSTOMIZE: flags being toggled or "none"] | Yes (toggle back) |
| Env vars | [CUSTOMIZE: new/changed env vars or "none"] | Yes (revert values) |
| Infrastructure | [CUSTOMIZE: scaling, DNS, CDN changes or "none"] | [CUSTOMIZE: Yes/No] |
| Third-party | [CUSTOMIZE: API version upgrades, new integrations or "none"] | [CUSTOMIZE: Yes/No] |

---

## 3. Rollback procedures

### Option A: Feature flag kill (< 1 minute)
**Use when:** The change is behind a feature flag.

- [ ] Disable the feature flag:
  - **LaunchDarkly:** Dashboard → [CUSTOMIZE: flag name] → Toggle OFF
  - **Flagsmith:** Dashboard → [CUSTOMIZE: flag name] → Toggle OFF
  - **Environment variable:**
    ```bash
    # [CUSTOMIZE: your platform]
    # Vercel
    vercel env rm [CUSTOMIZE: FLAG_NAME] production
    vercel --prod

    # Railway
    railway variables set [CUSTOMIZE: FLAG_NAME]=false

    # Fly.io
    fly secrets set [CUSTOMIZE: FLAG_NAME]=false

    # AWS (SSM Parameter Store)
    aws ssm put-parameter --name "/prod/[CUSTOMIZE: FLAG_NAME]" --value "false" --overwrite
    ```
- [ ] Verify: feature is no longer visible to users
- [ ] Monitor error rate for 5 minutes — should return to baseline
- [ ] Post in war room: "Feature flag [name] killed. Monitoring."

### Option B: Platform rollback (< 2 minutes)
**Use when:** Stateless app changes (no DB migration involved).

```bash
# Vercel — rollback to previous deployment
vercel rollback
# Or rollback to a specific deployment:
vercel rollback [CUSTOMIZE: deployment-url]

# Railway — rollback to previous deploy
railway rollback

# Fly.io — rollback to previous release
fly releases rollback
# Or rollback to a specific release:
fly releases rollback [CUSTOMIZE: release-version]

# AWS ECS — update service to previous task definition
aws ecs update-service \
  --cluster [CUSTOMIZE: cluster-name] \
  --service [CUSTOMIZE: service-name] \
  --task-definition [CUSTOMIZE: previous-task-def-arn] \
  --force-new-deployment

# Heroku — rollback to previous release
heroku rollback -a [CUSTOMIZE: app-name]

# Kubernetes — rollback deployment
kubectl rollout undo deployment/[CUSTOMIZE: deployment-name] -n [CUSTOMIZE: namespace]
```

- [ ] Execute platform rollback command
- [ ] Verify: health check endpoint returns 200
- [ ] Verify: app loads correctly in browser
- [ ] Monitor error rate for 5 minutes — should return to baseline
- [ ] Post in war room: "Rolled back to previous deployment. Monitoring."

### Option C: Git revert + redeploy (< 10 minutes)
**Use when:** Platform rollback is not available or multiple commits need reverting.

```bash
# Revert the merge commit (if deployed via merge)
git revert -m 1 [CUSTOMIZE: merge-commit-hash]
git push origin main

# Or revert a range of commits
git revert --no-commit [CUSTOMIZE: oldest-commit]..[CUSTOMIZE: newest-commit]
git commit -m "revert: rollback release [CUSTOMIZE: version]"
git push origin main

# Wait for CI/CD to deploy, or force a deploy:
# [CUSTOMIZE: your deploy command]
```

- [ ] Create revert commit
- [ ] Push to main / trigger deploy
- [ ] Wait for deploy to complete
- [ ] Verify: health check endpoint returns 200
- [ ] Verify: app loads correctly in browser
- [ ] Monitor error rate for 5 minutes
- [ ] Post in war room: "Git revert deployed. Monitoring."

### Option D: Database rollback (< 15-30 minutes)
**Use when:** A database migration caused the issue.

#### D1 — Reverse migration (if available)
```bash
# [CUSTOMIZE: your migration tool]
# Prisma
npx prisma migrate resolve --rolled-back [CUSTOMIZE: migration-name]

# Drizzle
npx drizzle-kit drop [CUSTOMIZE: migration-name]

# Knex
npx knex migrate:down

# Rails
rails db:rollback STEP=1

# Django
python manage.py migrate [CUSTOMIZE: app-name] [CUSTOMIZE: previous-migration-number]
```

- [ ] Run reverse migration on production
- [ ] Verify: database schema matches pre-deploy state
- [ ] Verify: application works with reverted schema
- [ ] Post in war room: "DB migration reversed. Monitoring."

#### D2 — Point-in-time restore (if migration is not reversible)
```bash
# [CUSTOMIZE: your database provider]

# AWS RDS — restore to point in time
aws rds restore-db-instance-to-point-in-time \
  --source-db-instance-identifier [CUSTOMIZE: db-instance-id] \
  --target-db-instance-identifier [CUSTOMIZE: db-instance-id]-restored \
  --restore-time [CUSTOMIZE: ISO-8601-timestamp-before-deploy]

# Supabase — restore from backup
# Use Supabase Dashboard → Database → Backups → Restore to point in time

# PlanetScale — restore from backup branch
# Use PlanetScale Dashboard → Backups → Restore

# Neon — restore from branch point
neon branches create --name recovery --parent [CUSTOMIZE: branch-name] \
  --set-time [CUSTOMIZE: ISO-8601-timestamp]
```

- [ ] Identify the pre-deploy timestamp: `[CUSTOMIZE: YYYY-MM-DDTHH:MM:SSZ]`
- [ ] Initiate point-in-time restore
- [ ] Update connection string to restored instance (if separate instance)
- [ ] Verify: data integrity — spot-check recent records
- [ ] Verify: application connects and operates correctly
- [ ] Post in war room: "DB restored to pre-deploy state. Monitoring."

**WARNING**: Point-in-time restore will lose any data written AFTER the restore point. Assess data loss before proceeding.

---

## 4. Communication templates

### Internal — Slack war room message
```
@channel 🔴 ROLLBACK INITIATED

**What:** Rolling back release [CUSTOMIZE: version]
**Why:** [CUSTOMIZE: error rate spike / payment failures / auth broken / etc.]
**Method:** [CUSTOMIZE: feature flag kill / platform rollback / git revert / DB restore]
**ETA to stable:** [CUSTOMIZE: 2 min / 10 min / 30 min]
**Owner:** @[CUSTOMIZE: rollback-owner]

Will post update when stable.
```

### Internal — Rollback complete
```
@channel ✅ ROLLBACK COMPLETE

**Rolled back at:** [CUSTOMIZE: HH:MM timezone]
**Stable since:** [CUSTOMIZE: HH:MM timezone]
**Method used:** [CUSTOMIZE: method]
**Data loss:** [CUSTOMIZE: none / describe impact]
**Next steps:** Post-mortem scheduled for [CUSTOMIZE: date/time]

Resuming normal monitoring cadence.
```

### External — Status page update (during rollback)
```
Title: Investigating increased error rates
Status: Investigating

We are aware of issues affecting [CUSTOMIZE: describe impact in user terms, e.g., "login functionality" or "checkout"]. Our team is actively investigating and working on a fix. We will provide updates every 15 minutes.
```

### External — Status page update (resolved)
```
Title: Issue resolved
Status: Resolved

The issue affecting [CUSTOMIZE: feature] has been resolved. Some users may need to refresh their browser. We apologize for the inconvenience and are conducting a thorough review to prevent recurrence.

Duration: [CUSTOMIZE: start time] - [CUSTOMIZE: end time] ([CUSTOMIZE: X] minutes)
```

### External — Customer email (for significant incidents)
```
Subject: [CUSTOMIZE: App Name] — Service disruption resolved

Hi [CUSTOMIZE: name / "there"],

Earlier today, [CUSTOMIZE: App Name] experienced a [CUSTOMIZE: brief / X-minute] service disruption affecting [CUSTOMIZE: what was impacted]. The issue has been fully resolved.

What happened: [CUSTOMIZE: 1-2 sentence non-technical explanation]
What we did: [CUSTOMIZE: 1-2 sentence explanation of fix]
What we're doing to prevent this: [CUSTOMIZE: 1-2 sentence prevention plan]

[CUSTOMIZE: If data was affected: "Your data was not affected by this issue." OR describe impact honestly.]

We apologize for the disruption. If you have questions, reply to this email or contact us at [CUSTOMIZE: support@yourapp.com].

— The [CUSTOMIZE: App Name] Team
```

---

## 5. Post-rollback checklist

- [ ] Confirm production is stable (error rate at baseline for 15+ minutes)
- [ ] Notify team in war room that rollback is complete
- [ ] Update status page to "Resolved"
- [ ] If customer-facing impact > 5 minutes, send customer communication
- [ ] Log the incident: what happened, timeline, root cause (preliminary)
- [ ] Schedule post-mortem within 48 hours
- [ ] Create ticket for the fix (do not re-deploy the same code)
- [ ] If DB was restored: audit for data loss, notify affected users if needed
```

---

## Customization notes

- **Test your rollback on staging**: Before launch day, actually execute a rollback on staging to verify the procedure works and measure how long it takes. A rollback plan you have never tested is a hope, not a plan.
- **Pre-fill before deploy**: Fill in the commit hashes, deployment IDs, and backup identifiers BEFORE you deploy, not after things are on fire.
- **Feature flags are your fastest rollback**: If you can feature-flag a change, always do so. A flag kill takes seconds. A git revert takes minutes. A DB restore takes tens of minutes.
- **Comms templates are not optional**: Write them before you need them. When production is down, you will not write good copy under pressure. Fill in the templates now, store them in the war room channel.

## Companion tools

- Sentry — real-time error rate monitoring to trigger rollback decisions
- Vercel / Railway / Fly.io CLI — platform-native rollback commands
- PlanetScale / Neon / Supabase — managed database backup and point-in-time restore
- LaunchDarkly / Flagsmith — feature flag management for instant rollbacks
- Better Uptime / Statuspage.io — public status page for external communication
