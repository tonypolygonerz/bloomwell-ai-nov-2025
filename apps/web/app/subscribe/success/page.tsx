import { getServerSession } from 'next-auth'
import { authOptions } from '@bloomwell/auth'
import { redirect } from 'next/navigation'
import { Button, Card } from '@bloomwell/ui'
import { MarketingHeader } from '@/components/marketing/header'
import { MarketingFooter } from '@/components/marketing/footer'
import Link from 'next/link'

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main className="mx-auto max-w-2xl px-4 py-20">
        <Card className="p-8 shadow-lg text-center">
          <div className="mb-6">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="mb-2 text-3xl font-bold">Subscription Successful!</h1>
            <p className="text-gray-600">
              Thank you for subscribing. Your subscription is now active.
            </p>
          </div>

          <div className="mb-6 rounded-lg bg-green-50 p-4">
            <p className="text-sm text-gray-700">
              You can now access all features included in your subscription plan.
            </p>
          </div>

          <div className="flex gap-4">
            <Link href="/app" className="flex-1">
              <Button className="w-full">Go to Dashboard</Button>
            </Link>
            <Link href="/upgrade" className="flex-1">
              <Button className="w-full bg-transparent border-2 border-brand text-brand hover:bg-brand hover:text-white">
                Manage Subscription
              </Button>
            </Link>
          </div>
        </Card>
      </main>
      <MarketingFooter />
    </div>
  )
}








