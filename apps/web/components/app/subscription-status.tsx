'use client'

import { useEffect, useState } from 'react'
import { Card } from '@bloomwell/ui'
import Link from 'next/link'

// Note: userId prop interface removed as it's not currently used

interface UsageStats {
  documentsUsedToday: number
  documentsUsedMonth: number
  tokensUsedToday: number
  documentsDailyLimit: number
  documentsMonthlyLimit: number
  tokensDailyLimit: number
  documentsRemainingToday: number
  documentsRemainingMonth: number
  tokensRemainingToday: number
}

interface SubscriptionData {
  status: string | null
  tier: 'starter' | 'enterprise' | null
  priceId: string | null
  currentPeriodEnd: string | null
  isTrialActive: boolean
}

export function SubscriptionStatus() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [subResponse, usageResponse] = await Promise.all([
          fetch('/api/subscribe/status'),
          fetch('/api/subscribe/usage'),
        ])

        if (subResponse.ok) {
          const subData = await subResponse.json()
          setSubscription(subData)
        }

        if (usageResponse.ok) {
          const usageData = await usageResponse.json()
          setUsageStats(usageData)
        }
      } catch (error) {
        console.error('Error fetching subscription data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </Card>
    )
  }

  if (!subscription) {
    return null
  }

  const daysUntilTrialEnd =
    subscription.isTrialActive && subscription.currentPeriodEnd
      ? Math.ceil(
          (new Date(subscription.currentPeriodEnd).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : null

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Subscription Status</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Status:</span>
            <span
              className={`font-semibold ${
                subscription.status === 'active'
                  ? 'text-green-600'
                  : subscription.status === 'trialing'
                    ? 'text-blue-600'
                    : 'text-gray-600'
              }`}
            >
              {subscription.status === 'active'
                ? 'Active'
                : subscription.status === 'trialing'
                  ? 'Trialing'
                  : subscription.status === 'canceled'
                    ? 'Canceled'
                    : 'No Subscription'}
            </span>
          </div>
          {subscription.tier && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Tier:</span>
              <span className="font-semibold capitalize">{subscription.tier}</span>
            </div>
          )}
          {subscription.currentPeriodEnd && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Period End:</span>
              <span className="font-semibold">
                {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </span>
            </div>
          )}
          {daysUntilTrialEnd && (
            <div className="mt-3 rounded-lg bg-blue-50 p-3">
              <p className="text-sm font-semibold text-blue-900">
                {daysUntilTrialEnd} days remaining in trial
              </p>
            </div>
          )}
        </div>
      </div>

      {usageStats && (
        <div className="mt-4 border-t pt-4">
          <h4 className="text-sm font-semibold mb-3">Usage Today</h4>
          <div className="space-y-3 text-xs">
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-gray-600">Documents:</span>
                <span className="font-semibold">
                  {usageStats.documentsUsedToday} / {usageStats.documentsDailyLimit}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-brand transition-all"
                  style={{
                    width: `${
                      (usageStats.documentsUsedToday / usageStats.documentsDailyLimit) * 100
                    }%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-gray-600">Tokens:</span>
                <span className="font-semibold">
                  {usageStats.tokensUsedToday.toLocaleString()} /{' '}
                  {usageStats.tokensDailyLimit.toLocaleString()}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-brand transition-all"
                  style={{
                    width: `${
                      (usageStats.tokensUsedToday / usageStats.tokensDailyLimit) * 100
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t">
        <Link
          href="/upgrade"
          className="text-sm text-brand hover:underline font-semibold"
        >
          Manage Subscription →
        </Link>
      </div>
    </Card>
  )
}








