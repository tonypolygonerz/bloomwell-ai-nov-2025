import { MarketingHeader } from '@/components/marketing/header'
import { MarketingFooter } from '@/components/marketing/footer'

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main className="mx-auto max-w-4xl px-4 py-20">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-bold">About Bloomwell AI</h1>
          <p className="text-xl text-gray-600">
            Empowering nonprofits with AI-driven grant discovery and management
          </p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="mb-4 text-3xl font-bold">Our Mission</h2>
            <p className="text-lg text-gray-700">
              At Bloomwell AI, we believe that every nonprofit deserves access to the funding they
              need to make a difference. Our mission is to democratize grant discovery by making it
              faster, easier, and more accessible for organizations of all sizes.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-3xl font-bold">What We Do</h2>
            <p className="mb-4 text-lg text-gray-700">
              We provide AI-powered tools that help nonprofits find, match, and secure grants more
              efficiently. Our platform combines cutting-edge technology with expert guidance to
              help you navigate the complex world of grant funding.
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-brand">✓</span>
                <span>Access to 73,000+ federal grants database</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand">✓</span>
                <span>AI-powered grant matching and recommendations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand">✓</span>
                <span>Expert webinars and guidance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand">✓</span>
                <span>Project management and application tracking</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-3xl font-bold">Our Values</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-2 font-semibold">Accessibility</h3>
                <p className="text-gray-600">
                  We believe grant discovery should be affordable and accessible to all nonprofits,
                  regardless of size or budget.
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold">Innovation</h3>
                <p className="text-gray-600">
                  We leverage the latest AI technology to simplify complex grant processes and save
                  you time.
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold">Support</h3>
                <p className="text-gray-600">
                  We're committed to your success with expert guidance, resources, and dedicated
                  support.
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold">Impact</h3>
                <p className="text-gray-600">
                  We measure our success by the positive impact our users make in their communities.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
      <MarketingFooter />
    </div>
  )
}
