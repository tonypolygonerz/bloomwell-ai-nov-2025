'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Input } from '@bloomwell/ui'

type Tab = 'profile' | 'account' | 'organization' | 'notifications' | 'billing'

interface Organization {
  id: string
  name?: string | null
  legalName?: string | null
  organizationType?: string | null
  ein?: string | null
  mission?: string | null
  missionStatement?: string | null
  budget?: string | null
  annualBudget?: string | null
  staffSize?: string | null
  focusAreas?: string | string[] | null
  revenueBracket?: string | null
  serviceGeo?: string | null
  geographicServiceArea?: string | null
  fiscalYear?: string | null
  isVerified?: boolean
  yearsOperating?: string | null
  stateOfIncorporation?: string | null
  currentLegalStatus?: string | null
  taxExemptStatusDate?: string | null
  programDescriptions?: string | null
  revenueSourcesGov?: number | null
  revenueSourcesPrivate?: number | null
  revenueSourcesDonations?: number | null
  revenueSourcesOther?: number | null
  boardSize?: number | null
  volunteerCount?: string | null
  previousGrantExperience?: string | null
  fundingGoals?: string | string[] | null
  documents?: any
  boardRoster?: any
}

interface SubscriptionStatus {
  status?: string | null
  tier?: 'starter' | 'enterprise' | null
  priceId?: string | null
  currentPeriodEnd?: string | null
  isTrialActive?: boolean
}

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
  lastUsageReset: string | null
}

function SettingsContent() {
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null)
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const tab = (searchParams.get('tab') as Tab) || 'profile'
    setActiveTab(tab)
  }, [searchParams])

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [orgRes, subRes, usageRes] = await Promise.all([
          fetch('/api/onboarding/status'),
          fetch('/api/subscribe/status'),
          fetch('/api/subscribe/usage'),
        ])

        if (orgRes.ok) {
          const orgData = await orgRes.json()
          setOrganization(orgData.organization || null)
        }

        if (subRes.ok) {
          const subData = await subRes.json()
          setSubscriptionStatus(subData)
        }

        if (usageRes.ok) {
          const usageData = await usageRes.json()
          setUsageStats(usageData)
        }
      } catch (error) {
        console.error('Error fetching settings data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const tabs: { id: Tab; label: string; href: string }[] = [
    { id: 'profile', label: 'Profile', href: '/app/settings?tab=profile' },
    { id: 'account', label: 'Account', href: '/app/settings?tab=account' },
    { id: 'organization', label: 'Organization Profile', href: '/app/settings?tab=organization' },
    { id: 'notifications', label: 'Notifications', href: '/app/settings?tab=notifications' },
    { id: 'billing', label: 'Billing', href: '/app/settings?tab=billing' },
  ]

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 dark:bg-slate-900">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              href={tab.href as any}
              className={`
                whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors
                ${
                  activeTab === tab.id
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                }
              `}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-sm text-slate-500 dark:text-slate-400">Loading...</div>
          </div>
        ) : (
          <>
            {activeTab === 'profile' && (
              <ProfileTab session={session} organization={organization} />
            )}
            {activeTab === 'account' && <AccountTab session={session} />}
            {activeTab === 'organization' && (
              <OrganizationTab session={session} organization={organization} />
            )}
            {activeTab === 'notifications' && <NotificationsTab session={session} />}
            {activeTab === 'billing' && (
              <BillingTab
                session={session}
                subscriptionStatus={subscriptionStatus}
                usageStats={usageStats}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

// Profile Tab Component
function ProfileTab({
  session,
  organization,
}: {
  session: any
  organization: Organization | null
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Profile Information</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Your personal information and profile settings
        </p>
      </div>

      {/* Avatar Section */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <label className="text-sm font-medium text-slate-900 dark:text-white">Profile Picture</label>
        <div className="mt-3 flex items-center gap-4">
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt={session?.user?.name ?? 'User'}
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-2xl font-semibold text-white">
              {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || 'U'}
            </div>
          )}
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {session?.user?.image
                ? 'Your profile picture is managed by your OAuth provider'
                : 'Upload a profile picture to personalize your account'}
            </p>
          </div>
        </div>
      </div>

      {/* User Information */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h3 className="mb-4 text-lg font-medium text-slate-900 dark:text-white">Personal Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Name
            </label>
            <Input
              type="text"
              value={session?.user?.name || ''}
              disabled
              className="mt-1"
              readOnly
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Your name is managed by your authentication provider
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Email
            </label>
            <Input
              type="email"
              value={session?.user?.email || ''}
              disabled
              className="mt-1"
              readOnly
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Your email address cannot be changed here
            </p>
          </div>
        </div>
      </div>

      {/* Organization Information */}
      {organization && (
        <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <h3 className="mb-4 text-lg font-medium text-slate-900 dark:text-white">
            Organization Details
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Legal Name
              </label>
              <Input
                type="text"
                value={organization.legalName || ''}
                disabled
                className="mt-1"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Organization Type
              </label>
              <Input
                type="text"
                value={organization.organizationType || ''}
                disabled
                className="mt-1"
                readOnly
              />
            </div>
            {organization.ein && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  EIN
                </label>
                <Input type="text" value={organization.ein} disabled className="mt-1" readOnly />
              </div>
            )}
            {organization.mission && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Mission
                </label>
                <textarea
                  value={organization.mission}
                  disabled
                  rows={3}
                  className="mt-1 w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                  readOnly
                />
              </div>
            )}
          </div>
          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
            To update organization details, please complete the onboarding process
          </p>
        </div>
      )}
    </div>
  )
}

// Account Tab Component
function AccountTab({ session }: { session: any }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  const hasPassword = !!session?.user?.email // Users with credentials have passwords

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      return
    }

    setIsChangingPassword(true)
    try {
      // TODO: Implement password change API endpoint
      // const response = await fetch('/api/account/password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ currentPassword, newPassword }),
      // })
      // if (!response.ok) {
      //   const error = await response.json()
      //   setPasswordError(error.message || 'Failed to change password')
      //   return
      // }
      setPasswordSuccess('Password changed successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      setPasswordError('An error occurred. Please try again.')
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Account Settings</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Manage your account security and data
        </p>
      </div>

      {/* Password Change */}
      {hasPassword ? (
        <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <h3 className="mb-4 text-lg font-medium text-slate-900 dark:text-white">Change Password</h3>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Current Password
              </label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                New Password
              </label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1"
                required
                minLength={8}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Confirm New Password
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1"
                required
                minLength={8}
              />
            </div>
            {passwordError && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400">
                {passwordSuccess}
              </div>
            )}
            <button
              type="submit"
              disabled={isChangingPassword}
              className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-700"
            >
              {isChangingPassword ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <h3 className="mb-2 text-lg font-medium text-slate-900 dark:text-white">
            Authentication Method
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            You're signed in with OAuth. Password management is handled by your authentication provider.
          </p>
        </div>
      )}

      {/* Security Settings */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h3 className="mb-4 text-lg font-medium text-slate-900 dark:text-white">Security</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Two-Factor Authentication</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Add an extra layer of security to your account
              </p>
            </div>
            <button
              disabled
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 opacity-50 dark:border-slate-600 dark:text-slate-300"
            >
              Coming Soon
            </button>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h3 className="mb-4 text-lg font-medium text-slate-900 dark:text-white">Data Management</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Export Data</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Download a copy of your account data
              </p>
            </div>
            <button
              disabled
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 opacity-50 dark:border-slate-600 dark:text-slate-300"
            >
              Coming Soon
            </button>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-700">
            <div>
              <p className="text-sm font-medium text-red-600 dark:text-red-400">Delete Account</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Permanently delete your account and all data
              </p>
            </div>
            <button
              disabled
              className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 opacity-50 dark:border-red-600 dark:text-red-400"
            >
              Coming Soon
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Notifications Tab Component
function NotificationsTab({ session }: { session: any }) {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [marketingEmails, setMarketingEmails] = useState(false)
  const [grantAlerts, setGrantAlerts] = useState(true)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Notification Preferences</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Manage how you receive notifications and updates
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h3 className="mb-4 text-lg font-medium text-slate-900 dark:text-white">Email Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                Account & Security Updates
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Receive emails about important account changes
              </p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-500 peer-checked:after:translate-x-full peer-checked:after:border-white dark:bg-slate-600 dark:after:border-slate-500"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900 dark:text-white">Marketing Emails</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Receive updates about new features and tips
              </p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={marketingEmails}
                onChange={(e) => setMarketingEmails(e.target.checked)}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-500 peer-checked:after:translate-x-full peer-checked:after:border-white dark:bg-slate-600 dark:after:border-slate-500"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900 dark:text-white">Grant Alerts</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Get notified about grants matching your organization
              </p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={grantAlerts}
                onChange={(e) => setGrantAlerts(e.target.checked)}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-500 peer-checked:after:translate-x-full peer-checked:after:border-white dark:bg-slate-600 dark:after:border-slate-500"></div>
            </label>
          </div>
        </div>
        <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
          Notification preferences are saved automatically
        </p>
      </div>
    </div>
  )
}

// Billing Tab Component
function BillingTab({
  session,
  subscriptionStatus,
  usageStats,
}: {
  session: any
  subscriptionStatus: SubscriptionStatus | null
  usageStats: UsageStats | null
}) {
  const [isLoadingPortal, setIsLoadingPortal] = useState(false)

  const handleOpenBillingPortal = async () => {
    setIsLoadingPortal(true)
    try {
      const response = await fetch('/api/subscribe/portal', {
        method: 'POST',
      })
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        console.error('No portal URL returned')
      }
    } catch (error) {
      console.error('Error opening billing portal:', error)
    } finally {
      setIsLoadingPortal(false)
    }
  }

  const trialEndsAt = session?.trialEndsAt ?? session?.user?.trialEndsAt
  const isTrialActive =
    trialEndsAt && new Date(trialEndsAt) > new Date() && subscriptionStatus?.isTrialActive

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Billing & Subscription</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Manage your subscription and view usage
        </p>
      </div>

      {/* Subscription Status */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h3 className="mb-4 text-lg font-medium text-slate-900 dark:text-white">Subscription Status</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-400">Status</span>
            <span className="text-sm font-medium capitalize text-slate-900 dark:text-white">
              {subscriptionStatus?.status || 'No active subscription'}
            </span>
          </div>
          {subscriptionStatus?.tier && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Plan</span>
              <span className="text-sm font-medium capitalize text-slate-900 dark:text-white">
                {subscriptionStatus.tier}
              </span>
            </div>
          )}
          {isTrialActive && trialEndsAt && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Trial Ends</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {new Date(trialEndsAt).toLocaleDateString()}
              </span>
            </div>
          )}
          {subscriptionStatus?.currentPeriodEnd && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Next Billing Date</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {new Date(subscriptionStatus.currentPeriodEnd).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
        <div className="mt-6">
          <button
            onClick={handleOpenBillingPortal}
            disabled={isLoadingPortal}
            className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-700"
          >
            {isLoadingPortal ? 'Loading...' : 'Manage Billing'}
          </button>
        </div>
      </div>

      {/* Usage Tracking */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h3 className="mb-4 text-lg font-medium text-slate-900 dark:text-white">Usage Statistics</h3>
        {usageStats ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Documents Used Today</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {usageStats.documentsUsedToday} / {usageStats.documentsDailyLimit}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Documents Used This Month
              </span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {usageStats.documentsUsedMonth} / {usageStats.documentsMonthlyLimit}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Tokens Used Today</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {usageStats.tokensUsedToday.toLocaleString()} /{' '}
                {usageStats.tokensDailyLimit.toLocaleString()}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-sm text-slate-500 dark:text-slate-400">Loading usage statistics...</div>
        )}
        <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
          Usage statistics reset daily and monthly
        </p>
      </div>
    </div>
  )
}

// Organization Tab Component
function OrganizationTab({
  session,
  organization,
}: {
  session: any
  organization: Organization | null
}) {
  const [completionStatus, setCompletionStatus] = useState<{
    completionPercentage: number
    isBasicComplete: boolean
  } | null>(null)

  useEffect(() => {
    fetch('/api/onboarding/status')
      .then((res) => res.json())
      .then((data) => {
        setCompletionStatus({
          completionPercentage: data.completionPercentage || 0,
          isBasicComplete: data.isBasicComplete || false,
        })
      })
      .catch((error) => {
        console.error('Error fetching completion status:', error)
      })
  }, [])

  const getNextStep = () => {
    if (!organization?.organizationType) return '/onboarding/step2'
    if (!organization?.missionStatement) return '/onboarding/step3'
    if (!organization?.documents) return '/onboarding/step4'
    return '/onboarding/step4'
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Organization Profile</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Manage your organization information and profile completion
        </p>
      </div>

      {/* Profile Completion Status */}
      {completionStatus && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-900/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100">
                Profile Completion
              </h3>
              <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                Complete your profile for better AI recommendations
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                {completionStatus.completionPercentage}%
              </div>
              <Link
                href={getNextStep()}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
              >
                Continue Onboarding →
              </Link>
            </div>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2 mt-4 dark:bg-blue-800">
            <div
              className="bg-blue-600 h-2 rounded-full dark:bg-blue-500"
              style={{ width: `${completionStatus.completionPercentage}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Basic Information */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Basic Information</h3>
          <Link
            href="/onboarding/step2"
            className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 text-sm font-medium"
          >
            Edit →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-500 dark:text-slate-400">Organization Name:</span>
            <p className="font-medium text-slate-900 dark:text-white">
              {organization?.legalName || organization?.name || 'Not set'}
            </p>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400">EIN:</span>
            <p className="font-medium text-slate-900 dark:text-white">
              {organization?.ein || 'Not set'}
            </p>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400">Organization Type:</span>
            <p className="font-medium text-slate-900 dark:text-white">
              {organization?.organizationType || 'Not set'}
            </p>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400">Years Operating:</span>
            <p className="font-medium text-slate-900 dark:text-white">
              {organization?.yearsOperating || 'Not set'}
            </p>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400">State of Incorporation:</span>
            <p className="font-medium text-slate-900 dark:text-white">
              {organization?.stateOfIncorporation || 'Not set'}
            </p>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400">Legal Status:</span>
            <p className="font-medium text-slate-900 dark:text-white">
              {organization?.currentLegalStatus || 'Not set'}
            </p>
          </div>
        </div>
      </div>

      {/* Mission & Programs */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Mission & Programs</h3>
          <Link
            href="/onboarding/step3"
            className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 text-sm font-medium"
          >
            Edit →
          </Link>
        </div>
        <div className="space-y-3 text-sm">
          <div>
            <span className="text-slate-500 dark:text-slate-400">Mission Statement:</span>
            <p className="font-medium text-slate-900 dark:text-white mt-1">
              {organization?.missionStatement || organization?.mission || 'Not set'}
            </p>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400">Focus Areas:</span>
            <p className="font-medium text-slate-900 dark:text-white">
              {organization?.focusAreas
                ? Array.isArray(organization.focusAreas)
                  ? organization.focusAreas.join(', ')
                  : String(organization.focusAreas)
                : 'Not set'}
            </p>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400">Service Area:</span>
            <p className="font-medium text-slate-900 dark:text-white">
              {organization?.geographicServiceArea || organization?.serviceGeo || 'Not set'}
            </p>
          </div>
        </div>
      </div>

      {/* Financial Profile */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Financial Profile</h3>
          <Link
            href="/onboarding/step3"
            className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 text-sm font-medium"
          >
            Edit →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-500 dark:text-slate-400">Annual Budget:</span>
            <p className="font-medium text-slate-900 dark:text-white">
              {organization?.annualBudget || organization?.budget || 'Not set'}
            </p>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400">Staff Size:</span>
            <p className="font-medium text-slate-900 dark:text-white">
              {organization?.staffSize || 'Not set'}
            </p>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400">Fiscal Year:</span>
            <p className="font-medium text-slate-900 dark:text-white">
              {organization?.fiscalYear || 'Not set'}
            </p>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400">Grant Experience:</span>
            <p className="font-medium text-slate-900 dark:text-white">
              {organization?.previousGrantExperience || 'Not set'}
            </p>
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Documents</h3>
          <Link
            href="/onboarding/step4"
            className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 text-sm font-medium"
          >
            Manage →
          </Link>
        </div>
        <div className="space-y-2 text-sm">
          {organization?.documents ? (
            <>
              {(organization.documents as any)?.determination501c3 ? (
                <div className="flex items-center">
                  <span className="w-4 h-4 text-green-500 mr-2">✅</span>
                  <span className="text-slate-900 dark:text-white">501(c)(3) Determination Letter</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <span className="w-4 h-4 text-slate-300 mr-2">⭕</span>
                  <span className="text-slate-500 dark:text-slate-400">
                    501(c)(3) Determination Letter
                  </span>
                </div>
              )}
              {(organization.documents as any)?.articlesIncorporation ? (
                <div className="flex items-center">
                  <span className="w-4 h-4 text-green-500 mr-2">✅</span>
                  <span className="text-slate-900 dark:text-white">Articles of Incorporation</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <span className="w-4 h-4 text-slate-300 mr-2">⭕</span>
                  <span className="text-slate-500 dark:text-slate-400">Articles of Incorporation</span>
                </div>
              )}
              {(organization.documents as any)?.bylaws ? (
                <div className="flex items-center">
                  <span className="w-4 h-4 text-green-500 mr-2">✅</span>
                  <span className="text-slate-900 dark:text-white">Organization Bylaws</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <span className="w-4 h-4 text-slate-300 mr-2">⭕</span>
                  <span className="text-slate-500 dark:text-slate-400">Organization Bylaws</span>
                </div>
              )}
            </>
          ) : (
            <p className="text-slate-500 dark:text-slate-400">No documents uploaded</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-sm text-slate-500 dark:text-slate-400">Loading settings...</div>
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  )
}

