'use client'

export function EventCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Event thumbnail skeleton */}
      <div className="aspect-video bg-gray-200 rounded-t-lg animate-pulse" />

      <div className="p-4">
        {/* Host info skeleton */}
        <div className="flex items-center mb-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
          <div className="ml-2 min-w-0 flex-1">
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-1 w-24" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-16" />
          </div>
        </div>

        {/* Event title skeleton */}
        <div className="mb-1">
          <div className="h-5 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4" />
        </div>

        {/* Subtitle skeleton */}
        <div className="mb-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse mb-1" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
        </div>

        {/* Date skeleton */}
        <div className="flex items-center mb-2">
          <div className="w-4 h-4 bg-gray-200 rounded animate-pulse mr-1" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
        </div>

        {/* Duration and attendees skeleton */}
        <div className="flex items-center justify-between mb-4">
          <div className="h-3 bg-gray-200 rounded animate-pulse w-20" />
          <div className="h-3 bg-gray-200 rounded animate-pulse w-24" />
        </div>

        {/* Button skeleton */}
        <div className="w-full h-9 bg-gray-200 rounded-md animate-pulse" />
      </div>
    </div>
  )
}


