import { Target, LayoutDashboard, Search, Sparkles } from 'lucide-react'

export function LoginPromotionalColumn() {
  const features = [
    {
      icon: Target,
      title: 'Pick up where you left off',
      description: 'Access your personalized grant recommendations and saved opportunities',
    },
    {
      icon: LayoutDashboard,
      title: 'Your Dashboard Awaits',
      description: 'Review application progress, track deadlines, and manage your funding pipeline',
    },
    {
      icon: Search,
      title: 'New Grants Added Daily',
      description: 'Fresh federal and state opportunities matched to your mission since your last visit',
    },
    {
      icon: Sparkles,
      title: 'Recent Platform Updates',
      description: 'Enhanced AI matching algorithms and improved proposal guidance tools',
    },
  ]

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
            <path d="M7.5 1.5L4 8H7V12.5L11 6H7.5V1.5Z" fill="white" />
          </svg>
        </div>
        <span className="text-xl font-bold">Bloomwell AI</span>
      </div>

      {/* Feature Cards */}
      <div className="mb-12 space-y-6">
        {features.map((feature, index) => {
          const Icon = feature.icon
          return (
            <div key={index} className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20">
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="mb-1 text-lg font-bold">{feature.title}</h3>
                <p className="text-white/90">{feature.description}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Testimonial Box */}
      <div className="mb-12 rounded-lg bg-white/10 p-6 backdrop-blur-sm">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex -space-x-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-8 w-8 rounded-full bg-white/20 border-2 border-white/20"
              />
            ))}
          </div>
          <span className="text-sm text-white/80">2,000+ nonprofits</span>
        </div>
        <blockquote className="mb-3 text-white/90 italic">
          &quot;Logging into Bloomwell AI has become part of our weekly routine. The personalized
          dashboard keeps our entire team aligned on funding priorities.&quot;
        </blockquote>
        <p className="text-sm text-white/80">— Marcus T., Development Director</p>
      </div>
    </div>
  )
}

