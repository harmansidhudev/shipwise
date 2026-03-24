import { describe, it, expect } from 'vitest';
import {
  createProjectSchema,
  updateProjectSchema,
  createTaskSchema,
  inviteTeamMemberSchema,
  createWebhookSchema,
  createCommentSchema,
} from '@/lib/validations';

describe('createProjectSchema', () => {
  it('accepts valid project data', () => {
    const result = createProjectSchema.safeParse({
      name: 'My Project',
      description: 'A great project',
      status: 'ACTIVE',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('My Project');
    }
  });

  it('accepts a project without description', () => {
    const result = createProjectSchema.safeParse({ name: 'Minimal Project' });
    expect(result.success).toBe(true);
  });

  it('rejects an empty name', () => {
    const result = createProjectSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.name).toBeDefined();
    }
  });

  it('rejects a name longer than 100 characters', () => {
    const result = createProjectSchema.safeParse({ name: 'a'.repeat(101) });
    expect(result.success).toBe(false);
  });

  it('rejects a description longer than 500 characters', () => {
    const result = createProjectSchema.safeParse({
      name: 'OK Name',
      description: 'd'.repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it('trims whitespace from name', () => {
    const result = createProjectSchema.safeParse({ name: '  My Project  ' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('My Project');
    }
  });

  it('rejects invalid status values', () => {
    const result = createProjectSchema.safeParse({
      name: 'Test',
      status: 'DELETED',
    });
    expect(result.success).toBe(false);
  });

  it('defaults status to ACTIVE when not provided', () => {
    const result = createProjectSchema.safeParse({ name: 'Test' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('ACTIVE');
    }
  });
});

describe('updateProjectSchema', () => {
  it('accepts a partial update with only name', () => {
    const result = updateProjectSchema.safeParse({ name: 'New Name' });
    expect(result.success).toBe(true);
  });

  it('accepts an empty object (no-op update)', () => {
    const result = updateProjectSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('accepts null description to clear it', () => {
    const result = updateProjectSchema.safeParse({ description: null });
    expect(result.success).toBe(true);
  });

  it('accepts status change to ARCHIVED', () => {
    const result = updateProjectSchema.safeParse({ status: 'ARCHIVED' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('ARCHIVED');
    }
  });
});

describe('createTaskSchema', () => {
  it('accepts a minimal task', () => {
    const result = createTaskSchema.safeParse({ title: 'Fix the bug' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.priority).toBe('MEDIUM');
      expect(result.data.status).toBe('TODO');
    }
  });

  it('accepts a full task with all fields', () => {
    const result = createTaskSchema.safeParse({
      title: 'Implement auth',
      description: 'Use Clerk for authentication',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      assigneeId: 'clm1234567890abcdef',
      dueDate: new Date('2025-12-31'),
    });
    expect(result.success).toBe(true);
  });

  it('rejects an empty title', () => {
    const result = createTaskSchema.safeParse({ title: '' });
    expect(result.success).toBe(false);
  });

  it('rejects a title longer than 200 characters', () => {
    const result = createTaskSchema.safeParse({ title: 't'.repeat(201) });
    expect(result.success).toBe(false);
  });

  it('rejects invalid priority values', () => {
    const result = createTaskSchema.safeParse({ title: 'Test', priority: 'CRITICAL' });
    expect(result.success).toBe(false);
  });

  it('coerces string dates to Date objects', () => {
    const result = createTaskSchema.safeParse({
      title: 'Test',
      dueDate: '2025-06-15',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.dueDate).toBeInstanceOf(Date);
    }
  });
});

describe('inviteTeamMemberSchema', () => {
  it('accepts a valid email and member role', () => {
    const result = inviteTeamMemberSchema.safeParse({
      email: 'user@example.com',
      role: 'member',
    });
    expect(result.success).toBe(true);
  });

  it('accepts admin role', () => {
    const result = inviteTeamMemberSchema.safeParse({
      email: 'admin@example.com',
      role: 'admin',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = inviteTeamMemberSchema.safeParse({
      email: 'not-an-email',
      role: 'member',
    });
    expect(result.success).toBe(false);
  });

  it('rejects owner role (not allowed in invite)', () => {
    const result = inviteTeamMemberSchema.safeParse({
      email: 'user@example.com',
      role: 'owner',
    });
    expect(result.success).toBe(false);
  });

  it('normalizes email to lowercase', () => {
    const result = inviteTeamMemberSchema.safeParse({
      email: 'USER@EXAMPLE.COM',
      role: 'member',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('user@example.com');
    }
  });
});

describe('createWebhookSchema', () => {
  it('accepts a valid HTTPS URL with events', () => {
    const result = createWebhookSchema.safeParse({
      url: 'https://example.com/webhook',
      events: ['task.created', 'project.updated'],
    });
    expect(result.success).toBe(true);
  });

  it('rejects HTTP URLs', () => {
    const result = createWebhookSchema.safeParse({
      url: 'http://example.com/webhook',
      events: ['task.created'],
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty events array', () => {
    const result = createWebhookSchema.safeParse({
      url: 'https://example.com/webhook',
      events: [],
    });
    expect(result.success).toBe(false);
  });

  it('rejects unknown event types', () => {
    const result = createWebhookSchema.safeParse({
      url: 'https://example.com/webhook',
      events: ['invalid.event'],
    });
    expect(result.success).toBe(false);
  });
});

describe('createCommentSchema', () => {
  it('accepts valid comment content', () => {
    const result = createCommentSchema.safeParse({ content: 'This looks good!' });
    expect(result.success).toBe(true);
  });

  it('rejects empty content', () => {
    const result = createCommentSchema.safeParse({ content: '' });
    expect(result.success).toBe(false);
  });

  it('rejects content over 2000 characters', () => {
    const result = createCommentSchema.safeParse({ content: 'c'.repeat(2001) });
    expect(result.success).toBe(false);
  });
});
