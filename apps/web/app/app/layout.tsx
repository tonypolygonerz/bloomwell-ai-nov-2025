'use client'

import { SessionProvider } from 'next-auth/react'
import { useState } from 'react'
import { AppTopbar } from '@/components/app/topbar'
import { AppSidebar } from '@/components/app/sidebar'
import { OnboardingGate } from '@/components/app/onboarding-gate'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  return (
    <SessionProvider>
      <OnboardingGate>
        <div className="flex min-h-screen flex-col">
          <AppTopbar />
          <div className="flex flex-1">
            <AppSidebar
              isCollapsed={isSidebarCollapsed}
              onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />
            <main className="flex-1">{children}</main>
          </div>
        </div>
      </OnboardingGate>
    </SessionProvider>
  )
}
