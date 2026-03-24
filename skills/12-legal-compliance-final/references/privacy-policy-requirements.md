# Privacy Policy Requirements

> **Disclaimer: Organizational checklists, not legal advice. Consult qualified professionals.**

## When to use

Reference this guide when drafting or updating your privacy policy, expanding to new jurisdictions, adding new data collection features, or onboarding new third-party processors. Use the jurisdiction comparison to identify which requirements apply to your user base.

## Decision framework

```
Where are your users?
├── United States only?
│   ├── California users? → CCPA/CPRA required
│   ├── Colorado, Connecticut, Virginia, Utah users? → State privacy laws apply
│   └── Children under 13? → COPPA required
│
├── European Union / EEA?
│   └── GDPR required (Art. 13/14 disclosures)
│
├── United Kingdom?
│   └── UK GDPR + DPA 2018
│
├── Canada?
│   └── PIPEDA (federal) + provincial laws (Quebec Law 25)
│
├── Australia?
│   └── Privacy Act 1988 + APPs (Australian Privacy Principles)
│
└── Multiple jurisdictions?
    └── Write one comprehensive policy covering the strictest requirements
        (GDPR is typically the highest bar)
```

---

## Jurisdiction Comparison

| Requirement | US (General) | California (CCPA/CPRA) | EU (GDPR) | UK (UK GDPR) | Canada (PIPEDA) | Australia (APPs) |
|-------------|-------------|----------------------|-----------|--------------|----------------|-----------------|
| **Privacy policy required** | Sector-specific | Yes | Yes | Yes | Yes | Yes |
| **Legal basis for processing** | No | No | Yes (Art. 6) | Yes | Consent or exception | No (but reasonable purpose) |
| **Right to access** | No (federal) | Yes | Yes (Art. 15) | Yes | Yes | Yes (APP 12) |
| **Right to delete** | No (federal) | Yes | Yes (Art. 17) | Yes | Limited | No explicit right |
| **Right to portability** | No | No | Yes (Art. 20) | Yes | No | No |
| **Data breach notification** | State-specific | Yes (AG notice) | 72 hours (Art. 33) | 72 hours | ASAP (PIPEDA) | Eligible breaches (NDB) |
| **Children's data** | COPPA (<13) | Yes | Yes (Art. 8) | Yes (age 13) | Yes | Yes |
| **DPO required** | No | No | Conditional (Art. 37) | Conditional | No | No |
| **Cross-border transfer rules** | No | No | Yes (Ch. V) | Yes (adequacy) | Yes (accountability) | APP 8 |
| **Max fines** | Varies | $7,500/violation | 4% global revenue | 4% global revenue | CAD $100K | AUD $50M+ |

---

## Required Sections Checklist

Use this checklist to verify your privacy policy covers all required topics. Items marked with a jurisdiction code are required by that regulation.

### Identity and Contact Information
- [ ] Company legal name, address, and registration number
- [ ] Contact email for privacy inquiries
- [ ] DPO contact (if appointed) — **GDPR, UK GDPR**
- [ ] EU representative contact (if non-EU company with EU users) — **GDPR Art. 27**

### Data Collected
- [ ] Categories of personal data collected (name, email, IP, device info, etc.)
- [ ] Categories of sensitive data, if any (health, biometric, racial/ethnic) — **GDPR Art. 9**
- [ ] Data collected automatically (cookies, analytics, server logs)
- [ ] Data collected from third parties (social login, enrichment services)
- [ ] Whether data collection is required or optional

### Legal Basis for Processing — **GDPR, UK GDPR**
- [ ] Legal basis for each processing activity (consent, contract, legitimate interest, legal obligation)
- [ ] Legitimate interest assessment documented (if using legitimate interest)
- [ ] Consent mechanism described (how obtained, how withdrawn)

### Purpose of Processing
- [ ] Specific purposes for each data category (account management, communication, analytics, marketing)
- [ ] Statement that data is not used beyond stated purposes — **GDPR Art. 5(1)(b)**

### Retention Periods
- [ ] Retention period for each data category (or criteria for determining period) — **GDPR Art. 13(2)(a)**
- [ ] What happens to data after retention period expires

### Third-Party Sharing
- [ ] Categories of third-party recipients
- [ ] Named processors (or categories if too many) — **GDPR**
- [ ] Purpose of each sharing arrangement
- [ ] Whether data is "sold" or "shared" for cross-context behavioral advertising — **CCPA/CPRA**

### International Data Transfers — **GDPR, UK GDPR, PIPEDA**
- [ ] Countries where data is transferred
- [ ] Transfer mechanisms (SCCs, adequacy decisions, BCRs)
- [ ] Link to or copy of relevant safeguards

### User Rights
- [ ] Right to access personal data — **GDPR, CCPA, PIPEDA, APPs**
- [ ] Right to rectification — **GDPR, UK GDPR**
- [ ] Right to erasure / deletion — **GDPR, CCPA**
- [ ] Right to restrict processing — **GDPR, UK GDPR**
- [ ] Right to data portability — **GDPR, UK GDPR**
- [ ] Right to object to processing — **GDPR, UK GDPR**
- [ ] Right to opt out of sale/sharing — **CCPA/CPRA**
- [ ] Right to non-discrimination for exercising rights — **CCPA**
- [ ] How to exercise rights (email, form, in-app)
- [ ] Response timeframe (30 days GDPR, 45 days CCPA)
- [ ] Right to lodge complaint with supervisory authority — **GDPR**

### Cookies and Tracking
- [ ] Types of cookies used (necessary, analytics, marketing)
- [ ] Third-party cookies and their purposes
- [ ] Link to cookie policy or consent management
- [ ] How to manage cookie preferences

### Children's Data — **COPPA, GDPR Art. 8**
- [ ] Minimum age for using the service
- [ ] Parental consent mechanism (if applicable)
- [ ] How children's data is handled differently

### Security Measures
- [ ] General description of technical and organizational measures
- [ ] Encryption, access controls, audit logging (high level)

### Automated Decision-Making — **GDPR Art. 22**
- [ ] Whether automated decision-making or profiling is used
- [ ] Logic involved, significance, and consequences
- [ ] Right to human review

### Policy Updates
- [ ] How users are notified of changes
- [ ] Effective date and version number
- [ ] Link to previous versions (best practice)

---

## Copy-paste template

```markdown
# Privacy Policy

**Last updated:** [CUSTOMIZE: DATE]
**Effective date:** [CUSTOMIZE: DATE]
**Version:** 1.0

## Who we are

[CUSTOMIZE: COMPANY_NAME] ("we", "us", "our") operates [CUSTOMIZE: SERVICE_NAME]
([CUSTOMIZE: WEBSITE_URL]). This privacy policy explains how we collect, use,
store, and share your personal information when you use our service.

**Contact:** [CUSTOMIZE: PRIVACY_EMAIL]
**Address:** [CUSTOMIZE: COMPANY_ADDRESS]
<!-- If you have EU users and are based outside the EU: -->
**EU Representative:** [CUSTOMIZE: EU_REP_NAME, EU_REP_ADDRESS]
<!-- If you have appointed a DPO: -->
**Data Protection Officer:** [CUSTOMIZE: DPO_NAME, DPO_EMAIL]

## What data we collect

### Data you provide directly
| Data type | When collected | Required? |
|-----------|---------------|-----------|
| Name, email address | Account registration | Yes |
| [CUSTOMIZE: ADD_ROWS] | [CUSTOMIZE] | [CUSTOMIZE] |

### Data collected automatically
| Data type | How collected | Purpose |
|-----------|--------------|---------|
| IP address, browser type, device info | Server logs | Security, debugging |
| Pages visited, features used | Analytics ([CUSTOMIZE: ANALYTICS_TOOL]) | Product improvement |
| [CUSTOMIZE: ADD_ROWS] | [CUSTOMIZE] | [CUSTOMIZE] |

### Data from third parties
| Source | Data type | Purpose |
|--------|-----------|---------|
| [CUSTOMIZE: e.g., Google OAuth] | Name, email, profile picture | Account creation |
| [CUSTOMIZE: ADD_ROWS] | [CUSTOMIZE] | [CUSTOMIZE] |

## Why we collect your data (legal basis)

<!-- Required for GDPR. List every processing activity and its legal basis. -->

| Purpose | Data used | Legal basis (GDPR) |
|---------|-----------|-------------------|
| Provide the service | Account data | Contract (Art. 6(1)(b)) |
| Send transactional emails | Email address | Contract (Art. 6(1)(b)) |
| Product analytics | Usage data | Legitimate interest (Art. 6(1)(f)) |
| Marketing emails | Email address | Consent (Art. 6(1)(a)) |
| [CUSTOMIZE: ADD_ROWS] | [CUSTOMIZE] | [CUSTOMIZE] |

## How long we keep your data

| Data type | Retention period | After expiration |
|-----------|-----------------|-----------------|
| Account data | Life of account + 30 days | Deleted |
| Server logs | 90 days | Automatically purged |
| Analytics data | 24 months | Anonymized |
| Transaction records | 7 years | Required by tax law |
| [CUSTOMIZE: ADD_ROWS] | [CUSTOMIZE] | [CUSTOMIZE] |

## Who we share your data with

We share personal data with the following categories of third parties:

| Processor | Purpose | Data shared | Location |
|-----------|---------|-------------|----------|
| [CUSTOMIZE: e.g., AWS] | Infrastructure hosting | All service data | [CUSTOMIZE: US/EU] |
| [CUSTOMIZE: e.g., Stripe] | Payment processing | Payment details | [CUSTOMIZE] |
| [CUSTOMIZE: e.g., Sentry] | Error tracking | IP, device info, usage context | [CUSTOMIZE] |
| [CUSTOMIZE: ADD_ROWS] | [CUSTOMIZE] | [CUSTOMIZE] | [CUSTOMIZE] |

We do not sell your personal data. [CUSTOMIZE: If you do share data for
advertising, disclose it here and provide CCPA opt-out instructions.]

## International data transfers

<!-- Required for GDPR/UK GDPR if you transfer data outside EEA/UK -->

Your data may be transferred to and processed in [CUSTOMIZE: COUNTRIES]. We
protect these transfers using:
- Standard Contractual Clauses (SCCs) approved by the European Commission
- [CUSTOMIZE: Other mechanisms — adequacy decisions, BCRs, etc.]

## Cookies and tracking

We use cookies and similar technologies. See our
[Cookie Policy]([CUSTOMIZE: COOKIE_POLICY_URL]) for details.

**Cookie categories:**
- **Strictly necessary:** Required for the service to function (session, CSRF)
- **Analytics:** Help us understand how you use the service ([CUSTOMIZE: TOOL])
- **Marketing:** [CUSTOMIZE: Used for / Not used]

You can manage your cookie preferences at any time via [CUSTOMIZE: CONSENT_MECHANISM].

## Your rights

Depending on your location, you may have the following rights:

| Right | GDPR | CCPA | How to exercise |
|-------|------|------|----------------|
| Access your data | Yes | Yes | [CUSTOMIZE: EMAIL or FORM_URL] |
| Correct your data | Yes | — | [CUSTOMIZE] |
| Delete your data | Yes | Yes | [CUSTOMIZE] |
| Export your data (portability) | Yes | — | [CUSTOMIZE] |
| Restrict processing | Yes | — | [CUSTOMIZE] |
| Object to processing | Yes | — | [CUSTOMIZE] |
| Opt out of sale/sharing | — | Yes | [CUSTOMIZE: "Do Not Sell" link] |
| Withdraw consent | Yes | — | [CUSTOMIZE] |

**Response time:** We respond to all requests within 30 days (GDPR) or 45 days
(CCPA). We may extend by an additional 30/45 days for complex requests with
notice to you.

**Verification:** We verify your identity before processing requests to protect
your data.

You also have the right to lodge a complaint with your local data protection
authority. [CUSTOMIZE: Link to relevant authority, e.g., ICO for UK, CNIL for
France.]

## Children's data

Our service is not directed to children under [CUSTOMIZE: 13/16]. We do not
knowingly collect personal data from children. If we learn we have collected
data from a child, we will delete it promptly.

## Security

We protect your data using industry-standard measures including encryption in
transit (TLS 1.2+), encryption at rest (AES-256), access controls, and regular
security assessments. No system is 100% secure, and we cannot guarantee
absolute security.

## Automated decision-making

<!-- Required by GDPR Art. 22 if applicable -->

[CUSTOMIZE: We do / do not use automated decision-making or profiling that
produces legal or similarly significant effects. If you do, describe the logic,
significance, and right to human review.]

## Changes to this policy

We may update this policy from time to time. We will notify you of material
changes by [CUSTOMIZE: email / in-app notification / banner]. The "Last
updated" date at the top reflects the most recent revision.

Previous versions are available at [CUSTOMIZE: CHANGELOG_URL].

## Contact us

For privacy-related questions or to exercise your rights:

- **Email:** [CUSTOMIZE: PRIVACY_EMAIL]
- **Form:** [CUSTOMIZE: PRIVACY_FORM_URL]
- **Mail:** [CUSTOMIZE: MAILING_ADDRESS]
```

---

## Customization notes

1. **Data inventory first** — Before filling in the template, complete a data mapping exercise. List every field, cookie, and third-party integration that touches personal data.
2. **Jurisdiction selection** — If 90%+ of your users are in one country, you can lead with that jurisdiction's requirements. If global, write to GDPR standards (the strictest) and add CCPA-specific sections.
3. **Processor list** — Name your key processors (hosting, payments, analytics, email). Use categories for minor ones. GDPR requires you to provide names on request.
4. **Retention periods** — Base these on actual business needs and legal requirements. "We keep it forever" is never an acceptable answer under GDPR.
5. **Plain language** — Privacy policies must be "concise, transparent, intelligible and in an easily accessible form, using clear and plain language" (GDPR Art. 12). Avoid legal jargon where possible.
6. **Review cadence** — Review quarterly and update whenever you add new data collection, change processors, or enter new markets.

## Companion tools
- `rohitg00/awesome-claude-code-toolkit` -> `legal-advisor`
- `mcpmarket.com` -> `legal-advisor` skill
- Termly, Iubenda, OneTrust — privacy policy generators (starting point, always customize)
- FOSSA, Snyk — for data flow analysis alongside license scanning
