import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
  typescript: true,
});

export const PLANS = {
  FREE: {
    name: "Free",
    priceId: null,
    limits: { projects: 3, members: 1, storage: 1_000_000 },
  },
  PRO: {
    name: "Pro",
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    limits: { projects: 50, members: 10, storage: 10_000_000 },
  },
  ENTERPRISE: {
    name: "Enterprise",
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    limits: { projects: Infinity, members: Infinity, storage: Infinity },
  },
} as const;

export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  returnUrl: string
) {
  return stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "subscription",
    success_url: `${returnUrl}?success=true`,
    cancel_url: `${returnUrl}?cancelled=true`,
    allow_promotion_codes: true,
  });
}

export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}
