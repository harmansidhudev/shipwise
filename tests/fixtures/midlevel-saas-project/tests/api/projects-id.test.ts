import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: {
    project: {
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    user: {
      findFirst: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
  },
}));

import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { GET, PATCH, DELETE } from '@/app/api/projects/[id]/route';

const mockAuth = vi.mocked(auth);
const mockProjectFindFirst = vi.mocked(db.project.findFirst);
const mockProjectUpdate = vi.mocked(db.project.update);
const mockProjectDelete = vi.mocked(db.project.delete);
const mockUserFindFirst = vi.mocked(db.user.findFirst);
const mockAuditLogCreate = vi.mocked(db.auditLog.create);

const FAKE_AUTH = { orgId: 'org_abc', userId: 'user_xyz' };
const FAKE_PROJECT = {
  id: 'proj_1',
  name: 'Existing Project',
  description: 'Already here',
  status: 'ACTIVE',
  organizationId: 'org_abc',
  createdAt: new Date(),
  updatedAt: new Date(),
};
const FAKE_ADMIN = { id: 'user_xyz', role: 'admin', organizationId: 'org_abc' };
const FAKE_MEMBER = { id: 'user_xyz', role: 'member', organizationId: 'org_abc' };

const CTX = { params: { id: 'proj_1' } };

function makeReq(method = 'GET', body?: object) {
  return new NextRequest(new URL('http://localhost/api/projects/proj_1'), {
    method,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.mockReturnValue(FAKE_AUTH as any);
  mockAuditLogCreate.mockResolvedValue({} as any);
});

describe('GET /api/projects/[id]', () => {
  it('returns 401 when not authenticated', async () => {
    mockAuth.mockReturnValue({ orgId: null, userId: null } as any);
    const res = await GET(makeReq(), CTX);
    expect(res.status).toBe(401);
  });

  it('returns 404 when project not found', async () => {
    mockProjectFindFirst.mockResolvedValue(null);
    const res = await GET(makeReq(), CTX);
    expect(res.status).toBe(404);
  });

  it('returns the project when found', async () => {
    mockProjectFindFirst.mockResolvedValue({ ...FAKE_PROJECT, tasks: [], _count: { tasks: 0 } } as any);
    const res = await GET(makeReq(), CTX);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.name).toBe('Existing Project');
  });
});

describe('PATCH /api/projects/[id]', () => {
  it('returns 401 when not authenticated', async () => {
    mockAuth.mockReturnValue({ orgId: null, userId: null } as any);
    const res = await PATCH(makeReq('PATCH', { name: 'New Name' }), CTX);
    expect(res.status).toBe(401);
  });

  it('returns 404 when project not found', async () => {
    mockProjectFindFirst.mockResolvedValue(null);
    const res = await PATCH(makeReq('PATCH', { name: 'New' }), CTX);
    expect(res.status).toBe(404);
  });

  it('updates the project for admin users', async () => {
    mockProjectFindFirst.mockResolvedValue(FAKE_PROJECT as any);
    mockUserFindFirst.mockResolvedValue(FAKE_ADMIN as any);
    mockProjectUpdate.mockResolvedValue({ ...FAKE_PROJECT, name: 'Updated', _count: { tasks: 0 } } as any);

    const res = await PATCH(makeReq('PATCH', { name: 'Updated' }), CTX);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.name).toBe('Updated');
  });

  it('returns 400 for invalid update data', async () => {
    mockProjectFindFirst.mockResolvedValue(FAKE_PROJECT as any);
    mockUserFindFirst.mockResolvedValue(FAKE_ADMIN as any);

    const res = await PATCH(makeReq('PATCH', { name: '' }), CTX);
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/projects/[id]', () => {
  it('returns 403 when user is a member', async () => {
    mockProjectFindFirst.mockResolvedValue(FAKE_PROJECT as any);
    mockUserFindFirst.mockResolvedValue(FAKE_MEMBER as any);

    const res = await DELETE(makeReq('DELETE'), CTX);
    expect(res.status).toBe(403);
  });

  it('deletes project when user is admin', async () => {
    mockProjectFindFirst.mockResolvedValue(FAKE_PROJECT as any);
    mockUserFindFirst.mockResolvedValue(FAKE_ADMIN as any);
    mockProjectDelete.mockResolvedValue({} as any);

    const res = await DELETE(makeReq('DELETE'), CTX);
    expect(res.status).toBe(204);
    expect(mockProjectDelete).toHaveBeenCalledWith({ where: { id: 'proj_1' } });
  });

  it('creates audit log on successful delete', async () => {
    mockProjectFindFirst.mockResolvedValue(FAKE_PROJECT as any);
    mockUserFindFirst.mockResolvedValue(FAKE_ADMIN as any);
    mockProjectDelete.mockResolvedValue({} as any);

    await DELETE(makeReq('DELETE'), CTX);
    expect(mockAuditLogCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: 'project.deleted' }),
      })
    );
  });
});
