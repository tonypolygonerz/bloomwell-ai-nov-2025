import Link from 'next/link'
import { Button, Card } from '@bloomwell/ui'
import { MarketingHeader } from '@/components/marketing/header'
import { MarketingFooter } from '@/components/marketing/footer'

export default function PricingPage() {
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

        <div className="mx-auto max-w-4xl">
          <Card className="p-8 shadow-lg">
            <div className="mb-6">
              <h2 className="mb-2 text-3xl font-bold">Bloomwell AI Pro</h2>
              <div className="mb-4">
                <span className="text-5xl font-bold">$29.99</span>
                <span className="text-gray-600">/month</span>
              </div>
              <p className="text-gray-600">
                Perfect for nonprofits seeking funding opportunities and expert guidance.
              </p>
            </div>

            <div className="mb-8 space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-brand">✓</span>
                <span>Access to 73,000+ federal grants database</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-brand">✓</span>
                <span>AI-powered grant discovery and matching</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-brand">✓</span>
                <span>Expert AI assistant available 24/7</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-brand">✓</span>
                <span>Monthly live expert webinars</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-brand">✓</span>
                <span>Real-time grant alerts</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-brand">✓</span>
                <span>Document upload and analysis</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-brand">✓</span>
                <span>Project management tools</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-brand">✓</span>
                <span>Priority support</span>
              </div>
            </div>

            <div className="mb-6 rounded-lg bg-green-50 p-4 text-center">
              <p className="font-semibold text-brand">Start Your 14-Day Free Trial</p>
              <p className="text-sm text-gray-600">No credit card required</p>
            </div>

            <Link href="/register" className="block">
              <Button className="w-full">Get Started →</Button>
            </Link>

            <p className="mt-4 text-center text-sm text-gray-500">
              Cancel anytime. No long-term contracts.
            </p>
          </Card>

          <div className="mt-12 text-center">
            <h3 className="mb-4 text-2xl font-bold">Why Choose Bloomwell AI?</h3>
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <h4 className="mb-2 font-semibold">Affordable</h4>
                <p className="text-gray-600">
                  At $29.99/month, we're 85% cheaper than enterprise competitors ($179-$899/month)
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
        </div>
      </main>
      <MarketingFooter />
    </div>
  )
}
