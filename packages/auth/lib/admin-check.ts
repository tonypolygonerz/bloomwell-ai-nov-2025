import { getServerSession } from 'next-auth';
import { authOptions } from '../nextauth';
import { redirect } from 'next/navigation';
import type { Session } from '../types';

/**
 * Server-side admin authentication check
 *
 * Use this in Server Components to verify admin access.
 * Automatically redirects to login if not authenticated or not admin.
 *
 * @param redirectPath - Path to redirect to if not admin (default: '/login')
 * @returns The authenticated admin session
 * @throws Redirects to login if not admin
 *
 * @example
 * ```typescript
 * // In a Server Component
 * export default async function AdminPage() {
 *   const session = await requireAdmin();
 *   // session.user.isAdmin is guaranteed to be true here
 * }
 * ```
 */
export async function requireAdmin(redirectPath: string = '/login'): Promise<Session> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.isAdmin) {
    redirect(redirectPath);
  }

  return session as Session;
}

/**
 * Check if a session has admin privileges
 *
 * Use this for conditional admin features without redirecting.
 *
 * @param session - The session to check
 * @returns true if the session belongs to an admin user
 *
 * @example
 * ```typescript
 * const session = await getServerSession(authOptions);
 * if (isAdmin(session)) {
 *   // Show admin features
 * }
 * ```
 */
export function isAdmin(session: Session | null): boolean {
  return session?.user?.isAdmin === true;
}

/**
 * API Route admin authentication check
 *
 * Use this in API routes to verify admin access and return appropriate responses.
 *
 * @returns Object with { isAdmin: boolean, session: Session | null }
 *
 * @example
 * ```typescript
 * // In an API route
 * export async function GET(request: NextRequest) {
 *   const { isAdmin, session } = await checkAdminAPI();
 *
 *   if (!isAdmin) {
 *     return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
 *   }
 *
 *   // Admin-only API logic here
 * }
 * ```
 */
export async function checkAdminAPI(): Promise<{
  isAdmin: boolean;
  session: Session | null;
}> {
  const session = await getServerSession(authOptions);

  return {
    isAdmin: session?.user?.isAdmin === true,
    session: session as Session | null,
  };
}
