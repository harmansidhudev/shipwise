import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10',
  typescript: true,
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export type CheckoutSessionParams = {
  organizationId: string;
  customerId?: string;
  priceId: string;
  successUrl?: string;
  cancelUrl?: string;
  trialDays?: number;
};

export async function createCheckoutSession({
  organizationId,
  customerId,
  priceId,
  successUrl = `${APP_URL}/dashboard/settings/billing?success=true`,
  cancelUrl = `${APP_URL}/dashboard/settings/billing?canceled=true`,
  trialDays,
}: CheckoutSessionParams): Promise<Stripe.Checkout.Session> {
  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { organizationId },
    subscription_data: {
      metadata: { organizationId },
      ...(trialDays ? { trial_period_days: trialDays } : {}),
    },
    allow_promotion_codes: true,
    billing_address_collection: 'auto',
  };

  if (customerId) {
    sessionParams.customer = customerId;
  } else {
    sessionParams.customer_creation = 'always';
  }

  return stripe.checkout.sessions.create(sessionParams);
}

export async function createBillingPortalSession(
  customerId: string,
  returnUrl = `${APP_URL}/dashboard/settings/billing`
): Promise<Stripe.BillingPortal.Session> {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

export async function getSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription | null> {
  try {
    return await stripe.subscriptions.retrieve(subscriptionId);
  } catch {
    return null;
  }
}

export async function cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

export async function getCustomer(customerId: string): Promise<Stripe.Customer | null> {
  try {
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) return null;
    return customer as Stripe.Customer;
  } catch {
    return null;
  }
}
