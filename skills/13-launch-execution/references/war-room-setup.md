# War Room Setup

## When to use
Set up a war room channel 24-48 hours before any production launch so your team has a single coordination hub with clear roles, escalation paths, and communication cadence on launch day.

## Decision framework

```
What size is your launch team?
├── Solo founder (1 person)?
│   → You wear all 4 hats. Still set up the channel — it becomes your launch log.
│   → Pin the timeline and rollback plan. Talk to yourself in writing.
│   → Benefit: a written record you can review in your post-mortem.
│
├── Small team (2-4 people)?
│   → Assign IC + Engineering Lead to the most technical person.
│   → Assign Comms Lead + Support Lead to the second person.
│   → If 3-4 people: split Comms and Support into separate roles.
│
├── Full team (5+ people)?
│   → Each role gets a dedicated person. IC should NOT also be Engineering Lead.
│   → Consider shift coverage if launch spans > 8 hours.
│   → Add a scribe role: someone who logs every decision and timestamp.
│
└── Multi-timezone team?
    → Define handoff points (e.g., US team covers T-2h to T+8h, EU covers T+8h to T+16h).
    → Each shift has its own IC. Outgoing IC briefs incoming IC.
    → Pin a "current status" message updated at every handoff.
```

---

## Copy-paste template

### Slack channel setup

```markdown
# War Room Channel Setup

## Step 1: Create the channel

Channel name: `#launch-war-room`
Channel topic:
```
[CUSTOMIZE: App Name] Launch Day — [CUSTOMIZE: date] | IC: @[CUSTOMIZE] | Eng: @[CUSTOMIZE] | Comms: @[CUSTOMIZE] | Support: @[CUSTOMIZE] | Status: PRE-LAUNCH
```

Channel description:
```
Dedicated coordination channel for [CUSTOMIZE: App Name] launch. All launch decisions happen here. No DMs for launch topics. Channel will be archived after post-launch review.
```

## Step 2: Pin these messages (in order)

### Pinned Message 1 — Role Assignments
```
📋 LAUNCH ROLES

@[CUSTOMIZE: name] — Incident Commander (IC)
• Owns the launch timeline
• Makes go/no-go decisions
• Approves all external communications
• Approves all post-T-0 deploys
• Final call on rollback decisions

@[CUSTOMIZE: name] — Engineering Lead
• Executes deploys and rollbacks
• Monitors error rates, latency, uptime
• Leads hotfix triage and implementation
• Posts metric updates every 30 min (every 15 min during incidents)
• Owns staging regression sign-off

@[CUSTOMIZE: name] — Comms Lead
• Manages status page updates
• Handles social media posts and PH/HN comments
• Drafts external incident communications
• All external messages approved by IC before sending
• Owns marketing launch sequence

@[CUSTOMIZE: name] — Support Lead
• Monitors support channels (chat, email, social mentions)
• Triages user-reported issues by severity
• Escalates P0/P1 bugs to Engineering Lead
• Maintains count of user reports per issue
• Drafts canned responses for common launch-day issues

Solo founder? You're all four. Still write it down — when things get hectic, check which hat you should be wearing.
```

### Pinned Message 2 — Key Links
```
🔗 KEY LINKS

Staging: [CUSTOMIZE: https://staging.yourapp.com]
Production: [CUSTOMIZE: https://yourapp.com]
Health check: [CUSTOMIZE: https://yourapp.com/api/health]

Monitoring:
• Sentry: [CUSTOMIZE: URL]
• Uptime: [CUSTOMIZE: URL]
• Analytics: [CUSTOMIZE: URL]
• Stripe dashboard: [CUSTOMIZE: URL]
• Hosting dashboard: [CUSTOMIZE: URL]

Docs:
• Launch timeline: [CUSTOMIZE: link to launch-day-sequence]
• Rollback plan: [CUSTOMIZE: link to rollback-plan]
• Staging checklist: [CUSTOMIZE: link to staging-regression-checklist]
• Status page admin: [CUSTOMIZE: URL]
```

### Pinned Message 3 — Escalation Matrix
```
🚨 ESCALATION MATRIX

Severity levels:
• SEV1 (Critical): Users cannot sign up, log in, or pay. Data loss. Full outage.
  → Notify IC immediately. Rollback decision within 5 min. Status page update within 10 min.
• SEV2 (Major): Feature degraded but workaround exists. Significant latency. Partial outage.
  → Notify IC within 15 min. Engineering investigates. Status page if > 15 min.
• SEV3 (Minor): Cosmetic issue, edge case bug, non-critical feature affected.
  → Log in war room. Fix in next hotfix batch or post-launch.

Escalation path:
  User report → Support Lead (triage severity)
  → SEV1/SEV2 → Engineering Lead (investigate)
  → Cannot resolve in 15 min → IC (rollback decision)
  → External impact → Comms Lead (status page + messaging, IC approves)

After-hours page (if applicable):
• IC phone: [CUSTOMIZE: phone or pager number]
• Eng Lead phone: [CUSTOMIZE: phone or pager number]
```

### Pinned Message 4 — War Room Rules
```
📜 WAR ROOM RULES

1. ALL launch communication happens in this channel. No DMs for launch topics.
2. Status updates from @engineering-lead every 30 min. Every 15 min during incidents.
3. No deploys after T-0 without @IC approval.
4. User-reported issues go through @support-lead who triages severity.
5. All external communications drafted by @comms-lead, approved by @IC.
6. If you are unsure about severity, escalate UP, not down.
7. Use threads for investigation details. Keep main channel for status updates and decisions.
8. Prefix messages with your role: [ENG] [COMMS] [SUPPORT] [IC]
9. When in doubt, rollback. We can always re-deploy.
```

### Pinned Message 5 — Status Update Template
```
📊 STATUS UPDATE TEMPLATE (copy-paste every 30 min)

Time: [HH:MM timezone]
Phase: [PRE-LAUNCH / LAUNCHED / MONITORING / INCIDENT / STABLE]

Metrics:
• Error rate: [X.X%] (baseline: [X.X%])
• p95 latency: [Xms] (baseline: [Xms])
• Signups since launch: [N]
• Active users: [N]
• Payment success rate: [X%]
• Uptime: [100% / describe any downtime]

Issues:
• [None / list active issues with severity]

Next action:
• [What happens next and who owns it]
```

## Step 3: Set channel notifications

Recommend all war room members set this channel to:
- **Desktop notifications:** All new messages
- **Mobile notifications:** All new messages (for launch day only)
- **Do Not Disturb:** OFF for launch window

## Step 4: Pre-launch channel test

- [ ] All role holders have joined the channel
- [ ] All pinned messages are posted and visible
- [ ] Key links are correct (click-test each one)
- [ ] Everyone can post messages
- [ ] Notification settings confirmed by each member
- [ ] Post a test status update using the template
```

---

### Handoff procedure (for multi-shift launches)

```markdown
# Shift Handoff Template

**Outgoing:** @[CUSTOMIZE: name] ([CUSTOMIZE: role])
**Incoming:** @[CUSTOMIZE: name] ([CUSTOMIZE: role])
**Handoff time:** [CUSTOMIZE: HH:MM timezone]

## Current status
- Phase: [PRE-LAUNCH / LAUNCHED / MONITORING / INCIDENT / STABLE]
- Hours since launch: [N]
- Error rate: [X.X%] trend: [stable / rising / falling]
- Active issues: [list or "none"]

## Key events this shift
1. [CUSTOMIZE: what happened, decisions made, issues resolved]
2. [CUSTOMIZE: ...]

## Open items for next shift
1. [CUSTOMIZE: what needs attention, pending decisions]
2. [CUSTOMIZE: ...]

## Decisions needed
- [CUSTOMIZE: any pending go/no-go decisions]

**Incoming IC confirmed:** [ ] Yes
```

---

## Customization notes

- **Channel naming**: Use `#launch-war-room` for the primary channel. If you run multiple launches, use `#launch-[feature-name]-war-room`. Archive after post-launch review.
- **Discord alternative**: Same structure applies. Use a dedicated category with channels for `#war-room-main`, `#war-room-metrics`, and `#war-room-support-triage` if your team is 5+.
- **Solo founders**: The war room is your launch log. Talking to yourself in writing forces clear thinking under pressure and gives you a timeline for your post-mortem. Post status updates to yourself every 30 minutes.
- **Timezone coverage**: For launches that span more than 8 hours of active monitoring, plan shift handoffs. Each shift needs its own IC who is empowered to make rollback decisions without waking the other shift.

## Companion tools

- Slack — primary war room platform (free tier works)
- Discord — alternative for teams already on Discord
- Better Uptime / Statuspage.io — public status page linked from war room
- PagerDuty / Opsgenie — after-hours escalation if team is 5+ people
- Google Meet / Zoom — keep a video call open for rapid verbal coordination during incidents
