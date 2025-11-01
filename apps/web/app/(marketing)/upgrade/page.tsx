import Link from 'next/link'
import { Button, Card } from '@bloomwell/ui'
import { MarketingHeader } from '@/components/marketing/header'
import { MarketingFooter } from '@/components/marketing/footer'

export default function UpgradePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main className="mx-auto max-w-4xl px-4 py-20">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-bold">Upgrade Your Plan</h1>
          <p className="text-xl text-gray-600">
            Unlock all features and continue your nonprofit journey
          </p>
        </div>

        <Card className="p-8 shadow-lg">
          <div className="mb-6">
            <h2 className="mb-4 text-2xl font-bold">Choose Your Plan</h2>
            <p className="text-gray-600">
              Upgrade to continue accessing all features after your free trial ends.
            </p>
          </div>

          <div className="mb-6 rounded-lg bg-gray-50 p-6">
            <h3 className="mb-2 text-xl font-semibold">Premium Features</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <span className="text-brand">✓</span>
                <span>Unlimited grant searches</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-brand">✓</span>
                <span>Advanced grant matching</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-brand">✓</span>
                <span>Priority support</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-brand">✓</span>
                <span>Expert webinars access</span>
              </li>
            </ul>
          </div>

          <div className="flex gap-4">
            <Link href="/pricing">
              <Button className="w-full">View Pricing Plans</Button>
            </Link>
            <Link href="/app">
              <Button className="w-full bg-transparent border-2 border-brand text-brand hover:bg-brand hover:text-white">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </Card>
      </main>
      <MarketingFooter />
    </div>
  )
}
