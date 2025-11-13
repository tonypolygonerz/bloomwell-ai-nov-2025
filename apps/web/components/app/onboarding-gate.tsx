'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export function OnboardingGate({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [, setIsComplete] = useState<boolean | null>(null)
  const redirectAttemptsRef = useRef(0)
  const hasCheckedRef = useRef(false)

  // Helper: Check if we should retry onboarding check
  const shouldRetryOnboardingCheck = (
    fromOnboarding: string | null,
    lastRedirectTime: string | null,
    retryCount: number,
  ): boolean => {
    if (fromOnboarding !== 'true' || !lastRedirectTime) {
      return false
    }
    const timeSinceRedirect = Date.now() - parseInt(lastRedirectTime)
    return timeSinceRedirect < 5000 && retryCount < 3
  }

  // Helper: Clear onboarding redirect flags
  const clearRedirectFlags = (): void => {
    sessionStorage.removeItem('fromOnboarding')
    sessionStorage.removeItem('lastRedirectTime')
  }

  // Helper: Handle onboarding redirect logic
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  type CheckOnboardingFn = (retryCount: number, delay: number) => Promise<void>
  const handleOnboardingRedirect = async (
    retryCount: number,
    delays: number[],
    checkOnboarding: CheckOnboardingFn,
  ): Promise<boolean> => {
    const currentPath = window.location.pathname
    if (!currentPath.startsWith('/app') || currentPath.startsWith('/app/onboarding')) {
      return false
    }

    const fromOnboarding = sessionStorage.getItem('fromOnboarding')
    const lastRedirectTime = sessionStorage.getItem('lastRedirectTime')
    const now = Date.now()

    // Check if we should retry
    if (shouldRetryOnboardingCheck(fromOnboarding, lastRedirectTime, retryCount)) {
      hasCheckedRef.current = false
      await checkOnboarding(retryCount + 1, delays[retryCount + 1] || 1000)
      return true
    }

    // Clear flags after 5 seconds
    if (fromOnboarding === 'true' && lastRedirectTime) {
      const timeSinceRedirect = now - parseInt(lastRedirectTime)
      if (timeSinceRedirect >= 5000) {
        clearRedirectFlags()
      }
    }

    // Prevent infinite redirect loops
    if (redirectAttemptsRef.current >= 3) {
      console.warn('OnboardingGate: Max redirect attempts reached, allowing access')
      hasCheckedRef.current = false
      redirectAttemptsRef.current = 0
      return true
    }

    redirectAttemptsRef.current += 1
    sessionStorage.setItem('lastRedirectTime', now.toString())
    router.push('/onboarding/step2')
    return true
  }

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    // Check for bypass query parameter
    const urlParams = new URLSearchParams(window.location.search)
    const skipOnboarding = urlParams.get('skipOnboarding') === 'true'

    // Progressive delays for retries: 1s, 2s, 3s
    const delays = [0, 1000, 2000, 3000]

    const checkOnboarding = async (retryCount = 0, initialDelay = 0) => {
      // Prevent multiple simultaneous checks
      if (hasCheckedRef.current && retryCount === 0) {
        return
      }
      hasCheckedRef.current = true

      try {
        // Add initial delay based on retry count (progressive delays: 1s, 2s, 3s)
        const delay = initialDelay > 0 ? initialDelay : delays[retryCount] || 0
        if (delay > 0) {
          await new Promise((resolve) => setTimeout(resolve, delay))
        }

        // Use cache-busting to ensure fresh data
        const response = await fetch(`/api/onboarding/status?t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          },
        })

        if (!response.ok) {
          throw new Error(`Status check failed: ${response.status}`)
        }

        const data = await response.json()

        setIsComplete(data.isComplete)

        // If bypass parameter is present, allow access temporarily
        if (skipOnboarding && !data.isBasicComplete) {
          console.log('OnboardingGate: Bypass parameter detected, allowing access temporarily')

          // Clean up query parameter from URL
          const newUrl = window.location.pathname
          router.replace(newUrl as any, { scroll: false })

          // Set up background check after 3 seconds
          setTimeout(async () => {
            try {
              const bgResponse = await fetch(`/api/onboarding/status?t=${Date.now()}`, {
                cache: 'no-store',
              })
              if (bgResponse.ok) {
                const bgData = await bgResponse.json()
                if (bgData.isBasicComplete) {
                  console.log('OnboardingGate: Background check confirms onboarding complete')
                  // Clear sessionStorage flags
                  sessionStorage.removeItem('fromOnboarding')
                  sessionStorage.removeItem('lastRedirectTime')
                  redirectAttemptsRef.current = 0
                }
              }
            } catch (error) {
              console.error('Background status check failed:', error)
            }
          }, 3000)

          // Allow access for now
          hasCheckedRef.current = false
          return
        }

        // Redirect to Step 2 if basic completion is missing (user hasn't selected organization type)
        if (!data.isBasicComplete && typeof window !== 'undefined') {
          const redirected = await handleOnboardingRedirect(retryCount, delays, checkOnboarding)
          if (redirected) {
            return
          }
        } else {
          // Reset redirect attempts on successful check
          redirectAttemptsRef.current = 0
          clearRedirectFlags()

          // Clean up query parameter if present
          if (skipOnboarding) {
            const newUrl = window.location.pathname
            router.replace(newUrl as any, { scroll: false })
          }
        }
      } catch (error) {
        console.error('Failed to check onboarding status:', error)
        setIsComplete(false)

        // On error, retry with progressive delays (up to 3 attempts)
        if (retryCount < 3) {
          hasCheckedRef.current = false
          const delays = [1000, 2000, 3000]
          setTimeout(
            () => checkOnboarding(retryCount + 1, delays[retryCount] || 1000),
            delays[retryCount] || 1000,
          )
        } else {
          // After 3 retries, if bypass is present, allow access
          if (skipOnboarding) {
            console.warn(
              'OnboardingGate: Error after retries, but bypass parameter present - allowing access',
            )
            hasCheckedRef.current = false
          }
        }
      } finally {
        if (retryCount === 0) {
          hasCheckedRef.current = false
        }
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

  return <>{children}</>
}
