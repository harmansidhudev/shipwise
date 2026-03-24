# TAM/SAM/SOM Bottom-Up Calculator

## When to use

Use this calculator when you need to estimate market size for fundraising decks, business plans, or your own go/no-go decision. Market sizing answers: "Is this opportunity big enough to build a business around?" Run this after user interviews and competitive analysis — you need real data about your target audience and pricing to make the numbers meaningful.

## Decision framework

```
Which methodology should I use?
│
├── Bottom-up (RECOMMENDED)
│   Start from a countable number of potential customers,
│   multiply by what they would pay. Grounded in real data.
│   Investors trust this.
│
├── Top-down (SANITY CHECK ONLY)
│   Start from total industry revenue, narrow by segment.
│   Easy to inflate. Use only to cross-reference your
│   bottom-up number — never as your primary estimate.
│
└── Not sure which customers to count?
    └── Go back to your persona. If you cannot identify
        and count your target customers, your persona
        is too vague.

When is market sizing "good enough"?
├── Bootstrapped / solo founder
│   └── SOM year 1 > $500K ARR is usually sufficient
│       (depends on your living costs and growth goals)
│
├── Seeking pre-seed / seed funding
│   └── TAM > $1B, SAM > $100M, SOM year 1 > $1M
│       (investors want a path to a large outcome)
│
└── Seeking Series A+
    └── TAM > $10B, SAM > $1B, demonstrable traction
        toward SOM
```

---

## Copy-paste template

### Definitions (plain English)

```markdown
# Market Sizing Definitions

**TAM — Total Addressable Market**
If every single person or company in the world who COULD
use your product DID use it, how much revenue would that be?
This is the theoretical ceiling. No one captures 100% of TAM.
It shows the SIZE of the opportunity.

**SAM — Serviceable Addressable Market**
The portion of TAM that your product, business model, and
geography can actually reach. Filters include:
- Geographic scope (US only? English-speaking countries? Global?)
- Product scope (which customer segments does your product serve?)
- Business model (can you sell to enterprise? Only SMB? Only consumers?)
- Technology requirements (do they need internet? A smartphone?)

**SOM — Serviceable Obtainable Market**
The realistic revenue you can capture in the first 1-2 years,
given your team size, marketing budget, competition, and
sales capacity. This is the number your business plan
should be built on.
```

### Bottom-up calculation template

```markdown
# Bottom-Up Market Sizing
# Product: [CUSTOMIZE — your product name]
# Date: [CUSTOMIZE]
# Author: [CUSTOMIZE]

---

## Step 1: Define your ideal customer segment
[CUSTOMIZE — describe who exactly you are counting]

- Industry: [CUSTOMIZE]
- Company size: [CUSTOMIZE — e.g., "1-50 employees"]
- Geography: [CUSTOMIZE — e.g., "United States"]
- Other filters: [CUSTOMIZE — any additional criteria]

## Step 2: Count potential customers

### Source your numbers (cite everything)
| Data point | Value | Source |
|------------|-------|--------|
| [CUSTOMIZE — e.g., "Total dental practices in US"] | [CUSTOMIZE] | [CUSTOMIZE — e.g., "ADA 2024 report"] |
| [CUSTOMIZE — filter 1] | [CUSTOMIZE] | [CUSTOMIZE] |
| [CUSTOMIZE — filter 2] | [CUSTOMIZE] | [CUSTOMIZE] |
| [CUSTOMIZE — filter 3] | [CUSTOMIZE] | [CUSTOMIZE] |

### TAM calculation
Total potential customers (broadest definition):
[CUSTOMIZE — number] x [CUSTOMIZE — annual contract value]
= TAM: $_______________

### SAM calculation
TAM filtered by your actual reach:
[CUSTOMIZE — number after filters] x [CUSTOMIZE — ACV]
= SAM: $_______________

Filters applied:
- [CUSTOMIZE — e.g., "US only (removes 60% of global total)"]
- [CUSTOMIZE — e.g., "Practices with 2+ dentists (our product
  requires team features)"]
- [CUSTOMIZE — e.g., "Tech-savvy practices (already use
  digital tools) — estimated 70% of remainder"]

### SOM calculation (Year 1)
Realistic year-1 capture:
SAM x [CUSTOMIZE — capture rate, typically 1-5%]
= SOM: $_______________

Justification for capture rate:
- Sales capacity: [CUSTOMIZE — e.g., "1 founder doing sales,
  can handle ~50 customers"]
- Marketing budget: [CUSTOMIZE — e.g., "$5K/month on ads,
  estimated 20 customers/month"]
- Competition: [CUSTOMIZE — e.g., "3 established competitors,
  but none focused on our niche"]
- Sales cycle: [CUSTOMIZE — e.g., "14-day average for SMB SaaS"]

## Step 3: Sanity checks

| Check | Expected Range | Your Number | Pass? |
|-------|---------------|-------------|-------|
| SAM / TAM ratio | 1-10% | ___% | [ ] |
| SOM / SAM ratio (Year 1) | 1-5% | ___% | [ ] |
| ACV vs. interview WTP | Within 2x | $____ vs $____ | [ ] |
| SOM vs. competitor revenue | SOM < smallest competitor | $____ vs $____ | [ ] |
| SOM supports business model? | Covers costs + growth | [ ] Yes / [ ] No | [ ] |

If any check fails, revisit your assumptions before proceeding.
```

---

## Worked example: B2B SaaS for dental practices

```markdown
# Worked Example: DentFlow — Practice Management SaaS for US Dentists

## Step 1: Ideal customer segment
Solo and small-group dental practices (1-5 dentists) in the
United States that currently use paper-based or outdated
scheduling and billing systems.

## Step 2: Count potential customers

### Source data
| Data point | Value | Source |
|------------|-------|--------|
| Total dental practices in US | 201,000 | ADA Health Policy Institute, 2024 |
| Practices with 1-5 dentists | 175,000 (87%) | ADA Practice Survey |
| Currently using legacy/paper systems | ~52,500 (30% of 175K) | Industry survey estimate |
| Annual contract value (ACV) | $3,600/yr ($300/mo) | Based on interview WTP data |

### TAM — All dental practices, any size, any system
201,000 practices x $3,600/yr = $723,600,000
TAM = ~$724M

### SAM — US, 1-5 dentist practices, any current system
175,000 practices x $3,600/yr = $630,000,000

Wait — SAM/TAM ratio = 87%. That is too high.
SAM should be more filtered. Add realistic filters:

Revised SAM — practices that (a) have 1-5 dentists,
(b) have internet + modern devices, (c) are not locked
into long-term contracts with competitors:
175,000 x 90% internet x 60% not locked in = 94,500
94,500 x $3,600 = $340,200,000
SAM = ~$340M (SAM/TAM = 47% — still high for this niche
market, but reasonable because the product broadly applies)

### SOM — Year 1 realistic capture
With 1 founder + 1 part-time marketer:
- Capacity: ~20 new customers/month through content marketing
  and dental conference outreach
- 12 months x 20 = 240 customers (accounting for churn,
  assume 200 active at year-end)
- 200 x $3,600 = $720,000

SOM Year 1 = ~$720K
SOM/SAM = 0.2% (below 5%, conservative and credible)

### Sanity checks
| Check | Expected | Actual | Pass? |
|-------|----------|--------|-------|
| SAM/TAM | 1-10% | 47% (niche market, acceptable) | [~] |
| SOM/SAM Y1 | 1-5% | 0.2% | [Y] |
| ACV vs interview WTP | Within 2x | $300/mo vs $250-400/mo range | [Y] |
| SOM < smallest competitor | — | $720K < Dentrix ($500M+) | [Y] |
| SOM supports business? | Covers costs | $720K covers 2 people + infra | [Y] |
```

### Top-down cross-reference (sanity check only)

```markdown
# Top-Down Cross-Reference
# Use ONLY to check if your bottom-up number is in the right ballpark

## Start from industry size
| Data point | Value | Source |
|------------|-------|--------|
| US dental practice management software market | $2.8B | [CUSTOMIZE — e.g., Grand View Research 2024] |
| Growth rate | 9.1% CAGR | [CUSTOMIZE — source] |

## Narrow down
$2.8B total market
x 40% small practices (1-5 dentists) = $1.12B
x 30% addressable (not locked into enterprise contracts) = $336M

Top-down SAM estimate: ~$336M
Bottom-up SAM estimate: ~$340M

These are close — good sign that the bottom-up math is reasonable.

## If the numbers are very different (>3x)
- Bottom-up >> top-down: Your ACV or customer count may be inflated.
  Double-check your sources.
- Bottom-up << top-down: You may be filtering too aggressively,
  or your ACV is too low. Consider whether you are leaving
  money on the table with pricing.
```

### Investor-ready slide format

```markdown
# Market Sizing Slide — [CUSTOMIZE — Product Name]

## [CUSTOMIZE — One-line product description]

+---------------------------------------------+
|                                             |
|   TAM: $[CUSTOMIZE]                         |
|   [CUSTOMIZE — broadest definition]         |
|                                             |
|     +-------------------------------------+ |
|     |                                     | |
|     |   SAM: $[CUSTOMIZE]                 | |
|     |   [CUSTOMIZE — your reachable       | |
|     |    market with filters]             | |
|     |                                     | |
|     |     +---------------------------+   | |
|     |     |                           |   | |
|     |     |  SOM: $[CUSTOMIZE]        |   | |
|     |     |  Year 1 target            |   | |
|     |     |                           |   | |
|     |     +---------------------------+   | |
|     |                                     | |
|     +-------------------------------------+ |
|                                             |
+---------------------------------------------+

### Methodology: Bottom-up
- [CUSTOMIZE — number] target customers identified
- $[CUSTOMIZE] average annual contract value
- Sources: [CUSTOMIZE — list 2-3 credible sources]

### Key assumptions
1. [CUSTOMIZE — most important assumption]
2. [CUSTOMIZE — second assumption]
3. [CUSTOMIZE — third assumption]

### SOM build-up (Year 1 to Year 3)
| | Year 1 | Year 2 | Year 3 |
|---|--------|--------|--------|
| Customers | [CUSTOMIZE] | [CUSTOMIZE] | [CUSTOMIZE] |
| ACV | $[CUSTOMIZE] | $[CUSTOMIZE] | $[CUSTOMIZE] |
| Revenue | $[CUSTOMIZE] | $[CUSTOMIZE] | $[CUSTOMIZE] |
| SOM capture rate | [CUSTOMIZE]% | [CUSTOMIZE]% | [CUSTOMIZE]% |
```

---

## Common mistakes to avoid

1. **Using only top-down math** — "The market is $50B and we just need 0.1%" is not a plan. Investors see through this immediately. Always lead with bottom-up.

2. **Inflating TAM with adjacent markets** — If you are building scheduling software for dentists, do not include the entire healthcare IT market in your TAM. TAM = people who would realistically buy your specific product.

3. **Confusing revenue with market size** — TAM is annual revenue, not total lifetime value. If you charge $300/month, your ACV is $3,600/year, not $3,600 times some assumed retention period.

4. **Forgetting to cite sources** — Every number in your calculation should have a source. Government data (BLS, Census), industry associations, and research firms (Gartner, IBISWorld) are credible. Blog posts and guesses are not.

5. **SOM that is too ambitious** — If your year-1 SOM requires capturing 20% of SAM with a two-person team, you will not be taken seriously. 1-5% of SAM in year 1 is typical for a startup with some traction.

6. **Ignoring competition in SOM** — SOM must account for the fact that competitors already exist and customers are not waiting for you. Your capture rate should reflect how hard it is to win customers away from established alternatives.

---

## Where to find data for your calculation

### Free sources
- **US Census Bureau** (census.gov) — Business counts by industry, geography, employee size
- **Bureau of Labor Statistics** (bls.gov) — Employment by occupation, wage data
- **Statista** (free tier) — Industry statistics and market sizes
- **IBISWorld** (library access) — Many public libraries provide free access to detailed industry reports
- **Industry associations** — Most industries have associations that publish annual reports with market data (e.g., ADA for dentists, ABA for lawyers)
- **SEC filings** — Public competitor financial data (revenue, growth rates)
- **Crunchbase** (free tier) — Funding data suggests investor confidence in market size
- **Google Trends** — Relative search volume over time (growth signal)
- **SimilarWeb** (free tier) — Competitor traffic as a proxy for market activity

### Paid sources (usually not needed pre-seed)
- **Gartner** — Enterprise market sizing
- **Grand View Research / Mordor Intelligence** — Detailed market reports
- **PitchBook** — Comprehensive funding and market data

---

## Customization notes

- **Consumer products**: Replace ACV with ARPU (Average Revenue Per User). Consumer markets are larger but conversion rates are lower — adjust SOM capture rate to 0.1-1% of SAM.
- **Marketplace / two-sided**: Size both sides separately. Your revenue = GMV times take rate. TAM = total GMV possible, not total revenue possible.
- **Freemium models**: TAM/SAM based on total users, SOM based on paying conversion rate (typically 2-5% for freemium SaaS). ACV applies only to paying users.
- **Developer tools**: Count developers by technology (use Stack Overflow surveys, GitHub stats). Developer markets are smaller but often have strong word-of-mouth growth.
- **Local / geo-restricted**: If your product only works in one city or region, your TAM is inherently small. Be honest about this — a small TAM is fine for a bootstrapped business but may not work for VC fundraising.

## Companion tools

None — this is a pre-code research and analysis activity. Use a spreadsheet for the calculations if the markdown format becomes unwieldy.
