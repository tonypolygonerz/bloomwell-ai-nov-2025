'use client'

import { useState, useRef, useEffect } from 'react'
import { Calendar, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AddToCalendarDropdownProps {
  event: {
    id: string
    title: string
    subtitle: string | null
    description: string | null
    date: string // ISO string
    duration: number
    host: {
      name: string
    }
  }
}

export function AddToCalendarDropdown({ event }: AddToCalendarDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const startDate = new Date(event.date)
  const endDate = new Date(startDate.getTime() + event.duration * 60 * 1000)

  // Format dates for calendar URLs (YYYYMMDDTHHmmss)
  const formatDateForCalendar = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    return `${year}${month}${day}T${hours}${minutes}${seconds}`
  }

  const formatDateForICS = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }

  const title = encodeURIComponent(event.title)
  const description = encodeURIComponent(
    `${event.subtitle ? `${event.subtitle}\n\n` : ''}${event.description || ''}\n\nHost: ${event.host.name}`
  )
  const eventLocation = encodeURIComponent('Online Webinar')
  const startDateStr = formatDateForCalendar(startDate)
  const endDateStr = formatDateForCalendar(endDate)

  const calendarLinks = {
    google: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDateStr}/${endDateStr}&details=${description}&location=${eventLocation}`,
    outlook: `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&startdt=${startDate.toISOString()}&enddt=${endDate.toISOString()}&body=${description}&location=${eventLocation}`,
    yahoo: `https://calendar.yahoo.com/?v=60&view=d&type=20&title=${title}&st=${formatDateForCalendar(startDate)}&dur=${Math.floor(event.duration / 60)}:${String(event.duration % 60).padStart(2, '0')}&desc=${description}&in_loc=${eventLocation}`,
  }

  const generateICSFile = () => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Bloomwell//Webinar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${event.id}@bloomwell.ai`,
      `DTSTAMP:${formatDateForICS(new Date())}`,
      `DTSTART:${formatDateForICS(startDate)}`,
      `DTEND:${formatDateForICS(endDate)}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.subtitle ? `${event.subtitle}\\n\\n` : ''}${event.description || ''}\\n\\nHost: ${event.host.name}`,
      `LOCATION:Online Webinar`,
      'STATUS:CONFIRMED',
      'SEQUENCE:0',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n')

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}.ics`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleCalendarClick = (platform: keyof typeof calendarLinks) => {
    window.open(calendarLinks[platform], '_blank', 'width=600,height=600')
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
      >
        <span className="flex items-center">
          <Calendar className="w-4 h-4 mr-2" />
          Add to Calendar
        </span>
        <ChevronDown
          className={cn('w-4 h-4 transition-transform', isOpen && 'transform rotate-180')}
        />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
          <div className="py-1">
            <button
              onClick={() => handleCalendarClick('google')}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Google Calendar
            </button>
            <button
              onClick={() => handleCalendarClick('outlook')}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Outlook Calendar
            </button>
            <button
              onClick={() => handleCalendarClick('yahoo')}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Yahoo Calendar
            </button>
            <button
              onClick={generateICSFile}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Apple Calendar (.ics)
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

