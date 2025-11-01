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

  const handleComplete = () => {
    router.push('/onboarding/step1')
    onComplete()
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="max-w-md">
      <div className="p-6">
        <h2 className="mb-2 text-xl font-bold">Complete Your Profile First</h2>
        <p className="mb-4 text-sm text-gray-600">
          To get accurate and personalized grant recommendations, we need to know more about your
          organization. This takes just 2-3 minutes.
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
