'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { EventsGrid, Event } from './EventsGrid'

interface ApiWebinar {
  id: string
  title: string
  subtitle?: string
  date: string // ISO string
  duration: number
  host: {
    name: string
    title?: string
    avatar?: string
  }
  attendeeCount: number
  isRegistered: boolean
}

interface ApiResponse {
  webinars: ApiWebinar[]
  total: number
}

interface WebinarsContentProps {
  selectedDate?: Date
  onEventsChange?: (events: Event[]) => void
}

export function WebinarsContent({ selectedDate, onEventsChange }: WebinarsContentProps = {}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [selectedHost, setSelectedHost] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortBy, setSortBy] = useState<'date-asc' | 'date-desc' | 'popularity'>('date-asc')
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [allHosts, setAllHosts] = useState<string[]>([])
  const [allCategories] = useState<string[]>([]) // Categories not supported by API
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Debounce search query
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery])

  // Fetch webinars from API
  const fetchWebinars = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()

      if (debouncedSearchQuery) {
        params.append('search', debouncedSearchQuery)
      }
      if (selectedHost) {
        params.append('host', selectedHost)
      }
      if (selectedCategory) {
        params.append('category', selectedCategory)
      }

      // Add date filter if selectedDate is provided
      if (selectedDate) {
        const startOfDay = new Date(selectedDate)
        startOfDay.setHours(0, 0, 0, 0)
        const endOfDay = new Date(selectedDate)
        endOfDay.setHours(23, 59, 59, 999)
        params.append('startDate', startOfDay.toISOString())
        params.append('endDate', endOfDay.toISOString())
      }

      // Map sortBy to API format
      let apiSortBy = 'startsAt'
      if (sortBy === 'popularity') {
        apiSortBy = 'attendeeCount'
      } else if (sortBy === 'date-asc' || sortBy === 'date-desc') {
        apiSortBy = 'startsAt'
      }

      params.append('sortBy', apiSortBy)

      const response = await fetch(`/api/webinars?${params.toString()}`, {
        credentials: 'include',
      })

      if (!response.ok) {
        if (response.status === 401) {
          setError('Please log in to view webinars')
          return
        }
        throw new Error(`Failed to fetch webinars: ${response.statusText}`)
      }

      const data: ApiResponse = await response.json()

      // Transform API response to Event format
      let transformedEvents: Event[] = data.webinars.map((webinar) => ({
        id: webinar.id,
        title: webinar.title,
        subtitle: webinar.subtitle,
        date: new Date(webinar.date),
        duration: webinar.duration,
        host: {
          name: webinar.host.name,
          title: webinar.host.title,
          avatar: webinar.host.avatar,
        },
        attendeeCount: webinar.attendeeCount,
        isRegistered: webinar.isRegistered,
      }))

      // Handle client-side sorting for date-desc
      if (sortBy === 'date-desc') {
        transformedEvents.sort((a, b) => b.date.getTime() - a.date.getTime())
      }

      setEvents(transformedEvents)

      // Extract unique hosts from fetched webinars
      const hosts = Array.from(new Set(transformedEvents.map((e) => e.host.name)))
      setAllHosts(hosts)

      // Notify parent component of events change
      if (onEventsChange) {
        onEventsChange(transformedEvents)
      }
    } catch (err) {
      console.error('Error fetching webinars:', err)
      setError(err instanceof Error ? err.message : 'Failed to load webinars')
    } finally {
      setLoading(false)
    }
  }, [debouncedSearchQuery, selectedHost, selectedCategory, sortBy, selectedDate, onEventsChange])

  // Fetch webinars when filters change
  useEffect(() => {
    fetchWebinars()
  }, [fetchWebinars])

  // Optimistic RSVP register
  const handleRegister = async (eventId: string) => {
    // Optimistic update
    const previousEvents = [...events]
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === eventId
          ? { ...event, isRegistered: true, attendeeCount: event.attendeeCount + 1 }
          : event
      )
    )

    try {
      const response = await fetch('/api/webinars/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webinarId: eventId, action: 'register' }),
      })

      if (!response.ok) {
        throw new Error('Failed to register for webinar')
      }

      const result = await response.json()

      // Update with server response
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === eventId
            ? {
                ...event,
                isRegistered: result.isRegistered ?? true,
                attendeeCount: result.attendeeCount ?? event.attendeeCount,
              }
            : event
        )
      )
    } catch (err) {
      console.error('Error registering for webinar:', err)
      // Revert optimistic update on error
      setEvents(previousEvents)
      setError('Failed to register for webinar. Please try again.')
    }
  }

  // Optimistic RSVP unregister
  const handleUnregister = async (eventId: string) => {
    // Optimistic update
    const previousEvents = [...events]
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === eventId
          ? {
              ...event,
              isRegistered: false,
              attendeeCount: Math.max(0, event.attendeeCount - 1),
            }
          : event
      )
    )

    try {
      const response = await fetch('/api/webinars/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webinarId: eventId, action: 'unregister' }),
      })

      if (!response.ok) {
        throw new Error('Failed to unregister from webinar')
      }

      const result = await response.json()

      // Update with server response
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === eventId
            ? {
                ...event,
                isRegistered: result.isRegistered ?? false,
                attendeeCount: result.attendeeCount ?? event.attendeeCount,
              }
            : event
        )
      )
    } catch (err) {
      console.error('Error unregistering from webinar:', err)
      // Revert optimistic update on error
      setEvents(previousEvents)
      setError('Failed to unregister from webinar. Please try again.')
    }
  }

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Webinars</h1>
        <p className="text-gray-600 mt-1">Discover and join expert-led sessions for nonprofits</p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Events Grid */}
      <EventsGrid
        events={events}
        loading={loading}
        filterProps={{
          searchQuery,
          onSearchChange: setSearchQuery,
          selectedHost,
          onHostChange: setSelectedHost,
          selectedCategory,
          onCategoryChange: setSelectedCategory,
          sortBy,
          onSortChange: setSortBy,
          hosts: allHosts,
          categories: allCategories,
        }}
        onRegister={handleRegister}
        onUnregister={handleUnregister}
      />
    </>
  )
}
