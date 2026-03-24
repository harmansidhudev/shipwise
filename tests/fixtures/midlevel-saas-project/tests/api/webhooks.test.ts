import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/stripe', () => ({
  stripe: {
    webhooks: {
      constructEvent: vi.fn(),
    },
  },
}));

vi.mock('@/lib/db', () => ({
  db: {
    organization: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    subscription: {
      upsert: vi.fn(),
    },
    invoice: {
      upsert: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import { POST } from '@/app/api/webhooks/stripe/route';

const mockConstructEvent = vi.mocked(stripe.webhooks.constructEvent);
const mockOrgFindUnique = vi.mocked(db.organization.findUnique);
const mockOrgUpdate = vi.mocked(db.organization.update);
const mockInvoiceUpsert = vi.mocked(db.invoice.upsert);
const mockTransaction = vi.mocked(db.$transaction);

const FAKE_ORG = {
  id: 'org_123',
  stripeCustomerId: 'cus_stripe123',
  plan: 'FREE',
};

function makeWebhookRequest(body: string, signature = 'stripe_sig_fake') {
  return new NextRequest('http://localhost/api/webhooks/stripe', {
    method: 'POST',
    body,
    headers: { 'stripe-signature': signature },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
});

describe('POST /api/webhooks/stripe', () => {
  it('returns 400 when stripe-signature header is missing', async () => {
    const req = new NextRequest('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      body: 'test',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('stripe-signature');
  });

  it('returns 400 when signature verification fails', async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error('Invalid signature');
    });

    const req = makeWebhookRequest('payload', 'bad_signature');
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('handles checkout.session.completed event', async () => {
    const fakeEvent = {
      type: 'checkout.session.completed',
      data: {
        object: {
          metadata: { organizationId: 'org_123' },
          customer: 'cus_new_customer',
        },
      },
    };
    mockConstructEvent.mockReturnValue(fakeEvent as any);
    mockOrgUpdate.mockResolvedValue({} as any);

    const req = makeWebhookRequest(JSON.stringify(fakeEvent));
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(mockOrgUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'org_123' },
        data: { stripeCustomerId: 'cus_new_customer' },
      })
    );
  });

  it('handles invoice.paid event and upserts invoice', async () => {
    const fakeEvent = {
      type: 'invoice.paid',
      data: {
        object: {
          id: 'in_stripe_123',
          customer: 'cus_stripe123',
          amount_paid: 2900,
          currency: 'usd',
          invoice_pdf: 'https://invoice.stripe.com/pdf',
        },
      },
    };
    mockConstructEvent.mockReturnValue(fakeEvent as any);
    mockOrgFindUnique.mockResolvedValue(FAKE_ORG as any);
    mockInvoiceUpsert.mockResolvedValue({} as any);

    const req = makeWebhookRequest(JSON.stringify(fakeEvent));
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(mockInvoiceUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { stripeInvoiceId: 'in_stripe_123' },
        create: expect.objectContaining({
          amount: 2900,
          status: 'paid',
          organizationId: 'org_123',
        }),
        update: expect.objectContaining({ status: 'paid' }),
      })
    );
  });

  it('handles invoice.payment_failed event', async () => {
    const fakeEvent = {
      type: 'invoice.payment_failed',
      data: {
        object: {
          id: 'in_failed_456',
          customer: 'cus_stripe123',
          amount_due: 2900,
          currency: 'usd',
        },
      },
    };
    mockConstructEvent.mockReturnValue(fakeEvent as any);
    mockOrgFindUnique.mockResolvedValue(FAKE_ORG as any);
    mockInvoiceUpsert.mockResolvedValue({} as any);

    const req = makeWebhookRequest(JSON.stringify(fakeEvent));
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(mockInvoiceUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ status: 'open' }),
      })
    );
  });

  it('handles customer.subscription.updated and updates plan to PRO', async () => {
    process.env.STRIPE_PRO_MONTHLY_PRICE_ID = 'price_pro_monthly_id';
    const fakeEvent = {
      type: 'customer.subscription.updated',
      data: {
        object: {
          id: 'sub_123',
          customer: 'cus_stripe123',
          status: 'active',
          current_period_start: 1700000000,
          current_period_end: 1702592000,
          cancel_at_period_end: false,
          items: {
            data: [{ price: { id: 'price_pro_monthly_id' } }],
          },
        },
      },
    };
    mockConstructEvent.mockReturnValue(fakeEvent as any);
    mockOrgFindUnique.mockResolvedValue(FAKE_ORG as any);
    mockTransaction.mockResolvedValue([{}, {}] as any);

    const req = makeWebhookRequest(JSON.stringify(fakeEvent));
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(mockTransaction).toHaveBeenCalled();
  });

  it('returns 200 with received: true for unhandled event types', async () => {
    const fakeEvent = {
      type: 'payment_method.attached',
      data: { object: {} },
    };
    mockConstructEvent.mockReturnValue(fakeEvent as any);

    const req = makeWebhookRequest(JSON.stringify(fakeEvent));
    const res = await POST(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.received).toBe(true);
  });
});
