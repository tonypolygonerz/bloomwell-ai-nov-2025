import { MarketingHeader } from '@/components/marketing/header'
import { MarketingFooter } from '@/components/marketing/footer'

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main className="mx-auto max-w-4xl px-4 py-20">
        <div className="mb-12">
          <h1 className="mb-4 text-5xl font-bold">Terms of Service</h1>
          <p className="text-sm text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="space-y-8 text-gray-700">
          <section>
            <h2 className="mb-4 text-2xl font-bold">Agreement to Terms</h2>
            <p>
              By accessing or using Bloomwell AI, you agree to be bound by these Terms of Service
              and all applicable laws and regulations. If you do not agree with any of these terms,
              you are prohibited from using our service.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold">Use License</h2>
            <p className="mb-2">
              Permission is granted to use Bloomwell AI for nonprofit purposes.
            </p>
            <p className="mb-2">Under this license you may not:</p>
            <ul className="ml-6 list-disc space-y-1">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose beyond nonprofit grant discovery</li>
              <li>Attempt to reverse engineer any software contained in Bloomwell AI</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold">User Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials
              and for all activities that occur under your account. You agree to notify us
              immediately of any unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold">Service Availability</h2>
            <p>
              We strive to provide reliable service but do not guarantee that our service will be
              available at all times. We reserve the right to modify or discontinue the service at
              any time.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold">Contact Us</h2>
            <p>
              If you have questions about these Terms of Service, please contact us at{' '}
              <a href="/contact" className="text-brand hover:underline">
                our contact page
              </a>
              .
            </p>
          </section>
        </div>
      </main>
      <MarketingFooter />
    </div>
  )
}
