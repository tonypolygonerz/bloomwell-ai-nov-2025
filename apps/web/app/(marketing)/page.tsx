'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MarketingHeader } from '@/components/marketing/header'
import { MarketingFooter } from '@/components/marketing/footer'
import { FeatureCard } from '@/components/marketing/feature-card'
import { TestimonialCard } from '@/components/marketing/testimonial-card'
import { ChatMockup } from '@/components/marketing/chat-mockup'
import { BillingToggle } from '@/components/pricing/billing-toggle'
import {
  CheckIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  CurrencyDollarIcon,
} from '@/components/ui/icons'
import {
  heroContent,
  featuresSection,
  databaseSection,
  aiChatSection,
  testimonialsSection,
  finalStats,
  additionalFeatures,
} from '@/lib/marketing-content'
import { pricingPlans, comparisonTable, pricingDisplay } from '@/lib/pricing-data'

export default function HomePage() {
  const [bloomwellBillingCycle, setBloomwellBillingCycle] = useState<'monthly' | 'annual'>(
    'monthly',
  )
  const [enterpriseBillingCycle, setEnterpriseBillingCycle] = useState<'monthly' | 'annual'>(
    'monthly',
  )
  const featuredPlan = pricingPlans.find((p) => p.id === 'enterprise-monthly')!

  return (
    <>
      <MarketingHeader />

      <main>
        {/* Hero Section */}
        <section className="py-16 md:py-24" style={{ backgroundColor: '#F6FEF9' }}>
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                {heroContent.headline}{' '}
                <span className="text-brand">{heroContent.headlineHighlight}</span>
              </h1>

              <p className="text-xl md:text-2xl mb-12" style={{ color: '#1E293B' }}>
                Access{' '}
                <span className="font-semibold" style={{ color: '#00A150' }}>
                  73,000+ federal grants
                </span>{' '}
                instantly. Get expert AI assistance for just{' '}
                <span className="font-semibold" style={{ color: '#00A150' }}>
                  $29.99/month.
                </span>
              </p>

              {/* Large Green CTA Box */}
              <div className="rounded-card bg-brand p-8 md:p-10 text-white mb-8 shadow-xl">
                <p className="text-lg md:text-xl mb-6 leading-relaxed">
                  {heroContent.ctaDescription}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                  <Link href="/register">
                    <button className="inline-flex items-center justify-center gap-2 bg-white text-brand px-8 py-4 rounded-button font-semibold text-lg hover:bg-gray-50 transition-colors">
                      {heroContent.primaryCTA}
                      <ArrowRightIcon className="w-5 h-5" />
                    </button>
                  </Link>
                  <Link href="#features">
                    <button className="inline-flex items-center justify-center gap-2 border-2 border-white text-white px-8 py-4 rounded-button font-semibold text-lg hover:bg-white/10 transition-colors">
                      {heroContent.secondaryCTA}
                      <ChevronDownIcon className="w-5 h-5" />
                    </button>
                  </Link>
                </div>

                {/* Badge Row */}
                <div className="flex flex-wrap justify-center gap-6 text-sm">
                  {heroContent.badges.map((badge, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckIcon className="w-4 h-4" />
                      <span>{badge.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-gray-600">{heroContent.socialProof}</p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {featuresSection.headline}
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {featuresSection.subheadline}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-8">
              {featuresSection.features.map((feature, i) => (
                <FeatureCard key={i} {...feature} />
              ))}
            </div>

            <p className="text-center text-gray-600 mb-8">{featuresSection.bottomText}</p>

            <div className="text-center">
              <Link href="/register">
                <button className="bg-brand hover:bg-brand-hover text-white px-8 py-4 rounded-button font-semibold text-lg transition-colors">
                  {featuresSection.cta}
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Database Section */}
        <section className="py-20 bg-brand text-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{databaseSection.headline}</h2>
              <p className="text-xl opacity-90 max-w-3xl mx-auto">{databaseSection.subheadline}</p>
            </div>

            <div className="max-w-4xl mx-auto rounded-card bg-white text-gray-900 p-8 md:p-12 shadow-2xl">
              <div className="text-center mb-8">
                <div className="text-6xl md:text-7xl font-bold text-brand mb-2">
                  {databaseSection.statNumber}
                </div>
                <div className="text-xl text-gray-600 mb-4">{databaseSection.statLabel}</div>
                <div className="inline-flex items-center gap-2 bg-brand/10 text-brand px-4 py-2 rounded-full text-sm font-medium">
                  <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />
                  {databaseSection.statBadge}
                </div>
              </div>

              <p className="text-gray-600 leading-relaxed mb-8 text-center max-w-2xl mx-auto">
                {databaseSection.description}
              </p>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {databaseSection.features.map((feature, i) => (
                  <div key={i} className="text-center p-4 rounded-lg bg-gray-50">
                    <div className="text-2xl font-bold text-brand mb-1">{feature.value}</div>
                    <div className="text-sm text-gray-600">{feature.label}</div>
                  </div>
                ))}
              </div>

              <div className="text-center mb-8">
                <Link href="/register">
                  <button className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-white px-8 py-4 rounded-button font-semibold transition-colors">
                    <MagnifyingGlassIcon className="w-5 h-5" />
                    {databaseSection.cta}
                  </button>
                </Link>
              </div>

              <div className="flex flex-wrap justify-center gap-6 text-sm">
                {databaseSection.verifications.map((verification, i) => (
                  <div key={i} className="flex items-center gap-2 text-gray-600">
                    <div className="w-6 h-6 rounded-full bg-brand flex items-center justify-center flex-shrink-0">
                      <CheckIcon className="w-4 h-4 text-white" />
                    </div>
                    <span>{verification}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* AI Chat Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
              {/* Left: Content */}
              <div>
                <div className="inline-block bg-brand/10 text-brand px-3 py-1 rounded-full text-sm font-semibold mb-4">
                  {aiChatSection.label}
                </div>

                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  {aiChatSection.headline}
                </h2>

                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  {aiChatSection.description}
                </p>

                <ul className="space-y-4 mb-8">
                  {aiChatSection.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckIcon className="w-5 h-5 text-brand flex-shrink-0 mt-1" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <p className="text-sm text-gray-600 mb-4">{aiChatSection.poweredBy}</p>

                {aiChatSection.technologies && aiChatSection.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-8">
                    {aiChatSection.technologies.map((tech: { name: string }, i: number) => (
                      <span
                        key={i}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-button text-sm font-medium text-gray-700"
                      >
                        {tech.name}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-4">
                  <Link href="/register">
                    <button className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-white px-6 py-3 rounded-button font-semibold transition-colors">
                      {aiChatSection.cta}
                      <ArrowRightIcon className="w-4 h-4" />
                    </button>
                  </Link>
                  <Link href="#">
                    <button className="px-6 py-3 border-2 border-brand text-brand rounded-button font-semibold hover:bg-brand/5 transition-colors">
                      {aiChatSection.secondaryCTA}
                    </button>
                  </Link>
                </div>
              </div>

              {/* Right: Chat Mockup */}
              <div>
                <ChatMockup />
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {testimonialsSection.headline}
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {testimonialsSection.subheadline}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
              {testimonialsSection.testimonials.map((testimonial, i) => (
                <TestimonialCard key={i} {...testimonial} />
              ))}
            </div>

            {/* Stats Bar */}
            <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 p-8 rounded-card bg-gray-50">
              {testimonialsSection.stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-brand mb-2">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {pricingDisplay.headline}
              </h2>
              <p className="text-xl text-gray-600">{pricingDisplay.subheadline}</p>
            </div>

            {/* Featured comparison: Enterprise Monthly vs Competitors */}
            <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto mb-16">
              {/* Left: Featured pricing card */}
              <div className="rounded-card bg-brand p-8 text-white relative overflow-hidden shadow-xl">
                <div className="absolute top-6 right-6">
                  <span className="bg-white text-brand px-3 py-1 rounded-full text-sm font-bold">
                    {featuredPlan.badge}
                  </span>
                </div>

                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-4">{featuredPlan.name}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl md:text-6xl font-bold">{featuredPlan.price}</span>
                    <span className="text-xl opacity-90">{featuredPlan.period}</span>
                  </div>
                  <p className="mt-2 text-lg opacity-90">Save $200+ with annual billing</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {featuredPlan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/register">
                  <button className="w-full bg-white text-brand font-bold py-4 rounded-button hover:bg-gray-50 transition-colors mb-6 text-lg">
                    {featuredPlan.cta}
                  </button>
                </Link>

                <div className="text-center space-y-2 text-sm opacity-90">
                  {featuredPlan.subtext.map((text, i) => (
                    <p key={i}>{text}</p>
                  ))}
                </div>
              </div>

              {/* Right: Comparison table */}
              <div className="rounded-card bg-white p-8 shadow-card">
                <h3 className="text-2xl font-bold mb-3">{comparisonTable.title}</h3>
                <p className="text-gray-600 mb-8 leading-relaxed">{comparisonTable.subtitle}</p>

                <div className="overflow-x-auto mb-8">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-3 pr-4 font-semibold">Solution</th>
                        {comparisonTable.columns.map((col, i) => (
                          <th
                            key={i}
                            className={`text-left py-3 px-2 font-semibold ${
                              col.highlight ? 'text-brand' : 'text-gray-700'
                            }`}
                          >
                            {col.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 pr-4 font-medium text-gray-700">Monthly Cost</td>
                        {comparisonTable.columns.map((col, i) => (
                          <td
                            key={i}
                            className={`py-3 px-2 ${
                              col.highlight ? 'text-brand font-bold' : 'text-gray-600'
                            }`}
                          >
                            {col.price}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="rounded-lg bg-brand/10 p-6 flex items-center gap-4">
                  <CurrencyDollarIcon className="w-10 h-10 text-brand flex-shrink-0" />
                  <div>
                    <div className="text-sm text-gray-700 mb-1">
                      Save {comparisonTable.savings.amount} {comparisonTable.savings.period}
                    </div>
                    <div className="font-semibold text-gray-900">
                      {comparisonTable.savings.description}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* All Plans Grid - 2 Modules with Toggles */}
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Choose the plan that fits your nonprofit
                </h3>
                <p className="text-gray-600">
                  All plans include 14-day free trial and can be cancelled anytime
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Module 1: Bloomwell AI (Monthly/Annual Toggle) */}
                <div className="rounded-card bg-white p-8 shadow-card relative">
                  <div className="absolute top-6 right-6">
                    <BillingToggle
                      isAnnual={bloomwellBillingCycle === 'annual'}
                      onToggle={(annual) => setBloomwellBillingCycle(annual ? 'annual' : 'monthly')}
                    />
                  </div>

                  {(() => {
                    const currentPlan =
                      bloomwellBillingCycle === 'annual'
                        ? pricingPlans.find((p) => p.id === 'annual')!
                        : pricingPlans.find((p) => p.id === 'monthly')!

                    return (
                      <div className="mt-8">
                        {currentPlan.badge && (
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 bg-brand/10 text-brand">
                            {currentPlan.badge}
                          </span>
                        )}

                        <h4 className="text-2xl font-bold mb-3">{currentPlan.name}</h4>
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className="text-4xl font-bold text-gray-900">
                            {currentPlan.price}
                          </span>
                          <span className="text-lg text-gray-600">{currentPlan.period}</span>
                        </div>
                        {currentPlan.pricePerMonth && (
                          <p className="text-sm text-gray-600 mb-6">{currentPlan.pricePerMonth}</p>
                        )}

                        <ul className="space-y-3 mb-8">
                          {currentPlan.features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <CheckIcon className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700">{feature}</span>
                            </li>
                          ))}
                        </ul>

                        <Link href="/register">
                          <button className="w-full bg-brand hover:bg-brand-hover text-white py-4 rounded-button font-semibold transition-colors mb-4">
                            {currentPlan.cta}
                          </button>
                        </Link>

                        <div className="text-center space-y-1 text-sm text-gray-600">
                          {currentPlan.subtext.map((text, i) => (
                            <p key={i}>{text}</p>
                          ))}
                        </div>
                      </div>
                    )
                  })()}
                </div>

                {/* Module 2: Bloomwell AI Enterprise (Monthly/Annual Toggle) */}
                <div className="rounded-card bg-white p-8 shadow-card relative">
                  <div className="absolute top-6 right-6">
                    <BillingToggle
                      isAnnual={enterpriseBillingCycle === 'annual'}
                      onToggle={(annual) =>
                        setEnterpriseBillingCycle(annual ? 'annual' : 'monthly')
                      }
                    />
                  </div>

                  {(() => {
                    const currentPlan =
                      enterpriseBillingCycle === 'annual'
                        ? pricingPlans.find((p) => p.id === 'enterprise-annual')!
                        : pricingPlans.find((p) => p.id === 'enterprise-monthly')!

                    return (
                      <div className="mt-8">
                        {currentPlan.badge && (
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 ${
                              currentPlan.badge === 'MOST POPULAR'
                                ? 'bg-brand text-white'
                                : 'bg-brand/10 text-brand'
                            }`}
                          >
                            {currentPlan.badge}
                          </span>
                        )}

                        <h4 className="text-2xl font-bold mb-3">{currentPlan.name}</h4>
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className="text-4xl font-bold text-gray-900">
                            {currentPlan.price}
                          </span>
                          <span className="text-lg text-gray-600">{currentPlan.period}</span>
                        </div>
                        {currentPlan.pricePerMonth && (
                          <p className="text-sm text-gray-600 mb-6">{currentPlan.pricePerMonth}</p>
                        )}

                        <ul className="space-y-3 mb-8">
                          {currentPlan.features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <CheckIcon className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700">{feature}</span>
                            </li>
                          ))}
                        </ul>

                        <Link href="/register">
                          <button
                            className={`w-full py-4 rounded-button font-semibold transition-colors mb-4 ${
                              currentPlan.badge === 'MOST POPULAR'
                                ? 'bg-brand text-white hover:bg-brand-hover'
                                : 'bg-brand text-white hover:bg-brand-hover'
                            }`}
                          >
                            {currentPlan.cta}
                          </button>
                        </Link>

                        <div className="text-center space-y-1 text-sm text-gray-600">
                          {currentPlan.subtext.map((text, i) => (
                            <p key={i}>{text}</p>
                          ))}
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Additional Features */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto space-y-12">
              {additionalFeatures.map((feature, i) => (
                <div key={i} className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <Link
                    href="#"
                    className="text-brand hover:text-brand-hover inline-flex items-center gap-1 font-semibold transition-colors"
                  >
                    {feature.cta} <ArrowRightIcon className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>

            {/* Final Stats */}
            <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 mt-16 mb-12">
              {finalStats.map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-4xl font-bold text-brand mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Trusted by Nonprofits Nationwide
              </h3>
              <p className="text-gray-600 mb-8">
                Join hundreds of organizations finding funding faster
              </p>
              <Link href="/register">
                <button className="bg-brand hover:bg-brand-hover text-white px-8 py-4 rounded-button font-bold text-lg transition-colors">
                  Get Started Today
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </>
  )
}
