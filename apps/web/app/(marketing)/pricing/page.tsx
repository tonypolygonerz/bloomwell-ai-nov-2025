'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button, Card } from '@bloomwell/ui'
import { MarketingHeader } from '@/components/marketing/header'
import { MarketingFooter } from '@/components/marketing/footer'
import { BillingToggle } from '@/components/pricing/billing-toggle'
// Import STRIPE_PRICES directly to avoid server-side dependencies in client component
const STRIPE_PRICES = {
  starter_monthly: 'price_1SAas1GpZiQKTBAtcgtB71u4',
  starter_annual: 'price_1SAatSGpZiQKTBAtmOVcBQZG',
  enterprise_monthly: 'price_1SPmEHGpZiQKTBAtTJwZbf4N',
  enterprise_annual: 'price_1SPm2bGpZiQKTBAtL2m5p2KQ',
} as const

export default function PricingPage() {
  const router = useRouter()
  const { status } = useSession()
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null)
  const [starterBillingCycle, setStarterBillingCycle] = useState<'monthly' | 'annual'>('monthly')
  const [enterpriseBillingCycle, setEnterpriseBillingCycle] = useState<'monthly' | 'annual'>(
    'monthly',
  )

  const handleSubscribe = async (priceId: string) => {
    // Check authentication first
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/pricing')
      return
    }

    // If loading, wait
    if (status === 'loading') {
      return
    }

    // Proceed with checkout for authenticated users
    setLoadingPriceId(priceId)
    try {
      const response = await fetch('/api/subscribe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })

      const data = await response.json()

      // Handle 401 as backup check
      if (response.status === 401) {
        router.push('/login?callbackUrl=/pricing')
        setLoadingPriceId(null)
        return
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Failed to create checkout session. Please try again.')
        setLoadingPriceId(null)
      }
    } catch (error) {
      console.error('Error creating checkout:', error)
      alert('An error occurred. Please try again.')
      setLoadingPriceId(null)
    }
  }

  const pricingPlans = [
    {
      tier: 'Starter',
      monthly: {
        price: 24.99,
        priceId: STRIPE_PRICES.starter_monthly,
        annualEquivalent: 251.88,
        savings: '16%',
      },
      annual: {
        price: 251.88,
        priceId: STRIPE_PRICES.starter_annual,
        monthlyEquivalent: 20.99,
        savings: '16%',
      },
      features: {
        documents_monthly: 300,
        documents_daily: 10,
        tokens_daily: 3000,
        support_level: 'AI Chatbot',
      },
    },
    {
      tier: 'Enterprise',
      monthly: {
        price: 79.99,
        priceId: STRIPE_PRICES.enterprise_monthly,
        annualEquivalent: 767.88,
        savings: '20%',
      },
      annual: {
        price: 767.88,
        priceId: STRIPE_PRICES.enterprise_annual,
        monthlyEquivalent: 63.99,
        savings: '20%',
      },
      features: {
        documents_monthly: 600,
        documents_daily: 30,
        tokens_daily: 10000,
        support_level: 'Priority Email',
      },
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main className="mx-auto max-w-7xl px-4 py-20">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-bold">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-600">
            All the tools you need to find and secure grants. No hidden fees.
          </p>
        </div>

        <div className="mb-8 text-center">
          <div className="mb-6 rounded-lg bg-green-50 p-4 inline-block">
            <p className="font-semibold text-brand">Start Your 14-Day Free Trial</p>
            <p className="text-sm text-gray-600">No credit card required</p>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2 mb-12">
          {pricingPlans.map((plan) => {
            const isStarter = plan.tier === 'Starter'
            const billingCycle = isStarter ? starterBillingCycle : enterpriseBillingCycle
            const setBillingCycle = isStarter ? setStarterBillingCycle : setEnterpriseBillingCycle
            const isAnnual = billingCycle === 'annual'
            const currentPriceId = isAnnual ? plan.annual.priceId : plan.monthly.priceId

            return (
              <Card
                key={plan.tier}
                className={`p-6 shadow-lg relative ${isAnnual ? 'border-2 border-brand' : ''}`}
              >
                {/* Tier Badge */}
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-900 shadow-sm">
                    {plan.tier}
                  </span>
                </div>

                {/* Toggle in top-right */}
                <div className="absolute top-4 right-4">
                  <BillingToggle
                    isAnnual={isAnnual}
                    onToggle={(annual) => setBillingCycle(annual ? 'annual' : 'monthly')}
                  />
                </div>

                {/* Pricing Section */}
                <div className="mb-4 mt-12">
                  <div className="mb-2">
                    {isAnnual ? (
                      <>
                        <span className="text-4xl font-bold">${plan.annual.price}</span>
                        <span className="text-gray-600">/year</span>
                        <p className="mt-2 text-sm text-gray-500">
                          ${plan.annual.monthlyEquivalent}/month (save {plan.annual.savings})
                        </p>
                      </>
                    ) : (
                      <>
                        <span className="text-4xl font-bold">${plan.monthly.price}</span>
                        <span className="text-gray-600">/month</span>
                        <p className="mt-2 text-sm text-gray-500">
                          ${plan.monthly.annualEquivalent}/year (save {plan.monthly.savings})
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Features List */}
                <div className="mb-6 space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-brand">✓</span>
                    <span>{plan.features.documents_monthly} documents/month</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-brand">✓</span>
                    <span>{plan.features.documents_daily} documents/day</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-brand">✓</span>
                    <span>{plan.features.tokens_daily.toLocaleString()} tokens/day</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-brand">✓</span>
                    <span>{plan.features.support_level} Support</span>
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  className={`w-full ${isAnnual ? 'bg-brand hover:bg-brand-hover' : ''}`}
                  onClick={() => handleSubscribe(currentPriceId)}
                  disabled={loadingPriceId === currentPriceId}
                >
                  {loadingPriceId === currentPriceId ? 'Loading...' : 'Get Started'}
                </Button>
              </Card>
            )
          })}
        </div>

        <div className="mt-12 text-center">
          <h3 className="mb-4 text-2xl font-bold">Why Choose Bloomwell AI?</h3>
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <h4 className="mb-2 font-semibold">Affordable</h4>
              <p className="text-gray-600">
                Starting at $24.99/month, we're 85% cheaper than enterprise competitors
              </p>
            </div>
            <div>
              <h4 className="mb-2 font-semibold">Specialized</h4>
              <p className="text-gray-600">
                Built specifically for nonprofits, not generic grant databases
              </p>
            </div>
            <div>
              <h4 className="mb-2 font-semibold">AI-Powered</h4>
              <p className="text-gray-600">
                Advanced AI technology to match you with the perfect grants
              </p>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-gray-500">
          Cancel anytime. No long-term contracts. 14-day free trial for all plans.
        </p>
      </main>
      <MarketingFooter />
    </div>
  )
}
