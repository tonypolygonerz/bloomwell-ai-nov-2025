'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

export function OnboardingGate({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [, setIsComplete] = useState<boolean | null>(null)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    const checkOnboarding = async () => {
      try {
        const response = await fetch('/api/onboarding/status')
        const data = await response.json()

        setIsComplete(data.isComplete)
        
        // Redirect to Step 1 if basic completion is missing (user hasn't selected organization type)
        if (!data.isBasicComplete && typeof window !== 'undefined') {
          const currentPath = window.location.pathname
          // Only redirect if on /app routes, not if already on onboarding
          if (currentPath.startsWith('/app') && !currentPath.startsWith('/app/onboarding')) {
            router.push('/onboarding/step2')
            return
          }
        }
        
        // Show banner if basic complete but not full complete (don't block access)
        setShowBanner(data.isBasicComplete && !data.isFullComplete)
      } catch (error) {
        console.error('Failed to check onboarding status:', error)
        setIsComplete(false)
        setShowBanner(false)
      }
    }

    checkOnboarding()
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <>
      {showBanner && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <p className="text-sm text-yellow-800">
              Complete your profile to unlock personalized grant recommendations
            </p>
            <div className="flex gap-2">
              <Link
                href="/onboarding/step2"
                className="rounded-md bg-yellow-600 px-3 py-1 text-sm font-medium text-white hover:bg-yellow-700"
              >
                Complete Profile
              </Link>
              <button
                onClick={() => setShowBanner(false)}
                className="text-sm text-yellow-700 hover:text-yellow-900"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
      {children}
    </>
  )
}
