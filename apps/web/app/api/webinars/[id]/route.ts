import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@bloomwell/auth'
import prisma from '@bloomwell/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const userId = session.userId ?? session.user.id
  if (!userId) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
  }

  try {
    const { id } = params

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
      return NextResponse.json({ error: 'Webinar not found' }, { status: 404 })
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
    const transformedWebinar = {
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

    return NextResponse.json(transformedWebinar)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

