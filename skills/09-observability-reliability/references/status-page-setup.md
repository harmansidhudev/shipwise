# Status Page Setup

## When to use
Reference this guide when choosing and setting up a public status page, defining components and incident templates, or automating status updates from your CI/CD pipeline.

## Decision framework

```
Which status page provider fits your stage?

├── Need free + fast setup, < 1K users?
│   └── Instatus (free tier: 1 page, unlimited components, API access)
│
├── Need enterprise features, SSO, SLA tracking?
│   └── Statuspage.io (Atlassian) — starts at $29/mo, deep Jira/Opsgenie integration
│
├── Need uptime monitoring + status page in one tool?
│   └── Better Uptime — combined monitoring + status page, free tier available
│
├── Need full control, no vendor dependency?
│   └── Self-hosted: Cachet (PHP) or Gatus (Go) — free, requires hosting
│
└── Just need something today with zero config?
    └── Instatus or Better Uptime free tier — both set up in < 10 minutes
```

### Provider comparison

| Feature | Instatus | Statuspage.io | Better Uptime | Self-hosted (Gatus) |
|---------|----------|---------------|---------------|---------------------|
| **Free tier** | 1 page, unlimited components | No (14-day trial) | 10 monitors, 1 page | Free (host yourself) |
| **Paid starts at** | $20/mo | $29/mo | $20/mo | Hosting costs only |
| **API for automation** | Yes | Yes | Yes | Yes |
| **Custom domain** | Paid | Paid | Paid | Yes (you own it) |
| **Subscriber notifications** | Email, webhook | Email, SMS, webhook | Email, SMS, Slack | Webhook, Slack |
| **Uptime monitoring built-in** | No | No | Yes | Yes |
| **Incident templates** | Yes | Yes | Yes | Manual |
| **SSO / team management** | Paid | Yes | Paid | DIY |
| **Best for** | Startups, indie devs | Enterprise, Atlassian shops | All-in-one monitoring | Full control, privacy |

---

## Component definitions

Define one component per user-visible system boundary. Keep the list short (5-8 components max) so customers can quickly find what matters.

```
[CUSTOMIZE] Typical SaaS component list:

Component              Description                          Affects
─────────────────────────────────────────────────────────────────────
API                    Core REST/GraphQL API                All integrations
Web Application        Main web UI (app.yoursite.com)       Browser users
Authentication         Login, signup, SSO, session mgmt     All users
Database               Primary data store                   All features
Payments               Billing, subscriptions, invoices     Paying customers
Email / Notifications  Transactional email, push, SMS       All users
CDN / Static Assets    Images, JS, CSS delivery             Page load speed
Background Jobs        Async processing, queues, cron       Delayed features
```

> **Tip**: Do NOT expose internal infrastructure names (e.g., "us-east-1 Redis cluster"). Use customer-facing names that match how users think about your product.

---

## Incident template with severity and update cadence

```markdown
# Incident: [Brief title]

## Severity: [SEV1 | SEV2 | SEV3 | SEV4]
## Affected components: [List]
## Start time: [ISO timestamp]

### Update cadence by severity:
- SEV1: Every 15 minutes until resolved
- SEV2: Every 30 minutes until resolved
- SEV3: Initial update + resolution update
- SEV4: Resolution update only

### Status progression:
1. INVESTIGATING — "We are aware of [impact] and investigating."
2. IDENTIFIED — "Root cause identified: [high-level]. Fix in progress."
3. MONITORING — "Fix deployed. Monitoring for stability."
4. RESOLVED — "Resolved. Duration: [X]. Post-mortem to follow."
```

---

## Copy-paste template

### Instatus API — create incident (curl)

```bash
#!/usr/bin/env bash
# status-page/create-incident.sh
# [CUSTOMIZE] Set your Instatus credentials

set -euo pipefail

INSTATUS_API_KEY="${INSTATUS_API_KEY}"        # [CUSTOMIZE] your API key
PAGE_ID="${INSTATUS_PAGE_ID}"                 # [CUSTOMIZE] your page ID

# [CUSTOMIZE] Set incident details
INCIDENT_NAME="Elevated API error rates"
INCIDENT_MESSAGE="We are investigating elevated error rates on our API. Some requests may fail or take longer than expected."
INCIDENT_STATUS="INVESTIGATING"               # INVESTIGATING | IDENTIFIED | MONITORING | RESOLVED
COMPONENT_IDS='["your-component-id-here"]'    # [CUSTOMIZE] array of component IDs
COMPONENT_STATUS="PARTIALOUTAGE"              # OPERATIONAL | DEGRADEDPERFORMANCE | PARTIALOUTAGE | MAJOROUTAGE

curl -s -X POST "https://api.instatus.com/v1/${PAGE_ID}/incidents" \
  -H "Authorization: Bearer ${INSTATUS_API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"${INCIDENT_NAME}\",
    \"message\": \"${INCIDENT_MESSAGE}\",
    \"components\": ${COMPONENT_IDS},
    \"status\": \"${INCIDENT_STATUS}\",
    \"notify\": true,
    \"statuses\": [
      {
        \"id\": $(echo "${COMPONENT_IDS}" | jq -r '.[0]' | xargs -I{} echo '"{}"'),
        \"status\": \"${COMPONENT_STATUS}\"
      }
    ]
  }" | jq '.id'
```

### Instatus API — create and update incident (TypeScript)

```ts
// status-page/instatus-client.ts
// [CUSTOMIZE] Replace API key and page ID with your values

// --- Configuration ---
const INSTATUS_API_KEY = process.env.INSTATUS_API_KEY!;  // [CUSTOMIZE]
const INSTATUS_PAGE_ID = process.env.INSTATUS_PAGE_ID!;  // [CUSTOMIZE]
const BASE_URL = `https://api.instatus.com/v1/${INSTATUS_PAGE_ID}`;

// --- Types ---
type IncidentStatus = 'INVESTIGATING' | 'IDENTIFIED' | 'MONITORING' | 'RESOLVED';
type ComponentStatus = 'OPERATIONAL' | 'DEGRADEDPERFORMANCE' | 'PARTIALOUTAGE' | 'MAJOROUTAGE';

interface IncidentOptions {
  name: string;
  message: string;
  status: IncidentStatus;
  componentIds: string[];          // [CUSTOMIZE] your component IDs
  componentStatus: ComponentStatus;
  notify?: boolean;
}

// --- API helpers ---
async function instatusRequest(path: string, method: string, body?: object): Promise<any> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${INSTATUS_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Instatus API error (${response.status}): ${error}`);
  }

  return response.json();
}

// --- Create incident ---
export async function createIncident(options: IncidentOptions): Promise<string> {
  const data = await instatusRequest('/incidents', 'POST', {
    name: options.name,
    message: options.message,
    components: options.componentIds,
    status: options.status,
    notify: options.notify ?? true,
    statuses: options.componentIds.map((id) => ({
      id,
      status: options.componentStatus,
    })),
  });

  console.log(`Incident created: ${data.id}`);
  return data.id;
}

// --- Update incident ---
export async function updateIncident(
  incidentId: string,
  options: Omit<IncidentOptions, 'name'>
): Promise<void> {
  await instatusRequest(`/incidents/${incidentId}/incident-updates`, 'POST', {
    message: options.message,
    status: options.status,
    statuses: options.componentIds.map((id) => ({
      id,
      status: options.componentStatus,
    })),
  });

  console.log(`Incident ${incidentId} updated: ${options.status}`);
}

// --- Update component status directly (no incident) ---
export async function updateComponentStatus(
  componentId: string,            // [CUSTOMIZE]
  status: ComponentStatus
): Promise<void> {
  await instatusRequest(`/components/${componentId}`, 'PUT', {
    status,
  });

  console.log(`Component ${componentId} updated: ${status}`);
}

// --- Usage example ---
// [CUSTOMIZE] Replace component IDs with your actual values
async function example() {
  // Create new incident
  const incidentId = await createIncident({
    name: 'API latency elevated',
    message: 'We are investigating elevated latency on our API endpoints.',
    status: 'INVESTIGATING',
    componentIds: ['clxxxx-api-component-id'],  // [CUSTOMIZE]
    componentStatus: 'DEGRADEDPERFORMANCE',
  });

  // Update as investigation progresses
  await updateIncident(incidentId, {
    message: 'Root cause identified: database connection pool exhaustion. Deploying fix.',
    status: 'IDENTIFIED',
    componentIds: ['clxxxx-api-component-id'],  // [CUSTOMIZE]
    componentStatus: 'DEGRADEDPERFORMANCE',
  });

  // Mark resolved
  await updateIncident(incidentId, {
    message: 'Fix deployed. API latency has returned to normal levels.',
    status: 'RESOLVED',
    componentIds: ['clxxxx-api-component-id'],  // [CUSTOMIZE]
    componentStatus: 'OPERATIONAL',
  });
}
```

### GitHub Actions — update status page on deploy failure

```yaml
# .github/workflows/deploy-status.yml
# [CUSTOMIZE] Set secrets in GitHub repo settings:
#   INSTATUS_API_KEY, INSTATUS_PAGE_ID, INSTATUS_API_COMPONENT_ID

name: Update Status Page on Deploy Failure

on:
  workflow_run:
    workflows: ["Deploy"]           # [CUSTOMIZE] your deploy workflow name
    types: [completed]

jobs:
  update-status-page:
    runs-on: ubuntu-latest
    if: ${{ github.event.workflow_run.conclusion == 'failure' }}

    steps:
      - name: Create incident on status page
        env:
          INSTATUS_API_KEY: ${{ secrets.INSTATUS_API_KEY }}
          INSTATUS_PAGE_ID: ${{ secrets.INSTATUS_PAGE_ID }}
          COMPONENT_ID: ${{ secrets.INSTATUS_API_COMPONENT_ID }}  # [CUSTOMIZE]
        run: |
          INCIDENT_ID=$(curl -s -X POST \
            "https://api.instatus.com/v1/${INSTATUS_PAGE_ID}/incidents" \
            -H "Authorization: Bearer ${INSTATUS_API_KEY}" \
            -H "Content-Type: application/json" \
            -d "{
              \"name\": \"Deploy failure — investigating impact\",
              \"message\": \"A deployment has failed. We are investigating whether this affects the running service. The previous stable version remains active.\",
              \"components\": [\"${COMPONENT_ID}\"],
              \"status\": \"INVESTIGATING\",
              \"notify\": true,
              \"statuses\": [{
                \"id\": \"${COMPONENT_ID}\",
                \"status\": \"DEGRADEDPERFORMANCE\"
              }]
            }" | jq -r '.id')

          echo "incident_id=${INCIDENT_ID}" >> "$GITHUB_OUTPUT"
          echo "Created incident: ${INCIDENT_ID}"

      - name: Notify team in Slack
        if: success()
        env:
          SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}  # [CUSTOMIZE]
        run: |
          curl -s -X POST "${SLACK_WEBHOOK}" \
            -H "Content-Type: application/json" \
            -d "{
              \"text\": \":warning: Deploy failed — status page incident created. Check <${{ github.event.workflow_run.html_url }}|workflow run> for details.\"
            }"

  # Auto-resolve if a subsequent deploy succeeds
  resolve-on-success:
    runs-on: ubuntu-latest
    if: ${{ github.event.workflow_run.conclusion == 'success' }}

    steps:
      - name: Check for open incidents and resolve
        env:
          INSTATUS_API_KEY: ${{ secrets.INSTATUS_API_KEY }}
          INSTATUS_PAGE_ID: ${{ secrets.INSTATUS_PAGE_ID }}
          COMPONENT_ID: ${{ secrets.INSTATUS_API_COMPONENT_ID }}  # [CUSTOMIZE]
        run: |
          # Get open incidents
          OPEN_INCIDENTS=$(curl -s \
            "https://api.instatus.com/v1/${INSTATUS_PAGE_ID}/incidents" \
            -H "Authorization: Bearer ${INSTATUS_API_KEY}" \
            | jq -r '[.[] | select(.status != "RESOLVED" and (.name | contains("Deploy failure")))][0].id // empty')

          if [ -n "${OPEN_INCIDENTS}" ]; then
            echo "Resolving incident: ${OPEN_INCIDENTS}"
            curl -s -X POST \
              "https://api.instatus.com/v1/${INSTATUS_PAGE_ID}/incidents/${OPEN_INCIDENTS}/incident-updates" \
              -H "Authorization: Bearer ${INSTATUS_API_KEY}" \
              -H "Content-Type: application/json" \
              -d "{
                \"message\": \"A successful deployment has been completed. Service is operating normally.\",
                \"status\": \"RESOLVED\",
                \"statuses\": [{
                  \"id\": \"${COMPONENT_ID}\",
                  \"status\": \"OPERATIONAL\"
                }]
              }"
            echo "Incident resolved."
          else
            echo "No open deploy-failure incidents to resolve."
          fi
```

---

## Customization notes

- **Solo founder / MVP**: Use Instatus free tier or Better Uptime free tier. Set up 3-5 components matching your user-facing services. Manual updates are fine at this stage — just be consistent.
- **Growing startup**: Automate incident creation via API (see scripts above). Connect deploy pipeline to status page. Enable email subscriber notifications.
- **Scale (10K+ users)**: Use a paid tier with custom domain (status.yourcompany.com). Automate component status from health endpoints. Integrate with PagerDuty/Opsgenie so incidents auto-create status page entries. Add SMS notifications for major incidents.
- **Enterprise**: Statuspage.io with SSO, team permissions, and SLA tracking. Integrate with Jira for incident ticket tracking. Use private status pages for internal infrastructure alongside public page for customers.

## Companion tools

- `getsentry/sentry-for-claude` — Trigger status page updates from Sentry alert rules
- Instatus API docs — `https://instatus.com/help/api`
- Better Uptime API docs — `https://betterstack.com/docs/uptime/api`
- `phrazzld/claude-config` -> `/check-status-page` — Validate status page configuration
