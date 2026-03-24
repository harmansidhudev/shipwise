import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: {
    project: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
    },
    organization: {
      findUnique: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
  },
}));

import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { GET, POST } from '@/app/api/projects/route';

const mockAuth = vi.mocked(auth);
const mockProjectFindMany = vi.mocked(db.project.findMany);
const mockProjectCount = vi.mocked(db.project.count);
const mockProjectCreate = vi.mocked(db.project.create);
const mockOrgFindUnique = vi.mocked(db.organization.findUnique);
const mockAuditLogCreate = vi.mocked(db.auditLog.create);

const FAKE_AUTH = { orgId: 'org_abc', userId: 'user_xyz' };

const FAKE_PROJECT = {
  id: 'proj_1',
  name: 'Test Project',
  description: 'A test',
  status: 'ACTIVE',
  organizationId: 'org_abc',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-06-01'),
  _count: { tasks: 5 },
};

function makeRequest(url: string, init?: RequestInit) {
  return new NextRequest(new URL(url, 'http://localhost'), init);
}

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.mockReturnValue(FAKE_AUTH as any);
  mockAuditLogCreate.mockResolvedValue({} as any);
});

describe('GET /api/projects', () => {
  it('returns 401 when not authenticated', async () => {
    mockAuth.mockReturnValue({ orgId: null, userId: null } as any);
    const req = makeRequest('http://localhost/api/projects');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('returns paginated projects list', async () => {
    mockProjectFindMany.mockResolvedValue([FAKE_PROJECT] as any);
    mockProjectCount.mockResolvedValue(1);

    const req = makeRequest('http://localhost/api/projects');
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.projects).toHaveLength(1);
    expect(data.total).toBe(1);
    expect(data.page).toBe(1);
    expect(data.pageSize).toBe(20);
  });

  it('filters by status when provided', async () => {
    mockProjectFindMany.mockResolvedValue([]);
    mockProjectCount.mockResolvedValue(0);

    const req = makeRequest('http://localhost/api/projects?status=ARCHIVED');
    await GET(req);

    expect(mockProjectFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'ARCHIVED' }),
      })
    );
  });

  it('applies search filter when provided', async () => {
    mockProjectFindMany.mockResolvedValue([]);
    mockProjectCount.mockResolvedValue(0);

    const req = makeRequest('http://localhost/api/projects?search=mobile');
    await GET(req);

    expect(mockProjectFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({ name: expect.objectContaining({ contains: 'mobile' }) }),
          ]),
        }),
      })
    );
  });

  it('respects custom page and pageSize params', async () => {
    mockProjectFindMany.mockResolvedValue([]);
    mockProjectCount.mockResolvedValue(50);

    const req = makeRequest('http://localhost/api/projects?page=3&pageSize=10');
    await GET(req);

    expect(mockProjectFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 20, take: 10 })
    );
  });
});

describe('POST /api/projects', () => {
  it('returns 401 when not authenticated', async () => {
    mockAuth.mockReturnValue({ orgId: null, userId: null } as any);
    const req = makeRequest('http://localhost/api/projects', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('creates a project with valid data', async () => {
    mockOrgFindUnique.mockResolvedValue({
      plan: 'PRO',
      _count: { projects: 1 },
    } as any);
    mockProjectCreate.mockResolvedValue(FAKE_PROJECT as any);

    const req = makeRequest('http://localhost/api/projects', {
      method: 'POST',
      body: JSON.stringify({ name: 'New Project', description: 'A new one' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.name).toBe('Test Project');
  });

  it('returns 400 for invalid input', async () => {
    const req = makeRequest('http://localhost/api/projects', {
      method: 'POST',
      body: JSON.stringify({ name: '' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Validation failed');
  });

  it('returns 403 when FREE plan has 3+ projects', async () => {
    mockOrgFindUnique.mockResolvedValue({
      plan: 'FREE',
      _count: { projects: 3 },
    } as any);

    const req = makeRequest('http://localhost/api/projects', {
      method: 'POST',
      body: JSON.stringify({ name: 'Over Limit' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it('creates an audit log entry on success', async () => {
    mockOrgFindUnique.mockResolvedValue({
      plan: 'PRO',
      _count: { projects: 2 },
    } as any);
    mockProjectCreate.mockResolvedValue(FAKE_PROJECT as any);

    const req = makeRequest('http://localhost/api/projects', {
      method: 'POST',
      body: JSON.stringify({ name: 'Audited Project' }),
    });

    await POST(req);
    expect(mockAuditLogCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: 'project.created',
          entityType: 'Project',
        }),
      })
    );
  });
});
