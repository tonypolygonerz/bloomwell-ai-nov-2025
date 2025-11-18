'use client'

import { useState, useEffect } from 'react'
import { AppTopbar } from '@/components/app/topbar'
import { AppSidebar } from '@/components/app/sidebar'
import { OnboardingGate } from '@/components/app/onboarding-gate'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  // Load sidebar state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed')
    if (savedState !== null) {
      setIsSidebarCollapsed(JSON.parse(savedState))
    }
  }, [])

  // Save sidebar state to localStorage when it changes
  const handleToggleSidebar = () => {
    const newState = !isSidebarCollapsed
    setIsSidebarCollapsed(newState)
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState))
  }

  return (
    <OnboardingGate>
      <div className="flex min-h-screen flex-col">
        <AppTopbar />
        <div className="flex flex-1">
          <AppSidebar isCollapsed={isSidebarCollapsed} onToggle={handleToggleSidebar} />
          <main className="flex-1 bg-white dark:bg-slate-900 overflow-y-auto h-[calc(100vh-4rem)] scrollbar-thin">
            {children}
          </main>
        </div>
      </div>
    </OnboardingGate>
  )
}
