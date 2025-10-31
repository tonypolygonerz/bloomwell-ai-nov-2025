'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Card, Input } from '@bloomwell/ui'

export default function Step2Page() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    mission: '',
    focusAreas: '',
    serviceGeo: 'Inside US',
    serviceGeoDetails: '',
  })

  const handleContinue = async () => {
    await fetch('/api/onboarding/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mission: formData.mission,
        focusAreas: formData.focusAreas,
        serviceGeo:
          formData.serviceGeo === 'Both'
            ? `${formData.serviceGeo}: ${formData.serviceGeoDetails}`
            : formData.serviceGeo,
      }),
    })

    router.push('/onboarding/step3')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-8">
      <Card className="w-full max-w-2xl p-8">
        <h2 className="mb-2 text-2xl font-bold">Step 2: What You Do</h2>
        <p className="mb-6 text-sm text-gray-600">
          Tell us about your mission and focus areas to help us match you with relevant grants.
        </p>

        <div className="mb-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Mission Statement</label>
            <p className="mb-2 text-xs text-gray-500">
              Describe what your organization does and who you serve
            </p>
            <textarea
              value={formData.mission}
              onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
              className="w-full rounded-md border border-gray-300 p-3"
              rows={4}
              placeholder="Example: We provide educational support and after-school programs to underserved youth in urban communities..."
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Focus Areas</label>
            <p className="mb-2 text-xs text-gray-500">
              What areas does your organization focus on? (comma-separated)
            </p>
            <Input
              value={formData.focusAreas}
              onChange={(e) => setFormData({ ...formData, focusAreas: e.target.value })}
              placeholder="education, healthcare, environment, housing, arts"
            />
            <p className="mt-1 text-xs text-gray-500">
              Common focus areas: education, healthcare, environment, housing, arts, social
              services, youth development
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Geographic Service Area</label>
            <p className="mb-2 text-xs text-gray-500">
              Where does your organization provide services?
            </p>
            <div className="space-y-2">
              {['Inside US', 'Outside US', 'Both'].map((option) => (
                <label key={option} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="serviceGeo"
                    value={option}
                    checked={formData.serviceGeo === option}
                    onChange={(e) => setFormData({ ...formData, serviceGeo: e.target.value })}
                    className="rounded border-gray-300"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
            {formData.serviceGeo === 'Both' && (
              <div className="mt-2">
                <Input
                  value={formData.serviceGeoDetails}
                  onChange={(e) =>
                    setFormData({ ...formData, serviceGeoDetails: e.target.value })
                  }
                  placeholder="Enter counties, states, or countries"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => router.push('/onboarding/step1')}
            className="text-gray-600 hover:text-brand"
          >
            ← Back
          </button>
          <Button onClick={handleContinue}>Continue →</Button>
        </div>
      </Card>
    </div>
  )
}

