'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Card } from '@bloomwell/ui'
import { ProgressIndicator } from '@/components/auth/progress-indicator'

interface BoardMember {
  name: string
  title: string
  background: string
  years: string
}

export default function Step4Page() {
  const router = useRouter()
  const [uploadedFiles, setUploadedFiles] = useState<{
    determination501c3: File | null
    articlesIncorporation: File | null
    bylaws: File | null
    form990s: File[]
    pastGrantApplications: File[]
  }>({
    determination501c3: null,
    articlesIncorporation: null,
    bylaws: null,
    form990s: [],
    pastGrantApplications: [],
  })
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([
    { name: '', title: '', background: '', years: '' },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleFileUpload = (fileType: string, files: FileList | null) => {
    if (!files) return

    if (fileType === 'form990s' || fileType === 'pastGrantApplications') {
      // Multiple files allowed
      const fileArray = Array.from(files)
      setUploadedFiles((prev) => ({
        ...prev,
        [fileType]: [...(prev[fileType as keyof typeof prev] as File[] || []), ...fileArray] as File[],
      }))
    } else {
      // Single file
      setUploadedFiles((prev) => ({
        ...prev,
        [fileType]: files[0],
      }))
    }
  }

  const removeFile = (fileType: string, index?: number) => {
    if (fileType === 'form990s' || fileType === 'pastGrantApplications') {
      setUploadedFiles((prev) => ({
        ...prev,
        [fileType]: (prev[fileType as keyof typeof prev] as File[]).filter(
          (_, i) => i !== index,
        ) as File[],
      }))
    } else {
      setUploadedFiles((prev) => ({
        ...prev,
        [fileType]: null,
      }))
    }
  }

  const addBoardMember = () => {
    setBoardMembers([...boardMembers, { name: '', title: '', background: '', years: '' }])
  }

  const removeBoardMember = (index: number) => {
    setBoardMembers(boardMembers.filter((_, i) => i !== index))
  }

  const updateBoardMember = (index: number, field: keyof BoardMember, value: string) => {
    const updated = boardMembers.map((member, i) =>
      i === index ? { ...member, [field]: value } : member,
    )
    setBoardMembers(updated)
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      // Prepare documents data
      const documentsData: any = {
        determination501c3: uploadedFiles.determination501c3
          ? {
              name: uploadedFiles.determination501c3.name,
              size: uploadedFiles.determination501c3.size,
              type: uploadedFiles.determination501c3.type,
            }
          : null,
        articlesIncorporation: uploadedFiles.articlesIncorporation
          ? {
              name: uploadedFiles.articlesIncorporation.name,
              size: uploadedFiles.articlesIncorporation.size,
              type: uploadedFiles.articlesIncorporation.type,
            }
          : null,
        bylaws: uploadedFiles.bylaws
          ? {
              name: uploadedFiles.bylaws.name,
              size: uploadedFiles.bylaws.size,
              type: uploadedFiles.bylaws.type,
            }
          : null,
        form990s: uploadedFiles.form990s.map((file) => ({
          name: file.name,
          size: file.size,
          type: file.type,
        })),
        pastGrantApplications: uploadedFiles.pastGrantApplications.map((file) => ({
          name: file.name,
          size: file.size,
          type: file.type,
        })),
      }

      // Filter out empty board members
      const validBoardMembers = boardMembers.filter(
        (member) => member.name.trim() || member.title.trim() || member.background.trim(),
      )

      const response = await fetch('/api/onboarding/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documents: documentsData,
          boardRoster: validBoardMembers.length > 0 ? validBoardMembers : undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        setErrorMessage(
          errorData.message || errorData.error || 'Unable to save your data. Please try again.',
        )
        setIsLoading(false)
        return
      }

      // Success - navigate to app
      router.push('/app')
    } catch (error) {
      console.error('Error saving document data:', error)
      setErrorMessage('An unexpected error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  const handleSkip = async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      // Save any entered data before skipping
      const documentsData: any = {
        determination501c3: uploadedFiles.determination501c3
          ? {
              name: uploadedFiles.determination501c3.name,
              size: uploadedFiles.determination501c3.size,
              type: uploadedFiles.determination501c3.type,
            }
          : null,
        articlesIncorporation: uploadedFiles.articlesIncorporation
          ? {
              name: uploadedFiles.articlesIncorporation.name,
              size: uploadedFiles.articlesIncorporation.size,
              type: uploadedFiles.articlesIncorporation.type,
            }
          : null,
        bylaws: uploadedFiles.bylaws
          ? {
              name: uploadedFiles.bylaws.name,
              size: uploadedFiles.bylaws.size,
              type: uploadedFiles.bylaws.type,
            }
          : null,
        form990s: uploadedFiles.form990s.map((file) => ({
          name: file.name,
          size: file.size,
          type: file.type,
        })),
        pastGrantApplications: uploadedFiles.pastGrantApplications.map((file) => ({
          name: file.name,
          size: file.size,
          type: file.type,
        })),
      }

      const validBoardMembers = boardMembers.filter(
        (member) => member.name.trim() || member.title.trim() || member.background.trim(),
      )

      await fetch('/api/onboarding/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documents: documentsData,
          boardRoster: validBoardMembers.length > 0 ? validBoardMembers : undefined,
        }),
      })

      // Navigate to app even if save fails
      router.push('/app')
    } catch (error) {
      console.error('Error saving document data (skip):', error)
      router.push('/app')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-8">
      <Card className="w-full max-w-4xl p-8">
        <ProgressIndicator currentStep={4} totalSteps={4} />

        <div className="mb-6">
          <h2 className="mb-2 text-2xl font-bold">Step 4: Document Collection</h2>
          <p className="mb-6 text-sm text-gray-600">
            Upload important documents to maximize AI recommendations
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-md bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-800">{errorMessage}</p>
          </div>
        )}

        <div className="space-y-8">
          {/* Legal Documents Section */}
          <section className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Legal Documents</h3>

            {/* 501(c)(3) Determination Letter */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                501(c)(3) Determination Letter <span className="text-red-600">*</span>
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileUpload('determination501c3', e.target.files)}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
              {uploadedFiles.determination501c3 && (
                <div className="mt-2 flex items-center justify-between bg-green-50 p-2 rounded">
                  <p className="text-green-600 text-sm">✓ {uploadedFiles.determination501c3.name}</p>
                  <button
                    type="button"
                    onClick={() => removeFile('determination501c3')}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Articles of Incorporation */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Articles of Incorporation{' '}
                <span className="text-xs font-normal text-gray-500">(Optional)</span>
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileUpload('articlesIncorporation', e.target.files)}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
              {uploadedFiles.articlesIncorporation && (
                <div className="mt-2 flex items-center justify-between bg-green-50 p-2 rounded">
                  <p className="text-green-600 text-sm">
                    ✓ {uploadedFiles.articlesIncorporation.name}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeFile('articlesIncorporation')}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Bylaws */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Organization Bylaws{' '}
                <span className="text-xs font-normal text-gray-500">(Optional)</span>
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileUpload('bylaws', e.target.files)}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
              {uploadedFiles.bylaws && (
                <div className="mt-2 flex items-center justify-between bg-green-50 p-2 rounded">
                  <p className="text-green-600 text-sm">✓ {uploadedFiles.bylaws.name}</p>
                  <button
                    type="button"
                    onClick={() => removeFile('bylaws')}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Financial Documents Section */}
          <section className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Documents</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Form 990s <span className="text-xs font-normal text-gray-500">(Upload available years)</span>
              </label>
              <input
                type="file"
                accept=".pdf"
                multiple
                onChange={(e) => handleFileUpload('form990s', e.target.files)}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
              {uploadedFiles.form990s.length > 0 && (
                <div className="mt-2 space-y-2">
                  {uploadedFiles.form990s.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-green-50 p-2 rounded"
                    >
                      <p className="text-green-600 text-sm">✓ {file.name}</p>
                      <button
                        type="button"
                        onClick={() => removeFile('form990s', index)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Grant Documents Section */}
          <section className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Grant Intelligence</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Past Grant Applications <span className="text-xs font-normal text-gray-500">(For AI Analysis)</span>
              </label>
              <input
                type="file"
                accept=".pdf"
                multiple
                onChange={(e) => handleFileUpload('pastGrantApplications', e.target.files)}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
              {uploadedFiles.pastGrantApplications.length > 0 && (
                <div className="mt-2 space-y-2">
                  {uploadedFiles.pastGrantApplications.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-green-50 p-2 rounded"
                    >
                      <p className="text-green-600 text-sm">✓ {file.name}</p>
                      <button
                        type="button"
                        onClick={() => removeFile('pastGrantApplications', index)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-gray-500 text-xs mt-1">
                AI will analyze successful language patterns for future applications
              </p>
            </div>
          </section>

          {/* Board Roster Section */}
          <section className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Board Roster</h3>

            {boardMembers.map((member, index) => (
              <div
                key={index}
                className="grid grid-cols-2 gap-4 mb-4 p-4 border border-gray-200 rounded"
              >
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) => updateBoardMember(index, 'name', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="Board member name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Title/Role</label>
                  <input
                    type="text"
                    value={member.title}
                    onChange={(e) => updateBoardMember(index, 'title', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="President, Treasurer, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Professional Background</label>
                  <input
                    type="text"
                    value={member.background}
                    onChange={(e) => updateBoardMember(index, 'background', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="Attorney, Educator, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Years on Board</label>
                  <input
                    type="number"
                    value={member.years}
                    onChange={(e) => updateBoardMember(index, 'years', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="Years"
                  />
                </div>
                {boardMembers.length > 1 && (
                  <div className="col-span-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeBoardMember(index)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove Member
                    </button>
                  </div>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={addBoardMember}
              className="text-[#1E6F5C] hover:text-[#1a5d4d] text-sm font-medium"
            >
              + Add Another Board Member
            </button>
          </section>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={() => router.push('/onboarding/step3')}
            className="text-gray-600 hover:text-[#1E6F5C]"
          >
            ← Back
          </button>
          <div className="space-x-4">
            <button
              type="button"
              onClick={handleSkip}
              disabled={isLoading}
              className="text-gray-600 hover:text-[#1E6F5C] px-4 py-2 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Skip for Now
            </button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-[#1E6F5C] text-white font-bold hover:bg-[#1a5d4d] py-3 rounded-md px-6 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Complete Profile'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
