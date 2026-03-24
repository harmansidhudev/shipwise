import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('date-fns', async (importOriginal) => {
  const actual = await importOriginal<typeof import('date-fns')>();
  return {
    ...actual,
    format: vi.fn(() => 'Jun 30'),
    isPast: vi.fn(() => false),
  };
});

import { TaskList } from '@/components/task-list';

const BASE_TASK = {
  id: 'task_1',
  title: 'Implement login page',
  description: 'Add Clerk authentication to the login page',
  status: 'TODO' as const,
  priority: 'HIGH' as const,
  assignee: null,
  dueDate: null,
  projectId: 'proj_123',
  _count: { comments: 0, attachments: 0 },
};

const TASKS = [
  BASE_TASK,
  {
    ...BASE_TASK,
    id: 'task_2',
    title: 'Write unit tests',
    priority: 'MEDIUM' as const,
    status: 'IN_PROGRESS' as const,
    assignee: {
      id: 'user_1',
      name: 'Jane Doe',
      email: 'jane@example.com',
      avatarUrl: null,
    },
    dueDate: new Date('2025-06-30'),
    _count: { comments: 3, attachments: 1 },
  },
];

describe('TaskList', () => {
  it('renders all task titles', () => {
    render(<TaskList tasks={TASKS} projectId="proj_123" />);
    expect(screen.getByText('Implement login page')).toBeInTheDocument();
    expect(screen.getByText('Write unit tests')).toBeInTheDocument();
  });

  it('shows priority badge', () => {
    render(<TaskList tasks={[BASE_TASK]} projectId="proj_123" />);
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('shows comment count when > 0', () => {
    render(<TaskList tasks={TASKS} projectId="proj_123" />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('shows attachment count when > 0', () => {
    render(<TaskList tasks={TASKS} projectId="proj_123" />);
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('shows assignee initials when assigned', () => {
    render(<TaskList tasks={TASKS} projectId="proj_123" />);
    expect(screen.getByTitle('Jane Doe')).toBeInTheDocument();
  });

  it('shows due date when provided', () => {
    render(<TaskList tasks={TASKS} projectId="proj_123" />);
    expect(screen.getByText('Jun 30')).toBeInTheDocument();
  });

  it('links each task to its detail page', () => {
    render(<TaskList tasks={TASKS} projectId="proj_123" />);
    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveAttribute('href', '/dashboard/projects/proj_123/tasks/task_1');
  });

  it('renders empty without crashing', () => {
    expect(() => render(<TaskList tasks={[]} projectId="proj_123" />)).not.toThrow();
  });

  it('shows overdue indicator when task is past due', () => {
    const { isPast } = require('date-fns');
    vi.mocked(isPast).mockReturnValue(true);

    const overdueTask = {
      ...BASE_TASK,
      dueDate: new Date('2024-01-01'),
      status: 'IN_PROGRESS' as const,
    };

    render(<TaskList tasks={[overdueTask]} projectId="proj_123" />);
    expect(screen.getByText('Overdue')).toBeInTheDocument();
  });
});
