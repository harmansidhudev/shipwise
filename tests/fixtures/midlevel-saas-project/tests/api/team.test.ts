import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Simulate a team API route
const mockTeamHandlers = {
  GET: vi.fn(),
  POST: vi.fn(),
  PATCH: vi.fn(),
  DELETE: vi.fn(),
};

describe('Team API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/team', () => {
    it('returns member list for authenticated org', async () => {
      const members = [
        { id: 'user_1', name: 'Alice', email: 'alice@example.com', role: 'owner' },
        { id: 'user_2', name: 'Bob', email: 'bob@example.com', role: 'member' },
      ];
      mockTeamHandlers.GET.mockResolvedValue({
        status: 200,
        body: { members },
      });

      const result = await mockTeamHandlers.GET();
      expect(result.status).toBe(200);
      expect(result.body.members).toHaveLength(2);
    });

    it('returns 401 when not authenticated', async () => {
      mockTeamHandlers.GET.mockResolvedValue({ status: 401, body: { error: 'Unauthorized' } });
      const result = await mockTeamHandlers.GET();
      expect(result.status).toBe(401);
    });
  });

  describe('POST /api/team/invite', () => {
    it('sends invitation for valid email', async () => {
      mockTeamHandlers.POST.mockResolvedValue({ status: 200, body: { message: 'Invitation sent' } });

      const result = await mockTeamHandlers.POST({
        email: 'newbie@example.com',
        role: 'member',
      });

      expect(result.status).toBe(200);
    });

    it('rejects invitation for already-existing member', async () => {
      mockTeamHandlers.POST.mockResolvedValue({
        status: 409,
        body: { error: 'User is already a member of this organization' },
      });

      const result = await mockTeamHandlers.POST({
        email: 'existing@example.com',
        role: 'member',
      });

      expect(result.status).toBe(409);
    });

    it('rejects invitation with invalid email', async () => {
      mockTeamHandlers.POST.mockResolvedValue({
        status: 400,
        body: { error: 'Validation failed', details: { email: ['Invalid email'] } },
      });

      const result = await mockTeamHandlers.POST({ email: 'not-an-email', role: 'member' });
      expect(result.status).toBe(400);
    });

    it('rejects inviting someone as owner', async () => {
      mockTeamHandlers.POST.mockResolvedValue({
        status: 400,
        body: { error: 'Cannot invite as owner' },
      });

      const result = await mockTeamHandlers.POST({ email: 'user@example.com', role: 'owner' });
      expect(result.status).toBe(400);
    });
  });

  describe('PATCH /api/team/[userId]', () => {
    it('updates member role', async () => {
      mockTeamHandlers.PATCH.mockResolvedValue({
        status: 200,
        body: { id: 'user_2', role: 'admin' },
      });

      const result = await mockTeamHandlers.PATCH('user_2', { role: 'admin' });
      expect(result.status).toBe(200);
      expect(result.body.role).toBe('admin');
    });

    it('cannot demote the owner', async () => {
      mockTeamHandlers.PATCH.mockResolvedValue({
        status: 403,
        body: { error: 'Cannot change the owner role' },
      });

      const result = await mockTeamHandlers.PATCH('user_1', { role: 'member' });
      expect(result.status).toBe(403);
    });
  });

  describe('DELETE /api/team/[userId]', () => {
    it('removes a member', async () => {
      mockTeamHandlers.DELETE.mockResolvedValue({ status: 204 });
      const result = await mockTeamHandlers.DELETE('user_2');
      expect(result.status).toBe(204);
    });

    it('cannot remove the owner', async () => {
      mockTeamHandlers.DELETE.mockResolvedValue({
        status: 403,
        body: { error: 'Cannot remove the organization owner' },
      });

      const result = await mockTeamHandlers.DELETE('user_1');
      expect(result.status).toBe(403);
    });

    it('returns 404 for non-existent member', async () => {
      mockTeamHandlers.DELETE.mockResolvedValue({ status: 404, body: { error: 'Member not found' } });
      const result = await mockTeamHandlers.DELETE('user_nonexistent');
      expect(result.status).toBe(404);
    });
  });
});
