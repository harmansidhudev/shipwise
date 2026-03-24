import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";

type Project = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  updatedAt: Date;
  _count: { tasks: number };
};

const statusVariant: Record<string, "default" | "success" | "warning" | "secondary"> = {
  ACTIVE: "success",
  DRAFT: "secondary",
  PAUSED: "warning",
  COMPLETED: "default",
  ARCHIVED: "secondary",
};

export function RecentProjects({ projects }: { projects: Project[] }) {
  return (
    <div className="rounded-xl border bg-white shadow-sm">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <h2 className="font-semibold text-gray-900">Recent Projects</h2>
        <Link
          href="/dashboard/projects"
          className="text-sm text-indigo-600 hover:underline"
        >
          View all
        </Link>
      </div>
      <ul className="divide-y">
        {projects.length === 0 && (
          <li className="px-5 py-8 text-center text-sm text-gray-500">
            No projects yet.{" "}
            <Link href="/dashboard/projects/new" className="text-indigo-600 hover:underline">
              Create one
            </Link>
          </li>
        )}
        {projects.map((project) => (
          <li key={project.id}>
            <Link
              href={`/dashboard/projects/${project.id}`}
              className="flex items-center justify-between px-5 py-4 transition hover:bg-gray-50"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-gray-900">{project.name}</p>
                {project.description && (
                  <p className="mt-0.5 truncate text-sm text-gray-500">
                    {project.description}
                  </p>
                )}
              </div>
              <div className="ml-4 flex shrink-0 items-center gap-3">
                <Badge variant={statusVariant[project.status] ?? "secondary"}>
                  {project.status}
                </Badge>
                <span className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(project.updatedAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
