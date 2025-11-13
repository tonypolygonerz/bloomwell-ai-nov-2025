'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Card, Input } from '@bloomwell/ui'
import { ProgressIndicator } from '@/components/auth/progress-indicator'

const budgetOptions = ['<$90K', '$90K-$200K', '$200K-$500K', '$500K-$750K', '$750K-$1M']

const staffSizeOptions = ['1-5', '6-10', '11-25', '26-50', '51-100', '101-500']

const usStates = [
  'Alabama',
  'Alaska',
  'Arizona',
  'Arkansas',
  'California',
  'Colorado',
  'Connecticut',
  'Delaware',
  'District of Columbia',
  'Florida',
  'Georgia',
  'Hawaii',
  'Idaho',
  'Illinois',
  'Indiana',
  'Iowa',
  'Kansas',
  'Kentucky',
  'Louisiana',
  'Maine',
  'Maryland',
  'Massachusetts',
  'Michigan',
  'Minnesota',
  'Mississippi',
  'Missouri',
  'Montana',
  'Nebraska',
  'Nevada',
  'New Hampshire',
  'New Jersey',
  'New Mexico',
  'New York',
  'North Carolina',
  'North Dakota',
  'Ohio',
  'Oklahoma',
  'Oregon',
  'Pennsylvania',
  'Rhode Island',
  'South Carolina',
  'South Dakota',
  'Tennessee',
  'Texas',
  'Utah',
  'Vermont',
  'Virginia',
  'Washington',
  'West Virginia',
  'Wisconsin',
  'Wyoming',
]

export default function Step3Page() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    mission: '',
    focusAreas: '',
    budget: '',
    staffSize: '',
    state: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Enhanced error logging helper
  const logError = (context: string, error: any) => {
    if (error instanceof Error) {
      console.error(`${context}:`, {
        message: error.message,
        stack: error.stack,
        name: error.name,
        fullError: JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
      })
    } else {
      console.error(`${context}:`, {
        errorObject: error,
        stringified: JSON.stringify(error, null, 2),
      })
    }
  }

  const handleContinue = async () => {
    if (!formData.mission || !formData.budget || !formData.staffSize || !formData.state) {
      return
    }

    setIsLoading(true)
    setErrorMessage(null)

    try {
      const response = await fetch('/api/onboarding/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mission: formData.mission || undefined,
          focusAreas: formData.focusAreas || undefined,
          budget: formData.budget || undefined,
          staffSize: formData.staffSize || undefined,
          state: formData.state || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        logError('Failed to save organization data', errorData)

        const errorMsg =
          errorData.message || errorData.error || 'Unable to save your data. Please try again.'
        setErrorMessage(errorMsg)
        setIsLoading(false)
        return
      }

      // Success - navigate to dashboard
      router.push('/app')
    } catch (error) {
      logError('Error saving organization data', error)
      setErrorMessage('An unexpected error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  const handleSkip = async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const response = await fetch('/api/onboarding/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mission: formData.mission || undefined,
          focusAreas: formData.focusAreas || undefined,
          budget: formData.budget || undefined,
          staffSize: formData.staffSize || undefined,
          state: formData.state || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        logError('Failed to save organization data (skip)', errorData)

        // For skip, we still navigate but show a warning
        const errorMsg =
          errorData.message || errorData.error || 'Unable to save your data, but continuing...'
        console.warn('Skip save failed:', errorMsg)
        // Still navigate on skip even if save fails
        router.push('/app')
        return
      }

      // Success - navigate to dashboard
      router.push('/app')
    } catch (error) {
      logError('Error saving organization data (skip)', error)
      // For skip, navigate anyway but log the error
      console.warn('Skip encountered error, but continuing:', error)
      router.push('/app')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-8">
      <Card className="w-full max-w-2xl p-8">
        <ProgressIndicator currentStep={3} totalSteps={3} />

        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleContinue()
          }}
          className="space-y-5"
        >
          {/* Error Message Display */}
          {errorMessage && (
            <div className="rounded-md bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-800">{errorMessage}</p>
            </div>
          )}

          {/* Mission Statement */}
          <div>
            <label htmlFor="mission" className="mb-2 block text-sm font-semibold text-gray-700">
              Mission Statement <span className="text-red-600">*</span>
            </label>
            <textarea
              id="mission"
              value={formData.mission}
              onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none transition-colors focus:border-[#1E6F5C] hover:border-[#1E6F5C]"
              rows={4}
              placeholder="Describe what your organization does and who you serve"
              required
            />
          </div>

          {/* Focus Areas */}
          <div>
            <label htmlFor="focusAreas" className="mb-2 block text-sm font-semibold text-gray-700">
              Focus Areas <span className="text-xs font-normal text-gray-500">(Optional)</span>
            </label>
            <Input
              id="focusAreas"
              value={formData.focusAreas}
              onChange={(e) => setFormData({ ...formData, focusAreas: e.target.value })}
              placeholder="e.g., education, healthcare, environment"
            />
          </div>

          {/* Budget */}
          <div>
            <label htmlFor="budget" className="mb-2 block text-sm font-semibold text-gray-700">
              Annual Budget <span className="text-red-600">*</span>
            </label>
            <select
              id="budget"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none transition-colors focus:border-[#1E6F5C] hover:border-[#1E6F5C]"
              required
            >
              <option value="">Select budget range</option>
              {budgetOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Staff Size */}
          <div>
            <label htmlFor="staffSize" className="mb-2 block text-sm font-semibold text-gray-700">
              Staff Size <span className="text-red-600">*</span>
            </label>
            <select
              id="staffSize"
              value={formData.staffSize}
              onChange={(e) => setFormData({ ...formData, staffSize: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none transition-colors focus:border-[#1E6F5C] hover:border-[#1E6F5C]"
              required
            >
              <option value="">Select staff size</option>
              {staffSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* State */}
          <div>
            <label htmlFor="state" className="mb-2 block text-sm font-semibold text-gray-700">
              State <span className="text-red-600">*</span>
            </label>
            <select
              id="state"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none transition-colors focus:border-[#1E6F5C] hover:border-[#1E6F5C]"
              required
            >
              <option value="">Select state</option>
              {usStates.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-between items-center pt-4">
            <button
              type="button"
              onClick={() => router.push('/onboarding/step2')}
              className="text-sm text-gray-600 hover:text-[#1E6F5C]"
            >
              ← Back
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSkip}
                className="text-sm text-gray-600 hover:text-[#1E6F5C] px-4 py-2 rounded-md hover:bg-gray-50"
              >
                Skip
              </button>
              <Button
                type="submit"
                className="bg-[#1E6F5C] text-white font-bold hover:bg-[#1a5d4d] py-3 rounded-md px-6"
                disabled={
                  isLoading ||
                  !formData.mission ||
                  !formData.budget ||
                  !formData.staffSize ||
                  !formData.state
                }
              >
                {isLoading ? 'Saving...' : 'Continue'}
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  )
}
