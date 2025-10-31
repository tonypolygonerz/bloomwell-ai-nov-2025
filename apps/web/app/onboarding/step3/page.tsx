'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Card } from '@bloomwell/ui'

const budgetOptions = [
  '<$90K',
  '$90K-$200K',
  '$200K-$500K',
  '$500K-$750K',
  '$750K-$1M',
  '$1M-$5M',
  '$5M-$10M',
  '$10M+',
]

const revenueBrackets = [
  '<$90K',
  '$90K-$200K',
  '$200K-$500K',
  '$500K-$750K',
  '$750K-$1M',
  '$1M-$5M',
  '$5M-$10M',
  '$10M+',
]

const staffSizeOptions = [
  '1-5',
  '6-10',
  '11-25',
  '26-50',
  '51-100',
  '101-500',
  '500+',
]

const grantActivity = ['0 grants', '1-5', '6-10', '11-15', '16-50', '50+']

const fiscalYearOptions = [
  'January-December',
  'February-January',
  'March-February',
  'April-March',
  'May-April',
  'June-May',
  'July-June',
  'August-July',
  'September-August',
  'October-September',
  'November-October',
  'December-November',
]

export default function Step3Page() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    budget: '',
    revenueBracket: '',
    staffSize: '',
    recentGrantActivity: '',
    fiscalYear: '',
  })

  const handleContinue = async () => {
    await fetch('/api/onboarding/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })

    router.push('/onboarding/step4')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-8">
      <Card className="w-full max-w-2xl p-8">
        <h2 className="mb-2 text-2xl font-bold">Step 3: Your Capacity</h2>
        <p className="mb-6 text-sm text-gray-600">
          Help us understand your organization's financial profile and grant experience to match you
          with appropriate funding opportunities.
        </p>

        <div className="mb-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Annual Operating Budget</label>
            <p className="mb-2 text-xs text-gray-500">
              Your organization's annual budget for programs and operations
            </p>
            <select
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              className="w-full rounded-md border border-gray-300 p-3"
            >
              <option value="">Select budget range</option>
              {budgetOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Annual Revenue</label>
            <p className="mb-2 text-xs text-gray-500">
              Total annual revenue from all sources (grants, donations, program fees, etc.)
            </p>
            <select
              value={formData.revenueBracket}
              onChange={(e) => setFormData({ ...formData, revenueBracket: e.target.value })}
              className="w-full rounded-md border border-gray-300 p-3"
            >
              <option value="">Select revenue bracket</option>
              {revenueBrackets.map((bracket) => (
                <option key={bracket} value={bracket}>
                  {bracket}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Staff Size</label>
            <p className="mb-2 text-xs text-gray-500">Number of full-time equivalent employees</p>
            <select
              value={formData.staffSize}
              onChange={(e) => setFormData({ ...formData, staffSize: e.target.value })}
              className="w-full rounded-md border border-gray-300 p-3"
            >
              <option value="">Select staff size</option>
              {staffSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Recent Grant Activity (Last 12 Months)
            </label>
            <p className="mb-2 text-xs text-gray-500">
              How many grants have you applied for in the past year?
            </p>
            <select
              value={formData.recentGrantActivity}
              onChange={(e) => setFormData({ ...formData, recentGrantActivity: e.target.value })}
              className="w-full rounded-md border border-gray-300 p-3"
            >
              <option value="">Select grant activity</option>
              {grantActivity.map((activity) => (
                <option key={activity} value={activity}>
                  {activity}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Fiscal Year</label>
            <p className="mb-2 text-xs text-gray-500">Your organization's fiscal year period</p>
            <select
              value={formData.fiscalYear}
              onChange={(e) => setFormData({ ...formData, fiscalYear: e.target.value })}
              className="w-full rounded-md border border-gray-300 p-3"
            >
              <option value="">Select fiscal year</option>
              {fiscalYearOptions.map((fy) => (
                <option key={fy} value={fy}>
                  {fy}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => router.push('/onboarding/step2')}
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

