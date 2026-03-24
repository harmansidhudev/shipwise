# IP Assignment Checklist

> **Disclaimer: This is an organizational checklist, not legal advice. IP assignment agreements have significant legal consequences. Have a qualified attorney draft or review your actual agreements before use.**

## When to use

Use this checklist when onboarding any contributor to your company — co-founders, employees, contractors, freelancers, or advisors. Every person who creates intellectual property for your company must sign an IP assignment agreement before they begin work. This is non-negotiable for any serious business.

## Why every contributor needs IP assignment

Without a signed IP assignment:
- **Contractors own their work by default.** Under US copyright law, independent contractors retain ownership of what they create unless there is a written agreement stating otherwise.
- **Work-for-hire alone is not enough.** The "work-for-hire" doctrine only applies to employees and to a limited set of specially commissioned works. Software often falls outside these categories.
- **Employees may have rights too.** Some states (notably California) give employees rights to inventions created on their own time that do not relate to the employer's business.
- **VCs will ask.** Every investor due diligence process checks that the company owns all its IP. Missing assignments can kill a deal.
- **Acquirers will walk.** IP ownership gaps are a top reason acquisitions fall apart during due diligence.

## Decision framework

```
Who is contributing IP to your company?
│
├── Co-founders
│   ├── IP assignment covered in co-founder agreement
│   ├── Also need technology assignment agreement for pre-incorporation IP
│   └── Sign: co-founder agreement + PIIA
│
├── Full-time / part-time employees
│   ├── Sign: PIIA (Proprietary Information and Inventions Assignment)
│   ├── Included as part of employment agreement
│   ├── Must list prior inventions on Schedule A (excluded from assignment)
│   └── State-specific carve-outs apply (see below)
│
├── Contractors / freelancers
│   ├── Sign: contractor agreement with IP assignment clause
│   ├── Must include: work-for-hire + explicit assignment + moral rights waiver
│   ├── Work-for-hire alone is NOT sufficient — always include explicit assignment
│   └── Get signed BEFORE any work begins
│
├── Advisors
│   ├── If contributing IP (code, designs, strategies): sign advisor agreement with IP clause
│   ├── If advisory only (introductions, advice): standard advisor agreement is sufficient
│   └── Use FAST Agreement (Founder / Advisor Standard Template) as baseline
│
└── Open source contributors
    ├── Separate policy: open source contribution policy
    ├── Employee contributions to company open source: covered by PIIA
    └── Employee contributions to external open source: require approval process
```

---

## What IP assignment covers

| Category | Examples | Covered? |
|----------|----------|----------|
| **Source code** | Application code, scripts, infrastructure-as-code | Yes |
| **Designs** | UI/UX designs, mockups, wireframes, icons, logos | Yes |
| **Inventions** | Algorithms, methods, processes, architectures | Yes |
| **Trade secrets** | Proprietary data models, business logic, customer lists | Yes |
| **Content** | Documentation, marketing copy, training materials | Yes |
| **Data** | Datasets created for the company, ML models trained on company data | Yes |
| **Domain names** | Domains purchased for the company | Yes |
| **Patents** | Patentable inventions created during engagement | Yes |

---

## Key clauses explained

### Work-for-hire
States that work created within the scope of engagement is considered "work made for hire" under copyright law. Important but has limited applicability for contractors.

### Assignment of inventions
The contributor explicitly assigns all rights, title, and interest in any IP created during the engagement to the company. This is the critical clause — it transfers ownership regardless of whether work-for-hire applies.

### Moral rights waiver
The contributor waives moral rights (right of attribution, right of integrity). Important for international contributors where moral rights are stronger.

### Prior inventions schedule
A list of inventions the contributor created before the engagement that are excluded from assignment. This protects both parties — the contributor keeps their pre-existing work, and the company knows exactly what it is getting.

### Representations and warranties
The contributor represents that their work is original, does not infringe third-party IP, and they have the authority to assign it.

### Survival
IP assignment obligations survive termination of the engagement.

---

## Contractor vs. employee differences

| Aspect | Employee | Contractor |
|--------|----------|------------|
| **Default IP ownership** | Employer (in most cases) | Contractor retains |
| **Agreement type** | PIIA + employment agreement | Contractor agreement + IP clause |
| **Work-for-hire** | Applies broadly | Limited applicability |
| **Assignment clause** | Reinforces default | Essential (overrides default) |
| **Prior inventions** | Schedule A exclusion | Schedule A exclusion |
| **State carve-outs** | Yes (CA, WA, IL, etc.) | Generally no |
| **Non-compete** | State-dependent | State-dependent |
| **Moral rights** | Typically waived | Must explicitly waive |

### State-specific employee carve-outs

Several states limit what employers can claim through invention assignment:

- **California** (Labor Code 2870): Cannot assign inventions developed entirely on employee's own time, without company equipment, that do not relate to company's business
- **Washington** (RCW 49.44.140): Similar to California
- **Illinois** (765 ILCS 1060): Similar to California
- **Delaware** (19 Del. C. 805): Similar to California
- **Minnesota, North Carolina, and others**: Various protections

Your IP agreement must include these carve-outs to be enforceable in those states.

---

## Copy-paste templates

### IP assignment clause for contractor agreements

```markdown
## INTELLECTUAL PROPERTY ASSIGNMENT
## [CUSTOMIZE: Company Name] — Contractor Agreement

### Work Product Ownership

a) "Work Product" means all inventions, discoveries, designs, code, documentation,
   data, materials, and other works of authorship created by Contractor in the
   performance of Services under this Agreement.

b) Work Made for Hire. To the extent permitted by law, all Work Product shall be
   considered "work made for hire" as defined in the U.S. Copyright Act, with all
   rights owned exclusively by [CUSTOMIZE: Company Name].

c) Assignment. To the extent any Work Product does not qualify as work made for
   hire, Contractor hereby irrevocably assigns to [CUSTOMIZE: Company Name] all
   right, title, and interest in and to the Work Product, including all
   intellectual property rights therein (patents, copyrights, trade secrets,
   trademarks, and all other proprietary rights).

d) Moral Rights. Contractor waives any moral rights in the Work Product, including
   rights of attribution and integrity, to the fullest extent permitted by law.

e) Further Assurances. Contractor agrees to execute any documents and take any
   actions reasonably requested by [CUSTOMIZE: Company Name] to evidence, perfect,
   or protect the Company's rights in the Work Product, including patent or
   copyright registration applications.

f) Prior Work. Contractor represents that no pre-existing intellectual property
   owned by Contractor is incorporated into the Work Product, except as listed
   in Schedule A. For any pre-existing IP listed in Schedule A that is incorporated
   into Work Product, Contractor grants [CUSTOMIZE: Company Name] a perpetual,
   irrevocable, worldwide, royalty-free license to use, modify, and sublicense
   such pre-existing IP as part of the Work Product.

g) Representations. Contractor represents and warrants that: (i) all Work Product
   is original and does not infringe the intellectual property rights of any third
   party; (ii) Contractor has the legal right to assign the Work Product; and
   (iii) no Work Product contains any open source software except as disclosed in
   writing and approved by [CUSTOMIZE: Company Name].

### Schedule A — Prior Inventions

[CUSTOMIZE: List any pre-existing IP that will be incorporated into work,
or write "None."]

1. _______________________________________________
2. _______________________________________________
3. _______________________________________________
```

### Invention assignment clause for employees (PIIA excerpt)

```markdown
## PROPRIETARY INFORMATION AND INVENTIONS ASSIGNMENT
## [CUSTOMIZE: Company Name]

### Inventions Assignment

a) "Inventions" means all inventions, discoveries, improvements, ideas, concepts,
   designs, code, algorithms, techniques, processes, works of authorship, trade
   secrets, and other intellectual property, whether or not patentable or
   copyrightable.

b) Assignment. Employee hereby assigns to [CUSTOMIZE: Company Name] all right,
   title, and interest in any Inventions that Employee makes, conceives, reduces
   to practice, or creates, either alone or jointly with others, during the period
   of employment, that:
   (i)   relate to the Company's actual or anticipated business, research, or
         development;
   (ii)  result from any work performed by Employee for the Company; or
   (iii) are developed using Company equipment, supplies, facilities, or
         proprietary information.

c) State Law Exclusion. [CUSTOMIZE: Include applicable state carve-out]

   CALIFORNIA EMPLOYEES: Pursuant to California Labor Code Section 2870, this
   assignment does not apply to any Invention that the Employee develops entirely
   on their own time without using the Company's equipment, supplies, facilities,
   or trade secret information, and that (a) does not relate at the time of
   conception to the Company's business or actual or demonstrably anticipated
   research or development, and (b) does not result from any work performed by
   the Employee for the Company.

   [CUSTOMIZE: Replace with applicable state statute if not California]

d) Disclosure. Employee agrees to promptly disclose all Inventions to the Company
   in writing.

e) Prior Inventions. Employee has listed on Schedule A all Inventions that Employee
   owns or has an interest in prior to employment. If no Schedule A is attached,
   Employee represents that no such Inventions exist.

f) Further Assurances. Employee agrees to assist the Company in obtaining and
   enforcing intellectual property rights related to assigned Inventions, including
   executing patent applications, copyright registrations, and other documents.

### Schedule A — Prior Inventions

The following is a complete list of all Inventions that I own or have an interest
in prior to my employment with [CUSTOMIZE: Company Name]:

[CUSTOMIZE: List prior inventions, or write "None."]

1. Title: _________________ Description: _________________
2. Title: _________________ Description: _________________

Employee signature: _______________ Date: ___________
```

### Open source contribution policy

```markdown
## OPEN SOURCE CONTRIBUTION POLICY
## [CUSTOMIZE: Company Name]

### Purpose
This policy governs contributions to open source projects by company employees
and contractors. It protects the company's intellectual property while supporting
the open source community.

### Definitions
- "Company Project": An open source project owned and maintained by
  [CUSTOMIZE: Company Name]
- "External Project": An open source project not owned by [CUSTOMIZE: Company Name]
- "Contribution": Any code, documentation, or other content submitted to an
  open source project

### Policy

#### Contributions to Company Projects
- Covered by your employment/contractor agreement and PIIA
- No additional approval needed
- All contributions are owned by [CUSTOMIZE: Company Name]
- Company projects are published under [CUSTOMIZE: MIT / Apache 2.0 / license]

#### Contributions to External Projects

a) Bug fixes (< [CUSTOMIZE: 20] lines): Pre-approved. No approval needed.
   - Must not include any proprietary code or trade secrets
   - Log the contribution in [CUSTOMIZE: #open-source Slack channel / spreadsheet]

b) Feature contributions (> [CUSTOMIZE: 20] lines): Requires approval.
   - Submit request to [CUSTOMIZE: engineering manager / CTO / legal]
   - Include: project name, license, description of contribution, estimated time
   - Wait for written approval before contributing
   - Must not include any proprietary code or trade secrets

c) New open source projects: Requires [CUSTOMIZE: CTO / CEO] approval.
   - Must not compete with or undermine company products
   - Must not contain proprietary code, algorithms, or trade secrets

#### Prohibited
- Contributing proprietary code, algorithms, or trade secrets to any open
  source project
- Contributing to projects with licenses incompatible with company products
  (e.g., AGPL contributions that could affect proprietary products)
- Creating personal open source projects that compete with company products

#### CLA (Contributor License Agreement)
- Before signing any CLA for an external project, obtain approval from
  [CUSTOMIZE: legal / CTO]
- The company may need to sign a Corporate CLA for some projects

### Questions
Direct questions about this policy to [CUSTOMIZE: legal@company.com / CTO].
```

---

## IP assignment onboarding checklist

```markdown
## IP Assignment — New Contributor Onboarding

Contributor name: [CUSTOMIZE: Name]
Role: [CUSTOMIZE: Co-founder / Employee / Contractor / Advisor]
Start date: [CUSTOMIZE: Date]

### Before first day of work
- [ ] Determine contributor type (employee vs. contractor vs. advisor)
- [ ] Prepare appropriate agreement:
      - Employee: Employment agreement + PIIA
      - Contractor: Contractor agreement with IP assignment clause
      - Advisor: Advisor agreement (FAST template) with IP clause if contributing IP
      - Co-founder: Co-founder agreement + PIIA + technology assignment (pre-formation IP)
- [ ] Include state-specific carve-outs if applicable
- [ ] Contributor reviews and completes Schedule A (prior inventions)
- [ ] Agreement signed by both parties BEFORE any work begins
- [ ] Signed copy stored in [CUSTOMIZE: Google Drive / Dropbox / HR system]

### After signing
- [ ] Review open source contribution policy with contributor
- [ ] Provide access to company code repositories
- [ ] Add to contributor tracking spreadsheet / HR system

### Periodic review
- [ ] Annual review of contractor agreements for renewal
- [ ] Update IP assignment if role changes (e.g., contractor to employee)
- [ ] Verify all active contributors have current signed agreements
```

---

## Customization notes

- **Get the agreement signed before work starts.** An IP assignment signed after work is completed may not be enforceable without additional consideration (something of value given in exchange). For new hires, employment is the consideration. For existing contributors, you may need to provide something additional.
- **Contractor vs. employee classification matters.** If you misclassify an employee as a contractor, the IP assignment clause in your contractor agreement may not hold up. Ensure proper classification.
- **International contributors** have different IP law regimes. Moral rights are stronger in many countries (especially EU, Canada, Australia). Ensure your agreement addresses moral rights explicitly.
- **Open source in your product.** If contributors use open source libraries, ensure license compatibility. Strong copyleft licenses (GPL, AGPL) can affect your proprietary code. Track open source dependencies.
- **Pre-incorporation IP.** If founders built a prototype before forming the company, they need a "Technology Assignment Agreement" to formally assign that pre-existing IP to the new company at formation.
- **Cost to get this right:** $500-1,500 for an attorney to create your templates. These templates are reused for every future hire and contractor, so the per-person cost approaches zero over time.

## Companion tools

- `rohitg00/awesome-claude-code-toolkit` -- `legal-advisor` agent
- `mcpmarket.com` -- `legal-advisor` skill
