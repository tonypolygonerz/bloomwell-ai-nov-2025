'use client'

export function PromotionalColumn() {
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
            <g fill="white">
              <ellipse cx="7" cy="3.5" rx="1.2" ry="2" />
              <ellipse cx="10.1" cy="5.1" rx="1.2" ry="2" transform="rotate(72 7 7)" />
              <ellipse cx="10.1" cy="8.9" rx="1.2" ry="2" transform="rotate(144 7 7)" />
              <ellipse cx="7" cy="10.5" rx="1.2" ry="2" transform="rotate(216 7 7)" />
              <ellipse cx="3.9" cy="8.9" rx="1.2" ry="2" transform="rotate(288 7 7)" />
              <circle cx="7" cy="7" r="1.2" />
            </g>
          </svg>
        </div>
        <span className="text-xl font-bold">Bloomwell AI</span>
      </div>

      {/* Main Heading */}
      <h1 className="mb-4 text-[48px] font-bold leading-tight lg:text-[56px]">
        Start your 14-day free trial
      </h1>

      {/* Subheading */}
      <p className="mb-12 text-lg text-white/90">
        Join hundreds of nonprofits using AI to discover grants faster and secure more funding.
      </p>

      {/* Feature List */}
      <div className="mb-12 space-y-4">
        {[
          'Access 73,000+ federal grants',
          'AI-powered grant matching',
          'Expert guidance and support',
          'Cancel anytime',
        ].map((feature, index) => (
          <div key={index} className="flex items-center gap-3">
            <svg
              className="h-5 w-5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-lg">{feature}</span>
          </div>
        ))}
      </div>

      {/* Testimonial */}
      <div className="mt-auto">
        <blockquote className="mb-4 text-xl italic text-white/90">
          &quot;We found three perfect grant opportunities in our first week. This tool is a game-changer.&quot;
        </blockquote>
        <p className="text-sm text-white/70">— Michael Chen, Executive Director</p>
      </div>
    </div>
  )
}
