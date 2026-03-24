# Incident Response Template

## When to use
Reference this guide when defining your incident response process, responding to a live incident, writing post-mortems, or setting up communication templates for internal and external stakeholders.

## Decision framework

```
An alert fires or a user reports an issue — what do you do?

DETECT
├── Automated alert (monitoring / Sentry / health check)?
│   └── Check alert severity → assign SEV level below
├── User report (support ticket / social media)?
│   └── Reproduce → assess blast radius → assign SEV level
└── Internal discovery (engineer notices something off)?
    └── Verify with metrics → assign SEV level

TRIAGE → SEV classification (see table below)
├── SEV1? → Page Incident Commander, open war room immediately
├── SEV2? → Page on-call, assemble responders within 15 min
├── SEV3? → Slack thread, fix during business hours
└── SEV4? → Create ticket, schedule for next sprint
```

---

## Severity classification

| Level | Criteria | Response Time | Update Cadence | Example |
|-------|----------|---------------|----------------|---------|
| **SEV1** | Total outage, data loss, security breach, all users affected | Immediate (< 5 min) | Every 15 min | Database down, auth broken for all users, data breach |
| **SEV2** | Major feature broken, significant subset of users affected | < 15 min | Every 30 min | Payment processing failing, API error rate > 10% |
| **SEV3** | Minor feature broken or degraded, workaround exists | < 1 hour (business hours) | As needed | Search slow, non-critical integration failing |
| **SEV4** | Cosmetic issue, minor bug, no significant user impact | Next business day | N/A | UI glitch, typo in email template, non-critical log errors |

---

## Role definitions

| Role | Responsibility | Who |
|------|---------------|-----|
| **Incident Commander (IC)** | Owns the incident end-to-end. Coordinates responders, makes decisions, controls communication cadence. Does NOT debug — delegates. | On-call lead or most senior available engineer |
| **Communications Lead** | Sends internal updates, manages status page, drafts customer notifications. Shields IC from communication overhead. | Product manager, support lead, or designated engineer |
| **Engineering Lead(s)** | Investigate root cause, implement mitigation, deploy fixes. Report findings to IC. | On-call engineer(s) with relevant system knowledge |

> **Solo founder rule**: You are all three roles. Focus on mitigation first, communication second, root cause third.

---

## Response flow

```
DETECT ──→ TRIAGE ──→ COMMUNICATE ──→ MITIGATE ──→ RESOLVE ──→ POST-MORTEM
  │           │            │              │            │             │
  │       Assign SEV    Open channel   Stop the     Deploy fix   Blameless
  │       Assign roles  First update   bleeding     Verify       review
  │       Set timer     Status page    (rollback,   Monitor      Action items
  │                                    feature      24 hours     Lessons
  │                                    flag, scale)
  ▼
 Log detection time (this is your MTTD)
```

---

## Copy-paste template

### Slack incident channel setup

```bash
#!/usr/bin/env bash
# incident/open-incident.sh
# [CUSTOMIZE] Set Slack workspace and bot token

set -euo pipefail

SLACK_BOT_TOKEN="${SLACK_BOT_TOKEN}"         # [CUSTOMIZE] Bot OAuth token (xoxb-...)
INCIDENT_ID="INC-$(date +%Y%m%d-%H%M)"
CHANNEL_NAME="inc-${INCIDENT_ID,,}"          # Lowercase channel name
SEV_LEVEL="${1:-SEV2}"                       # Pass SEV level as first argument
DESCRIPTION="${2:-Incident under investigation}"

# --- Create incident channel ---
CHANNEL_ID=$(curl -s -X POST "https://slack.com/api/conversations.create" \
  -H "Authorization: Bearer ${SLACK_BOT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"${CHANNEL_NAME}\", \"is_private\": false}" \
  | jq -r '.channel.id')

echo "Created channel: #${CHANNEL_NAME} (${CHANNEL_ID})"

# --- Set channel topic ---
curl -s -X POST "https://slack.com/api/conversations.setTopic" \
  -H "Authorization: Bearer ${SLACK_BOT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"channel\": \"${CHANNEL_ID}\",
    \"topic\": \"${SEV_LEVEL} | ${DESCRIPTION} | IC: TBD | Status: Investigating\"
  }" > /dev/null

# --- Post initial message ---
curl -s -X POST "https://slack.com/api/chat.postMessage" \
  -H "Authorization: Bearer ${SLACK_BOT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"channel\": \"${CHANNEL_ID}\",
    \"text\": \":rotating_light: *Incident Declared: ${INCIDENT_ID}*\n\n*Severity*: ${SEV_LEVEL}\n*Description*: ${DESCRIPTION}\n*Status*: Investigating\n*Incident Commander*: TBD — please claim by reacting with :raised_hand:\n\n*Roles needed*:\n- :helmet_with_white_cross: Incident Commander — react :one:\n- :mega: Communications Lead — react :two:\n- :wrench: Engineering Lead — react :three:\n\n*Runbook*: <https://[CUSTOMIZE-your-wiki]/runbooks|View Runbooks>\"
  }" > /dev/null

# --- Notify #incidents channel ---                # [CUSTOMIZE] your main alerts channel
curl -s -X POST "https://slack.com/api/chat.postMessage" \
  -H "Authorization: Bearer ${SLACK_BOT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"channel\": \"#incidents\",
    \"text\": \":rotating_light: *${SEV_LEVEL} Incident Declared*: ${DESCRIPTION}\nJoin: #${CHANNEL_NAME}\"
  }" > /dev/null

echo "Incident ${INCIDENT_ID} opened. Channel: #${CHANNEL_NAME}"
```

### Status page API update script

```ts
// incident/update-status-page.ts
// [CUSTOMIZE] Works with Instatus, Statuspage.io, or BetterUptime APIs

interface StatusUpdate {
  incidentName: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  message: string;
  affectedComponents: string[];    // [CUSTOMIZE] your component IDs
  componentStatus: 'operational' | 'degraded_performance' | 'partial_outage' | 'major_outage';
}

// --- Instatus API ---
// [CUSTOMIZE] Replace with your Instatus page ID and API key
const INSTATUS_API_KEY = process.env.INSTATUS_API_KEY!;  // [CUSTOMIZE]
const INSTATUS_PAGE_ID = process.env.INSTATUS_PAGE_ID!;  // [CUSTOMIZE]

async function createInstatusIncident(update: StatusUpdate): Promise<string> {
  const response = await fetch(
    `https://api.instatus.com/v1/${INSTATUS_PAGE_ID}/incidents`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${INSTATUS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: update.incidentName,
        message: update.message,
        components: update.affectedComponents,
        status: update.status.toUpperCase(),
        notify: true,
        statuses: update.affectedComponents.map((id) => ({
          id,
          status: update.componentStatus.toUpperCase(),
        })),
      }),
    }
  );

  const data = await response.json();
  console.log(`Incident created: ${data.id}`);
  return data.id;
}

async function updateInstatusIncident(
  incidentId: string,
  update: StatusUpdate
): Promise<void> {
  await fetch(
    `https://api.instatus.com/v1/${INSTATUS_PAGE_ID}/incidents/${incidentId}/incident-updates`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${INSTATUS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: update.message,
        status: update.status.toUpperCase(),
        statuses: update.affectedComponents.map((id) => ({
          id,
          status: update.componentStatus.toUpperCase(),
        })),
      }),
    }
  );

  console.log(`Incident ${incidentId} updated: ${update.status}`);
}

// --- Usage ---
// [CUSTOMIZE] Replace component IDs with your actual component IDs
const incident = await createInstatusIncident({
  incidentName: 'Elevated API error rates',
  status: 'investigating',
  message: 'We are investigating elevated error rates on our API. Some requests may fail.',
  affectedComponents: ['component-api-id'],   // [CUSTOMIZE]
  componentStatus: 'partial_outage',
});

// Later: update as you progress
await updateInstatusIncident(incident, {
  incidentName: 'Elevated API error rates',
  status: 'identified',
  message: 'Root cause identified as a misconfigured database connection pool. Deploying fix.',
  affectedComponents: ['component-api-id'],   // [CUSTOMIZE]
  componentStatus: 'partial_outage',
});

// Resolved
await updateInstatusIncident(incident, {
  incidentName: 'Elevated API error rates',
  status: 'resolved',
  message: 'Fix deployed and verified. API error rates have returned to normal.',
  affectedComponents: ['component-api-id'],   // [CUSTOMIZE]
  componentStatus: 'operational',
});
```

---

## Communication templates

### Internal status update (post to Slack incident channel)

```markdown
## Incident Update — [INCIDENT_ID]
**Time**: [CUSTOMIZE: timestamp]
**Severity**: [SEV level]
**Status**: Investigating | Identified | Monitoring | Resolved

### Current situation
[1-2 sentences: what is happening, who is affected]

### Actions taken
- [Action 1]
- [Action 2]

### Next steps
- [What we are doing next]
- [Expected timeline for next update]

### Roles
- **IC**: [Name]
- **Comms**: [Name]
- **Eng Lead**: [Name]
```

### External customer notification (email / status page)

```markdown
Subject: [Service Name] — [Brief description of impact]

We are aware of an issue affecting [describe user-visible impact in plain language].

**What's happening**: [1 sentence, no jargon]
**Who is affected**: [All users / users in region X / users of feature Y]
**What we're doing**: Our team is actively working to resolve this.
**Estimated resolution**: We expect to have an update within [time frame].

We apologize for the inconvenience and will provide updates as we make progress.

— The [CUSTOMIZE: Company Name] Team
```

### Status page update progression

```
INVESTIGATING (T+0):
"We are investigating reports of [issue]. Some users may experience [impact]."

IDENTIFIED (T+15 to T+60):
"We have identified the root cause as [high-level cause]. A fix is being deployed."

MONITORING (T+30 to T+120):
"A fix has been deployed. We are monitoring to confirm the issue is fully resolved."

RESOLVED (when metrics confirm recovery):
"This incident has been resolved. [Brief description of what happened and what was fixed.]
Total duration: [X hours Y minutes]. We will publish a post-mortem within 48 hours."
```

---

## Post-mortem template (blameless)

```markdown
# Post-Mortem: [INCIDENT_ID] — [Brief title]
**Date**: [CUSTOMIZE]
**Severity**: [SEV level]
**Duration**: [Start time] — [End time] ([total duration])
**Authors**: [CUSTOMIZE: Names of post-mortem authors]
**Status**: Draft | Reviewed | Final

---

## Summary
[2-3 sentences: what happened, what was the impact, how was it resolved]

## Impact
- **Users affected**: [number or percentage]
- **Duration of impact**: [time]
- **Revenue impact**: [if applicable, estimated $ or transactions affected]
- **Data loss**: [none / describe if any]
- **SLA impact**: [did this breach any SLA commitments?]

## Timeline (all times in UTC)

| Time | Event |
|------|-------|
| HH:MM | [First sign of issue — automated alert / user report / discovery] |
| HH:MM | [Incident declared, channel opened] |
| HH:MM | [Initial investigation — what was checked first] |
| HH:MM | [Root cause identified] |
| HH:MM | [Mitigation applied — rollback / fix / feature flag] |
| HH:MM | [Service restored, monitoring began] |
| HH:MM | [Incident resolved, all-clear given] |

## Root cause
[Detailed technical explanation. Be specific about what failed and why.
This section should be thorough enough that someone unfamiliar with the system
could understand what went wrong.]

## Detection
- **How was the incident detected?** [Alert / user report / manual discovery]
- **Time to detect (MTTD)**: [time from first symptom to detection]
- **Could we have detected this sooner?** [Yes/No — explain]

## Response
- **Time to mitigate (MTTM)**: [time from detection to mitigation]
- **Time to resolve (MTTR)**: [time from detection to full resolution]
- **What went well in the response?**
  - [Item 1]
  - [Item 2]
- **What could have gone better?**
  - [Item 1]
  - [Item 2]

## Action items

| Priority | Action | Owner | Due date | Status |
|----------|--------|-------|----------|--------|
| P0 | [CUSTOMIZE: Critical fix to prevent recurrence] | @name | YYYY-MM-DD | Open |
| P1 | [CUSTOMIZE: Important improvement] | @name | YYYY-MM-DD | Open |
| P1 | [CUSTOMIZE: Monitoring gap to close] | @name | YYYY-MM-DD | Open |
| P2 | [CUSTOMIZE: Process improvement] | @name | YYYY-MM-DD | Open |

## Lessons learned
1. **What did we learn about our system?**
   [Key technical insight]
2. **What did we learn about our process?**
   [Key process insight]
3. **What would we do differently next time?**
   [Specific changes]

## References
- [Link to incident Slack channel archive]
- [Link to relevant dashboards / graphs]
- [Link to deploy logs or PRs]
```

---

## Customization notes

- **Solo founder**: Simplify roles — you are IC, Comms, and Eng Lead. Focus on: (1) mitigate, (2) update status page, (3) post-mortem within 48 hours. Skip the Slack channel automation and just use a notes doc.
- **Small team (2-5 engineers)**: Designate one person as IC and one as Eng Lead. Use a shared Slack channel for all incidents rather than creating new channels per incident. Post-mortems can be shorter but still cover root cause and action items.
- **Growing team (5+ engineers)**: Implement the full process. Automate channel creation. Establish on-call rotations. Track MTTD/MTTM/MTTR metrics over time. Review post-mortem action item completion weekly.
- **Compliance (SOC 2)**: Retain all post-mortems. Track action item completion rates. Document your incident response process and review it annually. Auditors will ask for incident logs and evidence of follow-through.

## Companion tools

- `getsentry/sentry-for-claude` — Auto-create incidents from Sentry issue spikes
- PagerDuty / Opsgenie — Automated paging and escalation
- Instatus / Statuspage.io — Hosted status pages with API
- `phrazzld/claude-config` -> `/check-incident-process` — Validate incident response readiness
