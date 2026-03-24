'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard-shell';
import { ProjectCard } from '@/components/project-card';
import { CreateProjectDialog } from '@/components/create-project-dialog';
import { Button } from '@/components/ui/button';
import { Search, SlidersHorizontal, Plus } from 'lucide-react';

type Project = {
  id: string;
  name: string;
  description: string | null;
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
  _count: { tasks: number };
};

type ProjectsResponse = {
  projects: Project[];
  total: number;
  page: number;
  pageSize: number;
};

const STATUS_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Archived', value: 'ARCHIVED' },
];

export default function ProjectsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<ProjectsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  const [createOpen, setCreateOpen] = useState(searchParams.get('new') === 'true');

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (statusFilter) params.set('status', statusFilter);
        const res = await fetch(`/api/projects?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch projects');
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('Error fetching projects:', err);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchProjects, 300);
    return () => clearTimeout(debounce);
  }, [search, statusFilter]);

  const handleProjectCreated = () => {
    setCreateOpen(false);
    // Refresh the list
    setSearch((s) => s);
  };

  return (
    <DashboardShell>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Projects</h1>
            <p className="text-secondary-500 mt-1">
              {data ? `${data.total} project${data.total !== 1 ? 's' : ''}` : 'Loading...'}
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="gap-1.5">
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-1.5 bg-secondary-100 p-1 rounded-lg">
            <SlidersHorizontal className="w-4 h-4 text-secondary-500 mx-1" />
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  statusFilter === opt.value
                    ? 'bg-white text-secondary-900 shadow-sm'
                    : 'text-secondary-500 hover:text-secondary-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-secondary-100 p-5 h-40 animate-pulse"
              >
                <div className="h-5 bg-secondary-100 rounded w-3/4 mb-3" />
                <div className="h-4 bg-secondary-100 rounded w-full mb-2" />
                <div className="h-4 bg-secondary-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : data && data.projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => router.push(`/dashboard/projects/${project.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 text-secondary-400" />
            </div>
            <h3 className="text-base font-medium text-secondary-900 mb-1">No projects found</h3>
            <p className="text-sm text-secondary-500 mb-4">
              {search
                ? `No projects match "${search}"`
                : 'Create your first project to get started'}
            </p>
            <Button onClick={() => setCreateOpen(true)} variant="secondary">
              Create a project
            </Button>
          </div>
        )}
      </div>

      <CreateProjectDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleProjectCreated}
      />
    </DashboardShell>
  );
}
