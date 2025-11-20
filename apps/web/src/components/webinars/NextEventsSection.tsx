'use client'

import { useState, useEffect } from 'react'
import { NextEventsWidget } from './NextEventsWidget'
import { useRouter } from 'next/navigation'

interface ApiRSVP {
  id: string
  webinar: {
    id: string
    title: string
    date: string // ISO string
    thumbnail: string | null
    host: {
      name: string
      avatar: string | null
    }
  }
  registeredAt: string
  status: string
}

interface ApiResponse {
  rsvps: ApiRSVP[]
}

export function NextEventsSection() {
  const router = useRouter()
  const [events, setEvents] = useState<
    {
      id: string
      title: string
      date: Date
      thumbnail?: string
      host?: string
    }[]
  >([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRSVPs = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/user/webinar-rsvps', {
          credentials: 'include',
        })

        if (!response.ok) {
          if (response.status === 401) {
            // Not authenticated, show empty state
            setEvents([])
            return
          }
          throw new Error(`Failed to fetch RSVPs: ${response.statusText}`)
        }

        const data: ApiResponse = await response.json()

        // Transform API response to NextEventsWidget format
        const now = new Date()
        now.setHours(0, 0, 0, 0)

        const transformedEvents = data.rsvps
          .map((rsvp) => {
            const eventDate = new Date(rsvp.webinar.date)
            return {
              id: rsvp.webinar.id,
              title: rsvp.webinar.title,
              date: eventDate,
              thumbnail: rsvp.webinar.thumbnail || undefined,
              host: rsvp.webinar.host.name,
            }
          })
          .filter((event) => {
            // Only show upcoming events (date >= today)
            const eventDate = new Date(event.date)
            eventDate.setHours(0, 0, 0, 0)
            return eventDate >= now
          })
          .sort((a, b) => a.date.getTime() - b.date.getTime()) // Sort by date ascending

        setEvents(transformedEvents)
      } catch (error) {
        console.error('Error fetching RSVPs:', error)
        setEvents([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchRSVPs()
  }, [])

  const handleViewAll = () => {
    // Navigate to full webinars list (could be filtered view or scroll to main content)
    router.push('/app/webinars')
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Next Events</h3>
      <NextEventsWidget events={events} isLoading={isLoading} onViewAll={handleViewAll} />
    </div>
  )
}
