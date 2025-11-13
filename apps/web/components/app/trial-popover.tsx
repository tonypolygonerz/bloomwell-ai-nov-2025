'use client'

import Link from 'next/link'
import { Dialog, Button } from '@bloomwell/ui'

interface TrialPopoverProps {
  isOpen: boolean
  onClose: () => void
  daysRemaining: number
}

export function TrialPopover({ isOpen, onClose, daysRemaining }: TrialPopoverProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="max-w-4xl">
      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700">
              <span>⭐</span>
              <span>Trial</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex">
          {/* Left Side - Content */}
          <div className="flex-1 p-6">
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              Your free trial expires in {daysRemaining} days
            </h2>
            <p className="mb-6 text-gray-600">
              Here's how you've used premium features during your free trial. Upgrade to continue
              using them.
            </p>

            <h3 className="mb-4 text-lg font-semibold text-gray-900">Max Plan Feature List</h3>

            <div className="space-y-4">
              {/* Feature 1 */}
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100">
                  <svg
                    className="h-6 w-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Create Up To 10 Publications</h4>
                  <p className="text-sm text-gray-600">
                    Create up to 10 publications to share your content with different audiences.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100">
                  <svg
                    className="h-6 w-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Remove beehiiv Branding</h4>
                  <p className="text-sm text-gray-600">
                    Let your brand shine by removing the beehiiv branding from your newsletter.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100">
                  <svg
                    className="h-6 w-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Advanced Web Builder</h4>
                  <p className="text-sm text-gray-600">
                    The ultimate suite of content tools—built for ease, optimized for beautiful
                    custom newsletters.
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100">
                  <svg
                    className="h-6 w-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Automations</h4>
                  <p className="text-sm text-gray-600">
                    Create multi-step email journeys based on different triggers such as signing up
                    for your newsletter or upgrading to your premium.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Illustrative Graphic */}
          <div className="w-80 bg-gradient-to-br from-purple-100 to-purple-200 p-8">
            <div className="relative h-full">
              {/* Simplified newsletter signup form representation */}
              <div className="rounded-lg bg-white p-6 shadow-lg">
                <div className="mb-4 h-8 w-24 rounded bg-pink-200"></div>
                <div className="mb-3 flex gap-2">
                  <div className="h-10 flex-1 rounded border border-gray-300"></div>
                  <div className="h-10 w-24 rounded bg-pink-500"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-gray-200 p-6">
          <Link href="/upgrade">
            <Button className="inline-flex items-center gap-2 bg-black text-white hover:bg-gray-800">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <span>Upgrade</span>
            </Button>
          </Link>
        </div>
      </div>
    </Dialog>
  )
}
