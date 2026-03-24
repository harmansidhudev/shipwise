import { notFound } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { DashboardShell } from '@/components/dashboard-shell';
import { TaskList } from '@/components/task-list';
import { db } from '@/lib/db';
import { TaskStatus } from '@prisma/client';
import { Calendar, CheckSquare, ChevronRight, Users } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

const STATUS_COLUMNS: { status: TaskStatus; label: string; color: string }[] = [
  { status: 'TODO', label: 'To Do', color: 'bg-secondary-100 text-secondary-700' },
  { status: 'IN_PROGRESS', label: 'In Progress', color: 'bg-amber-100 text-amber-700' },
  { status: 'IN_REVIEW', label: 'In Review', color: 'bg-blue-100 text-blue-700' },
  { status: 'DONE', label: 'Done', color: 'bg-green-100 text-green-700' },
];

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const { orgId } = auth();

  if (!orgId) {
    notFound();
  }

  const project = await db.project.findFirst({
    where: {
      id: params.id,
      organizationId: orgId,
    },
    include: {
      tasks: {
        orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
        include: {
          assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
          _count: { select: { comments: true, attachments: true } },
        },
      },
      _count: { select: { tasks: true } },
    },
  });

  if (!project) {
    notFound();
  }

  const tasksByStatus = STATUS_COLUMNS.reduce(
    (acc, col) => {
      acc[col.status] = project.tasks.filter((t) => t.status === col.status);
      return acc;
    },
    {} as Record<TaskStatus, typeof project.tasks>
  );

  const completionPct =
    project._count.tasks > 0
      ? Math.round(
          ((tasksByStatus['DONE']?.length ?? 0) / project._count.tasks) * 100
        )
      : 0;

  return (
    <DashboardShell>
      <div className="max-w-full">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-secondary-500 mb-6">
          <Link href="/dashboard/projects" className="hover:text-secondary-700">
            Projects
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-secondary-900 font-medium">{project.name}</span>
        </nav>

        {/* Project header */}
        <div className="bg-white rounded-xl border border-secondary-100 p-6 shadow-sm mb-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-xl font-bold text-secondary-900">{project.name}</h1>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    project.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-secondary-100 text-secondary-600'
                  }`}
                >
                  {project.status}
                </span>
              </div>
              {project.description && (
                <p className="text-secondary-500 text-sm max-w-2xl">{project.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-secondary-50">
            <div className="flex items-center gap-1.5 text-sm text-secondary-500">
              <CheckSquare className="w-4 h-4" />
              <span>
                {tasksByStatus['DONE']?.length ?? 0} / {project._count.tasks} tasks
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-secondary-500">
              <Users className="w-4 h-4" />
              <span>
                {
                  new Set(project.tasks.filter((t) => t.assigneeId).map((t) => t.assigneeId))
                    .size
                }{' '}
                members
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-secondary-500">
              <Calendar className="w-4 h-4" />
              <span>Updated {formatDistanceToNow(project.updatedAt, { addSuffix: true })}</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-secondary-500">{completionPct}% complete</span>
              <div className="w-32 h-1.5 bg-secondary-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 rounded-full transition-all"
                  style={{ width: `${completionPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Kanban columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {STATUS_COLUMNS.map((col) => (
            <div key={col.status} className="flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${col.color}`}>
                  {col.label}
                </span>
                <span className="text-xs text-secondary-400">
                  {tasksByStatus[col.status]?.length ?? 0}
                </span>
              </div>
              <div className="flex flex-col gap-2 flex-1 min-h-[200px]">
                {tasksByStatus[col.status]?.length > 0 ? (
                  <TaskList tasks={tasksByStatus[col.status]} projectId={project.id} />
                ) : (
                  <div className="flex-1 border-2 border-dashed border-secondary-100 rounded-xl flex items-center justify-center">
                    <p className="text-xs text-secondary-300">No tasks</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
