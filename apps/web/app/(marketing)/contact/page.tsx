import { MarketingHeader } from '@/components/marketing/header'
import { MarketingFooter } from '@/components/marketing/footer'
import { Card } from '@bloomwell/ui'

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main className="mx-auto max-w-4xl px-4 py-20">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-bold">Contact Us</h1>
          <p className="text-xl text-gray-600">Have questions? We'd love to hear from you</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <Card className="p-6">
            <h2 className="mb-4 text-2xl font-bold">Get in Touch</h2>
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="mb-1 block text-sm font-medium">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand focus:outline-none"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand focus:outline-none"
                  required
                />
              </div>
              <div>
                <label htmlFor="message" className="mb-1 block text-sm font-medium">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-brand focus:outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-md bg-brand px-6 py-3 font-medium text-white hover:bg-brand-hover"
              >
                Send Message
              </button>
            </form>
          </Card>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="mb-2 text-xl font-semibold">Support</h3>
              <p className="text-gray-700">
                For technical support or account questions, email us at support@bloomwell-ai.com
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="mb-2 text-xl font-semibold">General Inquiries</h3>
              <p className="text-gray-700">
                For general questions, partnerships, or media inquiries, contact us at
                info@bloomwell-ai.com
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="mb-2 text-xl font-semibold">Response Time</h3>
              <p className="text-gray-700">
                We typically respond to all inquiries within 24 hours during business days.
              </p>
            </Card>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  )
}
