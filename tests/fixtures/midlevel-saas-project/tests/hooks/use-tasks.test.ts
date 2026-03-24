import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFetch = vi.fn();
global.fetch = mockFetch;

// Simulated useTasks hook logic
async function useTasksSimulated(projectId: string, options: {
  status?: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
  assigneeId?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
} = {}) {
  if (!projectId) throw new Error('projectId is required');

  const params = new URLSearchParams();
  if (options.status) params.set('status', options.status);
  if (options.assigneeId) params.set('assigneeId', options.assigneeId);
  if (options.priority) params.set('priority', options.priority);

  const res = await fetch(`/api/projects/${projectId}/tasks?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch tasks');
  return res.json();
}

// Simulated createTask action
async function createTask(projectId: string, data: {
  title: string;
  description?: string;
  priority?: string;
  assigneeId?: string;
  dueDate?: Date;
}) {
  const res = await fetch(`/api/projects/${projectId}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? 'Failed to create task');
  }
  return res.json();
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useTasks (hook simulation)', () => {
  it('throws when projectId is empty', async () => {
    await expect(useTasksSimulated('')).rejects.toThrow('projectId is required');
  });

  it('fetches tasks for a given project', async () => {
    const tasks = [{ id: 't1', title: 'Fix bug' }];
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({ tasks }) });

    const data = await useTasksSimulated('proj_123');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/projects/proj_123/tasks')
    );
    expect(data.tasks).toHaveLength(1);
  });

  it('filters by status', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({ tasks: [] }) });

    await useTasksSimulated('proj_123', { status: 'IN_PROGRESS' });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('status=IN_PROGRESS')
    );
  });

  it('filters by assigneeId', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({ tasks: [] }) });

    await useTasksSimulated('proj_123', { assigneeId: 'user_abc' });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('assigneeId=user_abc')
    );
  });

  it('filters by priority', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({ tasks: [] }) });

    await useTasksSimulated('proj_123', { priority: 'URGENT' });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('priority=URGENT')
    );
  });

  it('throws when fetch fails', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 403 });
    await expect(useTasksSimulated('proj_123')).rejects.toThrow('Failed to fetch tasks');
  });
});

describe('createTask action', () => {
  it('creates a task with minimal data', async () => {
    const newTask = { id: 't_new', title: 'New task', status: 'TODO' };
    mockFetch.mockResolvedValue({ ok: true, json: async () => newTask });

    const result = await createTask('proj_123', { title: 'New task' });
    expect(result).toEqual(newTask);
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/projects/proj_123/tasks',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('throws with error message on failure', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Validation failed' }),
    });

    await expect(createTask('proj_123', { title: '' })).rejects.toThrow('Validation failed');
  });

  it('serializes dueDate as part of request body', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({ id: 't1' }) });

    const dueDate = new Date('2025-12-31');
    await createTask('proj_123', { title: 'Deadline task', dueDate });

    const [, options] = mockFetch.mock.calls[0];
    const body = JSON.parse((options as RequestInit).body as string);
    expect(body.dueDate).toBeDefined();
  });
});
