# Terms of Service Framework

> **Disclaimer: Organizational checklists, not legal advice. Consult qualified professionals.**

## When to use

Reference this guide when drafting or updating your terms of service, launching a new product, adding paid features, enabling user-generated content, or changing your dispute resolution approach. Use the section checklist to verify completeness and the dispute resolution comparison to select the right mechanism.

## Decision framework

```
What type of product are you building?
├── SaaS (B2B)?
│   ├── Terms of service + SLA + DPA
│   ├── Enterprise: MSA (Master Service Agreement) + Order Form
│   └── Focus: liability caps, IP ownership, data handling, uptime SLA
│
├── SaaS (B2C)?
│   ├── Terms of service + Privacy policy
│   ├── Focus: acceptable use, content policies, subscription/billing, dispute resolution
│   └── Consider: arbitration clause, class action waiver (US)
│
├── Marketplace / Platform?
│   ├── Terms for buyers + sellers + platform rules
│   ├── Focus: transaction terms, disputes between users, content moderation
│   └── Consider: indemnification from both sides, escrow terms
│
├── Mobile app?
│   ├── Terms of service + EULA (End User License Agreement)
│   ├── Must comply with App Store / Play Store guidelines
│   └── Focus: license grant, in-app purchases, device permissions
│
└── API / Developer platform?
    ├── API terms of use + rate limits + usage restrictions
    ├── Focus: acceptable use, rate limits, SLA, data use restrictions
    └── Consider: derivative works, competitive use restrictions
```

---

## Key Sections Checklist

### 1. Agreement to Terms
- [ ] Clear statement that using the service constitutes acceptance
- [ ] Minimum age requirement (13 for COPPA, 16 for GDPR in some countries, 18 for contracts)
- [ ] Reference to privacy policy and other incorporated documents
- [ ] Mechanism for acceptance (clickwrap preferred over browsewrap for enforceability)

### 2. Definitions
- [ ] "Service" — what your product includes
- [ ] "User" / "Customer" / "Account Holder"
- [ ] "Content" — user-generated vs company-provided
- [ ] "Confidential Information" (B2B)
- [ ] "Fees" / "Subscription" (if paid)

### 3. Account Terms
- [ ] Account registration requirements
- [ ] Responsibility for account security (password, MFA)
- [ ] One person or entity per account (if applicable)
- [ ] Accurate information requirement
- [ ] Account transfer restrictions

### 4. Acceptable Use Policy (AUP)
- [ ] Prohibited activities (illegal use, abuse, spam, scraping, reverse engineering)
- [ ] Content standards (if user-generated content)
- [ ] Rate limits and fair use (API products)
- [ ] Enforcement actions (warning, suspension, termination)
- [ ] Reporting mechanism for violations

### 5. Intellectual Property Rights
- [ ] Company IP — service, brand, code, documentation remain company property
- [ ] User content — user retains ownership, grants limited license to company
- [ ] License scope — what can the company do with user content (display, store, process)
- [ ] Feedback — user grants company right to use product feedback
- [ ] Third-party IP — user must not infringe others' IP
- [ ] DMCA / copyright takedown process (if user-generated content)

### 6. Payment Terms (if applicable)
- [ ] Pricing and billing cycle (monthly, annual)
- [ ] Payment methods accepted
- [ ] Free trial terms and conversion
- [ ] Automatic renewal and cancellation process
- [ ] Refund policy
- [ ] Price change notification period (30 days typical)
- [ ] Taxes (user responsible for applicable taxes)
- [ ] Late payment consequences

### 7. Liability Limitations and Disclaimers
- [ ] Service provided "AS IS" and "AS AVAILABLE"
- [ ] No warranty of uninterrupted or error-free service
- [ ] Limitation of liability cap (typically fees paid in prior 12 months)
- [ ] Exclusion of consequential, incidental, indirect damages
- [ ] Exceptions that cannot be limited by law (gross negligence, willful misconduct)

### 8. Indemnification
- [ ] User indemnifies company for violations of terms, misuse, content disputes
- [ ] Mutual indemnification (B2B — each party indemnifies for their own breaches)
- [ ] Indemnification procedures (notice, control of defense)

### 9. Dispute Resolution
- [ ] Governing law (which jurisdiction's laws apply)
- [ ] Dispute resolution mechanism (see comparison table below)
- [ ] Informal resolution period before formal proceedings (30 days typical)
- [ ] Class action waiver (if arbitration, US)
- [ ] Small claims court carve-out
- [ ] IP disputes carve-out (injunctive relief)

### 10. Termination
- [ ] User right to terminate (cancel account at any time)
- [ ] Company right to terminate (for breach, with or without notice)
- [ ] Effect of termination (data export period, data deletion timeline)
- [ ] Surviving clauses (IP, liability, indemnification, dispute resolution)

### 11. Modifications
- [ ] Right to modify terms
- [ ] Notification method and period (email, in-app, 30 days)
- [ ] Continued use = acceptance (or require re-acceptance for material changes)
- [ ] Version history availability

### 12. Miscellaneous
- [ ] Severability (invalid clauses do not void entire agreement)
- [ ] Waiver (failure to enforce is not a waiver)
- [ ] Entire agreement (supersedes prior agreements)
- [ ] Assignment (company can assign in M&A, user cannot assign)
- [ ] Force majeure (neither party liable for events beyond control)

---

## Dispute Resolution Comparison

| Factor | Arbitration | Litigation | Small Claims Court |
|--------|-------------|------------|-------------------|
| **Cost** | Medium (arbitrator fees, typically $1,500-5,000 filing) | High (attorneys, discovery, court fees) | Low ($30-75 filing fee) |
| **Speed** | 3-6 months typical | 1-3 years typical | 1-3 months |
| **Privacy** | Private proceedings, no public record | Public record | Public record |
| **Appeal** | Very limited appeal rights | Full appeal rights | Limited appeal |
| **Discovery** | Limited (cost-saving) | Extensive (expensive) | Minimal |
| **Jury** | No jury | Jury available | No jury |
| **Class action** | Can waive with arbitration clause (US) | Available unless waived | Not applicable |
| **Enforceability** | Strong (Federal Arbitration Act in US) | Standard | Standard |
| **Jurisdiction reach** | Flexible (any location) | Must have jurisdiction | Local jurisdiction only |
| **Claim limit** | No limit | No limit | Varies by state ($5K-$25K) |
| **Best for** | B2C SaaS (reduces class action risk) | B2B enterprise (customers demand it) | Low-value consumer disputes |

### Recommendation by product type

| Product Type | Recommended Approach |
|-------------|---------------------|
| B2C SaaS (US users) | Binding arbitration + class action waiver + small claims carve-out |
| B2C SaaS (EU users) | Litigation (arbitration clauses often unenforceable for EU consumers) |
| B2B SaaS | Litigation in your preferred jurisdiction (enterprise buyers expect it) |
| Marketplace | Arbitration for platform disputes, litigation carve-out for IP |
| API platform | Arbitration or litigation, depending on customer segment |

---

## Copy-paste template

```markdown
# Terms of Service

**Last updated:** [CUSTOMIZE: DATE]
**Effective date:** [CUSTOMIZE: DATE]

## 1. Agreement to Terms

By accessing or using [CUSTOMIZE: SERVICE_NAME] ("Service"), provided by
[CUSTOMIZE: COMPANY_LEGAL_NAME] ("Company", "we", "us"), you agree to be bound
by these Terms of Service ("Terms"). If you do not agree, do not use the
Service.

You must be at least [CUSTOMIZE: 13/16/18] years old to use the Service. By
using the Service, you represent that you meet this age requirement.

These Terms incorporate our [Privacy Policy]([CUSTOMIZE: PRIVACY_URL]) and any
other policies referenced herein.

## 2. Definitions

- **"Service"** means [CUSTOMIZE: DESCRIPTION — the web application, API,
  mobile app, and related services provided by Company].
- **"User"** means any individual or entity that accesses or uses the Service.
- **"User Content"** means any data, text, files, or other materials you
  upload, submit, or transmit through the Service.
- **"Subscription"** means a paid plan granting access to premium features.

## 3. Account Terms

To use certain features, you must create an account. You agree to:

- Provide accurate, current, and complete information
- Maintain the security of your password and account
- Accept responsibility for all activity under your account
- Notify us immediately of any unauthorized access

We reserve the right to suspend or terminate accounts that violate these Terms.

## 4. Acceptable Use

You agree not to:

- Use the Service for any illegal purpose or in violation of any laws
- Transmit malware, viruses, or other harmful code
- Attempt to gain unauthorized access to any part of the Service
- Interfere with or disrupt the integrity or performance of the Service
- Scrape, crawl, or use automated means to access the Service without
  permission
- Reverse engineer, decompile, or disassemble any part of the Service
- Use the Service to send spam or unsolicited communications
- Impersonate any person or entity
- [CUSTOMIZE: ADD PRODUCT-SPECIFIC RESTRICTIONS]

We may investigate violations and take action including warning, suspension, or
termination.

## 5. Intellectual Property

### Our IP
The Service, including its design, code, features, documentation, and branding,
is owned by [CUSTOMIZE: COMPANY_NAME] and protected by intellectual property
laws. Nothing in these Terms grants you ownership of the Service or its
components.

### Your Content
You retain ownership of User Content you submit to the Service. By submitting
User Content, you grant us a worldwide, non-exclusive, royalty-free license to
use, store, display, and process your content solely to provide and improve the
Service.

### Feedback
If you provide suggestions, ideas, or feedback about the Service, we may use
them without restriction or obligation to you.

<!-- [CUSTOMIZE: Add DMCA section if you host user-generated content] -->

## 6. Payment Terms

<!-- [CUSTOMIZE: Remove this section if your product is free] -->

### Pricing and billing
Subscription fees are billed [CUSTOMIZE: monthly/annually] in advance. All fees
are in [CUSTOMIZE: USD] and exclude applicable taxes.

### Free trials
[CUSTOMIZE: If applicable — Free trials last [DURATION]. At the end of the
trial, your account will [convert to paid / be downgraded to free tier] unless
you cancel.]

### Cancellation
You may cancel your subscription at any time through your account settings.
Cancellation takes effect at the end of the current billing period. No refunds
are provided for partial periods.

### Price changes
We may change pricing with at least 30 days' notice. Continued use after the
price change takes effect constitutes acceptance.

## 7. Disclaimers

THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY
KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING BUT NOT LIMITED TO
WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
NON-INFRINGEMENT.

We do not warrant that the Service will be uninterrupted, error-free, or secure.
Your use of the Service is at your own risk.

## 8. Limitation of Liability

TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL [CUSTOMIZE:
COMPANY_NAME] BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, REVENUE, DATA, OR BUSINESS
OPPORTUNITIES, ARISING OUT OF OR RELATED TO THESE TERMS OR THE SERVICE.

OUR TOTAL AGGREGATE LIABILITY FOR ANY CLAIMS ARISING OUT OF OR RELATED TO THESE
TERMS OR THE SERVICE SHALL NOT EXCEED THE GREATER OF (A) THE AMOUNTS YOU PAID TO
US IN THE [CUSTOMIZE: 12] MONTHS PRECEDING THE CLAIM, OR (B) [CUSTOMIZE: $100].

Some jurisdictions do not allow the exclusion or limitation of certain damages.
In those jurisdictions, our liability is limited to the maximum extent permitted
by law.

## 9. Indemnification

You agree to indemnify and hold harmless [CUSTOMIZE: COMPANY_NAME], its
officers, directors, employees, and agents from any claims, damages, losses, and
expenses (including reasonable attorneys' fees) arising from:

- Your use of the Service
- Your violation of these Terms
- Your User Content
- Your violation of any third-party rights

## 10. Dispute Resolution

### Governing law
These Terms are governed by the laws of [CUSTOMIZE: STATE/COUNTRY], without
regard to its conflict of law provisions.

### Informal resolution
Before filing any formal proceeding, you agree to contact us at
[CUSTOMIZE: LEGAL_EMAIL] and attempt to resolve the dispute informally for at
least 30 days.

<!-- [CUSTOMIZE: Choose ONE of the following dispute resolution approaches] -->

<!-- OPTION A: Arbitration (recommended for B2C US) -->
### Binding arbitration
Any dispute not resolved informally shall be resolved by binding arbitration
administered by [CUSTOMIZE: JAMS / AAA] under its [CUSTOMIZE: Streamlined /
Consumer] Arbitration Rules. Arbitration shall take place in
[CUSTOMIZE: CITY, STATE] or remotely. The arbitrator's award is final and may be
entered as a judgment in any court of competent jurisdiction.

**CLASS ACTION WAIVER:** You agree that any dispute resolution proceedings will
be conducted only on an individual basis and not in a class, consolidated, or
representative action.

**Small claims exception:** Either party may bring qualifying claims in small
claims court.

<!-- OPTION B: Litigation (recommended for B2B) -->
### Jurisdiction
Any disputes shall be resolved exclusively in the [CUSTOMIZE: state or federal]
courts located in [CUSTOMIZE: CITY, STATE/COUNTRY], and you consent to personal
jurisdiction in those courts.

## 11. Termination

### By you
You may stop using the Service and delete your account at any time.

### By us
We may suspend or terminate your access to the Service at any time, with or
without cause, with or without notice. Grounds for termination include violation
of these Terms, non-payment, or extended inactivity.

### Effect of termination
Upon termination: (a) your right to access the Service ceases immediately,
(b) you may request export of your data within [CUSTOMIZE: 30] days,
(c) we will delete your data within [CUSTOMIZE: 30] days after the export
period, subject to legal retention requirements.

Sections 5 (IP), 7-9 (Disclaimers, Liability, Indemnification), 10 (Disputes),
and this section survive termination.

## 12. Changes to Terms

We may update these Terms from time to time. We will notify you of material
changes by [CUSTOMIZE: email / in-app notification] at least [CUSTOMIZE: 30]
days before they take effect. Your continued use of the Service after the
effective date constitutes acceptance of the updated Terms.

## 13. General

- **Severability:** If any provision is found unenforceable, the remaining
  provisions continue in full force.
- **Waiver:** Our failure to enforce any right is not a waiver of that right.
- **Entire agreement:** These Terms, together with the Privacy Policy and any
  other referenced policies, constitute the entire agreement between you and us.
- **Assignment:** We may assign these Terms in connection with a merger,
  acquisition, or sale of assets. You may not assign your rights under these
  Terms.
- **Force majeure:** Neither party is liable for delays caused by events beyond
  reasonable control (natural disasters, war, pandemic, government actions).

## Contact

Questions about these Terms? Contact us at:

- **Email:** [CUSTOMIZE: LEGAL_EMAIL]
- **Mail:** [CUSTOMIZE: MAILING_ADDRESS]
```

---

## Customization notes

1. **Clickwrap vs browsewrap** — Clickwrap (checkbox or "I agree" button) is far more enforceable than browsewrap ("by using the site you agree"). Always use clickwrap for paid products and arbitration clauses.
2. **Liability cap** — Standard for SaaS is fees paid in the prior 12 months. For free products, set a nominal cap (e.g., $100). B2B enterprise deals often negotiate higher caps.
3. **Arbitration in the EU** — Mandatory arbitration clauses are generally unenforceable against EU consumers. If you have EU users, use litigation for that segment or make arbitration optional.
4. **Class action waiver** — Enforceable in the US when paired with binding arbitration (per Supreme Court precedent). Not enforceable in many other jurisdictions.
5. **Modification notice** — 30 days is standard. Some jurisdictions require re-acceptance for material changes rather than passive acceptance via continued use.
6. **B2B additions** — For B2B products, add SLA terms (uptime guarantee, response times, credits), DPA reference, and mutual confidentiality obligations. Enterprise customers typically negotiate an MSA that supersedes standard ToS.
7. **Review cadence** — Review when adding features, changing pricing, entering new markets, or at least annually.

## Companion tools
- `rohitg00/awesome-claude-code-toolkit` -> `legal-advisor`
- `mcpmarket.com` -> `legal-advisor` skill
- Termly, Iubenda — ToS generators (starting point, always customize and review with counsel)
