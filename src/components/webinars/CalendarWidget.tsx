'use client'

import { useState, useMemo } from 'react'
import { cn } from '../../../apps/web/lib/utils'

export interface CalendarWidgetProps {
  webinarDates: Date[]
  selectedDate?: Date
  onDateSelect: (date: Date) => void
  className?: string
}

export interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  hasWebinar: boolean
  isSelected: boolean
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

/**
 * Normalizes a date to midnight (00:00:00) for accurate date comparisons
 */
function normalizeDate(date: Date): Date {
  const normalized = new Date(date)
  normalized.setHours(0, 0, 0, 0)
  return normalized
}

/**
 * Checks if two dates are the same day (ignoring time)
 */
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

/**
 * Checks if a date is today
 */
function isToday(date: Date): boolean {
  return isSameDay(date, new Date())
}

/**
 * Checks if a date has a webinar event
 */
function hasWebinar(date: Date, webinarDates: Date[]): boolean {
  const normalizedDate = normalizeDate(date)
  return webinarDates.some((webinarDate) => {
    const normalizedWebinar = normalizeDate(webinarDate)
    return isSameDay(normalizedDate, normalizedWebinar)
  })
}

/**
 * Generates an array of calendar days for the specified month
 */
function generateCalendarDays(
  year: number,
  month: number,
  webinarDates: Date[],
  selectedDate?: Date
): CalendarDay[] {
  const days: CalendarDay[] = []
  
  // First day of the month
  const firstDay = new Date(year, month, 1)
  const firstDayOfWeek = firstDay.getDay() // 0 = Sunday, 6 = Saturday
  
  // Last day of the month
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  
  // Days from previous month to fill the first week
  const prevMonth = month === 0 ? 11 : month - 1
  const prevYear = month === 0 ? year - 1 : year
  const prevMonthLastDay = new Date(prevYear, prevMonth + 1, 0).getDate()
  
  // Add previous month's trailing days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(prevYear, prevMonth, prevMonthLastDay - i)
    days.push({
      date,
      isCurrentMonth: false,
      isToday: isToday(date),
      hasWebinar: hasWebinar(date, webinarDates),
      isSelected: selectedDate ? isSameDay(date, selectedDate) : false,
    })
  }
  
  // Add current month's days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    days.push({
      date,
      isCurrentMonth: true,
      isToday: isToday(date),
      hasWebinar: hasWebinar(date, webinarDates),
      isSelected: selectedDate ? isSameDay(date, selectedDate) : false,
    })
  }
  
  // Add next month's leading days to fill the last week (up to 6 rows = 42 days total)
  const remainingDays = 42 - days.length
  const nextMonth = month === 11 ? 0 : month + 1
  const nextYear = month === 11 ? year + 1 : year
  
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(nextYear, nextMonth, day)
    days.push({
      date,
      isCurrentMonth: false,
      isToday: isToday(date),
      hasWebinar: hasWebinar(date, webinarDates),
      isSelected: selectedDate ? isSameDay(date, selectedDate) : false,
    })
  }
  
  return days
}

export function CalendarWidget({
  webinarDates,
  selectedDate,
  onDateSelect,
  className,
}: CalendarWidgetProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  const calendarDays = useMemo(
    () => generateCalendarDays(currentYear, currentMonth, webinarDates, selectedDate),
    [currentYear, currentMonth, webinarDates, selectedDate]
  )

  const monthYearDisplay = `${MONTHS[currentMonth]} ${currentYear}`

  const handlePreviousMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (newDate.getMonth() === 0) {
        newDate.setFullYear(newDate.getFullYear() - 1)
        newDate.setMonth(11)
      } else {
        newDate.setMonth(newDate.getMonth() - 1)
      }
      return newDate
    })
  }

  const handleNextMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (newDate.getMonth() === 11) {
        newDate.setFullYear(newDate.getFullYear() + 1)
        newDate.setMonth(0)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  const handleDateClick = (day: CalendarDay) => {
    onDateSelect(day.date)
  }

  const handleKeyDown = (event: React.KeyboardEvent, day: CalendarDay) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleDateClick(day)
    }
  }

  return (
    <div
      className={cn(
        'w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4',
        className
      )}
      role="application"
      aria-label={`Calendar widget for ${monthYearDisplay}`}
    >
      {/* Header with Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={handlePreviousMonth}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          aria-label="Previous month"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <h2 className="text-lg font-semibold text-gray-900 dark:text-white" aria-live="polite">
          {monthYearDisplay}
        </h2>

        <button
          type="button"
          onClick={handleNextMonth}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          aria-label="Next month"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2"
            role="columnheader"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1" role="grid">
        {calendarDays.map((day, index) => {
          const dayKey = `${day.date.getFullYear()}-${day.date.getMonth()}-${day.date.getDate()}-${index}`
          
          return (
            <button
              key={dayKey}
              type="button"
              onClick={() => handleDateClick(day)}
              onKeyDown={(e) => handleKeyDown(e, day)}
              className={cn(
                'relative flex flex-col items-center justify-center p-2 rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2',
                // Base styles
                day.isCurrentMonth
                  ? 'text-gray-900 dark:text-gray-100'
                  : 'text-gray-400 dark:text-gray-500',
                // Today highlighting with Bloomwell green (#22C55E)
                day.isToday &&
                  'bg-[#22C55E] text-white font-semibold hover:bg-[#16A34A] dark:bg-[#22C55E] dark:text-white dark:hover:bg-[#16A34A]',
                // Selected date styling
                !day.isToday &&
                  day.isSelected &&
                  'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-100 font-medium',
                // Hover states (only if not today and not selected)
                !day.isToday &&
                  !day.isSelected &&
                  'hover:bg-gray-100 dark:hover:bg-slate-800',
                // Disabled/other month styling
                !day.isCurrentMonth && 'opacity-50'
              )}
              aria-label={`${day.date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}${day.hasWebinar ? ', Has webinar' : ''}${day.isToday ? ', Today' : ''}`}
              aria-pressed={day.isSelected}
              role="gridcell"
              tabIndex={day.isSelected || day.isToday ? 0 : -1}
            >
              <span>{day.date.getDate()}</span>
              {day.hasWebinar && (
                <span
                  className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-[#22C55E] dark:bg-[#22C55E]"
                  aria-hidden="true"
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}


