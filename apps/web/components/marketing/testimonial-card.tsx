import Link from 'next/link'
import { StarIcon, CheckIcon, ArrowRightIcon } from '@/components/ui/icons'

interface TestimonialCardProps {
  quote: string
  author: string
  role: string
  organization: string
  rating: number
  initials: string
}

export function TestimonialCard({
  quote,
  author,
  role,
  organization,
  rating,
  initials,
}: TestimonialCardProps) {
  return (
    <div className="rounded-card bg-white p-6 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col h-full">
      <div className="flex gap-0.5 mb-4">
        {[...Array(5)].map((_, i) => (
          <StarIcon key={i} className="w-5 h-5 text-yellow-400" filled={i < rating} />
        ))}
      </div>

      <p className="text-gray-700 mb-6 leading-relaxed flex-grow">"{quote}"</p>

      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center flex-shrink-0">
          <span className="text-brand font-semibold text-lg">{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-gray-900 truncate">{author}</p>
            <CheckIcon className="w-4 h-4 text-brand flex-shrink-0" />
          </div>
          <p className="text-sm text-gray-600 truncate">{role}</p>
          <p className="text-sm text-gray-600 truncate">{organization}</p>
        </div>
      </div>

      <Link
        href="#"
        className="text-brand hover:text-brand-hover inline-flex items-center gap-1 font-medium text-sm transition-colors"
      >
        View More <ArrowRightIcon className="w-3 h-3" />
      </Link>
    </div>
  )
}




