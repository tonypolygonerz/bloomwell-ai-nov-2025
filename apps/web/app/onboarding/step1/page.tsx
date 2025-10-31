'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Card, Input } from '@bloomwell/ui'

const organizationTypes = [
  'US Registered 501(c)(3) Nonprofit',
  'Freelance Grant Writer / Grant Writing Agency',
  'University / College / School / School District',
  'Government Entity',
  'Other (Individual Researcher, For-Profit, etc.)',
]

export default function Step1Page() {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState('')
  const [ein, setEin] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [orgData, setOrgData] = useState<{
    legalName?: string
    ein?: string
  } | null>(null)

  const handleEINSearch = async () => {
    if (!ein || ein.length < 9) return

    setIsSearching(true)
    try {
      const response = await fetch(`/api/onboarding/propublica?ein=${ein}`)
      const data = await response.json()

      if (data.organization) {
        setOrgData({
          legalName: data.organization.name,
          ein: data.organization.ein,
        })
      }
    } catch (error) {
      console.error('ProPublica search failed:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleContinue = async () => {
    if (!selectedType) return

    await fetch('/api/onboarding/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        organizationType: selectedType,
        ein: orgData?.ein || ein,
        legalName: orgData?.legalName,
      }),
    })

    router.push('/onboarding/step2')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-8">
      <Card className="w-full max-w-2xl p-8">
        <div className="mb-6">
          <div className="mb-2 text-4xl">👋</div>
          <h1 className="mb-2 text-3xl font-bold">Welcome to Bloomwell AI</h1>
          <p className="text-gray-600">Let's set up your organization profile</p>
        </div>

        <div className="mb-6">
          <h2 className="mb-4 text-xl font-semibold">Step 1: Who You Are</h2>
          <p className="mb-4 text-sm text-gray-600">
            Help us understand your organization type so we can find the right grants for you.
          </p>
          <div className="mb-6">
            <h3 className="mb-3 text-sm font-medium text-gray-700">Organization Type</h3>
            <div className="space-y-3">
              {organizationTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`w-full rounded-lg border-2 p-4 text-left transition-colors ${
                    selectedType === type
                      ? 'border-brand bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {(selectedType === 'US Registered 501(c)(3) Nonprofit' ||
            selectedType === 'University / College / School / School District' ||
            selectedType === 'Government Entity') && (
            <div className="mb-6">
              <h3 className="mb-3 text-sm font-medium text-gray-700">
                Verify Organization (Optional)
              </h3>
              <p className="mb-2 text-xs text-gray-600">
                Search by EIN to auto-populate your organization details
              </p>
              <div className="flex gap-2">
                <Input
                  value={ein}
                  onChange={(e) => setEin(e.target.value)}
                  placeholder="Enter EIN (e.g., 123456789)"
                  className="flex-1"
                />
                <Button onClick={handleEINSearch} disabled={isSearching || !ein}>
                  {isSearching ? 'Searching...' : 'Search'}
                </Button>
              </div>
              {orgData && (
                <div className="mt-2 rounded-lg bg-green-50 p-3">
                  <p className="text-sm font-medium text-green-800">
                    ✓ Found: {orgData.legalName}
                  </p>
                  <p className="text-xs text-green-700">EIN: {orgData.ein}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => router.push('/app')}
            className="text-gray-600 hover:text-brand"
          >
            ← Back
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/app')}
              className="text-sm text-gray-600 hover:text-brand"
            >
              Skip for now
            </button>
            <Button onClick={handleContinue} disabled={!selectedType}>
              Continue →
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

