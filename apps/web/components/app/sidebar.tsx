'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TrialPopover } from './trial-popover'
import { RenameChatModal } from './rename-chat-modal'
import { FileChatModal } from './file-chat-modal'

interface Chat {
  id: string
  title: string
  projectId: string | null
  updatedAt: string
  isPinned: boolean
  project?: {
    id: string
    name: string
    color?: string | null
  } | null
}

interface Project {
  id: string
  name: string
  color?: string | null
  chats: Array<{
    id: string
    title: string
    updatedAt: string
  }>
}

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

export function AppSidebar({ isCollapsed, onToggle }: SidebarProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [showTrialPopover, setShowTrialPopover] = useState(false)
  const [chats, setChats] = useState<Chat[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set(['all', 'deleted']))
  const [renameModalOpen, setRenameModalOpen] = useState(false)
  const [fileModalOpen, setFileModalOpen] = useState(false)
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)

  const trialEndsAt = session?.trialEndsAt ?? session?.user?.trialEndsAt
  const isTrialActive = trialEndsAt && new Date(trialEndsAt) > new Date()
  const daysRemaining = isTrialActive
    ? Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0
  const totalTrialDays = 14
  const daysElapsed = totalTrialDays - daysRemaining
  const currentDay = daysElapsed + 1
  const progressPercentage = (currentDay / totalTrialDays) * 100

  // Fetch chats and projects
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [chatsRes, projectsRes] = await Promise.all([
          fetch('/api/chats'),
          fetch('/api/projects'),
        ])

        if (chatsRes.ok) {
          const chatsData = await chatsRes.json()
          setChats(chatsData.chats || [])
        }

        if (projectsRes.ok) {
          const projectsData = await projectsRes.json()
          setProjects(projectsData.projects || [])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Get unfiled chats (recent chats)
  const recentChats = chats
    .filter((chat) => !chat.projectId)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

  // Create new chat
  const handleCreateChat = async () => {
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Chat' }),
      })

      if (response.ok) {
        const data = await response.json()
        // Refresh chats list
        const chatsRes = await fetch('/api/chats')
        if (chatsRes.ok) {
          const chatsData = await chatsRes.json()
          setChats(chatsData.chats || [])
        }
        // Navigate to chat (TODO: implement chat page)
        router.push(`/app/chat/${data.chat.id}` as any)
      }
    } catch (error) {
      console.error('Error creating chat:', error)
    }
  }

  // Rename chat
  const handleRenameChat = async (chatId: string, newTitle: string) => {
    const response = await fetch(`/api/chats/${chatId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle }),
    })

    if (response.ok) {
      const chatsRes = await fetch('/api/chats')
      if (chatsRes.ok) {
        const chatsData = await chatsRes.json()
        setChats(chatsData.chats || [])
      }
    } else {
      throw new Error('Failed to rename chat')
    }
  }

  // Delete chat
  const handleDeleteChat = async (chatId: string) => {
    if (!confirm('Are you sure you want to delete this chat?')) return

    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        const chatsRes = await fetch('/api/chats')
        if (chatsRes.ok) {
          const chatsData = await chatsRes.json()
          setChats(chatsData.chats || [])
        }
      }
    } catch (error) {
      console.error('Error deleting chat:', error)
    }
  }

  // File chat to project
  const handleFileToProject = async (chatId: string, projectId: string | null) => {
    const response = await fetch(`/api/chats/${chatId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId }),
    })

    if (response.ok) {
      // Refresh both chats and projects
      const [chatsRes, projectsRes] = await Promise.all([
        fetch('/api/chats'),
        fetch('/api/projects'),
      ])

      if (chatsRes.ok) {
        const chatsData = await chatsRes.json()
        setChats(chatsData.chats || [])
      }

      if (projectsRes.ok) {
        const projectsData = await projectsRes.json()
        setProjects(projectsData.projects || [])
      }
    } else {
      throw new Error('Failed to file chat')
    }
  }

  // Create new project
  const handleCreateProject = async (name: string) => {
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })

    if (response.ok) {
      const data = await response.json()
      const projectsRes = await fetch('/api/projects')
      if (projectsRes.ok) {
        const projectsData = await projectsRes.json()
        setProjects(projectsData.projects || [])
      }
      return data.project
    } else {
      throw new Error('Failed to create project')
    }
  }

  // Toggle project expand/collapse
  const toggleProject = (projectId: string) => {
    setExpandedProjects((prev) => {
      const next = new Set(prev)
      if (next.has(projectId)) {
        next.delete(projectId)
      } else {
        next.add(projectId)
      }
      return next
    })
  }

  return (
    <aside
      className={`${
        isCollapsed ? 'w-[60px]' : 'w-[280px]'
      } relative flex flex-col border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 transition-all duration-300 ease-in-out overflow-hidden`}
    >
      {/* Toggle Button - D-shaped with blue border */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-6 z-50 w-8 h-8 rounded-lg border-2 border-blue-500 dark:border-blue-400 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md hover:border-blue-600 dark:hover:border-blue-300 transition-all duration-200 flex items-center justify-center"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <svg
          className={`w-4 h-4 text-slate-600 dark:text-slate-300 transition-transform duration-200 ${
            isCollapsed ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <nav className="flex-1 space-y-2 px-4 overflow-y-auto">
        {/* TODO: Create /app/chat/new page */}
        {/* <Link
            href="/app/chat/new"
            className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <span>➕</span>
            <span>Start New Chat</span>
          </Link> */}

        {/* + New Chat Button */}
        <div className="px-4 mt-4 mb-4 -ml-[17px]">
          <button
            onClick={handleCreateChat}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-center gap-2'} px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-medium transition-all duration-200 shadow-sm hover:shadow-md`}
            aria-label="New Chat"
          >
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            {!isCollapsed && <span>New Chat</span>}
          </button>
        </div>

        {/* Divider */}
        <div className="my-2 border-t border-slate-200 dark:border-slate-700"></div>

        {/* Recent Chats Section */}
        {!isCollapsed && (
          <div className="mt-6">
            <div className="px-3 mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Recent Chats
            </div>
            {isLoading ? (
              <div className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">Loading...</div>
            ) : recentChats.length === 0 ? (
              <div className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400 italic">No chats yet</div>
            ) : (
              <div className="space-y-1">
                {recentChats.map((chat) => (
                  <div
                    key={chat.id}
                    className="group relative flex items-center gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors duration-150"
                    onClick={() => router.push(`/app/chat/${chat.id}` as any)}
                  >
                    <svg
                      className="w-5 h-5 text-slate-600 dark:text-slate-400 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      />
                    </svg>
                    <span className="flex-1 truncate text-sm text-slate-700 dark:text-slate-300">{chat.title}</span>
                    <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity duration-150">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedChat(chat)
                          setRenameModalOpen(true)
                        }}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        title="Rename"
                      >
                        <svg
                          className="w-3 h-3 text-slate-600 dark:text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedChat(chat)
                          setFileModalOpen(true)
                        }}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        title="File to project"
                      >
                        <svg
                          className="w-3 h-3 text-slate-600 dark:text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteChat(chat.id)
                        }}
                        className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Projects Section */}
        {!isCollapsed && (
          <div className="mt-6">
            <div className="px-3 mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Projects</span>
              <button
                onClick={() => {
                  const name = prompt('Enter project name:')
                  if (name) {
                    handleCreateProject(name)
                  }
                }}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                title="New project"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
            </div>
            {isLoading ? (
              <div className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">Loading...</div>
            ) : (
              <div className="space-y-1">
                {/* All and Deleted options */}
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-left text-sm text-slate-700 dark:text-slate-300 transition-colors duration-150"
                  onClick={() => {/* Navigate to all chats */}}
                >
                  <svg className="w-4 h-4 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <span>All</span>
                </button>
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-left text-sm text-slate-700 dark:text-slate-300 transition-colors duration-150"
                  onClick={() => {/* Navigate to deleted chats */}}
                >
                  <svg className="w-4 h-4 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Deleted</span>
                </button>
                {projects.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400 italic">No projects yet</div>
                ) : (
                  projects.map((project) => (
                  <div key={project.id} className="mb-2">
                    <button
                      onClick={() => toggleProject(project.id)}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-left transition-colors duration-150"
                    >
                      <svg
                        className="w-5 h-5 text-slate-600 dark:text-slate-400 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                        />
                      </svg>
                      <span className="flex-1 truncate text-sm font-medium text-slate-700 dark:text-slate-300">
                        {project.name}
                      </span>
                      <svg
                        className={`w-4 h-4 text-slate-500 dark:text-slate-400 transition-transform ${
                          expandedProjects.has(project.id) ? 'rotate-90' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                    {expandedProjects.has(project.id) && (
                      <div className="ml-6 mt-1 space-y-1 border-l border-slate-200 dark:border-slate-700 pl-2">
                        {project.chats.length === 0 ? (
                          <div className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400 italic">
                            No chats in this project
                          </div>
                        ) : (
                          project.chats.map((chat) => (
                            <div
                              key={chat.id}
                              className="group flex items-center gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors duration-150"
                              onClick={() => router.push(`/app/chat/${chat.id}` as any)}
                            >
                              <svg
                                className="w-4 h-4 text-slate-500 dark:text-slate-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                                />
                              </svg>
                              <span className="flex-1 truncate text-sm text-slate-600 dark:text-slate-400">
                                {chat.title}
                              </span>
                              <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity duration-150">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    const fullChat = chats.find((c) => c.id === chat.id)
                                    if (fullChat) {
                                      setSelectedChat(fullChat)
                                      setRenameModalOpen(true)
                                    }
                                  }}
                                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                  <svg
                                    className="w-3 h-3 text-slate-600 dark:text-slate-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                  </svg>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    const fullChat = chats.find((c) => c.id === chat.id)
                                    if (fullChat) {
                                      handleFileToProject(chat.id, null)
                                    }
                                  }}
                                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                  title="Unfile"
                                >
                                  <svg
                                    className="w-3 h-3 text-slate-600 dark:text-slate-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Webinars Link */}
        <Link
          href="/webinars"
          className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors duration-150"
        >
          <svg
            className="w-5 h-5 flex-shrink-0 text-slate-600 dark:text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <span
            className={`${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'} transition-opacity duration-300 text-sm`}
          >
            Webinars
          </span>
        </Link>
      </nav>

      {/* Trial Banner */}
      {isTrialActive && daysRemaining > 0 && !isCollapsed && (
        <div className="mx-4 mt-4 mb-2 rounded-2xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 p-4 shadow-sm">
          <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">Free trial of Max features</h3>
          <button
            onClick={() => setShowTrialPopover(true)}
            className="mb-3 flex items-center gap-1 text-sm text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
          >
            <span>What's included?</span>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
          {/* Progress Bar */}
          <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-purple-200 dark:bg-purple-800">
            <div
              className="h-full bg-purple-600 dark:bg-purple-500 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="mb-3 text-xs text-slate-600 dark:text-slate-400">
            On day {currentDay} of {totalTrialDays} days
          </p>
          <Link href="/upgrade" className="block">
            <button className="w-full rounded-lg bg-purple-600 dark:bg-purple-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors shadow-sm">
              Upgrade to continue accessing all features
            </button>
          </Link>
        </div>
      )}

      <div className="border-t border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex-shrink-0 flex items-center justify-center text-white font-semibold text-sm">
            {session?.user?.name?.charAt(0) ?? 'U'}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-slate-900 dark:text-white">{session?.user?.name ?? 'User'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{session?.user?.email}</p>
            </div>
          )}
        </div>
      </div>
      <TrialPopover
        isOpen={showTrialPopover}
        onClose={() => setShowTrialPopover(false)}
        daysRemaining={daysRemaining}
      />
      {selectedChat && (
        <>
          <RenameChatModal
            isOpen={renameModalOpen}
            onClose={() => {
              setRenameModalOpen(false)
              setSelectedChat(null)
            }}
            currentTitle={selectedChat.title}
            chatId={selectedChat.id}
            onRename={handleRenameChat}
          />
          <FileChatModal
            isOpen={fileModalOpen}
            onClose={() => {
              setFileModalOpen(false)
              setSelectedChat(null)
            }}
            chatId={selectedChat.id}
            currentProjectId={selectedChat.projectId}
            projects={projects}
            onCreateProject={handleCreateProject}
            onFileToProject={handleFileToProject}
          />
        </>
      )}
    </aside>
  )
}
