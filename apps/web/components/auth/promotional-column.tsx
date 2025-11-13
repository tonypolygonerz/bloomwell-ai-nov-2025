import { DollarSign, Sparkles, Clock, Users, Check } from 'lucide-react'

export function PromotionalColumn() {
  const features = [
    {
      icon: DollarSign,
      title: '1,200+ Grant Opportunities',
      description: 'Access federal and state grants worth billions in funding.',
    },
    {
      icon: Sparkles,
      title: 'AI-Powered Matching',
      description: 'Get personalized grant recommendations based on your mission.',
    },
    {
      icon: Clock,
      title: 'Save Hours Every Week',
      description: 'Let AI handle research while you focus on writing proposals.',
    },
    {
      icon: Users,
      title: 'Built for Nonprofits',
      description: 'Designed specifically for organizations under $3M budget.',
    },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-[#1E6F5C] px-12 py-10 text-white lg:px-16">
      {/* Logo and Brand Name */}
      <div className="mb-12 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white/20">
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M7.5 1.5L4 8H7V12.5L11 6H7.5V1.5Z" fill="white" />
          </svg>
        </div>
        <span className="text-xl font-bold">Bloomwell AI</span>
      </div>

      {/* Main Heading */}
      <h1 className="mb-4 text-[48px] font-bold leading-tight lg:text-[56px]">
        Start your 14-day free trial
      </h1>

      {/* Description */}
      <p className="mb-12 text-lg text-white/90 leading-relaxed">
        Join thousands of nonprofits discovering funding opportunities with AI-powered grant
        matching.
      </p>

      {/* Feature Cards */}
      <div className="mb-12 space-y-6">
        {features.map((feature, index) => {
          const Icon = feature.icon
          return (
            <div key={index} className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#4CAF50]">
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="mb-1 text-xl font-bold">{feature.title}</h3>
                <p className="text-base text-white/90">{feature.description}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Testimonial Box */}
      <div className="mb-12 rounded-lg bg-[#4CAF50]/30 p-6 backdrop-blur-sm">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex -space-x-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-8 w-8 rounded-full bg-[#4CAF50] border-2 border-[#4CAF50]"
              />
            ))}
          </div>
          <span className="text-sm font-bold text-white">2,000+ nonprofits</span>
        </div>
        <blockquote className="mb-3 text-base text-white/90 leading-relaxed">
          &quot;Bloomwell AI helped us discover $500K in grants we didn&apos;t know existed. The AI
          assistant feels like having a dedicated grant researcher.&quot;
        </blockquote>
        <p className="text-sm text-white/90">— Sarah M., Executive Director</p>
      </div>

      {/* Footer Badges */}
      <div className="mt-auto flex flex-wrap gap-6">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#4CAF50]">
            <Check className="h-3 w-3 text-white" />
          </div>
          <span className="text-sm text-white/90">No credit card required</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#4CAF50]">
            <Check className="h-3 w-3 text-white" />
          </div>
          <span className="text-sm text-white/90">Cancel anytime</span>
        </div>
      </div>
    </div>
  )
}
