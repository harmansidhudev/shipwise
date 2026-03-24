---
name: billing-payments
description: "Payment processor selection, subscription architecture, billing portal, webhooks, tax compliance, dunning, and free trial design."
triggers:
  - "Stripe"
  - "payments"
  - "billing"
  - "subscription"
  - "pricing"
  - "checkout"
  - "payment processor"
  - "Paddle"
  - "Lemon Squeezy"
  - "dunning"
  - "tax compliance"
---

# Billing & Payments

> Phase 3: SHIP | Sprint 4 (planned)

## Coverage

- Processor comparison (Stripe vs Paddle vs Lemon Squeezy)
- Subscription architecture (plans, upgrades, downgrades, proration, cancellation)
- Billing portal (invoices, payment methods, plan changes)
- Webhook architecture (idempotent, HMAC, retry handling)
- Tax compliance (Stripe Tax, Paddle, automation)
- Dunning/retry logic (schedules, grace periods, notifications)
- Free trial design (card upfront vs not, limits, nudges)

## Checklist Items

### Payment Integration
<!-- beginner -->
**Set up payment processing** — Stripe is the most developer-friendly option. Use Stripe Checkout (hosted payment page) to start — it handles card input, 3D Secure, and receipts for you. Never handle raw credit card numbers in your code.
→ Time: ~45 min for basic Stripe Checkout

<!-- intermediate -->
**Payment integration (Stripe/Paddle)** — Checkout or Elements, webhook handlers with HMAC verification, idempotent processing.

<!-- senior -->
**Payments** → Stripe/Paddle + webhooks (HMAC, idempotent) + billing portal.

## Companion tools
- `wrsmith108/stripe-mcp-skill`
- `coreyhaines31/marketingskills` → `pricing-strategy`
