'use client'

interface BillingToggleProps {
  isAnnual: boolean
  onToggle: (isAnnual: boolean) => void
}

export function BillingToggle({ isAnnual, onToggle }: BillingToggleProps) {
  return (
    <div className="flex items-center gap-2">
      <span className={`text-xs font-semibold ${!isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
        Monthly
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={isAnnual}
        onClick={() => onToggle(!isAnnual)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 ${
          isAnnual ? 'bg-brand' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isAnnual ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      <span className={`text-xs font-semibold ${isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
        Yearly
      </span>
    </div>
  )
}

