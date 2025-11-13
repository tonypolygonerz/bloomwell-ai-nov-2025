'use client'

import { useRouter } from 'next/navigation'
import { Dialog, Button } from '@bloomwell/ui'

interface GrantSearchPromptProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

export function GrantSearchPrompt({ isOpen, onClose, onComplete }: GrantSearchPromptProps) {
  const router = useRouter()

  const handleComplete = async () => {
    // Check current onboarding status to route to appropriate step
    try {
      const response = await fetch('/api/onboarding/status')
      const data = await response.json()

      if (!data.isBasicComplete) {
        // No organization type - go to Step 1
        router.push('/onboarding/step2')
      } else if (!data.isFullComplete) {
        // Has org type but missing mission/capacity - go to Step 2
        router.push('/onboarding/step2')
      } else {
        // Profile complete - shouldn't reach here
        onClose()
      }
    } catch (error) {
      // Fallback to Step 1 if check fails
      router.push('/onboarding/step2')
    }
    onComplete()
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="max-w-md">
      <div className="p-6">
        <h2 className="mb-2 text-xl font-bold">Complete Your Profile First</h2>
        <p className="mb-4 text-sm text-gray-600">
          To get accurate and personalized grant recommendations, we need to know more about your
          organization. Complete your profile to unlock grant matching features.
        </p>
        <p className="mb-4 text-xs text-gray-500">
          You can still use general AI assistance while you complete your profile.
        </p>
        <div className="flex gap-3">
          <Button onClick={handleComplete} className="flex-1">
            Complete Profile →
          </Button>
          <button
            onClick={onClose}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </Dialog>
  )
}
