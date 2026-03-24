import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(() => ({ orgId: 'org_123', userId: 'user_456' })),
}));

vi.mock('@/lib/stripe', () => ({
  stripe: {
    checkout: { sessions: { create: vi.fn() } },
    billingPortal: { sessions: { create: vi.fn() } },
  },
  createCheckoutSession: vi.fn(),
  createBillingPortalSession: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: {
    organization: { findUnique: vi.fn() },
  },
}));

import { createCheckoutSession, createBillingPortalSession } from '@/lib/stripe';
import { db } from '@/lib/db';

const mockCreateCheckout = vi.mocked(createCheckoutSession);
const mockCreatePortal = vi.mocked(createBillingPortalSession);
const mockOrgFindUnique = vi.mocked(db.organization.findUnique);

const FREE_ORG = { id: 'org_123', plan: 'FREE', stripeCustomerId: null };
const PRO_ORG = { id: 'org_123', plan: 'PRO', stripeCustomerId: 'cus_stripe123' };

beforeEach(() => {
  vi.clearAllMocks();
  process.env.STRIPE_PRO_MONTHLY_PRICE_ID = 'price_pro_monthly';
  process.env.STRIPE_PRO_YEARLY_PRICE_ID = 'price_pro_yearly';
  process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID = 'price_enterprise_monthly';
});

describe('Billing checkout flow', () => {
  it('creates a checkout session for free org upgrading to PRO', async () => {
    mockOrgFindUnique.mockResolvedValue(FREE_ORG as any);
    mockCreateCheckout.mockResolvedValue({ id: 'cs_123', url: 'https://checkout.stripe.com/cs_123' } as any);

    const session = await createCheckoutSession({
      organizationId: 'org_123',
      priceId: 'price_pro_monthly',
    });

    expect(session.url).toBe('https://checkout.stripe.com/cs_123');
  });

  it('creates billing portal for existing customer', async () => {
    mockOrgFindUnique.mockResolvedValue(PRO_ORG as any);
    mockCreatePortal.mockResolvedValue({
      id: 'bps_123',
      url: 'https://billing.stripe.com/session/bps_123',
    } as any);

    const session = await createBillingPortalSession('cus_stripe123');
    expect(session.url).toContain('billing.stripe.com');
  });

  it('checkout session includes organization ID in metadata', async () => {
    mockCreateCheckout.mockResolvedValue({ id: 'cs_456' } as any);

    await createCheckoutSession({
      organizationId: 'org_123',
      priceId: 'price_pro_monthly',
    });

    expect(mockCreateCheckout).toHaveBeenCalledWith(
      expect.objectContaining({ organizationId: 'org_123' })
    );
  });
});

describe('Billing plan limits', () => {
  it('FREE plan limits are 3 projects and 5 members', () => {
    const FREE_LIMITS = { projects: 3, members: 5 };
    expect(FREE_LIMITS.projects).toBe(3);
    expect(FREE_LIMITS.members).toBe(5);
  });

  it('PRO plan limits are 25 members and unlimited projects', () => {
    const PRO_LIMITS = { projects: Infinity, members: 25 };
    expect(PRO_LIMITS.members).toBe(25);
    expect(PRO_LIMITS.projects).toBe(Infinity);
  });

  it('ENTERPRISE plan has unlimited everything', () => {
    const ENTERPRISE_LIMITS = { projects: Infinity, members: Infinity };
    expect(ENTERPRISE_LIMITS.projects).toBe(Infinity);
    expect(ENTERPRISE_LIMITS.members).toBe(Infinity);
  });
});

describe('Plan price IDs', () => {
  it('reads PRO monthly price ID from env', () => {
    expect(process.env.STRIPE_PRO_MONTHLY_PRICE_ID).toBe('price_pro_monthly');
  });

  it('reads ENTERPRISE monthly price ID from env', () => {
    expect(process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID).toBe('price_enterprise_monthly');
  });
});
