import { getServerSession } from 'next-auth'
import { authOptions } from '@bloomwell/auth'
import { redirect } from 'next/navigation'
import { Button, Card } from '@bloomwell/ui'
import { MarketingHeader } from '@/components/marketing/header'
import { MarketingFooter } from '@/components/marketing/footer'
import { getUserSubscription } from '@bloomwell/stripe'
import { getUsageStats } from '@/lib/usage-tracker'
import Link from 'next/link'
import { PortalButton } from '@/components/marketing/portal-button'

export default async function UpgradePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  const userId = session.userId ?? session.user.id
  if (!userId) {
    redirect('/login')
  }

  const subscription = await getUserSubscription(userId)
  const usageStats = await getUsageStats(userId)

  const daysUntilTrialEnd =
    subscription.isTrialActive && subscription.currentPeriodEnd
      ? Math.ceil(
          (new Date(subscription.currentPeriodEnd).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : null

  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main className="mx-auto max-w-4xl px-4 py-20">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-bold">Subscription Management</h1>
          <p className="text-xl text-gray-600">
            Manage your subscription and view usage statistics
          </p>
        </div>

        <div className="space-y-6">
          {/* Current Subscription Status */}
          <Card className="p-6 shadow-lg">
            <h2 className="mb-4 text-2xl font-bold">Current Subscription</h2>
            <div className="space-y-3">
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
                <div className="rounded-lg bg-blue-50 p-4">
                  <p className="font-semibold text-blue-900">
                    {daysUntilTrialEnd} days remaining in trial
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Usage Statistics */}
          <Card className="p-6 shadow-lg">
            <h2 className="mb-4 text-2xl font-bold">Usage Statistics</h2>
            <div className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-gray-600">Documents (Today)</span>
                  <span className="font-semibold">
                    {usageStats.documentsUsedToday} / {usageStats.documentsDailyLimit}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
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
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-gray-600">Documents (This Month)</span>
                  <span className="font-semibold">
                    {usageStats.documentsUsedMonth} / {usageStats.documentsMonthlyLimit}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full bg-brand transition-all"
                    style={{
                      width: `${
                        (usageStats.documentsUsedMonth / usageStats.documentsMonthlyLimit) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-gray-600">Tokens (Today)</span>
                  <span className="font-semibold">
                    {usageStats.tokensUsedToday.toLocaleString()} /{' '}
                    {usageStats.tokensDailyLimit.toLocaleString()}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full bg-brand transition-all"
                    style={{
                      width: `${(usageStats.tokensUsedToday / usageStats.tokensDailyLimit) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <Card className="p-6 shadow-lg">
            <h2 className="mb-4 text-2xl font-bold">Manage Subscription</h2>
            <div className="flex flex-col gap-4">
              {subscription.status !== 'active' && subscription.status !== 'trialing' && (
                <Link href="/pricing">
                  <Button className="w-full">View Pricing Plans</Button>
                </Link>
              )}
              {subscription.status === 'active' && <PortalButton />}
              <Link href="/app">
                <Button className="w-full bg-transparent border-2 border-brand text-brand hover:bg-brand hover:text-white">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </main>
      <MarketingFooter />
    </div>
  )
}
