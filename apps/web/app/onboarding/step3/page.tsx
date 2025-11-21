'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Card, Input } from '@bloomwell/ui'
import { ProgressIndicator } from '@/components/auth/progress-indicator'

const budgetOptions = [
  '<90k',
  '90k-200k',
  '200k-500k',
  '500k-750k',
  '750k-1m',
  '1m-2.5m',
  '2.5m-5m',
  '5m+',
]

const staffSizeOptions = ['1-5', '6-10', '11-25', '26-50', '51-100', '101-500']

const volunteerCountOptions = [
  '0',
  '1-10',
  '11-25',
  '26-50',
  '51-100',
  '100+',
]

const focusAreasOptions = [
  'Education',
  'Health',
  'Environment',
  'Arts',
  'Housing',
  'Youth Development',
  'Senior Services',
  'Animal Welfare',
  'Community Development',
  'Human Rights',
  'Religion',
  'Other',
]

const fundingGoalsOptions = [
  'Program Expansion',
  'Staff Hiring',
  'Equipment Purchase',
  'Facility Improvement',
  'Research',
  'Capacity Building',
  'Emergency Funding',
  'General Operating',
  'Technology',
  'Other',
]

const geographicServiceAreaOptions = [
  'Local',
  'Regional',
  'Statewide',
  'National',
  'International',
]

const fiscalYearOptions = [
  'Jan-Dec',
  'Feb-Jan',
  'Mar-Feb',
  'Apr-Mar',
  'May-Apr',
  'Jun-May',
  'Jul-Jun',
  'Aug-Jul',
  'Sep-Aug',
  'Oct-Sep',
  'Nov-Oct',
  'Dec-Nov',
]

const previousGrantExperienceOptions = [
  'never-applied',
  'applied-only',
  'received-grants',
]

export default function Step3Page() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    // Mission & Programs
    missionStatement: '',
    focusAreas: [] as string[],
    programs: [] as Array<{ id: number; name: string; description: string; whoServed?: string; goals?: string }>,
    geographicServiceArea: '',
    // Financial Profile
    annualBudget: '',
    fiscalYear: '',
    revenueSourcesGov: '',
    revenueSourcesPrivate: '',
    revenueSourcesDonations: '',
    revenueSourcesOther: '',
    // Staffing & Governance
    staffSize: '',
    boardSize: '',
    volunteerCount: '',
    // Grant History
    previousGrantExperience: '',
    fundingGoals: [] as string[],
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showProgramForm, setShowProgramForm] = useState(false)
  const [editingProgramIndex, setEditingProgramIndex] = useState<number | null>(null)
  const [newProgram, setNewProgram] = useState({
    name: '',
    description: '',
    whoServed: '',
    goals: '',
  })

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

  const handleFocusAreaToggle = (area: string) => {
    setFormData((prev) => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(area)
        ? prev.focusAreas.filter((a) => a !== area)
        : [...prev.focusAreas, area],
    }))
  }

  const handleFundingGoalToggle = (goal: string) => {
    setFormData((prev) => ({
      ...prev,
      fundingGoals: prev.fundingGoals.includes(goal)
        ? prev.fundingGoals.filter((g) => g !== goal)
        : [...prev.fundingGoals, goal],
    }))
  }

  const saveProgram = () => {
    if (!newProgram.name || !newProgram.description) {
      alert('Program name and description are required')
      return
    }

    const programs = formData.programs || []
    if (editingProgramIndex !== null) {
      // Update existing program
      const updatedPrograms = [...programs]
      const existingProgram = programs[editingProgramIndex]
      if (existingProgram) {
        updatedPrograms[editingProgramIndex] = { ...newProgram, id: existingProgram.id }
      }
      setFormData({
        ...formData,
        programs: updatedPrograms,
      })
    } else {
      // Add new program
      setFormData({
        ...formData,
        programs: [...programs, { ...newProgram, id: Date.now() }],
      })
    }

    setNewProgram({ name: '', description: '', whoServed: '', goals: '' })
    setEditingProgramIndex(null)
    setShowProgramForm(false)
  }

  const removeProgram = (index: number) => {
    const programs = formData.programs || []
    setFormData({
      ...formData,
      programs: programs.filter((_, i) => i !== index),
    })
  }

  const cancelAddProgram = () => {
    setNewProgram({ name: '', description: '', whoServed: '', goals: '' })
    setEditingProgramIndex(null)
    setShowProgramForm(false)
  }

  const editProgram = (index: number) => {
    const programs = formData.programs || []
    const program = programs[index]
    if (program) {
      setNewProgram({ 
        name: program.name || '', 
        description: program.description || '', 
        whoServed: program.whoServed || '', 
        goals: program.goals || '' 
      })
      setEditingProgramIndex(index)
      setShowProgramForm(true)
    }
  }

  const handleContinue = async () => {
    if (
      !formData.missionStatement ||
      !formData.geographicServiceArea ||
      !formData.annualBudget ||
      !formData.fiscalYear ||
      !formData.staffSize ||
      !formData.previousGrantExperience
    ) {
      setErrorMessage('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    setErrorMessage(null)

    try {
      const response = await fetch('/api/onboarding/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          missionStatement: formData.missionStatement || undefined,
          focusAreas: formData.focusAreas.length > 0 ? formData.focusAreas : undefined,
          programDescriptions:
            formData.programs && formData.programs.length > 0
              ? JSON.stringify(formData.programs)
              : undefined,
          geographicServiceArea: formData.geographicServiceArea || undefined,
          annualBudget: formData.annualBudget || undefined,
          fiscalYear: formData.fiscalYear || undefined,
          revenueSourcesGov:
            formData.revenueSourcesGov !== '' ? parseInt(formData.revenueSourcesGov) : undefined,
          revenueSourcesPrivate:
            formData.revenueSourcesPrivate !== ''
              ? parseInt(formData.revenueSourcesPrivate)
              : undefined,
          revenueSourcesDonations:
            formData.revenueSourcesDonations !== ''
              ? parseInt(formData.revenueSourcesDonations)
              : undefined,
          revenueSourcesOther:
            formData.revenueSourcesOther !== ''
              ? parseInt(formData.revenueSourcesOther)
              : undefined,
          staffSize: formData.staffSize || undefined,
          boardSize: formData.boardSize !== '' ? parseInt(formData.boardSize) : undefined,
          volunteerCount: formData.volunteerCount || undefined,
          previousGrantExperience: formData.previousGrantExperience || undefined,
          fundingGoals: formData.fundingGoals.length > 0 ? formData.fundingGoals : undefined,
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

      // Success - navigate to step 4
      router.push('/onboarding/step4')
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
          missionStatement: formData.missionStatement || undefined,
          focusAreas: formData.focusAreas.length > 0 ? formData.focusAreas : undefined,
          programDescriptions:
            formData.programs && formData.programs.length > 0
              ? JSON.stringify(formData.programs)
              : undefined,
          geographicServiceArea: formData.geographicServiceArea || undefined,
          annualBudget: formData.annualBudget || undefined,
          fiscalYear: formData.fiscalYear || undefined,
          revenueSourcesGov:
            formData.revenueSourcesGov !== '' ? parseInt(formData.revenueSourcesGov) : undefined,
          revenueSourcesPrivate:
            formData.revenueSourcesPrivate !== ''
              ? parseInt(formData.revenueSourcesPrivate)
              : undefined,
          revenueSourcesDonations:
            formData.revenueSourcesDonations !== ''
              ? parseInt(formData.revenueSourcesDonations)
              : undefined,
          revenueSourcesOther:
            formData.revenueSourcesOther !== ''
              ? parseInt(formData.revenueSourcesOther)
              : undefined,
          staffSize: formData.staffSize || undefined,
          boardSize: formData.boardSize !== '' ? parseInt(formData.boardSize) : undefined,
          volunteerCount: formData.volunteerCount || undefined,
          previousGrantExperience: formData.previousGrantExperience || undefined,
          fundingGoals: formData.fundingGoals.length > 0 ? formData.fundingGoals : undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        logError('Failed to save organization data (skip)', errorData)
        console.warn('Skip save failed, but continuing...')
      }

      // Navigate to step 4 even if save fails
      router.push('/onboarding/step4')
    } catch (error) {
      logError('Error saving organization data (skip)', error)
      console.warn('Skip encountered error, but continuing:', error)
      router.push('/onboarding/step4')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-8">
      <Card className="w-full max-w-4xl p-8">
        <ProgressIndicator currentStep={3} totalSteps={4} />

        <div className="mb-6">
          <h2 className="mb-4 text-xl font-semibold">Step 3: Organization Details</h2>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleContinue()
          }}
          className="space-y-8"
        >
          {/* Error Message Display */}
          {errorMessage && (
            <div className="rounded-md bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-800">{errorMessage}</p>
            </div>
          )}

          {/* Mission & Programs Section */}
          <section className="space-y-6 border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900">Mission & Programs</h3>

            {/* Mission Statement */}
            <div>
              <label htmlFor="missionStatement" className="mb-2 block text-sm font-semibold text-gray-700">
                Mission Statement <span className="text-red-600">*</span>
              </label>
              <textarea
                id="missionStatement"
                value={formData.missionStatement}
                onChange={(e) => setFormData({ ...formData, missionStatement: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none transition-colors focus:border-[#1E6F5C] hover:border-[#1E6F5C]"
                rows={4}
                placeholder="Describe your organization's mission and purpose..."
                required
              />
            </div>

            {/* Focus Areas */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Focus Areas <span className="text-xs font-normal text-gray-500">(Optional)</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {focusAreasOptions.map((area) => (
                  <label key={area} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.focusAreas.includes(area)}
                      onChange={() => handleFocusAreaToggle(area)}
                      className="mr-2 rounded border-gray-300 text-[#1E6F5C] focus:ring-[#1E6F5C]"
                    />
                    <span className="text-sm text-gray-700">{area}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Programs */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Programs <span className="text-xs font-normal text-gray-500">(Optional)</span>
              </label>

              {/* Existing Programs List */}
              {formData.programs && formData.programs.length > 0 && (
                <div className="space-y-3 mb-4">
                  <p className="text-sm text-gray-600">Your Programs ({formData.programs.length}):</p>
                  {formData.programs.map((program, index) => (
                    <div
                      key={program.id || index}
                      className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{program.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{program.description}</p>
                          {program.whoServed && (
                            <p className="text-xs text-gray-500 mt-1">
                              <span className="font-medium">Serves:</span> {program.whoServed}
                            </p>
                          )}
                          {program.goals && (
                            <p className="text-xs text-gray-500 mt-1">
                              <span className="font-medium">Goals:</span> {program.goals}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 ml-2">
                          <button
                            type="button"
                            onClick={() => editProgram(index)}
                            className="text-blue-500 hover:text-blue-700 text-sm"
                            title="Edit program"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => removeProgram(index)}
                            className="text-red-500 hover:text-red-700"
                            title="Remove program"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Program Form */}
              {showProgramForm && (
                <div className="border border-green-200 rounded-lg p-4 bg-green-50 mb-4">
                  <h4 className="font-medium text-gray-900 mb-3">
                    {editingProgramIndex !== null ? 'Edit Program' : 'Add New Program'}
                  </h4>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Program Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newProgram.name}
                        onChange={(e) => setNewProgram({ ...newProgram, name: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="e.g., Youth Mentorship Program"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Program Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={newProgram.description}
                        onChange={(e) =>
                          setNewProgram({ ...newProgram, description: e.target.value })
                        }
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        rows={3}
                        placeholder="Describe what this program does, its activities, and impact..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Who We Serve</label>
                        <input
                          type="text"
                          value={newProgram.whoServed}
                          onChange={(e) =>
                            setNewProgram({ ...newProgram, whoServed: e.target.value })
                          }
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="e.g., At-risk youth ages 12-18"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Program Goals</label>
                        <input
                          type="text"
                          value={newProgram.goals}
                          onChange={(e) =>
                            setNewProgram({ ...newProgram, goals: e.target.value })
                          }
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="e.g., Improve graduation rates by 25%"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 mt-4">
                    <button
                      type="button"
                      onClick={cancelAddProgram}
                      className="px-4 py-2 text-gray-600 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={saveProgram}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500"
                    >
                      {editingProgramIndex !== null ? 'Update Program' : 'Save Program'}
                    </button>
                  </div>
                </div>
              )}

              {/* Add Program Button */}
              {!showProgramForm && (
                <button
                  type="button"
                  onClick={() => setShowProgramForm(true)}
                  className="inline-flex items-center px-4 py-2 text-green-600 hover:text-green-700 border border-green-300 rounded-lg hover:bg-green-50 text-sm font-medium"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Add Program
                </button>
              )}

              {(!formData.programs || formData.programs.length === 0) && !showProgramForm && (
                <p className="text-sm text-gray-500 mt-2">
                  Add your organization's programs to help AI provide better grant recommendations.
                </p>
              )}
            </div>

            {/* Geographic Service Area */}
            <div>
              <label htmlFor="geographicServiceArea" className="mb-2 block text-sm font-semibold text-gray-700">
                Geographic Service Area <span className="text-red-600">*</span>
              </label>
              <select
                id="geographicServiceArea"
                value={formData.geographicServiceArea}
                onChange={(e) => setFormData({ ...formData, geographicServiceArea: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none transition-colors focus:border-[#1E6F5C] hover:border-[#1E6F5C]"
                required
              >
                <option value="">Select service area</option>
                {geographicServiceAreaOptions.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* Financial Profile Section */}
          <section className="space-y-6 border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900">Financial Profile</h3>

            {/* Annual Budget */}
            <div>
              <label htmlFor="annualBudget" className="mb-2 block text-sm font-semibold text-gray-700">
                Annual Budget <span className="text-red-600">*</span>
              </label>
              <select
                id="annualBudget"
                value={formData.annualBudget}
                onChange={(e) => setFormData({ ...formData, annualBudget: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none transition-colors focus:border-[#1E6F5C] hover:border-[#1E6F5C]"
                required
              >
                <option value="">Select budget range</option>
                {budgetOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === '<90k' && 'Less than $90,000'}
                    {opt === '90k-200k' && '$90,000 - $200,000'}
                    {opt === '200k-500k' && '$200,000 - $500,000'}
                    {opt === '500k-750k' && '$500,000 - $750,000'}
                    {opt === '750k-1m' && '$750,000 - $1,000,000'}
                    {opt === '1m-2.5m' && '$1,000,000 - $2,500,000'}
                    {opt === '2.5m-5m' && '$2,500,000 - $5,000,000'}
                    {opt === '5m+' && '$5,000,000+'}
                  </option>
                ))}
              </select>
            </div>

            {/* Fiscal Year */}
            <div>
              <label htmlFor="fiscalYear" className="mb-2 block text-sm font-semibold text-gray-700">
                Fiscal Year <span className="text-red-600">*</span>
              </label>
              <select
                id="fiscalYear"
                value={formData.fiscalYear}
                onChange={(e) => setFormData({ ...formData, fiscalYear: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none transition-colors focus:border-[#1E6F5C] hover:border-[#1E6F5C]"
                required
              >
                <option value="">Select fiscal year</option>
                {fiscalYearOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Revenue Sources */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Revenue Sources <span className="text-xs font-normal text-gray-500">(Optional %)</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Government Grants</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.revenueSourcesGov}
                    onChange={(e) => setFormData({ ...formData, revenueSourcesGov: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none transition-colors focus:border-[#1E6F5C] hover:border-[#1E6F5C]"
                    placeholder="%"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Private Foundation Grants</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.revenueSourcesPrivate}
                    onChange={(e) => setFormData({ ...formData, revenueSourcesPrivate: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none transition-colors focus:border-[#1E6F5C] hover:border-[#1E6F5C]"
                    placeholder="%"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Individual Donations</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.revenueSourcesDonations}
                    onChange={(e) => setFormData({ ...formData, revenueSourcesDonations: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none transition-colors focus:border-[#1E6F5C] hover:border-[#1E6F5C]"
                    placeholder="%"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Other Sources</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.revenueSourcesOther}
                    onChange={(e) => setFormData({ ...formData, revenueSourcesOther: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none transition-colors focus:border-[#1E6F5C] hover:border-[#1E6F5C]"
                    placeholder="%"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Staffing & Governance Section */}
          <section className="space-y-6 border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900">Staffing & Governance</h3>

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
                    {opt} staff
                  </option>
                ))}
              </select>
            </div>

            {/* Board Size */}
            <div>
              <label htmlFor="boardSize" className="mb-2 block text-sm font-semibold text-gray-700">
                Board Size <span className="text-xs font-normal text-gray-500">(Optional)</span>
              </label>
              <input
                type="number"
                min="1"
                max="50"
                id="boardSize"
                value={formData.boardSize}
                onChange={(e) => setFormData({ ...formData, boardSize: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none transition-colors focus:border-[#1E6F5C] hover:border-[#1E6F5C]"
                placeholder="Number of board members"
              />
            </div>

            {/* Volunteer Count */}
            <div>
              <label htmlFor="volunteerCount" className="mb-2 block text-sm font-semibold text-gray-700">
                Volunteer Count <span className="text-xs font-normal text-gray-500">(Optional)</span>
              </label>
              <select
                id="volunteerCount"
                value={formData.volunteerCount}
                onChange={(e) => setFormData({ ...formData, volunteerCount: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none transition-colors focus:border-[#1E6F5C] hover:border-[#1E6F5C]"
              >
                <option value="">Select volunteer count</option>
                {volunteerCountOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === '0' && 'No volunteers'}
                    {opt === '1-10' && '1-10 volunteers'}
                    {opt === '11-25' && '11-25 volunteers'}
                    {opt === '26-50' && '26-50 volunteers'}
                    {opt === '51-100' && '51-100 volunteers'}
                    {opt === '100+' && '100+ volunteers'}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* Grant History Section */}
          <section className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Grant History</h3>

            {/* Previous Grant Experience */}
            <div>
              <label htmlFor="previousGrantExperience" className="mb-2 block text-sm font-semibold text-gray-700">
                Previous Grant Experience <span className="text-red-600">*</span>
              </label>
              <select
                id="previousGrantExperience"
                value={formData.previousGrantExperience}
                onChange={(e) => setFormData({ ...formData, previousGrantExperience: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none transition-colors focus:border-[#1E6F5C] hover:border-[#1E6F5C]"
                required
              >
                <option value="">Select experience level</option>
                <option value="never-applied">Never applied for grants</option>
                <option value="applied-only">Applied but never received</option>
                <option value="received-grants">Successfully received grants</option>
              </select>
            </div>

            {/* Funding Goals */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Funding Goals <span className="text-xs font-normal text-gray-500">(Optional)</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {fundingGoalsOptions.map((goal) => (
                  <label key={goal} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.fundingGoals.includes(goal)}
                      onChange={() => handleFundingGoalToggle(goal)}
                      className="mr-2 rounded border-gray-300 text-[#1E6F5C] focus:ring-[#1E6F5C]"
                    />
                    <span className="text-sm text-gray-700">{goal}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>

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
                  !formData.missionStatement ||
                  !formData.geographicServiceArea ||
                  !formData.annualBudget ||
                  !formData.fiscalYear ||
                  !formData.staffSize ||
                  !formData.previousGrantExperience
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
