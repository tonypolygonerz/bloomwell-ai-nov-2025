interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
}

export function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  return (
    <div className="mb-6">
      <p className="mb-2 text-sm text-gray-700">
        Step {currentStep} of {totalSteps}
      </p>
      <div className="flex gap-2">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1
          const isActive = stepNumber <= currentStep
          return (
            <div
              key={index}
              className={`h-1 flex-1 rounded-full transition-colors ${
                isActive ? 'bg-[#1E6F5C]' : 'bg-gray-200'
              }`}
            />
          )
        })}
      </div>
    </div>
  )
}
