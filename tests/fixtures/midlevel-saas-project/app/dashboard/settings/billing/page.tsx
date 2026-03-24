import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard-shell';
import { db } from '@/lib/db';
import { createBillingPortalSession } from '@/lib/stripe';
import { CheckCircle, CreditCard, Zap } from 'lucide-react';
import { format } from 'date-fns';

const PLAN_FEATURES: Record<string, string[]> = {
  FREE: ['Up to 3 projects', '5 team members', '1GB storage', 'Basic reporting'],
  PRO: [
    'Unlimited projects',
    '25 team members',
    '50GB storage',
    'Advanced reporting',
    'Webhooks',
    'API access',
    'Priority support',
  ],
  ENTERPRISE: [
    'Everything in Pro',
    'Unlimited members',
    '1TB storage',
    'SSO / SAML',
    'Custom contracts',
    'Dedicated support',
    'SLA guarantee',
  ],
};

export default async function BillingPage() {
  const { orgId } = auth();
  if (!orgId) redirect('/sign-in');

  const org = await db.organization.findUnique({
    where: { id: orgId },
    include: {
      subscription: true,
      invoices: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
      _count: { select: { members: true, projects: true } },
    },
  });

  if (!org) redirect('/sign-in');

  const plan = org.plan;
  const features = PLAN_FEATURES[plan] ?? PLAN_FEATURES.FREE;

  let billingPortalUrl: string | null = null;
  if (org.stripeCustomerId) {
    try {
      const session = await createBillingPortalSession(org.stripeCustomerId);
      billingPortalUrl = session.url;
    } catch {
      // Customer may not have a portal session yet
    }
  }

  return (
    <DashboardShell>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-secondary-900">Billing</h1>
          <p className="text-secondary-500 mt-1">Manage your subscription and payment methods.</p>
        </div>

        {/* Current Plan */}
        <div className="bg-white rounded-xl border border-secondary-100 p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-secondary-900">Current Plan</h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary-100 text-primary-700">
                  {plan}
                </span>
              </div>
              {org.subscription && (
                <p className="text-sm text-secondary-500 mt-1">
                  Renews on{' '}
                  {format(org.subscription.currentPeriodEnd, 'MMMM d, yyyy')}
                </p>
              )}
            </div>
            {billingPortalUrl ? (
              <a
                href={billingPortalUrl}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 border border-primary-200 px-4 py-2 rounded-lg hover:bg-primary-50 transition-colors"
              >
                <CreditCard className="w-4 h-4" />
                Manage Billing
              </a>
            ) : null}
          </div>

          <ul className="space-y-2">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-secondary-600">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Usage */}
        <div className="bg-white rounded-xl border border-secondary-100 p-6 shadow-sm mb-6">
          <h2 className="text-base font-semibold text-secondary-900 mb-4">Usage This Month</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-secondary-500 mb-1">Projects</p>
              <p className="text-2xl font-bold text-secondary-900">{org._count.projects}</p>
              <div className="mt-2 h-1.5 bg-secondary-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 rounded-full"
                  style={{ width: `${Math.min((org._count.projects / (plan === 'FREE' ? 3 : 100)) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-secondary-400 mt-1">
                {plan === 'FREE' ? `of 3 included` : 'Unlimited'}
              </p>
            </div>
            <div>
              <p className="text-sm text-secondary-500 mb-1">Team Members</p>
              <p className="text-2xl font-bold text-secondary-900">{org._count.members}</p>
              <div className="mt-2 h-1.5 bg-secondary-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 rounded-full"
                  style={{ width: `${Math.min((org._count.members / (plan === 'FREE' ? 5 : plan === 'PRO' ? 25 : 1000)) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-secondary-400 mt-1">
                {plan === 'FREE' ? 'of 5 seats' : plan === 'PRO' ? 'of 25 seats' : 'Unlimited'}
              </p>
            </div>
          </div>
        </div>

        {/* Upgrade CTA — only show on FREE */}
        {plan === 'FREE' && (
          <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl p-6 text-white mb-6">
            <div className="flex items-start gap-3">
              <Zap className="w-6 h-6 text-primary-200 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1">Upgrade to Pro</h3>
                <p className="text-primary-100 text-sm mb-4">
                  Unlock unlimited projects, 25 team members, webhooks, and priority support for
                  $29/month.
                </p>
                <a
                  href="/api/billing/checkout?plan=PRO"
                  className="inline-flex items-center gap-1.5 bg-white text-primary-700 font-medium text-sm px-4 py-2 rounded-lg hover:bg-primary-50 transition-colors"
                >
                  Upgrade now
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Invoice History */}
        {org.invoices.length > 0 && (
          <div className="bg-white rounded-xl border border-secondary-100 p-6 shadow-sm">
            <h2 className="text-base font-semibold text-secondary-900 mb-4">Invoice History</h2>
            <div className="space-y-3">
              {org.invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between py-2 border-b border-secondary-50 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-secondary-700">
                      ${(invoice.amount / 100).toFixed(2)} {invoice.currency.toUpperCase()}
                    </p>
                    <p className="text-xs text-secondary-400">
                      {format(invoice.createdAt, 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        invoice.status === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {invoice.status}
                    </span>
                    {invoice.pdfUrl && (
                      <a
                        href={invoice.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary-600 hover:underline"
                      >
                        Download
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
