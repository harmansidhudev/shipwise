import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';

export type AuthUser = {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: string;
  organizationId: string | null;
};

/**
 * Get the current authenticated user from the database.
 * Returns null if not authenticated.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const user = await db.user.findUnique({
    where: { clerkId: clerkUser.id },
    select: {
      id: true,
      clerkId: true,
      email: true,
      name: true,
      avatarUrl: true,
      role: true,
      organizationId: true,
    },
  });

  return user;
}

/**
 * Require authentication. Redirects to sign-in if not authenticated.
 * Use in Server Components and Route Handlers.
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/sign-in');
  }
  return user;
}

/**
 * Require org membership. Redirects if user has no org.
 */
export async function requireOrgMember(): Promise<{ user: AuthUser; orgId: string }> {
  const user = await requireAuth();
  const { orgId } = auth();

  if (!orgId) {
    redirect('/dashboard');
  }

  return { user, orgId };
}

/**
 * Check if the current user has admin or owner role in their org.
 */
export async function isOrgAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  return user.role === 'admin' || user.role === 'owner';
}

/**
 * Get org ID from Clerk auth context.
 * Returns null if no org is selected.
 */
export function getOrgId(): string | null {
  const { orgId } = auth();
  return orgId ?? null;
}
