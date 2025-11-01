'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

export function AppSidebar({ isCollapsed, onToggle }: SidebarProps) {
  const { data: session } = useSession()

  return (
    <aside
      className={`${
        isCollapsed ? 'w-0' : 'w-64'
      } flex flex-col border-r border-gray-200 bg-white transition-all duration-250`}
    >
      <div className="flex items-center justify-between p-4">
        {!isCollapsed && <h2 className="font-bold">Navigation</h2>}
        <button
          onClick={onToggle}
          className="rounded-md p-2 hover:bg-gray-100"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>
      {!isCollapsed && (
        <nav className="flex-1 space-y-2 px-4">
          <Link
            href="/app"
            className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-gray-100"
          >
            <span>🏠</span>
            <span>Dashboard</span>
          </Link>
          {/* TODO: Create /app/chat/new page */}
          {/* <Link
            href="/app/chat/new"
            className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-gray-100"
          >
            <span>➕</span>
            <span>Start New Chat</span>
          </Link> */}
          <Link
            href="/webinars"
            className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-gray-100"
          >
            <span>📚</span>
            <span>Webinars</span>
          </Link>
          {/* TODO: Create /app/chats page */}
          {/* <Link
            href="/app/chats"
            className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-gray-100"
          >
            <span>💬</span>
            <span>Chats</span>
          </Link> */}
          {/* TODO: Create /app/projects page */}
          {/* <Link
            href="/app/projects"
            className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-gray-100"
          >
            <span>📁</span>
            <span>Projects</span>
          </Link> */}
        </nav>
      )}
      {!isCollapsed && (
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gray-300" />
            <div className="flex-1">
              <p className="text-sm font-medium">{session?.user?.name ?? 'User'}</p>
              <p className="text-xs text-gray-600">{session?.user?.email}</p>
            </div>
          </div>
          {/* TODO: Create /app/settings page */}
          {/* <Link
            href="/app/settings"
            className="mt-2 block text-sm text-gray-600 hover:text-brand"
          >
            Settings
          </Link> */}
        </div>
      )}
    </aside>
  )
}
