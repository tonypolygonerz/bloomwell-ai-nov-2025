import Link from 'next/link'
import { Button, Card } from '@bloomwell/ui'
import { MarketingHeader } from '@/components/marketing/header'
import { MarketingFooter } from '@/components/marketing/footer'

export default function WebinarsPage() {
  const upcomingWebinars = [
    {
      id: '1',
      title: 'Grant Writing Fundamentals for Nonprofits',
      subtitle: 'Learn the basics of successful grant writing',
      date: '2025-02-15',
      time: '2:00 PM EST',
      hostName: 'Sarah Johnson',
      hostTitle: 'Grant Writing Expert',
    },
    {
      id: '2',
      title: 'Board Governance Best Practices',
      subtitle: 'Building effective nonprofit boards',
      date: '2025-02-22',
      time: '3:00 PM EST',
      hostName: 'Michael Chen',
      hostTitle: 'Nonprofit Consultant',
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main className="mx-auto max-w-7xl px-4 py-20">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-bold">Expert Webinars</h1>
          <p className="text-xl text-gray-600">
            Learn from industry experts and connect with other nonprofit professionals
          </p>
        </div>

        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-bold">Upcoming Webinars</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {upcomingWebinars.map((webinar) => (
              <Card key={webinar.id} className="p-6 shadow-lg">
                <h3 className="mb-2 text-xl font-bold">{webinar.title}</h3>
                <p className="mb-4 text-gray-600">{webinar.subtitle}</p>
                <div className="mb-4 space-y-2 text-sm">
                  <p className="flex items-center gap-2">
                    <span className="font-semibold">Date:</span>
                    {new Date(webinar.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="font-semibold">Time:</span>
                    {webinar.time}
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="font-semibold">Host:</span>
                    {webinar.hostName}, {webinar.hostTitle}
                  </p>
                </div>
                <Link href={`/webinar/${webinar.id}`}>
                  <Button className="w-full">Register Now</Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>

        <div className="rounded-lg bg-gray-50 p-8">
          <h2 className="mb-4 text-2xl font-bold">Webinar Topics Include</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              '7-10 Steps: Formation to Funded',
              '501(c)(3) Basics',
              'Grant Writing Fundamentals',
              'Budget Creation',
              'Corporate Sponsorship',
              'Product Donation Acquisition',
              'Appeal Letters & Solicitation',
              'Program Planning Workbook',
              'Partnership Development',
              'Application Success Strategies',
              'Cover Letters & Budgets',
              'Mission Matching Matrix',
            ].map((topic) => (
              <div key={topic} className="flex items-center gap-2">
                <span className="text-brand">✓</span>
                <span>{topic}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  )
}

