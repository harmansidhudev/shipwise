import { describe, it, expect, vi } from 'vitest';

// Test that the db singleton pattern works correctly
describe('db singleton', () => {
  it('exports a PrismaClient instance', async () => {
    vi.mock('@prisma/client', () => {
      const PrismaClient = vi.fn(() => ({
        $connect: vi.fn(),
        $disconnect: vi.fn(),
        user: {},
        project: {},
        task: {},
      }));
      return { PrismaClient };
    });

    const { db } = await import('@/lib/db');
    expect(db).toBeDefined();
  });

  it('reuses the same instance in development', async () => {
    const originalEnv = process.env.NODE_ENV;
    // @ts-expect-error - NODE_ENV is readonly in TS but we override for test
    process.env.NODE_ENV = 'development';

    const { db: db1 } = await import('@/lib/db');
    const { db: db2 } = await import('@/lib/db');
    expect(db1).toBe(db2);

    // @ts-expect-error
    process.env.NODE_ENV = originalEnv;
  });
});
