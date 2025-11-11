'use client'

import { useRouter } from 'next/navigation'
import { Dialog, Button } from '@bloomwell/ui'

interface CompletionStep {
  field: string
  name: string
  percentage: number
  completed: boolean
  route: string
}

interface ProfileCompletionModalProps {
  isOpen: boolean
  onClose: () => void
  completionPercentage: number
  completionSteps: CompletionStep[]
}

export function ProfileCompletionModal({
  isOpen,
  onClose,
  completionPercentage,
  completionSteps,
}: ProfileCompletionModalProps) {
  const router = useRouter()

  const handleStepClick = (route: string) => {
    router.push(route)
    onClose()
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="max-w-2xl">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {completionPercentage}% Profile Completion
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Complete your profile to unlock AI recommendations for new grants, grantwriting help,
              and more.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <svg
              className="h-5 w-5"
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

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">Overall Progress</span>
            <span className="text-gray-600">{completionPercentage}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Steps List */}
        <div className="space-y-3">
          {completionSteps.map((step) => (
            <div
              key={step.field}
              className="flex items-center justify-between rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                {step.completed ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                    <svg
                      className="h-4 w-4 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-gray-300">
                    <div className="h-2 w-2 rounded-full bg-gray-300" />
                  </div>
                )}
                <div>
                  <div className="font-medium text-gray-900">{step.name}</div>
                  <div className="text-xs text-gray-500">+{step.percentage}%</div>
                </div>
              </div>
              {!step.completed && (
                <Button
                  onClick={() => handleStepClick(step.route)}
                  className="bg-red-600 text-white hover:bg-red-700"
                  size="sm"
                >
                  Complete
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end border-t border-gray-200 pt-4">
          <button
            onClick={onClose}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </Dialog>
  )
}

