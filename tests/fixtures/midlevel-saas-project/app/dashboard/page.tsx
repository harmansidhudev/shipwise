import { Suspense } from 'react';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard-shell';
import { db } from '@/lib/db';
import { BarChart3, CheckSquare, FolderOpen, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

async function DashboardStats({ orgId }: { orgId: string }) {
  const [projectCount, taskCounts, memberCount] = await Promise.all([
    db.project.count({ where: { organizationId: orgId, status: 'ACTIVE' } }),
    db.task.groupBy({
      by: ['status'],
      where: { project: { organizationId: orgId } },
      _count: { status: true },
    }),
    db.user.count({ where: { organizationId: orgId } }),
  ]);

  const totalTasks = taskCounts.reduce((sum, g) => sum + g._count.status, 0);
  const doneTasks = taskCounts.find((g) => g.status === 'DONE')?._count.status ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard
        icon={FolderOpen}
        label="Active Projects"
        value={projectCount.toString()}
        color="text-primary-600"
        bg="bg-primary-50"
      />
      <StatCard
        icon={CheckSquare}
        label="Tasks Complete"
        value={`${doneTasks} / ${totalTasks}`}
        color="text-green-600"
        bg="bg-green-50"
      />
      <StatCard
        icon={BarChart3}
        label="In Progress"
        value={(taskCounts.find((g) => g.status === 'IN_PROGRESS')?._count.status ?? 0).toString()}
        color="text-amber-600"
        bg="bg-amber-50"
      />
      <StatCard
        icon={Users}
        label="Team Members"
        value={memberCount.toString()}
        color="text-purple-600"
        bg="bg-purple-50"
      />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  bg,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
  bg: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-secondary-100 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-secondary-500">{label}</span>
        <div className={`${bg} p-2 rounded-lg`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
      </div>
      <p className="text-2xl font-bold text-secondary-900">{value}</p>
    </div>
  );
}

async function RecentActivity({ orgId }: { orgId: string }) {
  const recentLogs = await db.auditLog.findMany({
    where: { user: { organizationId: orgId } },
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: { user: { select: { name: true, email: true } } },
  });

  if (recentLogs.length === 0) {
    return (
      <div className="text-center py-8 text-secondary-400">
        <p>No activity yet. Create your first project to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recentLogs.map((log) => (
        <div key={log.id} className="flex items-start gap-3 py-3 border-b border-secondary-50 last:border-0">
          <div className="w-8 h-8 bg-secondary-200 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium text-secondary-600">
            {(log.user.name ?? log.user.email).charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-secondary-700">
              <span className="font-medium">{log.user.name ?? log.user.email}</span>{' '}
              {log.action.replace('.', ' ')}
            </p>
            <p className="text-xs text-secondary-400 mt-0.5">
              {formatDistanceToNow(log.createdAt, { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-secondary-100 p-5 shadow-sm animate-pulse">
          <div className="h-4 bg-secondary-100 rounded w-24 mb-3" />
          <div className="h-8 bg-secondary-100 rounded w-16" />
        </div>
      ))}
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-start gap-3 py-3 animate-pulse">
          <div className="w-8 h-8 bg-secondary-100 rounded-full flex-shrink-0" />
          <div className="flex-1">
            <div className="h-4 bg-secondary-100 rounded w-3/4 mb-1.5" />
            <div className="h-3 bg-secondary-100 rounded w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function DashboardPage() {
  const { orgId } = auth();

  if (!orgId) {
    redirect('/sign-in');
  }

  return (
    <DashboardShell>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-secondary-900">Dashboard</h1>
          <p className="text-secondary-500 mt-1">
            Here&apos;s what&apos;s happening across your organization.
          </p>
        </div>

        <Suspense fallback={<StatsSkeleton />}>
          <DashboardStats orgId={orgId} />
        </Suspense>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-secondary-100 p-6 shadow-sm">
            <h2 className="text-base font-semibold text-secondary-900 mb-4">Recent Activity</h2>
            <Suspense fallback={<ActivitySkeleton />}>
              <RecentActivity orgId={orgId} />
            </Suspense>
          </div>
          <div className="bg-white rounded-xl border border-secondary-100 p-6 shadow-sm">
            <h2 className="text-base font-semibold text-secondary-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <a
                href="/dashboard/projects"
                className="block w-full text-left px-4 py-2.5 text-sm text-secondary-700 rounded-lg border border-secondary-100 hover:bg-secondary-50 transition-colors"
              >
                View all projects
              </a>
              <a
                href="/dashboard/projects?new=true"
                className="block w-full text-left px-4 py-2.5 text-sm text-primary-700 rounded-lg border border-primary-100 bg-primary-50 hover:bg-primary-100 transition-colors"
              >
                + Create new project
              </a>
              <a
                href="/dashboard/settings/team"
                className="block w-full text-left px-4 py-2.5 text-sm text-secondary-700 rounded-lg border border-secondary-100 hover:bg-secondary-50 transition-colors"
              >
                Invite teammates
              </a>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
