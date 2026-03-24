import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Clerk server module
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
  currentUser: vi.fn(),
}));

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

// Mock our DB module
vi.mock('@/lib/db', () => ({
  db: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { getCurrentUser, requireAuth, isOrgAdmin, getOrgId } from '@/lib/auth';

const mockCurrentUser = vi.mocked(currentUser);
const mockAuth = vi.mocked(auth);
const mockDbUserFindUnique = vi.mocked(db.user.findUnique);

const FAKE_CLERK_USER = {
  id: 'user_clerkid123',
  emailAddresses: [{ emailAddress: 'test@example.com' }],
};

const FAKE_DB_USER = {
  id: 'cuid_user_123',
  clerkId: 'user_clerkid123',
  email: 'test@example.com',
  name: 'Test User',
  avatarUrl: null,
  role: 'member',
  organizationId: 'cuid_org_123',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getCurrentUser', () => {
  it('returns null when not authenticated', async () => {
    mockCurrentUser.mockResolvedValue(null);
    const user = await getCurrentUser();
    expect(user).toBeNull();
    expect(mockDbUserFindUnique).not.toHaveBeenCalled();
  });

  it('returns null when Clerk user has no DB record', async () => {
    mockCurrentUser.mockResolvedValue(FAKE_CLERK_USER as any);
    mockDbUserFindUnique.mockResolvedValue(null);
    const user = await getCurrentUser();
    expect(user).toBeNull();
  });

  it('returns user when authenticated and DB record exists', async () => {
    mockCurrentUser.mockResolvedValue(FAKE_CLERK_USER as any);
    mockDbUserFindUnique.mockResolvedValue(FAKE_DB_USER as any);
    const user = await getCurrentUser();
    expect(user).toEqual(FAKE_DB_USER);
    expect(mockDbUserFindUnique).toHaveBeenCalledWith({
      where: { clerkId: 'user_clerkid123' },
      select: expect.objectContaining({
        id: true,
        clerkId: true,
        email: true,
      }),
    });
  });
});

describe('requireAuth', () => {
  it('redirects to sign-in when not authenticated', async () => {
    mockCurrentUser.mockResolvedValue(null);
    await expect(requireAuth()).rejects.toThrow('REDIRECT:/sign-in');
  });

  it('returns user when authenticated', async () => {
    mockCurrentUser.mockResolvedValue(FAKE_CLERK_USER as any);
    mockDbUserFindUnique.mockResolvedValue(FAKE_DB_USER as any);
    const user = await requireAuth();
    expect(user).toEqual(FAKE_DB_USER);
  });
});

describe('isOrgAdmin', () => {
  it('returns false when not authenticated', async () => {
    mockCurrentUser.mockResolvedValue(null);
    const result = await isOrgAdmin();
    expect(result).toBe(false);
  });

  it('returns false for member role', async () => {
    mockCurrentUser.mockResolvedValue(FAKE_CLERK_USER as any);
    mockDbUserFindUnique.mockResolvedValue({ ...FAKE_DB_USER, role: 'member' } as any);
    const result = await isOrgAdmin();
    expect(result).toBe(false);
  });

  it('returns true for admin role', async () => {
    mockCurrentUser.mockResolvedValue(FAKE_CLERK_USER as any);
    mockDbUserFindUnique.mockResolvedValue({ ...FAKE_DB_USER, role: 'admin' } as any);
    const result = await isOrgAdmin();
    expect(result).toBe(true);
  });

  it('returns true for owner role', async () => {
    mockCurrentUser.mockResolvedValue(FAKE_CLERK_USER as any);
    mockDbUserFindUnique.mockResolvedValue({ ...FAKE_DB_USER, role: 'owner' } as any);
    const result = await isOrgAdmin();
    expect(result).toBe(true);
  });
});

describe('getOrgId', () => {
  it('returns orgId from auth context', () => {
    mockAuth.mockReturnValue({ orgId: 'org_123' } as any);
    const orgId = getOrgId();
    expect(orgId).toBe('org_123');
  });

  it('returns null when no org is selected', () => {
    mockAuth.mockReturnValue({ orgId: null } as any);
    const orgId = getOrgId();
    expect(orgId).toBeNull();
  });

  it('returns null when orgId is undefined', () => {
    mockAuth.mockReturnValue({ orgId: undefined } as any);
    const orgId = getOrgId();
    expect(orgId).toBeNull();
  });
});
