'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Card } from '@bloomwell/ui'

export default function Step4Page() {
  const router = useRouter()
  const [organization, setOrganization] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/onboarding/status')
      .then((res) => res.json())
      .then((data) => {
        setOrganization(data.organization)
        setIsLoading(false)
      })
  }, [])

  const handleComplete = async () => {
    // Onboarding data is already saved from previous steps
    // Check if full completion is met, otherwise show what's missing
    try {
      const response = await fetch('/api/onboarding/status')
      const data = await response.json()

      if (data.isFullComplete) {
        router.push('/app')
      } else {
        // If not fully complete, redirect to appropriate step
        if (!data.organization?.mission) {
          router.push('/onboarding/step2')
        } else {
          router.push('/onboarding/step3')
        }
      }
    } catch (error) {
      // Fallback to dashboard
      router.push('/app')
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-8">
      <Card className="w-full max-w-2xl p-8">
        <h2 className="mb-2 text-2xl font-bold">Step 4: Review & Complete</h2>
        <p className="mb-6 text-sm text-gray-600">
          Review your profile information. You can edit these details anytime in Settings.
        </p>

        <div className="mb-6 space-y-6">
          {organization?.mission &&
          (organization?.budget || organization?.revenueBracket || organization?.staffSize) ? (
            <div className="rounded-lg bg-green-50 p-4">
              <p className="font-semibold text-green-800">✓ Profile Information Complete</p>
              <p className="mt-1 text-xs text-green-700">
                Your profile helps us find the best grant opportunities for your organization.
              </p>
            </div>
          ) : (
            <div className="rounded-lg bg-yellow-50 p-4">
              <p className="font-semibold text-yellow-800">Profile Partially Complete</p>
              <p className="mt-1 text-xs text-yellow-700">
                Complete your mission and capacity details to unlock personalized grant
                recommendations.
              </p>
            </div>
          )}

          {organization && (
            <div className="space-y-4">
              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-700">Organization Identity</h3>
                <div className="space-y-2 rounded-md bg-gray-50 p-3 text-sm">
                  {organization.legalName && (
                    <div>
                      <span className="font-medium">Name:</span> {organization.legalName}
                    </div>
                  )}
                  {organization.ein && (
                    <div>
                      <span className="font-medium">EIN:</span> {organization.ein}
                    </div>
                  )}
                </div>
              </div>

              {organization.mission && (
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-gray-700">Mission & Focus</h3>
                  <div className="space-y-2 rounded-md bg-gray-50 p-3 text-sm">
                    <div>
                      <span className="font-medium">Mission:</span>
                      <p className="mt-1 text-gray-700">{organization.mission}</p>
                    </div>
                    {organization.focusAreas && (
                      <div>
                        <span className="font-medium">Focus Areas:</span> {organization.focusAreas}
                      </div>
                    )}
                    {organization.serviceGeo && (
                      <div>
                        <span className="font-medium">Service Area:</span> {organization.serviceGeo}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-700">Capacity & Experience</h3>
                <div className="space-y-2 rounded-md bg-gray-50 p-3 text-sm">
                  {organization.budget && (
                    <div>
                      <span className="font-medium">Annual Budget:</span> {organization.budget}
                    </div>
                  )}
                  {organization.revenueBracket && (
                    <div>
                      <span className="font-medium">Annual Revenue:</span>{' '}
                      {organization.revenueBracket}
                    </div>
                  )}
                  {organization.staffSize && (
                    <div>
                      <span className="font-medium">Staff Size:</span> {organization.staffSize}
                    </div>
                  )}
                  {organization.recentGrantActivity && (
                    <div>
                      <span className="font-medium">Recent Grant Activity:</span>{' '}
                      {organization.recentGrantActivity}
                    </div>
                  )}
                  {organization.fiscalYear && (
                    <div>
                      <span className="font-medium">Fiscal Year:</span> {organization.fiscalYear}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => router.push('/onboarding/step3')}
            className="text-gray-600 hover:text-brand"
          >
            ← Back
          </button>
          <Button onClick={handleComplete}>Complete Setup →</Button>
        </div>
      </Card>
    </div>
  )
}
