import Link from 'next/link'
import { Button, Card } from '@bloomwell/ui'
import { MarketingHeader } from '@/components/marketing/header'
import { MarketingFooter } from '@/components/marketing/footer'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main>
        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-4 py-20 text-center">
          <h1 className="mb-4 text-5xl font-bold">
            <span className="text-black">AI-Powered Grant Discovery</span>{' '}
            <span className="text-brand">for Nonprofits</span>
          </h1>
          <p className="mb-8 text-xl text-gray-600">
            Access <span className="font-bold">73,000+ federal grants</span> instantly. Get expert
            AI assistance for just <span className="font-bold">$29.99/month</span>.
          </p>
          <div className="mx-auto max-w-2xl rounded-lg bg-brand p-8 text-white">
            <p className="mb-6 text-lg">
              Stop spending hours searching for grants. Our AI assistant finds the perfect funding
              opportunities for your mission in minutes—not days.
            </p>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/register">
                <button className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-6 py-3 font-semibold text-brand transition-colors hover:bg-gray-100">
                  Start Your 14-Day Free Trial
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6 12L10 8L6 4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </Link>
              <Link href="#features">
                <button className="inline-flex items-center justify-center gap-2 rounded-md border-2 border-white bg-transparent px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10">
                  View Features
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4 6L8 10L12 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </Link>
            </div>
            {/* Feature Highlights */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13.3333 4L6 11.3333L2.66667 8"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13.3333 4L6 11.3333L2.66667 8"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13.3333 4L6 11.3333L2.66667 8"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
          <p className="mt-6 text-gray-600">
            Join <span className="font-bold">500+ nonprofits</span> already using Bloomwell AI to
            secure funding
          </p>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-gray-50 py-20">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-4xl font-bold">Everything Your Nonprofit Needs</h2>
              <p className="text-lg text-gray-600">
                Comprehensive tools and resources to help you find and secure funding
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <Card className="p-6 shadow-lg">
                {/* Documents/Stack Icon */}
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-md bg-brand">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M14 2V8H20"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M16 13H8"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M16 17H8"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10 9H8"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-bold">73,000+ Federal Grants</h3>
                <p className="mb-4 text-gray-600">
                  Access our comprehensive database with thousands of grant opportunities. Search,
                  filter, and discover funding that matches your nonprofit's mission and needs.
                </p>
                <Link href="/register" className="inline-flex items-center gap-1 text-brand hover:underline">
                  Learn more
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6 12L10 8L6 4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              </Card>
              <Card className="p-6 shadow-lg">
                {/* Lightbulb Icon */}
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-md bg-brand">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 3C10.34 3 9 4.34 9 6C9 7.66 10.34 9 12 9C13.66 9 15 7.66 15 6C15 4.34 13.66 3 12 3Z"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 9V13"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 13C10.5 13 9.5 14 9.5 15.5V17.5H14.5V15.5C14.5 14 13.5 13 12 13Z"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8 17.5H16"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9.5 19.5H14.5"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-bold">Expert AI Assistant</h3>
                <p className="mb-4 text-gray-600">
                  Get instant expert answers to your grant writing questions. Our AI assistant
                  provides personalized guidance, tips, and strategies 24/7 to help you succeed.
                </p>
                <Link href="/register" className="inline-flex items-center gap-1 text-brand hover:underline">
                  Learn more
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6 12L10 8L6 4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              </Card>
              <Card className="p-6 shadow-lg">
                {/* Video Camera Icon */}
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-md bg-brand">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15 10L19.553 7.276C19.8344 7.10747 20.1656 7.10747 20.447 7.276L23 8.618C23.3883 8.83681 23.6452 9.22869 23.6907 9.66814C23.7361 10.1076 23.5646 10.5376 23.224 10.832L15 17V10Z"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M4 18H14C14.5304 18 15.0391 17.7893 15.4142 17.4142C15.7893 17.0391 16 16.5304 16 16V8C16 7.46957 15.7893 6.96086 15.4142 6.58579C15.0391 6.21071 14.5304 6 14 6H4C3.46957 6 2.96086 6.21071 2.58579 6.58579C2.21071 6.96086 2 7.46957 2 8V16C2 16.5304 2.21071 17.0391 2.58579 17.4142C2.96086 17.7893 3.46957 18 4 18Z"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-bold">Live Expert Webinars</h3>
                <p className="mb-4 text-gray-600">
                  Join monthly live webinars with nonprofit experts. Learn best practices, get your
                  questions answered in real-time, and network with other nonprofit professionals.
                </p>
                <Link href="/register" className="inline-flex items-center gap-1 text-brand hover:underline">
                  Learn more
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6 12L10 8L6 4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              </Card>
            </div>
            <div className="mt-12 text-center">
              <p className="mb-6 text-lg text-gray-600">
                Plus dozens more features to help you save time and secure more funding
              </p>
              <Link href="/register">
                <Button>Start Your Free Trial Today</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Comprehensive Grant Database Section */}
        <section className="relative bg-brand py-20 text-white">
          {/* Background Pattern */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M9 0H11V9H20V11H11V20H9V11H0V9H9V0Z' fill='%23DCFCE7'/%3E%3C/svg%3E")`,
            }}
          />
          <div className="relative z-10 mx-auto max-w-7xl px-4 text-center">
            <h2 className="mb-4 text-4xl font-bold md:text-5xl">
              Comprehensive Grant Database
            </h2>
            <p className="mx-auto mb-12 max-w-3xl text-lg md:text-xl">
              Access the most complete and up-to-date federal grant database, intelligently
              categorized by our AI for your nonprofit's success
            </p>

            {/* White Card */}
            <Card className="mx-auto max-w-4xl bg-white p-8 text-center shadow-xl">
              {/* Main Statistic */}
              <div className="mb-6">
                <p className="text-6xl font-bold text-brand md:text-7xl">6,622</p>
                <p className="mt-2 text-xl text-gray-700">grants and counting</p>
                {/* Updated Daily Indicator */}
                <div className="mt-4 flex items-center justify-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#DCFCE7]"></div>
                  <span className="text-sm text-[#86EFAC]">Updated daily</span>
                </div>
              </div>

              {/* Descriptive Paragraph */}
              <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-700">
                Our comprehensive database includes federal, state, and foundation grants—all
                expertly organized and searchable with advanced AI-powered filters to match your
                nonprofit's unique mission and funding needs.
              </p>

              {/* Three Column Stats */}
              <div className="mb-10 grid gap-8 md:grid-cols-3">
                <div>
                  <p className="text-4xl font-bold text-brand">73,000+</p>
                  <p className="mt-2 text-gray-700">Total Opportunities</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-brand">Daily</p>
                  <p className="mt-2 text-gray-700">Database Updates</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-brand">AI-Powered</p>
                  <p className="mt-2 text-gray-700">Smart Matching</p>
                </div>
              </div>

              {/* Search Button */}
              <Link href="/register" className="inline-block">
                <button className="inline-flex items-center gap-2 rounded-md bg-brand px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-hover">
                  Search Grants Now
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </Link>

              {/* Verification Points */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13.3333 4L6 11.3333L2.66667 8"
                      stroke="#22C55E"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Verified Sources</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13.3333 4L6 11.3333L2.66667 8"
                      stroke="#22C55E"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Real-Time Alerts</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13.3333 4L6 11.3333L2.66667 8"
                      stroke="#22C55E"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Expert Curation</span>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  )
}

