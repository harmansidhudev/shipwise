import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('stripe', () => {
  const mockStripe = {
    checkout: {
      sessions: { create: vi.fn() },
    },
    billingPortal: {
      sessions: { create: vi.fn() },
    },
    subscriptions: {
      retrieve: vi.fn(),
      update: vi.fn(),
    },
    customers: {
      retrieve: vi.fn(),
    },
    webhooks: {
      constructEvent: vi.fn(),
    },
  };
  return { default: vi.fn(() => mockStripe) };
});

import Stripe from 'stripe';

const mockStripeInstance = new (Stripe as any)('fake_key');

beforeEach(() => {
  vi.clearAllMocks();
  process.env.STRIPE_SECRET_KEY = 'sk_test_fake';
  process.env.NEXT_PUBLIC_APP_URL = 'https://app.example.com';
});

describe('createCheckoutSession', () => {
  it('creates a checkout session with the correct parameters', async () => {
    const fakeSession = { id: 'cs_test_123', url: 'https://checkout.stripe.com/pay/cs_test_123' };
    mockStripeInstance.checkout.sessions.create.mockResolvedValue(fakeSession);

    const { createCheckoutSession } = await import('@/lib/stripe');
    const session = await createCheckoutSession({
      organizationId: 'org_123',
      priceId: 'price_pro_monthly',
    });

    expect(session).toEqual(fakeSession);
    expect(mockStripeInstance.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'subscription',
        line_items: [{ price: 'price_pro_monthly', quantity: 1 }],
        metadata: { organizationId: 'org_123' },
      })
    );
  });

  it('includes existing customerId when provided', async () => {
    mockStripeInstance.checkout.sessions.create.mockResolvedValue({ id: 'cs_test_456' });
    const { createCheckoutSession } = await import('@/lib/stripe');

    await createCheckoutSession({
      organizationId: 'org_123',
      customerId: 'cus_existing',
      priceId: 'price_pro_monthly',
    });

    expect(mockStripeInstance.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({ customer: 'cus_existing' })
    );
  });

  it('includes trial days when provided', async () => {
    mockStripeInstance.checkout.sessions.create.mockResolvedValue({ id: 'cs_test_789' });
    const { createCheckoutSession } = await import('@/lib/stripe');

    await createCheckoutSession({
      organizationId: 'org_123',
      priceId: 'price_pro_monthly',
      trialDays: 14,
    });

    expect(mockStripeInstance.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        subscription_data: expect.objectContaining({
          trial_period_days: 14,
        }),
      })
    );
  });
});

describe('createBillingPortalSession', () => {
  it('creates a billing portal session', async () => {
    const fakePortalSession = { id: 'bps_test_123', url: 'https://billing.stripe.com/session/bps_test_123' };
    mockStripeInstance.billingPortal.sessions.create.mockResolvedValue(fakePortalSession);

    const { createBillingPortalSession } = await import('@/lib/stripe');
    const session = await createBillingPortalSession('cus_123');

    expect(session).toEqual(fakePortalSession);
    expect(mockStripeInstance.billingPortal.sessions.create).toHaveBeenCalledWith({
      customer: 'cus_123',
      return_url: 'https://app.example.com/dashboard/settings/billing',
    });
  });

  it('uses custom return URL when provided', async () => {
    mockStripeInstance.billingPortal.sessions.create.mockResolvedValue({ id: 'bps_test_456' });
    const { createBillingPortalSession } = await import('@/lib/stripe');

    await createBillingPortalSession('cus_123', 'https://custom-return.example.com');

    expect(mockStripeInstance.billingPortal.sessions.create).toHaveBeenCalledWith({
      customer: 'cus_123',
      return_url: 'https://custom-return.example.com',
    });
  });
});

describe('getSubscription', () => {
  it('returns a subscription when found', async () => {
    const fakeSub = { id: 'sub_123', status: 'active' };
    mockStripeInstance.subscriptions.retrieve.mockResolvedValue(fakeSub);

    const { getSubscription } = await import('@/lib/stripe');
    const sub = await getSubscription('sub_123');

    expect(sub).toEqual(fakeSub);
  });

  it('returns null when subscription not found', async () => {
    mockStripeInstance.subscriptions.retrieve.mockRejectedValue(new Error('No such subscription'));

    const { getSubscription } = await import('@/lib/stripe');
    const sub = await getSubscription('sub_nonexistent');

    expect(sub).toBeNull();
  });
});
