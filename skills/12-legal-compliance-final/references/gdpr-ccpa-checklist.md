# GDPR + CCPA Compliance Checklist

> **Disclaimer: Organizational checklists, not legal advice. Consult qualified professionals.**

## When to use

Reference this guide when building your compliance program, handling data subject requests, signing data processing agreements, preparing for a data breach, or conducting annual compliance reviews. Use the data mapping template to inventory your data flows and the DSAR templates for responding to user requests.

## Decision framework

```
Which regulations apply to you?
├── Do you process personal data of EU/EEA residents?
│   └── Yes → GDPR applies (regardless of where your company is based)
│
├── Do you process personal data of UK residents?
│   └── Yes → UK GDPR applies
│
├── Do you do business in California or process data of CA residents?
│   ├── Revenue > $25M? → CCPA/CPRA applies
│   ├── Buy/sell/share data of 100K+ consumers? → CCPA/CPRA applies
│   └── 50%+ revenue from selling personal info? → CCPA/CPRA applies
│
├── Other US states?
│   ├── Colorado (CPA), Connecticut (CTDPA), Virginia (VCDPA), Utah (UCPA)
│   └── Check thresholds — most apply at 100K+ consumers processed
│
└── Multiple regulations?
    └── Build to the strictest standard (GDPR) and add jurisdiction-specific layers
```

---

## 1. Data Mapping

You cannot comply with privacy regulations if you do not know what data you have. Complete this mapping before anything else.

### Data mapping template

```markdown
## Data Inventory — [CUSTOMIZE: PROJECT_NAME]

**Last updated:** [CUSTOMIZE: DATE]
**Owner:** [CUSTOMIZE: NAME/ROLE]

### Personal Data Categories

| # | Data category | Specific fields | Collection method | Storage location | Legal basis (GDPR) | Retention period | Shared with | Transfer outside EEA? |
|---|--------------|-----------------|-------------------|-----------------|-------------------|-----------------|-------------|----------------------|
| 1 | Account info | Name, email, password hash | Registration form | [CUSTOMIZE: DB name, region] | Contract (Art. 6(1)(b)) | Life of account + 30 days | — | [CUSTOMIZE: Yes/No] |
| 2 | Payment data | Card last-4, billing address | Checkout | Stripe (processor) | Contract | 7 years (tax) | Stripe | Yes (US) |
| 3 | Usage analytics | Page views, feature usage, IP | Automatic | [CUSTOMIZE: Analytics tool] | Legitimate interest (Art. 6(1)(f)) | 24 months | [CUSTOMIZE] | [CUSTOMIZE] |
| 4 | Support tickets | Name, email, message content | Support form | [CUSTOMIZE: Helpdesk tool] | Contract | 3 years after resolution | [CUSTOMIZE] | [CUSTOMIZE] |
| 5 | Server logs | IP, user agent, timestamps | Automatic | [CUSTOMIZE: Log service] | Legitimate interest | 90 days | — | [CUSTOMIZE] |
| [CUSTOMIZE: ADD_ROWS] | | | | | | | | |

### Data Flow Diagram

```
[User Browser] → [CDN/Edge] → [App Server] → [Database]
                                    ↓              ↓
                              [Analytics]    [Backup Storage]
                              [Error Tracking]
                              [Email Service]
                              [Payment Processor]
```
<!-- [CUSTOMIZE] Draw your actual data flow -->
```

---

## 2. Lawful Basis Assessment (GDPR)

For each processing activity, you must identify a lawful basis under Article 6.

| Lawful basis | When to use | Key requirement | Example |
|-------------|-------------|-----------------|---------|
| **Consent (Art. 6(1)(a))** | Optional processing, marketing | Freely given, specific, informed, unambiguous; can withdraw | Marketing emails, optional analytics |
| **Contract (Art. 6(1)(b))** | Necessary to provide the service | Must be genuinely necessary, not just convenient | Account management, payment processing |
| **Legitimate interest (Art. 6(1)(f))** | Business need balanced against user rights | Document LIA (Legitimate Interest Assessment) | Security logging, product analytics, fraud prevention |
| **Legal obligation (Art. 6(1)(c))** | Required by law | Cite the specific law | Tax records, AML checks |
| **Vital interests (Art. 6(1)(d))** | Protecting someone's life | Rarely applicable for software | Emergency health services |
| **Public task (Art. 6(1)(e))** | Public authority functions | Rarely applicable for private companies | Government services |

### Legitimate Interest Assessment (LIA) template

```markdown
## Legitimate Interest Assessment

**Processing activity:** [CUSTOMIZE: e.g., Product analytics]
**Date:** [CUSTOMIZE]

### Purpose test
What is the legitimate interest? [CUSTOMIZE: e.g., Understanding product usage
to improve features and user experience]

Is it a genuine interest? [Yes/No]
Is processing necessary for this interest? [Yes/No]

### Necessity test
Is this the least intrusive way to achieve the purpose? [CUSTOMIZE]
Could you achieve the same result with less data? [CUSTOMIZE]

### Balancing test
What is the impact on individuals? [CUSTOMIZE: e.g., Minimal — aggregated
usage data, no sensitive categories]
Would individuals expect this processing? [CUSTOMIZE: e.g., Yes — standard
for web applications]
Are there additional safeguards? [CUSTOMIZE: e.g., Data anonymized after
24 months, no cross-site tracking]

### Decision
Does legitimate interest apply? [Yes/No]
Reviewed by: [CUSTOMIZE]
```

---

## 3. DSAR (Data Subject Access Request) Handling

### DSAR process flow

```
Request received (email, form, in-app)
├── Step 1: Log request (timestamp, channel, type)
│
├── Step 2: Verify identity (within 3 business days)
│   ├── Authenticated user → Verify via logged-in session
│   ├── Email request → Verify via account email confirmation
│   └── Cannot verify → Request additional proof, clock pauses
│
├── Step 3: Determine request type
│   ├── Access (copy of data) → Export all personal data
│   ├── Deletion (right to erasure) → Delete + cascade to processors
│   ├── Rectification (correction) → Update records
│   ├── Portability (machine-readable export) → JSON/CSV export
│   ├── Restriction (stop processing) → Flag account
│   └── Objection (stop specific processing) → Assess and respond
│
├── Step 4: Fulfill request
│   ├── Collect data from all systems (DB, logs, processors, backups)
│   ├── For deletion: cascade to all sub-processors
│   └── For access/portability: compile into structured format
│
├── Step 5: Respond to requester
│   ├── GDPR: within 30 days (extendable +60 days with notice)
│   ├── CCPA: within 45 days (extendable +45 days with notice)
│   └── Include: what action was taken, any exceptions applied
│
└── Step 6: Document everything
    └── Log: request date, type, verification, fulfillment date, response
```

### DSAR response email templates

```markdown
<!-- [CUSTOMIZE] TEMPLATE 1: Acknowledge receipt -->

Subject: Your Data Request — Received [REF-[CUSTOMIZE: ID]]

Dear [CUSTOMIZE: USER_NAME],

We have received your request to [CUSTOMIZE: access / delete / export] your
personal data on [CUSTOMIZE: DATE].

Your request reference number is REF-[CUSTOMIZE: ID].

To protect your privacy, we need to verify your identity before proceeding.
[CUSTOMIZE: Choose one:]
- Since you submitted this request while logged into your account, your
  identity has been verified.
- Please confirm your identity by clicking the verification link sent to your
  registered email address.

We will complete your request within [CUSTOMIZE: 30 days (GDPR) / 45 days
(CCPA)].

If you have questions, contact us at [CUSTOMIZE: PRIVACY_EMAIL].

Regards,
[CUSTOMIZE: COMPANY_NAME] Privacy Team
```

```markdown
<!-- [CUSTOMIZE] TEMPLATE 2: Data access / export fulfillment -->

Subject: Your Data Export — REF-[CUSTOMIZE: ID]

Dear [CUSTOMIZE: USER_NAME],

In response to your data access request (REF-[CUSTOMIZE: ID]), we have
compiled all personal data we hold about you.

**Attached:** your-data-export.json (also available in CSV format upon request)

This export includes data from the following systems:
- Account information (name, email, profile data)
- Usage history
- [CUSTOMIZE: List categories]

The following data was excluded under applicable legal exceptions:
- [CUSTOMIZE: e.g., "None" or specific exemptions like trade secrets,
  third-party data]

This download link expires in 7 days. Please save the file to your device.

If you have questions or believe any data is missing, contact us at
[CUSTOMIZE: PRIVACY_EMAIL].

Regards,
[CUSTOMIZE: COMPANY_NAME] Privacy Team
```

```markdown
<!-- [CUSTOMIZE] TEMPLATE 3: Deletion confirmation -->

Subject: Your Data Has Been Deleted — REF-[CUSTOMIZE: ID]

Dear [CUSTOMIZE: USER_NAME],

We have completed your data deletion request (REF-[CUSTOMIZE: ID]).

**What was deleted:**
- Account information (name, email, profile)
- Usage data and analytics associated with your account
- [CUSTOMIZE: List categories]

**What was retained (legal requirement):**
- Transaction records (retained for [CUSTOMIZE: 7] years per tax law)
- [CUSTOMIZE: Other legally required retention]

**Sub-processor notification:**
We have notified the following data processors to delete your data:
- [CUSTOMIZE: List processors — e.g., Stripe, analytics providers]

Please note that it may take up to [CUSTOMIZE: 30] days for deletion to
propagate through all backup systems.

Your account has been permanently closed. If you wish to use our service
again, you will need to create a new account.

Regards,
[CUSTOMIZE: COMPANY_NAME] Privacy Team
```

---

## 4. Data Export API Endpoint Template

```ts
// api/dsar/export.ts
// [CUSTOMIZE] Adapt to your framework (Next.js API route shown)

import { NextRequest, NextResponse } from 'next/server';

// [CUSTOMIZE] Import your data access layer
// import { db } from '@/lib/db';
// import { verifyDsarToken } from '@/lib/auth';

interface DataExport {
  exportDate: string;
  requestRef: string;
  dataSubject: {
    id: string;
    email: string;
  };
  categories: {
    account: Record<string, unknown>;
    activity: Record<string, unknown>[];
    preferences: Record<string, unknown>;
    communications: Record<string, unknown>[];
    // [CUSTOMIZE] Add your data categories
  };
  processors: string[];
  retentionNote: string;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  // [CUSTOMIZE] Verify the DSAR token or authenticated session
  const token = req.nextUrl.searchParams.get('token');
  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 401 });
  }

  // const dsarRequest = await verifyDsarToken(token);
  // if (!dsarRequest) {
  //   return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  // }

  // [CUSTOMIZE] Replace with your actual data queries
  const userId = 'VERIFIED_USER_ID'; // from dsarRequest

  // const accountData = await db.user.findUnique({ where: { id: userId } });
  // const activityData = await db.activity.findMany({ where: { userId } });
  // const preferencesData = await db.preferences.findUnique({ where: { userId } });
  // const commsData = await db.communications.findMany({ where: { userId } });

  const exportData: DataExport = {
    exportDate: new Date().toISOString(),
    requestRef: 'REF-XXXXX', // [CUSTOMIZE] from dsarRequest
    dataSubject: {
      id: userId,
      email: 'user@example.com', // [CUSTOMIZE] from accountData
    },
    categories: {
      account: {
        // [CUSTOMIZE] All account fields
        // name: accountData.name,
        // email: accountData.email,
        // createdAt: accountData.createdAt,
      },
      activity: [
        // [CUSTOMIZE] All activity records
      ],
      preferences: {
        // [CUSTOMIZE] All preference data
      },
      communications: [
        // [CUSTOMIZE] All emails, notifications sent
      ],
    },
    processors: [
      // [CUSTOMIZE] List all processors that hold this user's data
      'AWS (infrastructure)',
      'Stripe (payments)',
      'Sentry (error tracking)',
    ],
    retentionNote:
      'Transaction records retained for 7 years per tax law. All other data deleted upon request.',
  };

  // Return as downloadable JSON
  return new NextResponse(JSON.stringify(exportData, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="data-export-${userId}.json"`,
    },
  });
}
```

---

## 5. Consent Management

### Consent record schema

```ts
// [CUSTOMIZE] Database schema for consent records

interface ConsentRecord {
  id: string;                  // Unique record ID
  userId: string;              // User or session identifier
  consentType: string;         // 'marketing_email' | 'analytics' | 'cookies' | etc.
  granted: boolean;            // true = opted in, false = opted out
  timestamp: string;           // ISO 8601 when consent was given/withdrawn
  method: string;              // 'signup_form' | 'cookie_banner' | 'settings_page'
  version: string;             // Policy version at time of consent
  ipAddress?: string;          // For audit (hash after recording)
  userAgent?: string;          // For audit
}

// [CUSTOMIZE] Prisma schema example:
// model ConsentRecord {
//   id          String   @id @default(cuid())
//   userId      String
//   consentType String
//   granted     Boolean
//   timestamp   DateTime @default(now())
//   method      String
//   version     String
//   ipHash      String?
//   userAgent   String?
//
//   user User @relation(fields: [userId], references: [id])
//   @@index([userId, consentType])
// }
```

---

## 6. Data Processing Agreement (DPA) Checklist

Before signing a DPA with a sub-processor (or providing one to your customers), verify it covers:

| Requirement | GDPR Article | Check |
|-------------|-------------|-------|
| Subject matter and duration of processing | Art. 28(3) | [ ] |
| Nature and purpose of processing | Art. 28(3) | [ ] |
| Types of personal data processed | Art. 28(3) | [ ] |
| Categories of data subjects | Art. 28(3) | [ ] |
| Obligations of the processor | Art. 28(3)(a-h) | [ ] |
| Process only on documented instructions | Art. 28(3)(a) | [ ] |
| Confidentiality obligations for personnel | Art. 28(3)(b) | [ ] |
| Appropriate technical and organizational security measures | Art. 28(3)(c) | [ ] |
| Conditions for engaging sub-processors | Art. 28(3)(d) | [ ] |
| Assist controller with DSAR obligations | Art. 28(3)(e) | [ ] |
| Assist with security, breach notification, DPIAs | Art. 28(3)(f) | [ ] |
| Delete or return data on termination | Art. 28(3)(g) | [ ] |
| Audit rights for the controller | Art. 28(3)(h) | [ ] |
| Notification before changing sub-processors | Art. 28(2) | [ ] |
| International transfer mechanisms (SCCs) | Art. 28(3) + Ch. V | [ ] |
| Breach notification timeframe to controller | Art. 33(2) | [ ] |

### Common sub-processors to sign DPAs with

| Processor | Category | Typical DPA location |
|-----------|----------|---------------------|
| AWS | Infrastructure | AWS GDPR DPA (auto-accepted in console) |
| Google Cloud | Infrastructure | GCP Data Processing Terms |
| Vercel | Hosting | Vercel DPA (request via support or settings) |
| Stripe | Payments | Stripe DPA (built into ToS) |
| Sentry | Error tracking | Sentry DPA (enterprise plan) |
| SendGrid / Postmark | Email | Check vendor DPA page |
| Mixpanel / Amplitude | Analytics | Check vendor DPA page |
| Intercom / Zendesk | Support | Check vendor DPA page |
| [CUSTOMIZE: ADD_ROWS] | [CUSTOMIZE] | [CUSTOMIZE] |

---

## 7. Breach Notification Procedures

### GDPR breach notification (Article 33 + 34)

```
Data breach detected
├── Hour 0: Contain the breach
│   ├── Isolate affected systems
│   ├── Preserve evidence (logs, access records)
│   └── Assemble incident response team
│
├── Hours 0-24: Assess severity
│   ├── What data was affected? (categories, volume)
│   ├── How many data subjects affected?
│   ├── Is the data encrypted/pseudonymized?
│   ├── Risk to data subjects (identity theft, financial loss, discrimination)?
│   └── Document: who, what, when, how, impact
│
├── Within 72 hours: Notify supervisory authority (Art. 33)
│   ├── Required UNLESS breach is unlikely to result in risk to individuals
│   ├── Include: nature of breach, categories/numbers affected, DPO contact,
│   │   likely consequences, measures taken
│   └── If you cannot provide full details, provide in phases
│
├── Without undue delay: Notify affected individuals (Art. 34)
│   ├── Required IF breach is likely to result in HIGH risk
│   ├── Clear, plain language
│   ├── Include: what happened, what data, what you are doing, what they should do
│   └── NOT required if data was encrypted or risk has been mitigated
│
└── Post-breach: Document everything
    ├── Maintain breach register (all breaches, even if not reported)
    ├── Conduct root cause analysis
    ├── Implement preventive measures
    └── Update DPIA if applicable
```

### CCPA breach notification

```
Data breach detected (unencrypted personal information)
├── Assess: Does it trigger CA Civil Code 1798.82?
│   ├── Unauthorized access to unencrypted personal information
│   └── Personal information = name + SSN, driver license, financial account,
│       medical info, health insurance, biometric, or email+password
│
├── Notify affected California residents
│   ├── "In the most expedient time possible and without unreasonable delay"
│   ├── Written notice (or email if consent given)
│   ├── Include: what happened, what data, what you are doing, contact info
│   └── If 500+ CA residents: also notify CA Attorney General
│
└── Exposure: Private right of action under CCPA
    ├── Statutory damages: $100-$750 per consumer per incident
    ├── OR actual damages (whichever is greater)
    └── 30-day cure period for AG enforcement actions
```

---

## 8. Data Retention Schedule

| Data category | Retention period | Legal basis | Deletion method | Owner |
|--------------|-----------------|-------------|-----------------|-------|
| Account data | Life of account + 30 days | Contract | Soft delete -> hard delete after 30 days | Engineering |
| Authentication logs | 90 days | Legitimate interest (security) | Automatic TTL | Engineering |
| Server/access logs | 90 days | Legitimate interest (debugging) | Log rotation / TTL | DevOps |
| Analytics (identified) | 24 months | Consent or legitimate interest | Anonymize at expiry | Product |
| Analytics (anonymized) | Indefinite | N/A (not personal data) | — | Product |
| Transaction records | 7 years | Legal obligation (tax) | Automated purge | Finance |
| Support tickets | 3 years after resolution | Legitimate interest | Automated purge | Support |
| Marketing consent records | Life of consent + 3 years | Legal obligation (prove consent) | Automated purge | Marketing |
| Breach records | 5 years | Legal obligation | Manual review | Security |
| DPA/contract records | Term + 6 years | Legal obligation | Manual review | Legal |
| [CUSTOMIZE: ADD_ROWS] | [CUSTOMIZE] | [CUSTOMIZE] | [CUSTOMIZE] | [CUSTOMIZE] |

### Automating data purging

```ts
// scripts/data-retention-purge.ts
// [CUSTOMIZE] Run as a daily cron job

// import { db } from '@/lib/db';

async function purgeExpiredData() {
  const now = new Date();

  // [CUSTOMIZE] Adapt to your ORM / database
  const results = {
    // Soft-deleted accounts past grace period (30 days)
    // accounts: await db.user.deleteMany({
    //   where: {
    //     deletedAt: { not: null },
    //     deletedAt: { lt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) },
    //   },
    // }),

    // Server logs older than 90 days
    // logs: await db.serverLog.deleteMany({
    //   where: { createdAt: { lt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) } },
    // }),

    // Analytics older than 24 months — anonymize instead of delete
    // analytics: await db.analytics.updateMany({
    //   where: {
    //     createdAt: { lt: new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000) },
    //     anonymized: false,
    //   },
    //   data: { userId: null, ip: null, anonymized: true },
    // }),

    // Support tickets resolved more than 3 years ago
    // tickets: await db.supportTicket.deleteMany({
    //   where: {
    //     resolvedAt: { not: null },
    //     resolvedAt: { lt: new Date(now.getTime() - 3 * 365 * 24 * 60 * 60 * 1000) },
    //   },
    // }),
  };

  console.log('Data retention purge completed:', results);
  // [CUSTOMIZE] Send results to monitoring/alerting
}

purgeExpiredData().catch(console.error);
```

---

## Annual Compliance Review Checklist

- [ ] Data mapping updated (new fields, processors, features)
- [ ] Lawful basis review (any processing activities changed?)
- [ ] Privacy policy reviewed and updated
- [ ] DPAs in place for all current sub-processors
- [ ] Sub-processor list published and current
- [ ] DSAR process tested (simulate a request end-to-end)
- [ ] Consent records audited (valid consent for all marketing contacts)
- [ ] Retention schedule enforced (verify automated purging is working)
- [ ] Breach response plan tested (tabletop exercise)
- [ ] Cookie audit completed (no undocumented cookies)
- [ ] Employee training completed (annual privacy/security training)
- [ ] Risk assessment updated
- [ ] DPO consulted (if appointed)

---

## Companion tools
- `rohitg00/awesome-claude-code-toolkit` -> `legal-advisor`
- `mcpmarket.com` -> `legal-advisor` skill
- OneTrust, TrustArc — enterprise privacy management platforms
- Ethyca (Fides) — open-source privacy engineering platform
- DataGrail, Transcend — DSAR automation
