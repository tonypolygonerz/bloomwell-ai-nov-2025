import { requireAdmin } from '@bloomwell/auth/lib/admin-check';

export default async function AdminPage() {
  // Server-side admin check - will redirect to /login if not admin
  const session = await requireAdmin();

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <h1 className="text-4xl font-bold text-gray-900">Bloomwell AI</h1>
    </div>
  );
}

