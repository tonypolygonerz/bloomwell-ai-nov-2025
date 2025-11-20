import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@bloomwell/auth'
import prisma from '@bloomwell/db'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const userId = session.userId ?? session.user.id
  if (!userId) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { webinarId, action } = body

    // Validate request body
    if (!webinarId || typeof webinarId !== 'string') {
      return NextResponse.json({ error: 'webinarId is required' }, { status: 400 })
    }

    if (!action || (action !== 'register' && action !== 'unregister')) {
      return NextResponse.json(
        { error: "action must be 'register' or 'unregister'" },
        { status: 400 },
      )
    }

    // Verify webinar exists
    const webinar = await prisma.webinar.findUnique({
      where: { id: webinarId },
      include: {
        rsvps: {
          select: {
            id: true,
          },
        },
      },
    })

    if (!webinar) {
      return NextResponse.json({ error: 'Webinar not found' }, { status: 404 })
    }

    if (action === 'register') {
      // Check if already registered
      const existingRsvp = await prisma.webinarRSVP.findUnique({
        where: {
          userId_webinarId: {
            userId,
            webinarId,
          },
        },
      })

      if (existingRsvp) {
        // Already registered, return success with current state
        const updatedWebinar = await prisma.webinar.findUnique({
          where: { id: webinarId },
          include: {
            rsvps: {
              select: {
                id: true,
              },
            },
          },
        })

        return NextResponse.json({
          success: true,
          isRegistered: true,
          attendeeCount: updatedWebinar?.rsvps.length || 0,
          message: 'Already registered for this webinar',
        })
      }

      // Create RSVP
      await prisma.webinarRSVP.create({
        data: {
          userId,
          webinarId,
          status: 'REGISTERED',
        },
      })

      // Fetch updated attendee count
      const updatedWebinar = await prisma.webinar.findUnique({
        where: { id: webinarId },
        include: {
          rsvps: {
            select: {
              id: true,
            },
          },
        },
      })

      return NextResponse.json({
        success: true,
        isRegistered: true,
        attendeeCount: updatedWebinar?.rsvps.length || 0,
        message: 'Successfully registered for webinar',
      })
    } else {
      // Unregister
      const existingRsvp = await prisma.webinarRSVP.findUnique({
        where: {
          userId_webinarId: {
            userId,
            webinarId,
          },
        },
      })

      if (!existingRsvp) {
        // Not registered, return success with current state
        const updatedWebinar = await prisma.webinar.findUnique({
          where: { id: webinarId },
          include: {
            rsvps: {
              select: {
                id: true,
              },
            },
          },
        })

        return NextResponse.json({
          success: true,
          isRegistered: false,
          attendeeCount: updatedWebinar?.rsvps.length || 0,
          message: 'Not registered for this webinar',
        })
      }

      // Delete RSVP
      await prisma.webinarRSVP.delete({
        where: {
          userId_webinarId: {
            userId,
            webinarId,
          },
        },
      })

      // Fetch updated attendee count
      const updatedWebinar = await prisma.webinar.findUnique({
        where: { id: webinarId },
        include: {
          rsvps: {
            select: {
              id: true,
            },
          },
        },
      })

      return NextResponse.json({
        success: true,
        isRegistered: false,
        attendeeCount: updatedWebinar?.rsvps.length || 0,
        message: 'Successfully unregistered from webinar',
      })
    }
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

