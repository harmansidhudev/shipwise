import { formatDistanceToNow } from "date-fns";
import { Bell, MessageSquare, GitBranch, UserPlus } from "lucide-react";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  createdAt: Date;
  read: boolean;
};

const typeIcon: Record<string, React.ElementType> = {
  MENTION: MessageSquare,
  COMMENT: MessageSquare,
  DEPLOYMENT: GitBranch,
  INVITATION: UserPlus,
  ASSIGNMENT: Bell,
  SYSTEM: Bell,
};

export function ActivityFeed({ notifications }: { notifications: Notification[] }) {
  return (
    <div className="rounded-xl border bg-white shadow-sm">
      <div className="border-b px-5 py-4">
        <h2 className="font-semibold text-gray-900">Activity</h2>
      </div>
      <ul className="divide-y">
        {notifications.length === 0 && (
          <li className="px-5 py-8 text-center text-sm text-gray-500">
            You're all caught up!
          </li>
        )}
        {notifications.map((n) => {
          const Icon = typeIcon[n.type] ?? Bell;
          return (
            <li key={n.id} className="flex gap-3 px-5 py-3">
              <div className="mt-0.5 shrink-0 rounded-full bg-gray-100 p-1.5">
                <Icon className="h-3.5 w-3.5 text-gray-500" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{n.title}</p>
                {n.body && (
                  <p className="text-xs text-gray-500 truncate">{n.body}</p>
                )}
                <p className="mt-0.5 text-xs text-gray-400">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
