'use client'

import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { useState } from 'react'

export function AppTopbar() {
  const { data: session } = useSession()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const trialEndsAt = session?.trialEndsAt ?? session?.user?.trialEndsAt
  const isTrialActive = trialEndsAt && new Date(trialEndsAt) > new Date()
  const daysRemaining = isTrialActive
    ? Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <header className="bg-brand text-white">
      <div className="mx-auto flex max-w-full items-center justify-between px-4 py-3">
        <Link href="/app" className="text-lg font-bold">
          Bloomwell AI
        </Link>
        <div className="flex items-center gap-4">
          <button className="rounded-md p-2 hover:bg-white/10">🔔</button>
          <button className="rounded-md p-2 hover:bg-white/10">📅</button>
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-white/10"
            >
              <span>Welcome {session?.user?.name ?? 'User'}</span>
              <span>▼</span>
            </button>
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-md bg-white shadow-lg">
                <button
                  onClick={() => signOut()}
                  className="block w-full px-4 py-2 text-left text-black hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {isTrialActive && daysRemaining > 0 && (
        <div className="flex items-center justify-between bg-yellow-500 px-4 py-2">
          <span className="text-sm font-medium">
            🕐 {daysRemaining} days remaining in your free trial
          </span>
          <Link href="/upgrade">
            <button className="inline-flex items-center justify-center rounded-md bg-white text-brand hover:bg-gray-100 px-3 py-1.5 text-sm font-medium transition-colors">
              Upgrade to continue accessing all features
            </button>
          </Link>
        </div>
      )}
    </header>
  )
}
