'use client'

import { cn } from '@/lib/utils'

export interface NextEventsWidgetProps {
  events: {
    id: string
    title: string
    date: Date
    thumbnail?: string
    host?: string
  }[]
  isLoading: boolean
  onViewAll?: () => void
  className?: string
}

function CalendarIcon({ className = 'w-12 h-12' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  )
}

function formatDate(date: Date): string {
  const now = new Date()
  const eventDate = new Date(date)
  const diffTime = eventDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return 'Today'
  } else if (diffDays === 1) {
    return 'Tomorrow'
  } else if (diffDays > 1 && diffDays <= 7) {
    return `In ${diffDays} days`
  } else {
    return eventDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: eventDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    })
  }
}

export function NextEventsWidget({
  events,
  isLoading,
  onViewAll,
  className,
}: NextEventsWidgetProps) {
  return (
    <div className={cn('w-full', className)}>
      {/* Loading State */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 p-2">
              <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-slate-700 animate-pulse flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded animate-pulse mb-1" />
                <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && events.length === 0 && (
        <div className="text-center py-6">
          <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No upcoming webinars</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">RSVP to events to see them here</p>
        </div>
      )}

      {/* Events List */}
      {!isLoading && events.length > 0 && (
        <div className="space-y-3">
          {events.slice(0, 5).map((event) => (
            <div
              key={event.id}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {/* Event thumbnail or placeholder */}
              <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-slate-700 flex-shrink-0 flex items-center justify-center overflow-hidden">
                {event.thumbnail ? (
                  <img
                    src={event.thumbnail}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <CalendarIcon className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                )}
              </div>

              {/* Event details */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {event.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(event.date)}
                </p>
                {event.host && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                    {event.host}
                  </p>
                )}
              </div>
            </div>
          ))}

          {/* View All link */}
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="text-green-600 dark:text-green-500 text-sm font-medium hover:text-green-700 dark:hover:text-green-400 transition-colors w-full text-left mt-2"
            >
              View All →
            </button>
          )}
        </div>
      )}
    </div>
  )
}

