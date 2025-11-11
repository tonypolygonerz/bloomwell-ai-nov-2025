'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ProfileCompletionModal } from './profile-completion-modal'

interface CompletionStep {
  field: string
  name: string
  percentage: number
  completed: boolean
  route: string
}

interface ProfileCompletionData {
  completionPercentage: number
  completionSteps: CompletionStep[]
  isComplete: boolean
}

export function ProfileCompletionFloating() {
  const router = useRouter()
  const [isDismissed, setIsDismissed] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [completionData, setCompletionData] = useState<ProfileCompletionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check dismissal state from localStorage
    const dismissed = localStorage.getItem('profileCompletionDismissed')
    if (dismissed) {
      setIsDismissed(true)
    }

    // Fetch completion status
    const fetchCompletionStatus = async () => {
      try {
        const response = await fetch('/api/onboarding/status')
        const data = await response.json()
        setCompletionData({
          completionPercentage: data.completionPercentage || 0,
          completionSteps: data.completionSteps || [],
          isComplete: data.isComplete || false,
        })
      } catch (error) {
        console.error('Failed to fetch completion status:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCompletionStatus()

    // Refresh on focus (when user returns from onboarding)
    const handleFocus = () => {
      fetchCompletionStatus()
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  const handleDismiss = () => {
    setIsDismissed(true)
    localStorage.setItem('profileCompletionDismissed', Date.now().toString())
  }

  const handleClick = () => {
    setIsModalOpen(true)
  }

  const handleCompleteProfile = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push('/onboarding/step2')
  }

  // Don't show if dismissed, loading, complete, or no data
  if (
    isDismissed ||
    isLoading ||
    !completionData ||
    completionData.isComplete ||
    completionData.completionPercentage >= 100
  ) {
    return null
  }

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleClick()
          }
        }}
        className="fixed bottom-[134px] right-6 z-40 flex max-w-sm cursor-pointer items-center gap-3 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 py-4 px-4 shadow-lg transition-all hover:shadow-xl group dark:border-emerald-300"
      >
        {/* Circular Progress Indicator */}
        <div className="flex-shrink-0 relative w-12 h-12">
          <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
            {/* Background circle */}
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-emerald-200"
            />
            {/* Progress arc */}
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={`${completionData.completionPercentage * 100.53 / 100}, 100.53`}
              strokeLinecap="round"
              className="text-emerald-600"
            />
          </svg>
          {/* Percentage text in center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-semibold text-emerald-700">
              {completionData.completionPercentage}%
            </span>
          </div>
        </div>
        
        <div className="flex flex-col flex-1">
          <div className="text-lg font-semibold text-emerald-900">
            {completionData.completionPercentage}%
          </div>
          <div className="text-xs text-emerald-700">
            Complete your profile to unlock AI recommendations for new grants, grantwriting help,
            and more.
          </div>
        </div>
        <button
          type="button"
          onClick={handleCompleteProfile}
          className="inline-flex items-center justify-center rounded-md bg-emerald-600 text-white transition-colors hover:bg-emerald-700 px-3 py-1.5 text-sm font-medium ml-2"
        >
          Complete Profile →
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleDismiss()
          }}
          className="ml-2 rounded-md p-1 text-emerald-400 opacity-0 transition-opacity hover:text-emerald-600 group-hover:opacity-100"
          aria-label="Dismiss"
        >
          <svg
            className="h-4 w-4"
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

      <ProfileCompletionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        completionPercentage={completionData.completionPercentage}
        completionSteps={completionData.completionSteps}
      />
    </>
  )
}

