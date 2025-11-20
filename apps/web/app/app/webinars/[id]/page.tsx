import { getServerSession } from 'next-auth'
import { authOptions } from '@bloomwell/auth'
import { redirect } from 'next/navigation'
import prisma from '@bloomwell/db'
import { WebinarDetailView } from '@/src/components/webinars/WebinarDetailView'

async function fetchWebinar(id: string, userId: string) {
  try {
    // Fetch webinar with RSVPs
    const webinar = await prisma.webinar.findUnique({
      where: { id },
      include: {
        rsvps: {
          select: {
            userId: true,
            status: true,
          },
        },
      },
    })

    if (!webinar) {
      return null
    }

    // Check if user is registered
    const userRsvp = await prisma.webinarRSVP.findUnique({
      where: {
        userId_webinarId: {
          userId,
          webinarId: id,
        },
      },
    })

    // Transform webinar to match API response format
    return {
      id: webinar.id,
      title: webinar.title,
      subtitle: webinar.subtitle || null,
      description: null, // Not in schema, but included for interface compatibility
      date: webinar.startsAt.toISOString(),
      duration: webinar.durationM,
      host: {
        name: webinar.hostName,
        title: webinar.hostTitle || null,
        bio: webinar.hostBio || null,
        avatar: null, // Not in schema
      },
      thumbnail: null, // Not in schema
      attendeeCount: webinar.rsvps.length,
      registrationDeadline: null, // Not in schema
      isRegistered: !!userRsvp,
      materials: webinar.materialsUrl
        ? [
            {
              name: 'Webinar Materials',
              url: webinar.materialsUrl,
              type: 'pdf' as const,
            },
          ]
        : null,
    }
  } catch (error) {
    console.error('Error fetching webinar:', error)
    return null
  }
}

export default async function WebinarDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login?callbackUrl=/app/webinars/' + params.id)
  }

  const userId = session.userId ?? session.user.id
  if (!userId) {
    redirect('/login?callbackUrl=/app/webinars/' + params.id)
  }

  const webinar = await fetchWebinar(params.id, userId)

  if (!webinar) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Webinar not found</h1>
          <p className="text-gray-600 mb-4">The webinar you're looking for doesn't exist or has been removed.</p>
          <a
            href="/app/webinars"
            className="text-brand hover:text-brand-hover font-medium"
          >
            Return to webinars
          </a>
        </div>
      </div>
    )
  }

  return <WebinarDetailView webinar={webinar} />
}

