'use client';

import { signOut } from 'next-auth/react';
import type { Session } from '@bloomwell/auth/types';

interface AdminHeaderProps {
  session: Session;
}

export function AdminHeader({ session }: AdminHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bloomwell AI - Admin Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage users, statistics, and system settings
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">
              {session.user.firstName && session.user.lastName
                ? `${session.user.firstName} ${session.user.lastName}`
                : session.user.name || session.user.email}
            </p>
            <p className="text-xs text-gray-500">{session.user.email}</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
              Admin
            </span>

            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="ml-2 inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
