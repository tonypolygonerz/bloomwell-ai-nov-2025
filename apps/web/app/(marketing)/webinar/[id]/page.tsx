import Link from 'next/link'
import { Button, Card } from '@bloomwell/ui'
import { MarketingHeader } from '@/components/marketing/header'
import { MarketingFooter } from '@/components/marketing/footer'

interface PageProps {
  params: {
    id: string
  }
}

export default function WebinarDetailPage({ params }: PageProps) {
  // In a real app, this would fetch from database
  // For now, using mock data based on the webinars page
  const webinars: Record<
    string,
    {
      id: string
      title: string
      subtitle: string
      date: string
      time: string
      hostName: string
      hostTitle: string
      description?: string
    }
  > = {
    '1': {
      id: '1',
      title: 'Grant Writing Fundamentals for Nonprofits',
      subtitle: 'Learn the basics of successful grant writing',
      date: '2025-02-15',
      time: '2:00 PM EST',
      hostName: 'Sarah Johnson',
      hostTitle: 'Grant Writing Expert',
      description:
        'This comprehensive webinar will cover the essential elements of grant writing, from understanding grant requirements to crafting compelling proposals that stand out to funders.',
    },
    '2': {
      id: '2',
      title: 'Board Governance Best Practices',
      subtitle: 'Building effective nonprofit boards',
      date: '2025-02-22',
      time: '3:00 PM EST',
      hostName: 'Michael Chen',
      hostTitle: 'Nonprofit Consultant',
      description:
        "Learn how to build and maintain a strong board of directors that supports your organization's mission and helps drive strategic growth.",
    },
  }

  const webinar = webinars[params.id]

  if (!webinar) {
    return (
      <div className="flex min-h-screen flex-col">
        <MarketingHeader />
        <main className="mx-auto max-w-4xl px-4 py-20">
          <h1 className="mb-4 text-3xl font-bold">Webinar Not Found</h1>
          <Link href="/webinars">
            <Button>Back to Webinars</Button>
          </Link>
        </main>
        <MarketingFooter />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main className="mx-auto max-w-4xl px-4 py-20">
        <Link href="/webinars" className="mb-6 text-brand hover:underline">
          ← Back to Webinars
        </Link>

        <Card className="p-8 shadow-lg">
          <h1 className="mb-2 text-4xl font-bold">{webinar.title}</h1>
          <p className="mb-6 text-xl text-gray-600">{webinar.subtitle}</p>

          <div className="mb-6 space-y-3">
            <div className="flex items-center gap-3">
              <span className="font-semibold">Date:</span>
              <span>
                {new Date(webinar.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold">Time:</span>
              <span>{webinar.time}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold">Host:</span>
              <span>
                {webinar.hostName}, {webinar.hostTitle}
              </span>
            </div>
          </div>

          {webinar.description && (
            <div className="mb-6">
              <h2 className="mb-3 text-2xl font-bold">About This Webinar</h2>
              <p className="text-gray-700">{webinar.description}</p>
            </div>
          )}

          <div className="rounded-lg bg-brand/10 p-6">
            <h3 className="mb-4 text-xl font-semibold">What You'll Learn</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-brand">✓</span>
                <span>Best practices and proven strategies</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand">✓</span>
                <span>Real-world examples and case studies</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand">✓</span>
                <span>Q&A session with the expert host</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand">✓</span>
                <span>Access to recording after the event</span>
              </li>
            </ul>
          </div>

          <div className="mt-6">
            <Button className="w-full">Register for This Webinar</Button>
            <p className="mt-4 text-center text-sm text-gray-600">
              Registration is free for all Bloomwell AI users
            </p>
          </div>
        </Card>
      </main>
      <MarketingFooter />
    </div>
  )
}
