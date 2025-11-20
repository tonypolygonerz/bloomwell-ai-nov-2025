'use client'

import { Video, User, Calendar, Clock, Users, Check } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export interface EventCardProps {
  event: {
    id: string
    title: string
    subtitle?: string
    date: Date
    duration: number // minutes
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
  onRegister: (eventId: string) => void
  onUnregister: (eventId: string) => void
}

function formatDateTime(date: Date): string {
  const eventDate = new Date(date)
  const now = new Date()
  const diffTime = eventDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  const timeString = eventDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  if (diffDays === 0) {
    return `Today at ${timeString}`
  } else if (diffDays === 1) {
    return `Tomorrow at ${timeString}`
  } else if (diffDays > 1 && diffDays <= 7) {
    return `${eventDate.toLocaleDateString('en-US', { weekday: 'long' })} at ${timeString}`
  } else {
    return eventDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: eventDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    }) + ` at ${timeString}`
  }
}

export function EventCard({ event, onRegister, onUnregister }: EventCardProps) {
  const formattedDateTime = formatDateTime(event.date)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (event.isRegistered) {
      onUnregister(event.id)
    } else {
      onRegister(event.id)
    }
  }

  return (
    <Link
      href={`/app/webinars/${event.id}`}
      className="block bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
    >
      {/* Event thumbnail or placeholder */}
      <div className="aspect-video bg-gray-100 rounded-t-lg flex items-center justify-center overflow-hidden">
        {event.thumbnail ? (
          <img
            src={event.thumbnail}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <Video className="w-12 h-12 text-gray-400" />
        )}
      </div>

      <div className="p-4">
        {/* Host info */}
        <div className="flex items-center mb-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
            {event.host.avatar ? (
              <img
                src={event.host.avatar}
                alt={event.host.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-4 h-4 text-gray-500" />
            )}
          </div>
          <div className="ml-2 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{event.host.name}</p>
            {event.host.title && (
              <p className="text-xs text-gray-500 truncate">{event.host.title}</p>
            )}
          </div>
        </div>

        {/* Event details */}
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{event.title}</h3>
        {event.subtitle && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{event.subtitle}</p>
        )}

        {/* Date and time */}
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
          <span className="truncate">{formattedDateTime}</span>
        </div>

        {/* Duration and attendees */}
        <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
          <div className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            <span>{event.duration} minutes</span>
          </div>
          <div className="flex items-center">
            <Users className="w-3 h-3 mr-1" />
            <span>{event.attendeeCount} registered</span>
          </div>
        </div>

        {/* Registration button */}
        <button
          onClick={handleClick}
          className={cn(
            'w-full py-2 px-4 rounded-md text-sm font-medium transition-colors',
            event.isRegistered
              ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
              : 'bg-brand text-white hover:bg-brand-hover'
          )}
        >
          {event.isRegistered ? (
            <span className="flex items-center justify-center">
              <Check className="w-4 h-4 mr-1" />
              Registered
            </span>
          ) : (
            'Register'
          )}
        </button>
      </div>
    </Link>
  )
}

