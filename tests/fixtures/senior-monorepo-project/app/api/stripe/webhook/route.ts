import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    logger.error({ error }, "Stripe webhook signature verification failed");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  logger.info({ eventType: event.type, eventId: event.id }, "Stripe webhook received");

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription);
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCancelled(subscription);
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }
      default:
        logger.info({ eventType: event.type }, "Unhandled Stripe event");
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error({ error, eventType: event.type }, "Stripe webhook handler failed");
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const plan = subscription.status === "active" ? "PRO" : "FREE";

  await db.organization.updateMany({
    where: { stripeCustomerId: customerId },
    data: { plan, stripeSubscriptionId: subscription.id },
  });
}

async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  await db.organization.updateMany({
    where: { stripeCustomerId: customerId },
    data: { plan: "FREE", stripeSubscriptionId: null },
  });
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  logger.warn({ customerId, invoiceId: invoice.id }, "Payment failed");
  // TODO: Send payment failure notification email
}
