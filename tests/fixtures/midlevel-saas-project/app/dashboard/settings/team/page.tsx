'use client';

import { useState, useEffect } from 'react';
import { useOrganization, useUser } from '@clerk/nextjs';
import { DashboardShell } from '@/components/dashboard-shell';
import { Button } from '@/components/ui/button';
import { Mail, MoreHorizontal, Shield, Trash2, UserPlus } from 'lucide-react';

type Member = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  avatarUrl: string | null;
  createdAt: string;
};

const ROLE_LABELS: Record<string, string> = {
  owner: 'Owner',
  admin: 'Admin',
  member: 'Member',
};

export default function TeamPage() {
  const { user } = useUser();
  const { organization } = useOrganization();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await fetch('/api/team');
        if (!res.ok) throw new Error('Failed to fetch team');
        const data = await res.json();
        setMembers(data.members);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setInviteError('');
    setInviteSuccess('');

    try {
      const res = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? 'Failed to send invite');
      }
      setInviteSuccess(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
    } catch (err: unknown) {
      setInviteError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Remove this member from the organization?')) return;
    try {
      await fetch(`/api/team/${memberId}`, { method: 'DELETE' });
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } catch {
      console.error('Failed to remove member');
    }
    setActionMenuOpen(null);
  };

  const handleChangeRole = async (memberId: string, newRole: string) => {
    try {
      await fetch(`/api/team/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
      );
    } catch {
      console.error('Failed to update role');
    }
    setActionMenuOpen(null);
  };

  return (
    <DashboardShell>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-secondary-900">Team</h1>
          <p className="text-secondary-500 mt-1">
            Manage your {organization?.name} team members and permissions.
          </p>
        </div>

        {/* Invite form */}
        <div className="bg-white rounded-xl border border-secondary-100 p-6 shadow-sm mb-6">
          <h2 className="text-base font-semibold text-secondary-900 mb-4 flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Invite New Member
          </h2>
          <form onSubmit={handleInvite} className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1.5">Role</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="px-3 py-2 text-sm border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <Button type="submit" disabled={inviting || !inviteEmail.trim()}>
              {inviting ? 'Sending...' : 'Send Invite'}
            </Button>
          </form>
          {inviteError && <p className="text-sm text-red-600 mt-2">{inviteError}</p>}
          {inviteSuccess && <p className="text-sm text-green-600 mt-2">{inviteSuccess}</p>}
        </div>

        {/* Members list */}
        <div className="bg-white rounded-xl border border-secondary-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-secondary-50">
            <h2 className="text-base font-semibold text-secondary-900">
              Members{' '}
              <span className="ml-1 text-sm font-normal text-secondary-400">({members.length})</span>
            </h2>
          </div>
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-10 h-10 bg-secondary-100 rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-secondary-100 rounded w-32 mb-1.5" />
                    <div className="h-3 bg-secondary-100 rounded w-48" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ul className="divide-y divide-secondary-50">
              {members.map((member) => {
                const isCurrentUser = member.email === user?.emailAddresses[0]?.emailAddress;
                return (
                  <li key={member.id} className="flex items-center gap-4 px-6 py-4">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 font-medium text-primary-700 text-sm">
                      {member.avatarUrl ? (
                        <img
                          src={member.avatarUrl}
                          alt={member.name ?? member.email}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        (member.name ?? member.email).charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-secondary-900 truncate">
                          {member.name ?? 'Unnamed'}
                          {isCurrentUser && (
                            <span className="ml-1.5 text-xs text-secondary-400">(you)</span>
                          )}
                        </p>
                        {member.role === 'owner' && (
                          <Shield className="w-3.5 h-3.5 text-amber-500" />
                        )}
                      </div>
                      <p className="text-xs text-secondary-400 truncate">{member.email}</p>
                    </div>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary-100 text-secondary-600">
                      {ROLE_LABELS[member.role] ?? member.role}
                    </span>
                    {!isCurrentUser && member.role !== 'owner' && (
                      <div className="relative">
                        <button
                          onClick={() =>
                            setActionMenuOpen(actionMenuOpen === member.id ? null : member.id)
                          }
                          className="p-1.5 rounded-lg text-secondary-400 hover:bg-secondary-50 hover:text-secondary-600"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        {actionMenuOpen === member.id && (
                          <div className="absolute right-0 top-8 w-40 bg-white border border-secondary-100 rounded-lg shadow-lg z-10 py-1">
                            <button
                              onClick={() =>
                                handleChangeRole(
                                  member.id,
                                  member.role === 'admin' ? 'member' : 'admin'
                                )
                              }
                              className="w-full text-left px-3 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                            >
                              Make {member.role === 'admin' ? 'Member' : 'Admin'}
                            </button>
                            <button
                              onClick={() => handleRemoveMember(member.id)}
                              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-1.5"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
