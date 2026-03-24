import { describe, it, expect, vi, beforeEach } from 'vitest';

// Simulate a useProjects hook
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Simulated hook logic for testing purposes
async function useProjectsSimulated(options: {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
} = {}) {
  const params = new URLSearchParams();
  if (options.search) params.set('search', options.search);
  if (options.status) params.set('status', options.status);
  if (options.page) params.set('page', String(options.page));
  if (options.pageSize) params.set('pageSize', String(options.pageSize));

  const res = await fetch(`/api/projects?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch projects');
  return res.json();
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useProjects (hook simulation)', () => {
  it('fetches projects from /api/projects', async () => {
    const mockData = { projects: [], total: 0, page: 1, pageSize: 20 };
    mockFetch.mockResolvedValue({ ok: true, json: async () => mockData });

    const data = await useProjectsSimulated();
    expect(mockFetch).toHaveBeenCalledWith('/api/projects?');
    expect(data).toEqual(mockData);
  });

  it('includes search param when provided', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({ projects: [] }) });

    await useProjectsSimulated({ search: 'mobile' });
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('search=mobile'));
  });

  it('includes status filter when provided', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({ projects: [] }) });

    await useProjectsSimulated({ status: 'ACTIVE' });
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('status=ACTIVE'));
  });

  it('includes pagination params', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({ projects: [] }) });

    await useProjectsSimulated({ page: 2, pageSize: 10 });
    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain('page=2');
    expect(calledUrl).toContain('pageSize=10');
  });

  it('throws when fetch fails', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 });
    await expect(useProjectsSimulated()).rejects.toThrow('Failed to fetch projects');
  });

  it('returns paginated results with totalPages', async () => {
    const mockData = {
      projects: [{ id: 'p1', name: 'Alpha' }, { id: 'p2', name: 'Beta' }],
      total: 2,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    };
    mockFetch.mockResolvedValue({ ok: true, json: async () => mockData });

    const data = await useProjectsSimulated();
    expect(data.totalPages).toBe(1);
    expect(data.projects).toHaveLength(2);
  });

  it('handles empty project list gracefully', async () => {
    const mockData = { projects: [], total: 0, page: 1, pageSize: 20, totalPages: 0 };
    mockFetch.mockResolvedValue({ ok: true, json: async () => mockData });

    const data = await useProjectsSimulated({ search: 'nonexistent project name' });
    expect(data.projects).toHaveLength(0);
    expect(data.total).toBe(0);
  });
});
