'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Video,
  User,
  Calendar,
  Clock,
  Users,
  Check,
  Share2,
  ChevronRight,
  FileText,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ShareModal } from './ShareModal'
import { AddToCalendarDropdown } from './AddToCalendarDropdown'

export interface WebinarDetailProps {
  webinar: {
    id: string
    title: string
    subtitle: string | null
    description: string | null
    date: string // ISO string
    duration: number
    host: {
      name: string
      title: string | null
      bio: string | null
      avatar?: string | null
    }
    thumbnail?: string | null
    attendeeCount: number
    registrationDeadline?: string | null
    isRegistered: boolean
    materials?: Array<{
      name: string
      url: string
      type: 'pdf' | 'doc'
    }> | null
  }
}

function formatDateTime(dateString: string): string {
  const eventDate = new Date(dateString)
  const now = new Date()
  const diffTime = eventDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  const timeString = eventDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  const formattedDateString = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  if (diffDays === 0) {
    return `Today at ${timeString}`
  } else if (diffDays === 1) {
    return `Tomorrow at ${timeString}`
  } else if (diffDays > 1 && diffDays <= 7) {
    return `${eventDate.toLocaleDateString('en-US', { weekday: 'long' })} at ${timeString}`
  } else {
    return `${formattedDateString} at ${timeString}`
  }
}

function formatDeadline(deadlineString: string): string {
  const deadline = new Date(deadlineString)
  const now = new Date()
  const diffTime = deadline.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return 'Registration closed'
  } else if (diffDays === 0) {
    return 'Registration closes today'
  } else if (diffDays === 1) {
    return 'Registration closes tomorrow'
  } else {
    return `Registration closes in ${diffDays} days`
  }
}

export function WebinarDetailView({ webinar }: WebinarDetailProps) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [isRegistered, setIsRegistered] = useState(webinar.isRegistered)
  const [attendeeCount, setAttendeeCount] = useState(webinar.attendeeCount)
  const [isLoading, setIsLoading] = useState(false)

  const formattedDate = formatDateTime(webinar.date)
  const formattedDeadline = webinar.registrationDeadline
    ? formatDeadline(webinar.registrationDeadline)
    : null

  const handleRSVP = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/webinars/rsvp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          webinarId: webinar.id,
          action: isRegistered ? 'unregister' : 'register',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update registration')
      }

      const data = await response.json()
      setIsRegistered(data.isRegistered)
      setAttendeeCount(data.attendeeCount)
    } catch (error) {
      console.error('Error updating registration:', error)
      alert('Failed to update registration. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = () => {
    setIsShareModalOpen(true)
  }

  return (
    <>
      <div className="max-w-4xl mx-auto p-6">
        {/* Breadcrumb */}
        <nav className="mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <Link href="/app/webinars" className="hover:text-gray-700">
                Webinars
              </Link>
            </li>
            <li>
              <ChevronRight className="w-4 h-4" />
            </li>
            <li className="text-gray-900 font-medium truncate max-w-md">
              {webinar.title}
            </li>
          </ol>
        </nav>

        {/* Header Section */}
        <div className="mb-8">
          {/* Event thumbnail or placeholder */}
          <div className="aspect-video bg-gray-100 rounded-lg mb-6 flex items-center justify-center overflow-hidden">
            {webinar.thumbnail ? (
              <img
                src={webinar.thumbnail}
                alt={webinar.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <Video className="w-16 h-16 text-gray-400" />
            )}
          </div>

          {/* Title and metadata */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{webinar.title}</h1>
              {webinar.subtitle && (
                <p className="text-lg text-gray-600">{webinar.subtitle}</p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex space-x-3 ml-4">
              <button
                onClick={handleShare}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </button>
              <button
                onClick={handleRSVP}
                disabled={isLoading}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center',
                  isRegistered
                    ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                    : 'bg-brand text-white hover:bg-brand-hover',
                  isLoading && 'opacity-50 cursor-not-allowed'
                )}
              >
                {isLoading ? (
                  'Loading...'
                ) : isRegistered ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Registered
                  </>
                ) : (
                  'Register'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content - 2/3 */}
          <div className="lg:col-span-2">
            {/* Event details */}
            {webinar.description && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">About this webinar</h2>
                <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                  {webinar.description}
                </div>
              </div>
            )}

            {/* Host information */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">About the host</h2>
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {webinar.host.avatar ? (
                    <img
                      src={webinar.host.avatar}
                      alt={webinar.host.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-gray-500" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900">{webinar.host.name}</h3>
                  {webinar.host.title && (
                    <p className="text-gray-600 mb-2">{webinar.host.title}</p>
                  )}
                  {webinar.host.bio && (
                    <p className="text-sm text-gray-500">{webinar.host.bio}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Materials */}
            {webinar.materials && webinar.materials.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Materials</h2>
                <div className="space-y-2">
                  {webinar.materials.map((material, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <span className="flex-1 text-gray-700">{material.name}</span>
                      <a
                        href={material.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 text-sm font-medium hover:text-green-700"
                      >
                        View
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - 1/3 */}
          <div className="space-y-6">
            {/* Event info card */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold mb-4 text-gray-900">Event Details</h3>

              <div className="space-y-3">
                <div className="flex items-start text-sm">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{formattedDate}</span>
                </div>

                <div className="flex items-start text-sm">
                  <Clock className="w-4 h-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{webinar.duration} minutes</span>
                </div>

                <div className="flex items-start text-sm">
                  <Users className="w-4 h-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{attendeeCount} registered</span>
                </div>

                {formattedDeadline && (
                  <div className="flex items-start text-sm">
                    <AlertCircle className="w-4 h-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{formattedDeadline}</span>
                  </div>
                )}
              </div>

              {/* Add to calendar */}
              <div className="mt-6">
                <AddToCalendarDropdown event={webinar} />
              </div>
            </div>

            {/* Registration status */}
            {isRegistered && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" />
                  <span className="text-green-800 font-medium">You're registered!</span>
                </div>
                <p className="text-green-700 text-sm mt-1">
                  You'll receive a reminder before the event starts.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        webinar={webinar}
      />
    </>
  )
}

