import Link from 'next/link'
import { ArrowRightIcon } from '@/components/ui/icons'

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  linkText?: string
  linkHref?: string
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  linkText = 'Learn More →',
  linkHref = '#',
}: FeatureCardProps) {
  return (
    <div className="rounded-card bg-white p-8 shadow-card hover:shadow-card-hover transition-all duration-200">
      <div className="mb-4 w-12 h-12 rounded-md bg-brand flex items-center justify-center">
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-xl font-semibold mb-3 text-gray-900">{title}</h3>
      <p className="text-gray-600 mb-6 leading-relaxed">{description}</p>
      <Link
        href={linkHref as any}
        className="text-brand hover:text-brand-hover inline-flex items-center gap-1 font-medium transition-colors"
        style={{ color: '#00A150' }}
      >
        {linkText}
        {linkText.includes('→') ? null : <ArrowRightIcon className="w-4 h-4" />}
      </Link>
    </div>
  )
}
