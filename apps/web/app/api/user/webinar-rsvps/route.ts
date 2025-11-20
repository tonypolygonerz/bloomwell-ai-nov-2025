import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@bloomwell/auth'
import prisma from '@bloomwell/db'

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    console.log('[Webinar RSVPs API] Session check:', { 
      hasSession: !!session, 
      userId: session?.user?.id,
      sessionUserId: session?.userId 
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const userId = session.userId ?? session.user.id
    if (!userId) {
      console.error('[Webinar RSVPs API] Invalid session - no userId found')
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    console.log('[Webinar RSVPs API] Authenticated user ID:', userId)

    // Test database connection first
    try {
      const rsvpCount = await prisma.webinarRSVP.count({ where: { userId } })
      console.log('[Webinar RSVPs API] User RSVP count:', rsvpCount)
    } catch (dbError: any) {
      console.error('[Webinar RSVPs API] Database connection test failed:', {
        message: dbError?.message,
        code: dbError?.code,
        name: dbError?.name,
      })
      throw new Error(`Database connection failed: ${dbError?.message}`)
    }

    // Fetch RSVPs with webinar details
    let rsvps
    try {
      rsvps = await prisma.webinarRSVP.findMany({
        where: { userId },
        include: {
          webinar: {
            select: {
              id: true,
              title: true,
              startsAt: true,
              hostName: true,
              hostTitle: true,
              materialsUrl: true,
            },
          },
        },
        orderBy: {
          registeredAt: 'desc',
        },
      })
      console.log('[Webinar RSVPs API] Query successful, found RSVPs:', rsvps.length)
    } catch (queryError: any) {
      console.error('[Webinar RSVPs API] Prisma query failed:', {
        message: queryError?.message,
        code: queryError?.code,
        name: queryError?.name,
        stack: queryError?.stack,
      })
      throw new Error(`Database query failed: ${queryError?.message}`)
    }

    // Transform RSVPs to match API response format
    const transformedRsvps = rsvps.map((rsvp) => ({
      id: rsvp.id,
      webinar: {
        id: rsvp.webinar.id,
        title: rsvp.webinar.title,
        date: rsvp.webinar.startsAt.toISOString(),
        thumbnail: null, // Not in schema
        host: {
          name: rsvp.webinar.hostName,
          avatar: null, // Not in schema
        },
      },
      registeredAt: rsvp.registeredAt.toISOString(),
      status: rsvp.status,
    }))

    console.log('[Webinar RSVPs API] Returning', transformedRsvps.length, 'RSVPs')

    return NextResponse.json({
      rsvps: transformedRsvps,
    })
  } catch (error: any) {
    // Detailed error logging
    console.error('[Webinar RSVPs API] Error Details:', {
      message: error?.message || String(error),
      stack: error?.stack,
      name: error?.name,
      cause: error?.cause,
      code: error?.code,
    })

    const errorMessage = process.env.NODE_ENV === 'development' 
      ? `Internal server error: ${error?.message || String(error)}`
      : 'Internal server error'

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

