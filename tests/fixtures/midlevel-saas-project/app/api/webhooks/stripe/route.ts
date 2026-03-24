import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

// Stripe requires the raw body to verify webhook signatures
export const dynamic = 'force-dynamic';

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const orgId = session.metadata?.organizationId;
  if (!orgId) {
    console.error('Missing organizationId in checkout session metadata');
    return;
  }

  const customerId =
    typeof session.customer === 'string' ? session.customer : session.customer?.id;
  if (!customerId) return;

  // Update org with customer ID
  await db.organization.update({
    where: { id: orgId },
    data: { stripeCustomerId: customerId },
  });
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const customerId =
    typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;
  if (!customerId) return;

  const org = await db.organization.findUnique({
    where: { stripeCustomerId: customerId },
  });
  if (!org) {
    console.warn(`No org found for Stripe customer ${customerId}`);
    return;
  }

  await db.invoice.upsert({
    where: { stripeInvoiceId: invoice.id },
    create: {
      stripeInvoiceId: invoice.id,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      status: 'paid',
      organizationId: org.id,
      pdfUrl: invoice.invoice_pdf,
    },
    update: {
      status: 'paid',
      amount: invoice.amount_paid,
    },
  });
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId =
    typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;
  if (!customerId) return;

  const org = await db.organization.findUnique({
    where: { stripeCustomerId: customerId },
  });
  if (!org) return;

  await db.invoice.upsert({
    where: { stripeInvoiceId: invoice.id },
    create: {
      stripeInvoiceId: invoice.id,
      amount: invoice.amount_due,
      currency: invoice.currency,
      status: 'open',
      organizationId: org.id,
    },
    update: { status: 'open' },
  });

  // TODO: Send payment failure email notification
  console.warn(`Payment failed for org ${org.id}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer?.id;
  if (!customerId) return;

  const org = await db.organization.findUnique({
    where: { stripeCustomerId: customerId },
  });
  if (!org) return;

  // Map Stripe price to our Plan enum
  const priceId = subscription.items.data[0]?.price?.id;
  let plan: 'FREE' | 'PRO' | 'ENTERPRISE' = 'FREE';

  if (priceId === process.env.STRIPE_PRO_MONTHLY_PRICE_ID || priceId === process.env.STRIPE_PRO_YEARLY_PRICE_ID) {
    plan = 'PRO';
  } else if (priceId === process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID) {
    plan = 'ENTERPRISE';
  }

  const status = subscription.status; // active | canceled | past_due | trialing etc.

  await db.$transaction([
    db.subscription.upsert({
      where: { organizationId: org.id },
      create: {
        stripeSubscriptionId: subscription.id,
        status,
        plan,
        organizationId: org.id,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
      update: {
        status,
        plan,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
    }),
    db.organization.update({
      where: { id: org.id },
      data: {
        plan: status === 'active' || status === 'trialing' ? plan : 'FREE',
      },
    }),
  ]);
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      default:
        // Unhandled event type — log but don't error
        console.log(`Unhandled Stripe event: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`Error processing webhook ${event.type}:`, error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
