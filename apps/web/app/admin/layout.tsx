import { requireAdmin } from '@bloomwell/auth/lib/admin-check';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { AdminNav } from '@/components/admin/admin-nav';
import { AdminHeader } from '@/components/admin/admin-header';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side admin check - will redirect to /login if not admin
  const session = await requireAdmin();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <AdminHeader session={session} />

      <div className="flex">
        {/* Sidebar Navigation */}
        <AdminNav />

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
