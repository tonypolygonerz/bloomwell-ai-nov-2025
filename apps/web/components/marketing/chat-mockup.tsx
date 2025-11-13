import { PaperAirplaneIcon } from '@/components/ui/icons'

export function ChatMockup() {
  return (
    <div className="bg-white rounded-card shadow-lg w-full max-w-md mx-auto lg:mx-0 relative overflow-visible">
      {/* Live Demo Badge */}
      <div
        className="absolute top-0 right-0 px-3 py-1 rounded-lg font-bold text-sm shadow-lg transform rotate-12 translate-x-1 -translate-y-1 z-20"
        style={{ backgroundColor: '#FDC800', color: '#1E293B' }}
      >
        Live Demo
      </div>
      {/* Header */}
      <div className="bg-brand px-4 py-3 rounded-t-card flex items-center gap-3 overflow-hidden">
        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
        <span className="font-semibold text-white">Bloomwell AI Assistant</span>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#006B3C' }} />
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#006B3C' }} />
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#006B3C' }} />
        </div>
      </div>

      {/* Messages */}
      <div className="p-4 space-y-4 bg-gray-50 min-h-[400px]">
        {/* User message */}
        <div className="flex justify-end">
          <div className="max-w-[85%] px-4 py-3 rounded-2xl bg-brand text-white">
            <p className="text-sm">
              Can you help me find grants for a nonprofit focused on environmental conservation in
              California?
            </p>
          </div>
        </div>

        {/* AI response */}
        <div className="flex justify-start">
          <div className="max-w-[85%] px-4 py-3 rounded-2xl bg-white text-gray-900 shadow-sm">
            <p className="text-sm mb-3">
              Great question! Here are the key eligibility requirements for most federal grants:
            </p>
            <ol className="space-y-2 text-sm mb-3">
              <li className="flex gap-2">
                <span className="font-semibold">1.</span>
                <span>
                  <strong>501(c)(3) status</strong> - Your organization must be a registered
                  nonprofit
                </span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold">2.</span>
                <span>
                  <strong>Mission alignment</strong> - Your programs must match the grant's focus
                  area
                </span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold">3.</span>
                <span>
                  <strong>Financial capacity</strong> - Ability to manage grant funds and provide
                  matching funds if required
                </span>
              </li>
            </ol>
            <p className="text-xs text-gray-600 mt-3">
              Would you like me to check specific eligibility requirements for grants in your area?
            </p>
          </div>
        </div>
      </div>

      {/* Input (disabled/preview) */}
      <div className="p-4 bg-white rounded-b-card">
        <div className="flex items-center gap-2">
          <div className="flex-1 px-4 h-8 bg-gray-50 rounded-full flex items-center">
            <span className="text-gray-500 text-sm">
              Ask anything about grants, eligibility, or applications...
            </span>
          </div>
          <button className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <PaperAirplaneIcon className="w-5 h-5 text-gray-600 -rotate-90" />
          </button>
        </div>
        <div className="text-center mt-2">
          <span className="text-sm text-gray-700">
            Preview only <span className="text-gray-600">•</span> Sign up to start chatting
          </span>
        </div>
      </div>
    </div>
  )
}
