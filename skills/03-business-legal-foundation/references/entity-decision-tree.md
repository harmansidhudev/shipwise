# Entity Decision Tree

> **Disclaimer: Organizational checklists, not legal advice. Consult qualified professionals.**

## When to use

Reference this guide when forming a new business entity, deciding between LLC and C-Corp, choosing a state of incorporation, or helping a founder evaluate entity options based on their funding plans and team structure.

## Decision framework

```
What type of business entity should you form?
│
├── Are you planning to raise venture capital?
│   ├── YES → Delaware C-Corp
│   │   ├── VCs require C-Corp for preferred stock, board seats, liquidation preferences
│   │   ├── Delaware: business-friendly courts, established case law, standard for startups
│   │   └── Use Stripe Atlas ($500), Clerky ($799), or direct filing ($89 state fee)
│   │
│   └── NO → Are you bootstrapping?
│       ├── YES → How many founders?
│       │   ├── Solo → LLC in home state (simplest) or Wyoming (cheapest ongoing)
│       │   ├── 2-3 founders → LLC with operating agreement
│       │   └── Consider S-Corp election for tax savings if profit > $80K/yr
│       │
│       └── MAYBE LATER → Start with LLC, convert to C-Corp when fundraising
│           └── Conversion costs $1,000-3,000 in legal fees
│
├── Are you an international founder?
│   ├── US entity needed for US customers/investors
│   │   ├── Delaware C-Corp (if raising) or Wyoming LLC (if bootstrapping)
│   │   ├── Need US registered agent ($50-200/yr)
│   │   ├── EIN application by fax/mail (4-week wait, no online option without SSN)
│   │   └── Consider Stripe Atlas (handles everything for international founders)
│   │
│   └── Non-US entity
│       ├── UK: Ltd company via Companies House
│       ├── EU: Local equivalent (GmbH, SAS, BV, etc.)
│       ├── Singapore: Pte Ltd (popular for Asia-Pacific)
│       └── Consider US subsidiary later if needed for US operations
│
└── Do you want pass-through taxation?
    ├── YES → LLC (default) or S-Corp (election on LLC or C-Corp)
    │   └── Pass-through: business income flows to your personal tax return
    │
    └── NO / DO NOT CARE → C-Corp
        └── C-Corp has double taxation (corporate tax + personal tax on dividends)
        └── But: QSBS (Section 1202) can exclude up to $10M in capital gains
```

---

## Entity comparison table

| Factor | Sole Prop | LLC | S-Corp | C-Corp |
|--------|-----------|-----|--------|--------|
| **Formation cost** | $0 | $50-500 | $50-500 + election | $89-500 |
| **Annual maintenance** | $0 | $0-800/yr | $0-800/yr + payroll | $300-1,600/yr |
| **Liability protection** | None | Yes | Yes | Yes |
| **Taxation** | Personal | Pass-through | Pass-through | Double (but QSBS) |
| **VC compatible** | No | No | No | Yes |
| **Max shareholders** | 1 | Unlimited | 100 (US only) | Unlimited |
| **Stock options** | No | Units/profits interests | Limited | Yes (ISO, NSO) |
| **Complexity** | Minimal | Low | Medium | High |
| **Best for** | Side projects | Bootstrapped | Profitable small biz | Funded startups |

---

## State selection guide

| State | Filing fee | Annual fee | Franchise tax | Best for |
|-------|-----------|------------|---------------|----------|
| **Delaware** | $89 (Corp), $90 (LLC) | $300 (Corp), $300 (LLC) | $175-200K+ (Corp) | VC-funded C-Corps |
| **Wyoming** | $100 (LLC), $100 (Corp) | $60 (LLC), $60 (Corp) | None | Bootstrapped LLCs, privacy |
| **Nevada** | $75 (LLC), $75 (Corp) | $150 (LLC), $150 (Corp) | None | Alternative to Wyoming |
| **Your home state** | Varies | Varies | Varies | If you operate locally |

**Important:** If you form in Delaware or Wyoming but operate in another state, you must also register as a "foreign entity" in your home state (additional fee + annual report). For bootstrapped businesses, forming in your home state is often simpler and cheaper.

---

## Copy-paste template

### Incorporation checklist — [CUSTOMIZE: LLC or C-Corp]

```markdown
## Entity Formation Checklist

### Pre-formation
- [ ] Decided on entity type: [CUSTOMIZE: LLC / C-Corp / S-Corp]
- [ ] Decided on state: [CUSTOMIZE: Delaware / Wyoming / home state]
- [ ] Verified business name availability (state secretary of state website)
- [ ] Checked domain availability for business name
- [ ] Checked USPTO TESS for trademark conflicts

### Formation filing
- [ ] Formation method: [CUSTOMIZE: Stripe Atlas / Clerky / direct filing / attorney]
- [ ] Filed [CUSTOMIZE: Articles of Organization (LLC) / Certificate of Incorporation (Corp)]
- [ ] State: [CUSTOMIZE: state name]
- [ ] Filing fee paid: $[CUSTOMIZE: amount]
- [ ] Registered agent: [CUSTOMIZE: name and address, or service name]

### Post-formation (within 30 days)
- [ ] Received confirmation / certificate from state
- [ ] Applied for EIN at irs.gov [CUSTOMIZE: online (US resident) / fax (international)]
- [ ] EIN received: _______________
- [ ] Drafted and signed operating agreement (LLC) / bylaws (Corp)
- [ ] Issued founder stock / membership units
- [ ] Filed 83(b) election with IRS (if restricted stock) — DEADLINE: 30 days from grant
  - [ ] Sent via certified mail with return receipt
  - [ ] Kept copy of signed 83(b) + certified mail receipt
- [ ] Opened business bank account at [CUSTOMIZE: Mercury / Relay / Brex]
- [ ] Transferred any initial capital contribution
- [ ] Set up accounting software: [CUSTOMIZE: QuickBooks / Xero / Wave]

### Foreign qualification (if formed out of state)
- [ ] Registered as foreign entity in [CUSTOMIZE: operating state]
- [ ] Obtained local business license if required

### Ongoing compliance
- [ ] Calendar: annual report filing date for [CUSTOMIZE: state]
- [ ] Calendar: franchise tax due date (if applicable)
- [ ] Calendar: federal tax filing deadline
- [ ] Calendar: state tax filing deadline
- [ ] Set up registered agent renewal reminders
```

### LLC formation — quick path (bootstrapped)

```markdown
## LLC Quick Formation — [CUSTOMIZE: State]

1. Go to [CUSTOMIZE: state] Secretary of State website
2. File Articles of Organization online
   - Business name: [CUSTOMIZE: Your Company Name, LLC]
   - Registered agent: [CUSTOMIZE: yourself or Northwest Registered Agent ($39/yr)]
   - Manager-managed or member-managed: [CUSTOMIZE: member-managed for small teams]
   - Pay filing fee: $[CUSTOMIZE: state fee]

3. Get EIN (same day)
   - Go to irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online
   - Apply as LLC, [CUSTOMIZE: single-member / multi-member]
   - EIN issued instantly

4. Draft operating agreement
   - Use template from references or attorney
   - All members sign
   - Keep on file (not filed with state, but legally required in most states)

5. Open bank account
   - Mercury: mercury.com — apply with EIN + Articles of Organization
   - Approval: 1-3 business days
```

### Delaware C-Corp formation — funded startup path

```markdown
## Delaware C-Corp Formation — Funded Startup

1. Incorporate in Delaware
   - Service: [CUSTOMIZE: Stripe Atlas ($500) / Clerky ($799) / attorney]
   - Stripe Atlas includes: incorporation, EIN, stock issuance, bylaws, bank account
   - Clerky includes: incorporation, bylaws, stock purchase agreements, 83(b) forms

2. Stock setup
   - Authorize 10,000,000 shares of common stock ($0.0001 par value)
   - Issue founder shares (restricted stock purchase agreements)
   - Each founder files 83(b) election within 30 days

3. Reserve option pool
   - Standard: 10-15% of authorized shares reserved for employee option pool
   - Do this before raising — VCs will require it anyway

4. Post-incorporation
   - EIN: applied for automatically by Stripe Atlas, or apply at irs.gov
   - Bank account: Mercury or Brex
   - Accounting: QuickBooks Online
   - Registered agent: included with Stripe Atlas / Clerky, or use Northwest ($39/yr)

5. Foreign qualification
   - Register as foreign corporation in [CUSTOMIZE: state where you operate]
   - File for local business license if required
```

---

## Customization notes

- **State fees change.** Verify current fees on the state secretary of state website before filing.
- **International founders** should budget extra time for EIN (4+ weeks by fax) and may need an ITIN.
- **Tax elections** (S-Corp, 83(b)) have strict deadlines. Calendar these immediately.
- **Franchise taxes** for Delaware C-Corps use the Assumed Par Value method — not the Authorized Shares method (which produces absurdly high estimates).
- **QSBS eligibility** (Section 1202) requires C-Corp status and meeting specific criteria. Discuss with your CPA at formation.

## Companion tools

- `rohitg00/awesome-claude-code-toolkit` -- `legal-advisor` agent
- `mcpmarket.com` -- `legal-advisor` skill
