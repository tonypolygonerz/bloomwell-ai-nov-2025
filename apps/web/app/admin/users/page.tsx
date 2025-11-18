import { requireAdmin } from '@bloomwell/auth/lib/admin-check';
import prisma from '@bloomwell/db';
import { UserManagementClient } from '@/components/admin/user-management-client';

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { search?: string; page?: string };
}) {
  // Server-side admin check
  await requireAdmin();

  const search = searchParams.search || '';
  const page = parseInt(searchParams.page || '1', 10);
  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  // Build where clause for search
  const where = search
    ? {
        OR: [
          { email: { contains: search, mode: 'insensitive' as const } },
          { firstName: { contains: search, mode: 'insensitive' as const } },
          { lastName: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  // Fetch users with pagination
  const [users, totalUsers] = await Promise.all([
    prisma.user.findMany({
      where,
      take: pageSize,
      skip,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        emailVerified: true,
        isAdmin: true,
        subscriptionStatus: true,
        createdAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(totalUsers / pageSize);

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <p className="text-gray-600 mt-1">
          Manage user accounts, verification status, and subscriptions
        </p>
      </div>

      <UserManagementClient
        users={users}
        totalUsers={totalUsers}
        currentPage={page}
        totalPages={totalPages}
        searchQuery={search}
      />
    </div>
  );
}
