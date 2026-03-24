# Tax Compliance Guide for SaaS

## When to use
Reference this guide when determining your tax obligations, setting up tax collection for your SaaS product, choosing between self-managed tax and Merchant of Record, or handling tax-exempt customers. Use the decision tree to determine if you need to collect tax, then follow the implementation guide for your chosen approach.

## Decision tree: Do I need to collect tax?

```
Do I need to collect sales tax / VAT?
│
├── Where are your customers?
│   │
│   ├── US only
│   │   ├── Do you have "nexus" in any state?
│   │   │   ├── Physical nexus: office, employees, or inventory in a state → YES, collect tax there
│   │   │   ├── Economic nexus: revenue or transactions exceed threshold in a state
│   │   │   │   ├── Most states: $100K revenue OR 200 transactions → YES, collect tax
│   │   │   │   └── Below thresholds → NO obligation in that state (but monitor as you grow)
│   │   │   └── No nexus anywhere (home state only, under thresholds)
│   │   │       └── Collect in your home state if it taxes SaaS → check below
│   │   │
│   │   └── Does your state tax SaaS?
│   │       ├── YES (TX, NY, PA, WA, CT, OH, etc.) → Collect in home state
│   │       ├── NO (CA, FL, IL — exempts most SaaS) → No home state obligation
│   │       └── UNCLEAR → Consult a tax professional
│   │
│   ├── EU customers
│   │   ├── B2C (selling to individuals) → You MUST charge VAT
│   │   │   ├── Revenue < EUR 10K from EU (all countries combined)?
│   │   │   │   ├── YES → Charge your home country VAT rate (simplified)
│   │   │   │   └── NO → Charge customer's country VAT rate (use OSS scheme)
│   │   │   └── Not EU-based? → Register for OSS in one EU country or use MoR
│   │   │
│   │   └── B2B (selling to businesses with VAT ID)
│   │       ├── Customer provides valid VAT ID → Reverse charge (0% VAT)
│   │       └── No VAT ID → Treat as B2C, charge VAT
│   │
│   ├── UK customers → 20% VAT on B2C, reverse charge on B2B (similar to EU)
│   │
│   ├── Canada → GST/HST applies to digital services sold to Canadian consumers
│   │
│   └── Rest of world → Varies widely. India (GST), Australia (GST), Japan (CT), etc.
│       └── Use MoR (Paddle/Lemon Squeezy) or Stripe Tax to handle automatically
│
└── Simplest path?
    ├── Want zero tax headaches → Use Paddle or Lemon Squeezy (MoR handles everything)
    ├── Want control + automation → Stripe + Stripe Tax
    └── Manual approach → TaxJar or Avalara API + file returns yourself or via service
```

---

## US sales tax for SaaS

### Economic nexus thresholds (most common states)

| State | Threshold | SaaS taxable? | Rate (approx.) | Notes |
|-------|-----------|---------------|-----------------|-------|
| **Texas** | $500K revenue | Yes | 6.25% + local | Charges on "data processing services" |
| **New York** | $500K + 100 transactions | Yes | 4% + local (up to 8.875%) | Pre-written software is tangible |
| **Pennsylvania** | $100K revenue | Yes | 6% | "Canned software" taxed |
| **Washington** | $100K revenue | Yes | 6.5% + local | B&O tax also applies |
| **Connecticut** | $100K + 200 transactions | Yes (1%) | 1% | Special reduced SaaS rate |
| **Ohio** | $100K + 200 transactions | Yes | 5.75% + local | "Computer services" taxed |
| **South Carolina** | $100K revenue | Yes | 6% + local | "Communication services" |
| **California** | $500K revenue | Mostly no | N/A | SaaS generally exempt (not tangible) |
| **Florida** | $100K revenue | Mostly no | N/A | SaaS generally exempt (proposed changes pending) |
| **Illinois** | $100K + 200 transactions | Mostly no | N/A | SaaS exempt unless address in IL |

> This table is a simplified reference. SaaS taxability is nuanced and state rules change frequently. Consult a tax professional or use an automated service for definitive guidance.

### Key US tax concepts

- **Nexus**: Your connection to a state that triggers tax obligation. Physical (office, employee) or economic (revenue/transaction threshold).
- **Economic nexus**: Most states adopted post-2018 (after the South Dakota v. Wayfair Supreme Court decision). Thresholds are typically $100K revenue or 200 transactions per state per year.
- **SaaS taxability varies by state**: Some states tax SaaS as tangible personal property, others exempt it as a service. No federal standard exists.
- **Marketplace facilitator laws**: If you sell through a marketplace (e.g., app store), the marketplace may handle tax collection.

---

## EU VAT for SaaS

### How EU VAT works for digital services

1. **B2C sales** (to individuals): You must charge VAT at the customer's country rate.
2. **B2B sales** (to businesses with valid VAT ID): Reverse charge mechanism — you charge 0% and the customer accounts for VAT themselves.
3. **VAT rates vary by country**: 17% (Luxembourg) to 27% (Hungary). Most are 20-25%.
4. **OSS (One-Stop Shop)**: Register in one EU country and file a single quarterly return covering all EU B2C sales. Eliminates the need to register in every EU country individually.
5. **EUR 10K threshold**: If your total EU B2C digital sales are under EUR 10K/year, you can charge your own country's VAT rate instead of the customer's. Above this, you must use OSS or register locally.

### VAT rates by major EU country

| Country | Standard VAT rate | Reduced digital rate |
|---------|-------------------|---------------------|
| Germany | 19% | 19% |
| France | 20% | 20% |
| Netherlands | 21% | 21% |
| Spain | 21% | 21% |
| Italy | 22% | 22% |
| Sweden | 25% | 25% |
| Ireland | 23% | 23% |
| Poland | 23% | 23% |
| Belgium | 21% | 21% |
| Luxembourg | 17% | 17% |
| Hungary | 27% | 27% |

### Invoice requirements (EU VAT compliant)

An EU VAT-compliant invoice must include:
- Unique sequential invoice number
- Invoice date
- Seller name, address, and VAT ID
- Buyer name and address (and VAT ID for B2B)
- Description of service ("SaaS subscription — [product name]")
- Net amount (before tax)
- VAT rate applied
- VAT amount
- Gross total
- Currency
- For B2B reverse charge: "Reverse charge — VAT to be accounted for by the recipient" + applicable legal reference

> Stripe and Paddle generate compliant invoices automatically when configured correctly.

---

## Three approaches to tax compliance

### Approach 1: Merchant of Record (Paddle / Lemon Squeezy)

```
Effort:    Minimal (they handle everything)
Cost:      Included in 5%+ processing fee
Coverage:  Global (200+ countries)
You do:    Nothing — MoR is the legal seller
They do:   Calculate, collect, file, remit, generate invoices

Best for: Solo founders, small teams, international customer base
```

Setup: Choose Paddle or Lemon Squeezy as your processor. Tax compliance is automatic and included. No additional configuration needed.

### Approach 2: Stripe + Stripe Tax

```
Effort:    Low-moderate (enable Stripe Tax, configure products)
Cost:      +0.5% per transaction (on top of standard Stripe fees)
Coverage:  50+ countries, all US states
You do:    Register in nexus states, file returns (or use TaxJar)
They do:   Calculate correct tax rate, add to invoice, track obligations

Best for: Stripe users who want automated calculation but retain control
```

### Approach 3: Manual with tax API (TaxJar / Avalara)

```
Effort:    High (integrate API, manage registrations, file returns)
Cost:      $19-500/mo depending on volume and service level
Coverage:  US + international (varies by provider)
You do:    Integrate API, register, file (or pay for filing service)
They do:   Provide tax rates via API, optionally file returns

Best for: Complex billing scenarios, high customization needs
```

---

## Copy-paste template

### Stripe Tax setup (TypeScript)

```ts
// lib/stripe-tax.ts
// [CUSTOMIZE] Stripe Tax configuration for checkout sessions

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Create a checkout session with automatic tax calculation
export async function createTaxAwareCheckout({
  customerId,
  priceId,
  successUrl,
  cancelUrl,
}: {
  customerId: string;
  priceId: string;
  successUrl: string;  // [CUSTOMIZE]
  cancelUrl: string;   // [CUSTOMIZE]
}) {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],

    // Enable automatic tax calculation
    automatic_tax: { enabled: true },

    // Collect customer address for tax determination
    // [CUSTOMIZE] 'auto' lets Stripe decide when to collect, 'required' always collects
    customer_update: {
      address: 'auto',
      name: 'auto',
    },

    // [CUSTOMIZE] For new customers without an address on file
    tax_id_collection: { enabled: true }, // Allow B2B customers to enter VAT ID

    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return session;
}

// Create a subscription with automatic tax (API-based, not Checkout)
export async function createTaxAwareSubscription({
  customerId,
  priceId,
}: {
  customerId: string;
  priceId: string;
}) {
  // Ensure customer has an address (required for tax calculation)
  const customer = await stripe.customers.retrieve(customerId);
  if (!('address' in customer) || !customer.address?.country) {
    throw new Error('Customer must have an address for tax calculation. Collect it first.');
  }

  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    automatic_tax: { enabled: true },
  });

  return subscription;
}

// Validate a EU VAT ID via Stripe
export async function validateTaxId(customerId: string, type: string, value: string) {
  // type examples: 'eu_vat', 'gb_vat', 'us_ein', 'au_abn', 'in_gst'
  // [CUSTOMIZE] See Stripe docs for full list of supported tax ID types
  const taxId = await stripe.customers.createTaxId(customerId, {
    type: type as Stripe.CustomerCreateTaxIdParams.Type,
    value, // e.g., 'DE123456789' for German VAT
  });

  return taxId; // Check taxId.verification.status: 'verified', 'pending', 'unverified'
}
```

### Tax-exempt customer handling

```ts
// lib/tax-exempt.ts
// [CUSTOMIZE] Handle B2B customers with valid tax IDs (reverse charge)

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Set customer as tax-exempt (B2B with verified VAT ID)
export async function setCustomerTaxExempt(customerId: string, exempt: boolean) {
  await stripe.customers.update(customerId, {
    tax_exempt: exempt ? 'exempt' : 'none',
    // Other options: 'reverse' for reverse charge (EU B2B)
  });
}

// Webhook handler for tax ID verification
export async function handleTaxIdVerified(taxId: Stripe.TaxId) {
  const customerId = taxId.customer as string;

  if (taxId.verification?.status === 'verified') {
    // Valid VAT ID — apply reverse charge (exempt from VAT)
    await stripe.customers.update(customerId, {
      tax_exempt: 'reverse',
    });

    // [CUSTOMIZE] Update your database
    // await db.user.update({
    //   where: { stripeCustomerId: customerId },
    //   data: {
    //     taxExempt: true,
    //     vatId: taxId.value,
    //     vatIdVerified: true,
    //   },
    // });

    console.log(`Tax ID verified for customer ${customerId}: ${taxId.value}`);
  } else if (taxId.verification?.status === 'unverified') {
    // Invalid VAT ID — keep charging tax
    console.log(`Tax ID verification failed for customer ${customerId}: ${taxId.value}`);
  }
}
```

### Product tax code configuration

```ts
// lib/stripe-products.ts
// [CUSTOMIZE] Set correct tax codes on your Stripe products

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Common SaaS tax codes (Stripe Tax product tax codes)
const TAX_CODES = {
  // [CUSTOMIZE] Choose the correct tax code for your product
  saas: 'txcd_10103001',          // Software as a Service (SaaS) — most common for web apps
  digitalGoods: 'txcd_10000000',  // General digital goods
  eBooks: 'txcd_10201000',        // Electronic books/publications
  streaming: 'txcd_10401000',     // Streaming services
  consulting: 'txcd_20060007',    // Consulting/professional services (often tax-exempt)
  training: 'txcd_10502000',      // Online courses/training
};

// Create a product with the correct tax code
export async function createTaxCodedProduct(name: string, type: keyof typeof TAX_CODES) {
  const product = await stripe.products.create({
    name,
    tax_code: TAX_CODES[type], // [CUSTOMIZE] pick the right code
  });

  return product;
}

// Update an existing product's tax code
export async function updateProductTaxCode(productId: string, type: keyof typeof TAX_CODES) {
  await stripe.products.update(productId, {
    tax_code: TAX_CODES[type],
  });
}
```

---

## Stripe Tax setup checklist

1. **Enable Stripe Tax** in Dashboard > Settings > Tax
2. **Set your business address** (origin address for tax calculation)
3. **Add tax registrations** for states/countries where you have nexus (Dashboard > Tax > Registrations)
4. **Set product tax codes** on all products (`txcd_10103001` for SaaS)
5. **Enable `automatic_tax`** on Checkout Sessions, Subscriptions, and Invoices
6. **Enable tax ID collection** for B2B customers (`tax_id_collection: { enabled: true }`)
7. **Test** with Stripe test mode addresses in different jurisdictions
8. **Monitor** the Tax > Overview dashboard for new nexus obligations
9. **File returns** — Stripe calculates but does not file. Use Stripe Tax auto-filing (beta), TaxJar, or file manually.

---

## Customization notes

- **US-only, under $100K**: You likely only have nexus in your home state. Check if your state taxes SaaS. If not, you may have no tax obligation yet. Monitor as revenue grows.
- **US-only, over $100K**: You are likely crossing economic nexus thresholds in multiple states. Use Stripe Tax and register in states where you have obligations. Consider TaxJar AutoFile for return filing.
- **International customer base**: If more than 20-30% of customers are outside the US, strongly consider a MoR (Paddle/Lemon Squeezy) to avoid the complexity of multi-country tax registration and filing.
- **B2B focus**: If most customers are businesses, EU VAT is simpler (reverse charge on B2B). Collect and validate VAT IDs at checkout. US B2B SaaS sales are generally taxed the same as B2C in states that tax SaaS.
- **Marketplace/platform**: If you operate a marketplace, you may be a "marketplace facilitator" with additional collection obligations. This is complex territory — consult a tax advisor.
- **Tax professional**: This guide provides a starting framework, but tax law is complex and jurisdiction-specific. Consult a CPA or tax attorney for definitive guidance, especially when expanding internationally or crossing revenue thresholds.

## Companion tools

- `wrsmith108/stripe-mcp-skill` — Configure Stripe products with tax codes from Claude Code
- Stripe Tax Dashboard — Monitor tax obligations and filing requirements
- TaxJar / Avalara — Automated filing services that integrate with Stripe
