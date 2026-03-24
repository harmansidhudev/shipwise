# Dunning & Retry Strategy

## When to use
Reference this guide when implementing payment failure recovery, setting up dunning email sequences, building webhook handlers for invoice events, or designing account suspension flows. Use the retry schedule and email templates as starting points, then customize timing and tone for your audience.

## Decision framework

```
A payment just failed. What happens next?
│
├── Is this the first failure?
│   ├── YES
│   │   ├── Mark subscription as "past_due"
│   │   ├── Maintain full access (grace period starts)
│   │   ├── Send "payment failed" email with update link
│   │   └── Stripe Smart Retries handles automatic retry timing
│   │
│   └── NO (subsequent failure)
│       ├── How many days since first failure?
│       │   ├── Day 1-3: Reminder email, gentle tone
│       │   ├── Day 3-5: Urgency email, mention upcoming restriction
│       │   ├── Day 5-7: Warning email, "access will be restricted"
│       │   ├── Day 7-12: Final warning, "action required immediately"
│       │   └── Day 14+: Suspend account, downgrade to free tier
│       │
│       └── Did the customer update their payment method?
│           ├── YES → Retry immediately, clear dunning state
│           └── NO → Continue schedule, escalate urgency
│
├── Pre-emptive: Card expiring within 30 days?
│   ├── Send "card expiring soon" email
│   └── In-app banner: "Update your payment method"
│
└── Payment succeeded after dunning?
    ├── Clear all dunning state
    ├── Restore full access
    ├── Send "payment successful" confirmation
    └── Log recovery for metrics
```

---

## Retry schedule

| Day | Action | Email | Access |
|-----|--------|-------|--------|
| **0** | Payment fails, Stripe Smart Retry queued | "Payment failed" — include update card link | Full access |
| **1** | First automatic retry | — | Full access |
| **3** | Second retry | "Reminder: update your payment method" | Full access |
| **5** | Third retry | "Urgent: your subscription is at risk" | Full access |
| **7** | Fourth retry | "Final warning: action required within 7 days" | Full access (consider read-only) |
| **14** | Final retry attempt | "Account suspended — reactivate anytime" | Suspended (downgrade to free) |
| **30** | — | "We miss you — reactivate your account" (win-back) | Suspended |
| **60** | — | Final win-back | Suspended |
| **90** | Cancel subscription, archive data | — | Cancelled |

> Stripe Smart Retries uses ML to pick optimal retry times based on the card network and failure reason. Enable it in Dashboard > Settings > Subscriptions and emails > Manage failed payments.

---

## Copy-paste template

### Stripe webhook handler for dunning (TypeScript)

```ts
// app/api/webhooks/stripe/route.ts
// [CUSTOMIZE] Stripe webhook handler with dunning logic

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia', // [CUSTOMIZE] use latest API version
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text(); // Must use raw body for signature verification
  const signature = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  // Step 1: Verify webhook signature (HMAC)
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Step 2: Idempotency check — skip if already processed
  // [CUSTOMIZE] Replace with your database/cache implementation
  const alreadyProcessed = await checkEventProcessed(event.id);
  if (alreadyProcessed) {
    console.log(`Event ${event.id} already processed, skipping`);
    return NextResponse.json({ received: true });
  }

  // Step 3: Handle the event
  try {
    switch (event.type) {
      // --- Checkout & Subscription Creation ---
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      // --- Subscription Lifecycle ---
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      // --- Payment Success/Failure (Dunning) ---
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      // --- Trial Ending ---
      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object as Stripe.Subscription);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Step 4: Mark event as processed
    await markEventProcessed(event.id);

  } catch (err) {
    console.error(`Error processing event ${event.type}:`, err);
    // Return 200 to prevent retries for processing errors
    // [CUSTOMIZE] You may want to return 500 for transient errors to trigger retries
    // For now, log the error and acknowledge receipt
  }

  return NextResponse.json({ received: true });
}

// --- Event Handlers ---

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  // [CUSTOMIZE] Update your database
  // await db.user.update({
  //   where: { stripeCustomerId: customerId },
  //   data: {
  //     stripeSubscriptionId: subscriptionId,
  //     plan: 'pro', // Map from price ID to your plan name
  //     subscriptionStatus: 'active',
  //   },
  // });

  console.log(`Checkout completed: customer=${customerId}, subscription=${subscriptionId}`);
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const status = subscription.status; // 'active', 'trialing', etc.
  const planId = subscription.items.data[0]?.price.id;

  // [CUSTOMIZE] Sync subscription to your database
  console.log(`Subscription created: customer=${customerId}, status=${status}, plan=${planId}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const status = subscription.status;
  const planId = subscription.items.data[0]?.price.id;

  // [CUSTOMIZE] Sync updated subscription status and plan
  // This fires on: plan change, status change (active -> past_due), renewal, etc.
  // await db.user.update({
  //   where: { stripeCustomerId: customerId },
  //   data: {
  //     plan: mapPriceIdToPlan(planId),
  //     subscriptionStatus: status,
  //   },
  // });

  console.log(`Subscription updated: customer=${customerId}, status=${status}`);

  // If status changed to past_due, start dunning
  if (status === 'past_due') {
    await startDunningFlow(customerId);
  }

  // If status changed back to active, end dunning
  if (status === 'active') {
    await endDunningFlow(customerId);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // [CUSTOMIZE] Downgrade user to free plan
  // await db.user.update({
  //   where: { stripeCustomerId: customerId },
  //   data: {
  //     plan: 'free',
  //     subscriptionStatus: 'cancelled',
  //     stripeSubscriptionId: null,
  //   },
  // });

  console.log(`Subscription deleted: customer=${customerId}`);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const subscriptionId = invoice.subscription as string;

  // Clear any dunning state
  await endDunningFlow(customerId);

  // [CUSTOMIZE] Record successful payment, update billing history
  console.log(`Payment succeeded: customer=${customerId}, amount=${invoice.amount_paid}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const attemptCount = invoice.attempt_count;
  const nextAttempt = invoice.next_payment_attempt;

  console.log(
    `Payment failed: customer=${customerId}, attempt=${attemptCount}, ` +
    `next_attempt=${nextAttempt ? new Date(nextAttempt * 1000).toISOString() : 'none'}`
  );

  // [CUSTOMIZE] Dunning email logic based on attempt count
  await sendDunningEmail(customerId, attemptCount);

  // [CUSTOMIZE] If no more retries, suspend account
  if (!nextAttempt) {
    await suspendAccount(customerId);
  }
}

async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const trialEnd = subscription.trial_end;

  // [CUSTOMIZE] Send trial ending email (fires 3 days before trial ends)
  // await sendEmail({
  //   to: await getEmailForCustomer(customerId),
  //   template: 'trial-ending',
  //   data: { trialEndDate: new Date(trialEnd! * 1000) },
  // });

  console.log(`Trial ending: customer=${customerId}, ends=${new Date(trialEnd! * 1000).toISOString()}`);
}

// --- Dunning Flow ---

async function startDunningFlow(customerId: string) {
  // [CUSTOMIZE] Record dunning start in database
  // await db.dunningState.upsert({
  //   where: { stripeCustomerId: customerId },
  //   create: { stripeCustomerId: customerId, startedAt: new Date(), status: 'active' },
  //   update: { startedAt: new Date(), status: 'active' },
  // });
  console.log(`Dunning started: customer=${customerId}`);
}

async function endDunningFlow(customerId: string) {
  // [CUSTOMIZE] Clear dunning state, restore full access
  // await db.dunningState.update({
  //   where: { stripeCustomerId: customerId },
  //   data: { status: 'resolved', resolvedAt: new Date() },
  // });
  console.log(`Dunning resolved: customer=${customerId}`);
}

async function sendDunningEmail(customerId: string, attemptCount: number) {
  // [CUSTOMIZE] Send appropriate dunning email based on attempt count
  const emailTemplates: Record<number, string> = {
    1: 'payment-failed',           // Day 0: "Your payment failed"
    2: 'payment-failed-reminder',  // Day 3: "Reminder: update your card"
    3: 'payment-failed-urgent',    // Day 5: "Urgent: subscription at risk"
    4: 'payment-failed-final',     // Day 7: "Final warning"
  };

  const template = emailTemplates[attemptCount] || 'payment-failed-final';

  // [CUSTOMIZE] Use your email service (Resend, SendGrid, Postmark, etc.)
  // const userEmail = await getEmailForCustomer(customerId);
  // await sendEmail({
  //   to: userEmail,
  //   template,
  //   data: {
  //     updatePaymentUrl: `https://[CUSTOMIZE].com/billing/update-payment`,
  //     supportEmail: 'support@[CUSTOMIZE].com',
  //   },
  // });

  console.log(`Dunning email sent: customer=${customerId}, template=${template}, attempt=${attemptCount}`);
}

async function suspendAccount(customerId: string) {
  // [CUSTOMIZE] Suspend the account — downgrade to free tier
  // await db.user.update({
  //   where: { stripeCustomerId: customerId },
  //   data: { plan: 'free', subscriptionStatus: 'suspended' },
  // });

  // [CUSTOMIZE] Send suspension notification
  // await sendEmail({
  //   to: await getEmailForCustomer(customerId),
  //   template: 'account-suspended',
  //   data: { reactivateUrl: `https://[CUSTOMIZE].com/billing/reactivate` },
  // });

  console.log(`Account suspended: customer=${customerId}`);
}

// --- Idempotency Helpers ---

async function checkEventProcessed(eventId: string): Promise<boolean> {
  // [CUSTOMIZE] Check your database or Redis cache
  // return await db.processedWebhookEvent.findUnique({ where: { eventId } }) !== null;
  return false; // Stub — implement with your database
}

async function markEventProcessed(eventId: string): Promise<void> {
  // [CUSTOMIZE] Store in your database or Redis with TTL
  // await db.processedWebhookEvent.create({ data: { eventId, processedAt: new Date() } });
  // Clean up events older than 30 days periodically
}
```

### Card expiry notification (cron job)

```ts
// jobs/card-expiry-check.ts
// [CUSTOMIZE] Run daily to notify customers of expiring cards

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function checkExpiringCards() {
  const now = new Date();
  const targetMonth = now.getMonth() + 2; // Check cards expiring next month
  const targetYear = now.getFullYear() + (targetMonth > 12 ? 1 : 0);
  const normalizedMonth = ((targetMonth - 1) % 12) + 1;

  // [CUSTOMIZE] Query your database for active subscribers
  // const activeSubscribers = await db.user.findMany({
  //   where: { subscriptionStatus: 'active', stripeCustomerId: { not: null } },
  // });

  // For each subscriber, check their default payment method
  // for (const user of activeSubscribers) {
  //   const customer = await stripe.customers.retrieve(user.stripeCustomerId, {
  //     expand: ['default_source', 'invoice_settings.default_payment_method'],
  //   });
  //
  //   const pm = customer.invoice_settings?.default_payment_method as Stripe.PaymentMethod;
  //   if (pm?.card?.exp_month === normalizedMonth && pm?.card?.exp_year === targetYear) {
  //     await sendEmail({
  //       to: user.email,
  //       template: 'card-expiring',
  //       data: {
  //         cardLast4: pm.card.last4,
  //         cardBrand: pm.card.brand,
  //         expiryDate: `${normalizedMonth}/${targetYear}`,
  //         updateUrl: `https://[CUSTOMIZE].com/billing/update-payment`,
  //       },
  //     });
  //   }
  // }

  console.log(`Card expiry check completed for ${normalizedMonth}/${targetYear}`);
}
```

---

## Email templates (content outlines)

### Payment Failed (Day 0)

```
Subject: Your payment for [APP_NAME] failed

Body:
- We were unable to process your payment of $[AMOUNT] for your [PLAN_NAME] plan.
- This is usually because your card expired or was declined.
- [PRIMARY CTA BUTTON: Update payment method]
- Your account remains active. We will automatically retry in a few days.
- If you need help, reply to this email.
```

### Payment Failed Reminder (Day 3)

```
Subject: Reminder: Please update your payment method

Body:
- A friendly reminder that your last payment of $[AMOUNT] was unsuccessful.
- To avoid any interruption to your [PLAN_NAME] plan, please update your payment method.
- [PRIMARY CTA BUTTON: Update payment method]
- We will retry your payment again in 2 days.
```

### Urgent Warning (Day 7)

```
Subject: Action required: Your [APP_NAME] subscription is at risk

Body:
- We have been unable to process your payment after multiple attempts.
- Your [PLAN_NAME] features will be restricted in 7 days unless you update your payment.
- [PRIMARY CTA BUTTON: Update payment method now]
- If you would like to cancel instead, you can do so in your billing settings.
- Need help? Contact support@[APP_NAME].com
```

### Final Warning (Day 12)

```
Subject: Final notice: Your [APP_NAME] account will be downgraded in 2 days

Body:
- This is our final attempt to reach you about your failed payment.
- In 2 days, your account will be downgraded to the Free plan.
- You will lose access to: [LIST 2-3 KEY PAID FEATURES]
- Your data will be preserved, and you can reactivate anytime.
- [PRIMARY CTA BUTTON: Update payment method to keep your plan]
```

### Account Suspended (Day 14)

```
Subject: Your [APP_NAME] account has been downgraded

Body:
- Your [PLAN_NAME] subscription has been cancelled due to payment failure.
- Your account has been downgraded to the Free plan.
- Your data is safe — nothing has been deleted.
- You can reactivate your subscription anytime:
- [PRIMARY CTA BUTTON: Reactivate my subscription]
- If you have questions, we are here to help: support@[APP_NAME].com
```

### Card Expiring Soon (30 days before)

```
Subject: Your card ending in [LAST4] is expiring soon

Body:
- The [BRAND] card ending in [LAST4] on your [APP_NAME] account expires on [EXPIRY_DATE].
- To avoid any interruption to your [PLAN_NAME] plan, please update your payment method.
- [PRIMARY CTA BUTTON: Update payment method]
- If you have already updated your card, you can ignore this email.
```

---

## Dunning metrics to track

| Metric | Target | How to measure |
|--------|--------|----------------|
| **Involuntary churn rate** | <1% of MRR/month | MRR lost to failed payments / total MRR |
| **Recovery rate** | >60% of failed payments | Payments recovered via dunning / total failed payments |
| **Average recovery time** | <5 days | Mean days from first failure to successful payment |
| **Pre-dunning prevention** | >30% of potential failures | Card updates before expiry / expiring cards notified |
| **Email open rate (dunning)** | >50% | Opens / sent for dunning emails |
| **CTA click rate (update card)** | >15% | Clicks on update link / opened dunning emails |

---

## Customization notes

- **B2B SaaS**: Use longer grace periods (21-30 days). Business customers often have procurement/AP processes that cause delays. Consider phone outreach for high-value accounts.
- **Consumer SaaS**: Shorter grace periods (7-14 days) are appropriate. Consumers act faster but are also more likely to let subscriptions lapse intentionally.
- **High-value accounts**: For customers paying >$500/mo, add a personal email or phone call at Day 3. Recovery rates are significantly higher with human outreach for high-value accounts.
- **Stripe Smart Retries**: Enable this. It uses ML to pick the optimal retry time based on card network, bank, and historical success patterns. It recovers 10-15% more failed payments than fixed schedules.
- **In-app notifications**: Supplement emails with in-app banners. Many users ignore emails but notice UI changes. Show a persistent banner: "Your payment failed. Update your card to keep your [PLAN] features."
- **Cancellation deflection**: When a user clicks "Cancel," offer alternatives first: pause subscription (1-3 months), downgrade to a cheaper plan, or extend their billing period. This can reduce voluntary churn by 15-30%.

## Companion tools

- `wrsmith108/stripe-mcp-skill` — Manage Stripe subscriptions and test webhook events
- Stripe CLI — `stripe trigger invoice.payment_failed` for local testing
