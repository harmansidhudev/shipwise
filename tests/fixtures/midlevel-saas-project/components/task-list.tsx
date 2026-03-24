import { format, isPast } from 'date-fns';
import { AlertCircle, Calendar, MessageSquare, Paperclip } from 'lucide-react';

type Assignee = {
  id: string;
  name: string | null;
  email: string;
  avatarUrl: string | null;
};

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignee: Assignee | null;
  dueDate: Date | null;
  projectId: string;
  _count: { comments: number; attachments: number };
};

const PRIORITY_CONFIG = {
  LOW: { label: 'Low', class: 'bg-secondary-100 text-secondary-500' },
  MEDIUM: { label: 'Medium', class: 'bg-blue-50 text-blue-600' },
  HIGH: { label: 'High', class: 'bg-amber-50 text-amber-700' },
  URGENT: { label: 'Urgent', class: 'bg-red-50 text-red-700' },
};

type TaskListProps = {
  tasks: Task[];
  projectId: string;
};

function AssigneeAvatar({ assignee }: { assignee: Assignee }) {
  const initials = assignee.name
    ? assignee.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : assignee.email.charAt(0).toUpperCase();

  return (
    <div
      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
      title={assignee.name ?? assignee.email}
    >
      {assignee.avatarUrl ? (
        <img
          src={assignee.avatarUrl}
          alt={assignee.name ?? assignee.email}
          className="w-6 h-6 rounded-full object-cover"
        />
      ) : (
        <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-medium">
          {initials}
        </div>
      )}
    </div>
  );
}

export function TaskList({ tasks, projectId }: TaskListProps) {
  return (
    <div className="space-y-2">
      {tasks.map((task) => {
        const priority = PRIORITY_CONFIG[task.priority];
        const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'DONE';

        return (
          <a
            key={task.id}
            href={`/dashboard/projects/${projectId}/tasks/${task.id}`}
            className="block bg-white rounded-lg border border-secondary-100 p-3 hover:border-primary-200 hover:shadow-sm transition-all group"
          >
            <div className="flex items-start gap-2">
              {/* Priority indicator */}
              <div
                className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                  task.priority === 'URGENT'
                    ? 'bg-red-500'
                    : task.priority === 'HIGH'
                    ? 'bg-amber-500'
                    : task.priority === 'MEDIUM'
                    ? 'bg-blue-400'
                    : 'bg-secondary-300'
                }`}
              />

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-secondary-800 group-hover:text-primary-700 transition-colors line-clamp-2">
                  {task.title}
                </p>

                {/* Meta row */}
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${priority.class}`}>
                    {priority.label}
                  </span>

                  {isOverdue && (
                    <div className="flex items-center gap-0.5 text-red-600">
                      <AlertCircle className="w-3 h-3" />
                      <span className="text-xs">Overdue</span>
                    </div>
                  )}

                  {task.dueDate && !isOverdue && (
                    <div className="flex items-center gap-0.5 text-secondary-400">
                      <Calendar className="w-3 h-3" />
                      <span className="text-xs">{format(new Date(task.dueDate), 'MMM d')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right side: assignee + counts */}
              <div className="flex items-center gap-1.5 flex-shrink-0 ml-1">
                {task._count.comments > 0 && (
                  <div className="flex items-center gap-0.5 text-secondary-400">
                    <MessageSquare className="w-3 h-3" />
                    <span className="text-xs">{task._count.comments}</span>
                  </div>
                )}
                {task._count.attachments > 0 && (
                  <div className="flex items-center gap-0.5 text-secondary-400">
                    <Paperclip className="w-3 h-3" />
                    <span className="text-xs">{task._count.attachments}</span>
                  </div>
                )}
                {task.assignee && <AssigneeAvatar assignee={task.assignee} />}
              </div>
            </div>
          </a>
        );
      })}
    </div>
  );
}
