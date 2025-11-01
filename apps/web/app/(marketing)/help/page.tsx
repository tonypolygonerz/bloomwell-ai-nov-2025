import Link from 'next/link'
import { MarketingHeader } from '@/components/marketing/header'
import { MarketingFooter } from '@/components/marketing/footer'

export default function HelpPage() {
  const faqItems = [
    {
      question: 'How do I search for grants?',
      answer:
        'Use the search bar on your dashboard to enter keywords related to your organization or project. Our AI will match you with relevant grant opportunities.',
    },
    {
      question: 'What information do I need to provide?',
      answer:
        'We recommend completing your organization profile with details about your mission, budget, and focus areas to get the best grant matches.',
    },
    {
      question: 'How do webinars work?',
      answer:
        'We host monthly expert webinars on grant writing and nonprofit management. Register for upcoming webinars from the webinars page.',
    },
    {
      question: 'Can I track my grant applications?',
      answer:
        'Yes! Create projects in your dashboard and link them to specific grants. Track your application status and deadlines all in one place.',
    },
    {
      question: 'What if I need more help?',
      answer:
        'Contact our support team through the contact page or reach out via email. We typically respond within 24 hours.',
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main className="mx-auto max-w-4xl px-4 py-20">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-bold">Help Center</h1>
          <p className="text-xl text-gray-600">
            Find answers to common questions and get the support you need
          </p>
        </div>

        <div className="mb-12 space-y-6">
          <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
          {faqItems.map((item, index) => (
            <div key={index} className="rounded-lg border border-gray-200 p-6">
              <h3 className="mb-2 text-xl font-semibold">{item.question}</h3>
              <p className="text-gray-700">{item.answer}</p>
            </div>
          ))}
        </div>

        <div className="rounded-lg bg-gray-50 p-8">
          <h2 className="mb-4 text-2xl font-bold">Still Need Help?</h2>
          <p className="mb-6 text-gray-700">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <Link href="/contact">
            <button className="rounded-md bg-brand px-6 py-3 font-medium text-white hover:bg-brand-hover">
              Contact Support
            </button>
          </Link>
        </div>
      </main>
      <MarketingFooter />
    </div>
  )
}
