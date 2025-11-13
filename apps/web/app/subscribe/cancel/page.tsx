import { getServerSession } from 'next-auth'
import { authOptions } from '@bloomwell/auth'
import { redirect } from 'next/navigation'
import { Button, Card } from '@bloomwell/ui'
import { MarketingHeader } from '@/components/marketing/header'
import { MarketingFooter } from '@/components/marketing/footer'
import Link from 'next/link'

export default async function CancelPage() {
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
            <h1 className="mb-2 text-3xl font-bold">Checkout Cancelled</h1>
            <p className="text-gray-600">
              Your checkout session was cancelled. No charges have been made.
            </p>
          </div>

          <div className="mb-6 rounded-lg bg-gray-50 p-4">
            <p className="text-sm text-gray-700">
              If you have any questions or need assistance, please contact our support team.
            </p>
          </div>

          <div className="flex gap-4">
            <Link href="/pricing" className="flex-1">
              <Button className="w-full">View Pricing Plans</Button>
            </Link>
            <Link href="/app" className="flex-1">
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
