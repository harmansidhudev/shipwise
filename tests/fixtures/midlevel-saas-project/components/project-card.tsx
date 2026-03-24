import { formatDistanceToNow } from 'date-fns';
import { CheckSquare, Clock, FolderOpen } from 'lucide-react';

type Project = {
  id: string;
  name: string;
  description: string | null;
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
  _count: { tasks: number };
};

type ProjectCardProps = {
  project: Project;
  onClick?: () => void;
};

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const updatedAgo = formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true });
  const isArchived = project.status === 'ARCHIVED';

  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-white rounded-xl border shadow-sm p-5 hover:shadow-md hover:border-primary-200 transition-all group ${
        isArchived ? 'border-secondary-100 opacity-70' : 'border-secondary-100'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isArchived ? 'bg-secondary-100' : 'bg-primary-50 group-hover:bg-primary-100'
            } transition-colors`}
          >
            <FolderOpen
              className={`w-4 h-4 ${isArchived ? 'text-secondary-400' : 'text-primary-600'}`}
            />
          </div>
        </div>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            project.status === 'ACTIVE'
              ? 'bg-green-50 text-green-700'
              : 'bg-secondary-100 text-secondary-500'
          }`}
        >
          {project.status === 'ACTIVE' ? 'Active' : 'Archived'}
        </span>
      </div>

      {/* Name and description */}
      <h3 className="text-sm font-semibold text-secondary-900 mb-1.5 group-hover:text-primary-700 transition-colors line-clamp-1">
        {project.name}
      </h3>
      {project.description && (
        <p className="text-xs text-secondary-500 line-clamp-2 mb-3 leading-relaxed">
          {project.description}
        </p>
      )}

      {/* Footer stats */}
      <div className="flex items-center gap-4 mt-auto pt-3 border-t border-secondary-50">
        <div className="flex items-center gap-1 text-xs text-secondary-400">
          <CheckSquare className="w-3.5 h-3.5" />
          <span>
            {project._count.tasks} task{project._count.tasks !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-secondary-400 ml-auto">
          <Clock className="w-3.5 h-3.5" />
          <span>{updatedAgo}</span>
        </div>
      </div>
    </button>
  );
}
