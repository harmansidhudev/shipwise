'use client';

import { useState } from 'react';
import { useOrganization } from '@clerk/nextjs';
import { DashboardShell } from '@/components/dashboard-shell';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

type Tab = 'general' | 'team' | 'billing';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const { organization, isLoaded } = useOrganization();
  const [orgName, setOrgName] = useState(organization?.name ?? '');
  const [slug, setSlug] = useState(organization?.slug ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // In a real app, this would call an API
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'general', label: 'General' },
    { key: 'team', label: 'Team' },
    { key: 'billing', label: 'Billing' },
  ];

  return (
    <DashboardShell>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-secondary-900">Settings</h1>
          <p className="text-secondary-500 mt-1">Manage your organization preferences.</p>
        </div>

        {/* Tab navigation */}
        <div className="flex gap-1 border-b border-secondary-100 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* General Tab */}
        {activeTab === 'general' && (
          <div className="bg-white rounded-xl border border-secondary-100 p-6 shadow-sm">
            <h2 className="text-base font-semibold text-secondary-900 mb-6">
              Organization Details
            </h2>
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label
                  htmlFor="orgName"
                  className="block text-sm font-medium text-secondary-700 mb-1.5"
                >
                  Organization Name
                </label>
                <input
                  id="orgName"
                  type="text"
                  value={isLoaded ? orgName : ''}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Acme Corp"
                  className="w-full px-3 py-2 text-sm border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label
                  htmlFor="slug"
                  className="block text-sm font-medium text-secondary-700 mb-1.5"
                >
                  URL Slug
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-2 text-sm bg-secondary-50 border border-r-0 border-secondary-200 rounded-l-lg text-secondary-400">
                    app.acmehub.io/
                  </span>
                  <input
                    id="slug"
                    type="text"
                    value={isLoaded ? slug : ''}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="acme-corp"
                    className="flex-1 px-3 py-2 text-sm border border-secondary-200 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-secondary-400 mt-1.5">
                  Only lowercase letters, numbers, and hyphens.
                </p>
              </div>
              <div className="pt-2">
                <Button type="submit" disabled={saving} className="gap-1.5">
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : saved ? 'Saved!' : 'Save changes'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Team Tab — redirect to full page */}
        {activeTab === 'team' && (
          <div className="bg-white rounded-xl border border-secondary-100 p-6 shadow-sm">
            <p className="text-secondary-500 text-sm">
              Manage team members in the{' '}
              <a href="/dashboard/settings/team" className="text-primary-600 hover:underline">
                Team Settings
              </a>{' '}
              page.
            </p>
          </div>
        )}

        {/* Billing Tab — redirect to full page */}
        {activeTab === 'billing' && (
          <div className="bg-white rounded-xl border border-secondary-100 p-6 shadow-sm">
            <p className="text-secondary-500 text-sm">
              Manage your subscription in the{' '}
              <a href="/dashboard/settings/billing" className="text-primary-600 hover:underline">
                Billing Settings
              </a>{' '}
              page.
            </p>
          </div>
        )}

        {/* Danger Zone */}
        {activeTab === 'general' && (
          <div className="bg-white rounded-xl border border-red-100 p-6 shadow-sm mt-6">
            <h2 className="text-base font-semibold text-red-700 mb-2">Danger Zone</h2>
            <p className="text-sm text-secondary-500 mb-4">
              Permanently delete this organization and all of its data. This action cannot be undone.
            </p>
            <Button variant="destructive" className="text-sm">
              Delete Organization
            </Button>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
