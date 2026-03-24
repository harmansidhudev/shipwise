import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProjectCard } from '@/components/project-card';

// date-fns uses real dates, so we mock to make tests deterministic
vi.mock('date-fns', async (importOriginal) => {
  const actual = await importOriginal<typeof import('date-fns')>();
  return {
    ...actual,
    formatDistanceToNow: vi.fn(() => '2 days ago'),
  };
});

const ACTIVE_PROJECT = {
  id: 'proj_123',
  name: 'Mobile App Redesign',
  description: 'Modernizing the mobile experience for Q3 launch.',
  status: 'ACTIVE' as const,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-06-15T12:00:00Z',
  _count: { tasks: 12 },
};

const ARCHIVED_PROJECT = {
  ...ACTIVE_PROJECT,
  id: 'proj_456',
  name: 'Old Campaign',
  status: 'ARCHIVED' as const,
  _count: { tasks: 3 },
};

describe('ProjectCard', () => {
  it('renders project name', () => {
    render(<ProjectCard project={ACTIVE_PROJECT} />);
    expect(screen.getByText('Mobile App Redesign')).toBeInTheDocument();
  });

  it('renders project description', () => {
    render(<ProjectCard project={ACTIVE_PROJECT} />);
    expect(screen.getByText(/Modernizing the mobile experience/)).toBeInTheDocument();
  });

  it('shows task count', () => {
    render(<ProjectCard project={ACTIVE_PROJECT} />);
    expect(screen.getByText('12 tasks')).toBeInTheDocument();
  });

  it('shows singular "task" for 1 task', () => {
    const singleTask = { ...ACTIVE_PROJECT, _count: { tasks: 1 } };
    render(<ProjectCard project={singleTask} />);
    expect(screen.getByText('1 task')).toBeInTheDocument();
  });

  it('shows last updated time', () => {
    render(<ProjectCard project={ACTIVE_PROJECT} />);
    expect(screen.getByText('2 days ago')).toBeInTheDocument();
  });

  it('shows "Active" status badge for active projects', () => {
    render(<ProjectCard project={ACTIVE_PROJECT} />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('shows "Archived" status badge for archived projects', () => {
    render(<ProjectCard project={ARCHIVED_PROJECT} />);
    expect(screen.getByText('Archived')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<ProjectCard project={ACTIVE_PROJECT} onClick={onClick} />);

    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('renders without onClick (no crash)', () => {
    expect(() => render(<ProjectCard project={ACTIVE_PROJECT} />)).not.toThrow();
  });

  it('renders without description gracefully', () => {
    const noDesc = { ...ACTIVE_PROJECT, description: null };
    render(<ProjectCard project={noDesc} />);
    expect(screen.getByText('Mobile App Redesign')).toBeInTheDocument();
    expect(screen.queryByText(/Modernizing/)).not.toBeInTheDocument();
  });

  it('applies reduced opacity for archived projects', () => {
    const { container } = render(<ProjectCard project={ARCHIVED_PROJECT} />);
    expect(container.firstChild).toHaveClass('opacity-70');
  });
});
