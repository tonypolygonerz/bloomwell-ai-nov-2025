'use client'

import { useState, useCallback } from 'react'
import { CalendarWidget } from './CalendarWidget'
import { NextEventsSection } from './NextEventsSection'
import { WebinarsContent } from './WebinarsContent'
import { Event } from './EventsGrid'

export function WebinarsPageClient() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [webinarDates, setWebinarDates] = useState<Date[]>([])

  const handleEventsChange = useCallback((events: Event[]) => {
    // Extract webinar dates from events
    const dates = events.map((event) => {
      const date = new Date(event.date)
      date.setHours(0, 0, 0, 0)
      return date
    })
    // Remove duplicates
    const uniqueDates = Array.from(
      new Set(dates.map((date) => date.getTime()))
    ).map((time) => new Date(time))
    setWebinarDates(uniqueDates)
  }, [])

  const handleDateSelect = useCallback((date: Date) => {
    // If the same date is clicked again, deselect it
    if (selectedDate && selectedDate.getTime() === date.getTime()) {
      setSelectedDate(undefined)
    } else {
      setSelectedDate(date)
    }
  }, [selectedDate])

  return (
    <div className="flex h-full flex-col bg-gray-50 dark:bg-slate-900 lg:flex-row">
      {/* Left Sidebar - 25% (Calendar + Your Next Events) */}
      <div className="w-full bg-white dark:bg-slate-800 p-6 shadow-sm border-r border-gray-200 dark:border-slate-700 lg:w-1/4">
        {/* Calendar Widget Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Calendar</h3>
          <CalendarWidget
            webinarDates={webinarDates}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
          />
        </div>

        {/* Your Next Events Section */}
        <NextEventsSection />
      </div>

      {/* Main Content Area - 75% */}
      <div className="w-full p-6 lg:w-3/4">
        <WebinarsContent selectedDate={selectedDate} onEventsChange={handleEventsChange} />
      </div>
    </div>
  )
}

