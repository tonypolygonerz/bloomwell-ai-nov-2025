'use client'

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'AI-Powered Grant Discovery',
    description: 'Find grants that match your mission in seconds',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Save Hours Every Week',
    description: 'Stop manually searching through thousands of grants',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Expert Guidance',
    description: 'Get personalized recommendations from our AI assistant',
  },
]

export function LoginPromotionalColumn() {
  return (
    <div className="flex min-h-screen flex-col bg-[#16A34A] px-12 py-10 text-white lg:px-16">
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

      {/* Feature Cards */}
      <div className="mb-12 space-y-6">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start gap-4">
            <div className="flex-shrink-0 rounded-lg bg-white/10 p-3">{feature.icon}</div>
            <div>
              <h3 className="mb-1 text-lg font-semibold">{feature.title}</h3>
              <p className="text-sm text-white/80">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Testimonial or Additional Content */}
      <div className="mt-auto">
        <blockquote className="text-lg italic text-white/90">
          &quot;Bloomwell AI helped us find grants we never would have discovered on our own.&quot;
        </blockquote>
        <p className="mt-4 text-sm text-white/70">— Sarah Johnson, Nonprofit Director</p>
      </div>
    </div>
  )
}
