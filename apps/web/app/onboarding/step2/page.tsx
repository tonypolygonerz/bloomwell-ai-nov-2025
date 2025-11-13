'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button, Card, Input } from '@bloomwell/ui'
import { ProgressIndicator } from '@/components/auth/progress-indicator'

const organizationTypes = [
  'US Registered 501(c)(3) Nonprofit',
  'Freelance Grant Writer / Grant Writing Agency',
  'University / College / School / School District',
  'Government Entity',
  'Other (Individual Researcher, For-Profit, etc.)',
]

interface ProPublicaResult {
  name: string
  ein: string
  city: string
  state: string
  mission: string
}

export default function Step2Page() {
  const router = useRouter()
  const { data: session } = useSession()
  const searchTimeoutRef = useRef<NodeJS.Timeout>()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const manualSearchTimeoutRef = useRef<NodeJS.Timeout>()
  const manualDropdownRef = useRef<HTMLDivElement>(null)

  // Pre-select nonprofit as default
  const [selectedType, setSelectedType] = useState('US Registered 501(c)(3) Nonprofit')
  const [organizationName, setOrganizationName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<ProPublicaResult[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [ein, setEin] = useState('')
  const [orgData, setOrgData] = useState<{
    legalName?: string
    ein?: string
  } | null>(null)

  // Manual entry search state (for non-nonprofit types)
  const [manualSearchQuery, setManualSearchQuery] = useState('')
  const [manualSearchResults, setManualSearchResults] = useState<ProPublicaResult[]>([])
  const [manualShowDropdown, setManualShowDropdown] = useState(false)
  const [manualIsSearching, setManualIsSearching] = useState(false)

  // Loading and error states
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Enhanced error logging helper
  const logError = (context: string, error: any) => {
    // Handle both Error objects and plain objects (like API responses)
    if (error instanceof Error) {
      console.error(`${context}:`, {
        message: error.message,
        stack: error.stack,
        name: error.name,
        fullError: JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
      })
    } else {
      // Plain object (like API error response)
      console.error(`${context}:`, {
        errorObject: error,
        stringified: JSON.stringify(error, null, 2),
      })
    }
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
      if (manualDropdownRef.current && !manualDropdownRef.current.contains(event.target as Node)) {
        setManualShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Real-time search with debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (searchQuery.length < 3) {
      setSearchResults([])
      setShowDropdown(false)
      return
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true)
      try {
        const response = await fetch(
          `/api/onboarding/propublica?q=${encodeURIComponent(searchQuery)}`,
        )

        if (!response.ok) {
          console.error('ProPublica search failed:', response.status, response.statusText)
          setSearchResults([])
          setShowDropdown(false)
          return
        }

        const data = await response.json()
        console.log('ProPublica API response:', JSON.stringify(data, null, 2))
        const organizations = data.organizations || []
        setSearchResults(organizations)
        if (organizations.length > 0) {
          setShowDropdown(true)
        } else {
          setShowDropdown(false)
        }
      } catch (error) {
        console.error('ProPublica search failed:', error)
        setSearchResults([])
        setShowDropdown(false)
      } finally {
        setIsSearching(false)
      }
    }, 300)

    searchTimeoutRef.current = timeoutId

    // Cleanup function to clear timeout on unmount or when searchQuery changes
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery])

  // Real-time search for manual entry field (non-nonprofit types)
  useEffect(() => {
    if (manualSearchTimeoutRef.current) {
      clearTimeout(manualSearchTimeoutRef.current)
    }

    if (manualSearchQuery.length < 3) {
      setManualSearchResults([])
      setManualShowDropdown(false)
      return
    }

    const timeoutId = setTimeout(async () => {
      setManualIsSearching(true)
      try {
        const response = await fetch(
          `/api/onboarding/propublica?q=${encodeURIComponent(manualSearchQuery)}`,
        )

        if (!response.ok) {
          console.error('ProPublica search failed:', response.status, response.statusText)
          setManualSearchResults([])
          setManualShowDropdown(false)
          return
        }

        const data = await response.json()
        const organizations = data.organizations || []
        setManualSearchResults(organizations)
        if (organizations.length > 0) {
          setManualShowDropdown(true)
        } else {
          setManualShowDropdown(false)
        }
      } catch (error) {
        console.error('ProPublica search failed:', error)
        setManualSearchResults([])
        setManualShowDropdown(false)
      } finally {
        setManualIsSearching(false)
      }
    }, 300)

    manualSearchTimeoutRef.current = timeoutId

    return () => {
      if (manualSearchTimeoutRef.current) {
        clearTimeout(manualSearchTimeoutRef.current)
      }
    }
  }, [manualSearchQuery])

  const handleOrganizationSearch = (value: string) => {
    setSearchQuery(value)
    // When user is typing/searching, clear verified status and org data
    // organizationName will be set when user selects from dropdown via selectOrganization
    setIsVerified(false)
    setOrgData(null)
    // Clear organizationName during active search (it will be set on selection)
    if (value !== organizationName) {
      setOrganizationName('')
    }
  }

  const selectOrganization = (org: ProPublicaResult) => {
    setOrganizationName(org.name)
    setSearchQuery('')
    setShowDropdown(false)
    setIsVerified(true)
    setOrgData({
      legalName: org.name,
      ein: org.ein,
    })
    setEin(org.ein)
  }

  // Handle manual entry search
  const handleManualOrganizationSearch = (value: string) => {
    setOrganizationName(value)
    setManualSearchQuery(value)
  }

  // Select organization from manual search dropdown
  const selectManualOrganization = (org: ProPublicaResult) => {
    setOrganizationName(org.name)
    setManualSearchQuery('')
    setManualShowDropdown(false)
    setIsVerified(true)
    setOrgData({
      legalName: org.name,
      ein: org.ein,
    })
    setEin(org.ein)
  }

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
        setOrganizationName(data.organization.name)
        setIsVerified(true)
      }
    } catch (error) {
      console.error('ProPublica search failed:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleContinue = async () => {
    if (!selectedType) return

    setIsLoading(true)
    setErrorMessage(null)

    try {
      const response = await fetch('/api/onboarding/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationType: selectedType,
          ein: orgData?.ein || ein || undefined,
          legalName: orgData?.legalName || organizationName || undefined,
          isVerified: isVerified || !!orgData,
          email: session?.user?.email || undefined, // Include email for authentication
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        logError('Failed to save organization data', errorData)
        setErrorMessage('Unable to save your data, but continuing to next step...')
        // Still navigate even if save fails
      }

      router.push('/onboarding/step3')
    } catch (error) {
      logError('Error saving organization data', error)
      setErrorMessage('Unable to save your data, but continuing to next step...')
      // Navigate even on error
      router.push('/onboarding/step3')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = async () => {
    setIsLoading(true)
    setErrorMessage(null)

    // Save any entered data before skipping - ensure organizationType is always included
    // Wait for save to complete and verify success before navigating
    try {
      // Create a timeout promise (5 seconds max wait)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Save timeout')), 5000)
      })

      // Save the organization data
      const saveResponse = (await Promise.race([
        fetch('/api/onboarding/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            organizationType: selectedType, // Always include organizationType (has default value)
            ein: orgData?.ein || ein || undefined,
            legalName: orgData?.legalName || organizationName || undefined,
            isVerified: isVerified || !!orgData,
            email: session?.user?.email || undefined, // Include email for authentication
          }),
        }),
        timeoutPromise,
      ])) as Response

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json().catch(() => ({}))
        logError('Failed to save organization data', errorData)
        setErrorMessage('Failed to save your information. Please try again.')
        setIsLoading(false)
        return
      }

      // Verify the save was successful by checking the status API
      // Add a delay to ensure database transaction is committed
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Verify the status shows basic completion before navigating
      const statusResponse = await fetch('/api/onboarding/status?t=' + Date.now(), {
        cache: 'no-store',
      })

      if (!statusResponse.ok) {
        console.error('Failed to verify save status')
        setErrorMessage('Unable to verify your information was saved. Please try again.')
        setIsLoading(false)
        return
      }

      const statusData = await statusResponse.json()

      if (!statusData.isBasicComplete) {
        // Save might not have propagated yet, wait a bit more and retry once
        await new Promise((resolve) => setTimeout(resolve, 1000))
        const retryStatusResponse = await fetch('/api/onboarding/status?t=' + Date.now(), {
          cache: 'no-store',
        })

        if (retryStatusResponse.ok) {
          const retryStatusData = await retryStatusResponse.json()
          if (!retryStatusData.isBasicComplete) {
            // Even if status check fails, proceed with bypass parameter
            // This allows database time to catch up
            console.warn(
              'Save verification: organizationType not yet visible, using bypass parameter',
            )
          }
        }
      }

      // Save successful - navigate to app with bypass parameter
      // Set flag to indicate we're coming from onboarding (helps prevent redirect loops)
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('fromOnboarding', 'true')
        sessionStorage.setItem('lastRedirectTime', Date.now().toString())
      }

      // Add query parameter to bypass OnboardingGate check temporarily
      // This gives the database time to fully commit the transaction
      window.location.href = '/app?skipOnboarding=true'
    } catch (error) {
      logError('Error saving organization data', error)
      setErrorMessage(
        error instanceof Error && error.message === 'Save timeout'
          ? 'Save operation timed out. Please try again.'
          : 'An error occurred while saving. Please try again.',
      )
      setIsLoading(false)
    }
  }

  const isNonprofit = selectedType === 'US Registered 501(c)(3) Nonprofit'

  // Determine if Continue button should be disabled
  // For nonprofit: button is enabled if user has typed in organization name OR EIN field
  // For non-nonprofit: button is enabled if organization type is selected
  const hasOrganizationInput =
    Boolean(searchQuery?.trim()) || Boolean(organizationName?.trim()) || Boolean(ein?.trim())
  const isContinueDisabled = !selectedType || (isNonprofit && !hasOrganizationInput)

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-8">
      <Card className="w-full max-w-2xl p-8">
        <div className="mb-6">
          <div className="mb-2 text-4xl">👋</div>
          <h1 className="mb-2 text-3xl font-bold">Welcome to Bloomwell AI</h1>
          <p className="text-gray-600">Let's set up your organization profile</p>
        </div>

        <ProgressIndicator currentStep={2} totalSteps={3} />

        <div className="mb-6">
          <h2 className="mb-4 text-xl font-semibold">Step 1: Who You Are</h2>

          {/* Primary: Organization Search (for nonprofits) */}
          {isNonprofit && (
            <div className="mb-6">
              <p className="mb-4 text-sm text-gray-600">
                Let's find your nonprofit in our database to get started quickly
              </p>
              <div className="relative">
                <label className="mb-2 block text-base font-semibold text-gray-900">
                  Organization Search{' '}
                  <span className="text-sm font-normal text-gray-500">(Recommended)</span>
                </label>
                <p className="mb-3 text-sm text-gray-600">
                  🔍 We'll auto-fill your details from our nonprofit database
                </p>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Start typing your organization name..."
                    value={searchQuery || organizationName || ''}
                    onChange={(e) => handleOrganizationSearch(e.target.value)}
                    className="w-full p-4 text-base border-2 border-emerald-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 bg-white"
                    autoComplete="off"
                  />
                  {isVerified && organizationName && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✓ Verified
                      </span>
                    </div>
                  )}

                  {/* Search Dropdown */}
                  {showDropdown && searchResults.length > 0 && (
                    <div
                      ref={dropdownRef}
                      className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                    >
                      {searchResults.map((org) => (
                        <button
                          key={`${org.ein}-${org.name}`}
                          onClick={() => selectOrganization(org)}
                          className="w-full px-4 py-3 text-left hover:bg-emerald-50 border-b border-gray-100 last:border-b-0 transition-colors"
                        >
                          <div className="font-semibold text-gray-900">{org.name}</div>
                          <div className="text-sm text-gray-600">
                            EIN: {org.ein} • {org.city}, {org.state}
                          </div>
                          {org.mission && (
                            <div className="text-xs text-gray-500 mt-1 truncate">{org.mission}</div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {isSearching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="animate-spin w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full"></div>
                    </div>
                  )}
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  ✅ Verified organizations get better grant recommendations. Can't find your
                  organization? No problem - enter manually below.
                </p>

                {/* Verified Organization Display */}
                {isVerified && orgData && (
                  <div className="mt-3 rounded-lg bg-green-50 p-3">
                    <p className="text-sm font-medium text-green-800">
                      ✓ Found: {orgData.legalName}
                    </p>
                    <p className="text-xs text-green-700">EIN: {orgData.ein}</p>
                  </div>
                )}
              </div>

              {/* Fallback: EIN Search (Secondary) */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="mb-2 text-xs text-gray-600 text-center">OR</p>
                <h3 className="mb-2 text-sm font-medium text-gray-700">
                  Search by EIN (Alternative)
                </h3>
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
              </div>
            </div>
          )}

          {/* Organization Type Selection */}
          <div className="mb-6">
            <h3 className="mb-3 text-sm font-medium text-gray-700">Organization Type</h3>
            <div className="space-y-3">
              {organizationTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setSelectedType(type)
                    // Reset search when changing type
                    if (type !== 'US Registered 501(c)(3) Nonprofit') {
                      setSearchQuery('')
                      setManualSearchQuery('')
                      setOrganizationName('')
                      setOrgData(null)
                      setIsVerified(false)
                      setManualShowDropdown(false)
                    }
                  }}
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

          {/* Manual entry for non-nonprofit types */}
          {!isNonprofit && (
            <div className="mb-6">
              <h3 className="mb-3 text-sm font-medium text-gray-700">Organization Details</h3>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Organization Name
                    <span className="ml-2 text-xs font-normal text-gray-500">
                      (Search our database)
                    </span>
                  </label>
                  <div className="relative">
                    <Input
                      value={organizationName}
                      onChange={(e) => handleManualOrganizationSearch(e.target.value)}
                      placeholder="Start typing your organization name..."
                      className="w-full"
                      autoComplete="off"
                    />
                    {isVerified && organizationName && orgData && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ Verified
                        </span>
                      </div>
                    )}

                    {/* Manual Search Dropdown */}
                    {manualShowDropdown && manualSearchResults.length > 0 && (
                      <div
                        ref={manualDropdownRef}
                        className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                      >
                        {manualSearchResults.map((org) => (
                          <button
                            key={`${org.ein}-${org.name}`}
                            onClick={() => selectManualOrganization(org)}
                            className="w-full px-4 py-3 text-left hover:bg-emerald-50 border-b border-gray-100 last:border-b-0 transition-colors"
                          >
                            <div className="font-semibold text-gray-900">{org.name}</div>
                            <div className="text-sm text-gray-600">
                              EIN: {org.ein} • {org.city}, {org.state}
                            </div>
                            {org.mission && (
                              <div className="text-xs text-gray-500 mt-1 truncate">
                                {org.mission}
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}

                    {manualIsSearching && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="animate-spin w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full"></div>
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    🔍 We'll search our database to auto-fill your details. Can't find your
                    organization? No problem - continue typing to enter manually.
                  </p>

                  {/* Verified Organization Display */}
                  {isVerified && orgData && (
                    <div className="mt-3 rounded-lg bg-green-50 p-3">
                      <p className="text-sm font-medium text-green-800">
                        ✓ Found: {orgData.legalName}
                      </p>
                      {orgData.ein && <p className="text-xs text-green-700">EIN: {orgData.ein}</p>}
                    </div>
                  )}
                </div>
                {(selectedType === 'University / College / School / School District' ||
                  selectedType === 'Government Entity') && (
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      EIN (Optional)
                    </label>
                    <Input
                      value={ein}
                      onChange={(e) => setEin(e.target.value)}
                      placeholder="Enter EIN (e.g., 123456789)"
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {errorMessage && (
          <div className="mb-4 rounded-md bg-yellow-50 border border-yellow-200 p-3">
            <p className="text-sm text-yellow-800">{errorMessage}</p>
          </div>
        )}
        <div className="flex justify-end items-center gap-4">
          <button
            onClick={handleSkip}
            disabled={isLoading}
            className="text-[#1E6F5C] hover:text-[#1a5d4d] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#1E6F5C] focus:ring-offset-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Loading...' : 'Skip'}
          </button>
          <Button
            type="button"
            onClick={handleContinue}
            disabled={isContinueDisabled || isLoading}
            className="disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : 'Continue →'}
          </Button>
        </div>
      </Card>
    </div>
  )
}
