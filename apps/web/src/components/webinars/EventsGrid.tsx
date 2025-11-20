'use client'

import { Search } from 'lucide-react'
import { EventCard, EventCardProps } from './EventCard'
import { WebinarFilters, WebinarFiltersProps } from './WebinarFilters'
import { EventCardSkeleton } from './EventCardSkeleton'

export interface Event {
  id: string
  title: string
  subtitle?: string
  date: Date
  duration: number
  host: {
    name: string
    title?: string
    avatar?: string
  }
  thumbnail?: string
  attendeeCount: number
  registrationDeadline?: Date
  isRegistered: boolean
}

export interface EventsGridProps {
  events: Event[]
  loading?: boolean
  filterProps: WebinarFiltersProps
  onRegister: (eventId: string) => void
  onUnregister: (eventId: string) => void
}

export function EventsGrid({ events, loading = false, filterProps, onRegister, onUnregister }: EventsGridProps) {
  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <WebinarFilters {...filterProps} />

      {/* Results count */}
      {!loading && (
        <div className="text-sm text-gray-500">
          Showing {events.length} {events.length === 1 ? 'webinar' : 'webinars'}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      ) : events.length > 0 ? (
        /* Event cards grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onRegister={onRegister}
              onUnregister={onUnregister}
            />
          ))}
        </div>
      ) : (
        /* Empty state */
        <div className="text-center py-12">
          <Search className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-lg text-gray-500">No webinars found</p>
          <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  )
}

