import { MarketingHeader } from '@/components/marketing/header'
import { MarketingFooter } from '@/components/marketing/footer'

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main className="mx-auto max-w-4xl px-4 py-20">
        <div className="mb-12">
          <h1 className="mb-4 text-5xl font-bold">Privacy Policy</h1>
          <p className="text-sm text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="space-y-8 text-gray-700">
          <section>
            <h2 className="mb-4 text-2xl font-bold">Introduction</h2>
            <p>
              At Bloomwell AI, we take your privacy seriously. This Privacy Policy explains how we
              collect, use, disclose, and safeguard your information when you use our service.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold">Information We Collect</h2>
            <p className="mb-2">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="ml-6 list-disc space-y-1">
              <li>Account information (name, email, organization details)</li>
              <li>Grant search queries and preferences</li>
              <li>Project and application data</li>
              <li>Communication preferences</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold">How We Use Your Information</h2>
            <p className="mb-2">We use the information we collect to:</p>
            <ul className="ml-6 list-disc space-y-1">
              <li>Provide, maintain, and improve our services</li>
              <li>Personalize your grant matching experience</li>
              <li>Send you relevant grant opportunities and updates</li>
              <li>Respond to your inquiries and provide customer support</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold">Data Security</h2>
            <p>
              We implement appropriate technical and organizational security measures to protect
              your personal information against unauthorized access, alteration, disclosure, or
              destruction.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold">Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at{' '}
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
