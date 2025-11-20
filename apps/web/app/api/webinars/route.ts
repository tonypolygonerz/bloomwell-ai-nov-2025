import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@bloomwell/auth'
import prisma from '@bloomwell/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    console.log('[Webinars API] Session check:', { 
      hasSession: !!session, 
      userId: session?.user?.id,
      sessionUserId: session?.userId 
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const userId = session.userId ?? session.user.id
    if (!userId) {
      console.error('[Webinars API] Invalid session - no userId found')
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    console.log('[Webinars API] Authenticated user ID:', userId)

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || undefined
    const host = searchParams.get('host') || undefined
    const category = searchParams.get('category') || undefined
    const startDate = searchParams.get('startDate') || undefined
    const endDate = searchParams.get('endDate') || undefined
    const sortBy = searchParams.get('sortBy') || 'startsAt'

    console.log('[Webinars API] Query params:', { search, host, category, startDate, endDate, sortBy })

    // Test database connection with simple count query
    try {
      const webinarCount = await prisma.webinar.count()
      console.log('[Webinars API] Total webinars in database:', webinarCount)
    } catch (dbError: any) {
      console.error('[Webinars API] Database connection test failed:', {
        message: dbError?.message,
        code: dbError?.code,
        name: dbError?.name,
      })
      throw new Error(`Database connection failed: ${dbError?.message}`)
    }

    // Build where clause
    const where: any = {}

    // Search filter (title or subtitle)
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { subtitle: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Host filter
    if (host) {
      where.hostName = { contains: host, mode: 'insensitive' }
    }

    // Category filter (not in schema, but included for API compatibility)
    // Will be filtered out in post-processing since category doesn't exist

    // Date range filters
    if (startDate || endDate) {
      where.startsAt = {}
      if (startDate) {
        const start = new Date(startDate)
        if (!isNaN(start.getTime())) {
          where.startsAt.gte = start
        }
      }
      if (endDate) {
        const end = new Date(endDate)
        if (!isNaN(end.getTime())) {
          where.startsAt.lte = end
        }
      }
    }

    // Build orderBy clause
    let orderBy: any = { startsAt: 'asc' }
    if (sortBy === 'title') {
      orderBy = { title: 'asc' }
    } else if (sortBy === 'startsAt' || sortBy === 'date') {
      orderBy = { startsAt: 'asc' }
    } else if (sortBy === 'attendeeCount') {
      // For attendeeCount sorting, we'll need to sort in memory after fetching
      orderBy = { startsAt: 'asc' }
    }

    console.log('[Webinars API] Where clause:', JSON.stringify(where, null, 2))
    console.log('[Webinars API] OrderBy clause:', JSON.stringify(orderBy, null, 2))

    // Fetch webinars with RSVPs
    let webinars
    try {
      webinars = await prisma.webinar.findMany({
        where,
        include: {
          rsvps: {
            select: {
              userId: true,
              status: true,
            },
          },
        },
        orderBy,
      })
      console.log('[Webinars API] Query successful, found webinars:', webinars.length)
    } catch (queryError: any) {
      console.error('[Webinars API] Prisma query failed:', {
        message: queryError?.message,
        code: queryError?.code,
        name: queryError?.name,
        stack: queryError?.stack,
      })
      throw new Error(`Database query failed: ${queryError?.message}`)
    }

    // Get user's RSVP IDs for isRegistered check
    let userRsvpWebinarIds: Set<string>
    try {
      const userRsvps = await prisma.webinarRSVP.findMany({
        where: { userId },
        select: { webinarId: true },
      })
      userRsvpWebinarIds = new Set(userRsvps.map((rsvp) => rsvp.webinarId))
      console.log('[Webinars API] User RSVPs found:', userRsvpWebinarIds.size)
    } catch (rsvpError: any) {
      console.error('[Webinars API] RSVP query failed:', {
        message: rsvpError?.message,
        code: rsvpError?.code,
      })
      // Continue with empty set if RSVP query fails
      userRsvpWebinarIds = new Set()
    }

    // Transform webinars to match API response format
    let transformedWebinars = webinars.map((webinar) => ({
      id: webinar.id,
      title: webinar.title,
      subtitle: webinar.subtitle,
      description: null, // Not in schema
      date: webinar.startsAt.toISOString(),
      duration: webinar.durationM,
      host: {
        id: null, // Not in schema
        name: webinar.hostName,
        title: webinar.hostTitle || null,
        avatar: null, // Not in schema
      },
      thumbnail: null, // Not in schema
      category: null, // Not in schema
      attendeeCount: webinar.rsvps.length,
      registrationDeadline: null, // Not in schema
      isRegistered: userRsvpWebinarIds.has(webinar.id),
    }))

    // Apply category filter in post-processing (if provided)
    if (category) {
      // Since category doesn't exist in schema, filter returns empty
      transformedWebinars = []
    }

    // Sort by attendeeCount if requested (after fetching)
    if (sortBy === 'attendeeCount') {
      transformedWebinars.sort((a, b) => b.attendeeCount - a.attendeeCount)
    }

    console.log('[Webinars API] Returning', transformedWebinars.length, 'webinars')

    return NextResponse.json({
      webinars: transformedWebinars,
      total: transformedWebinars.length,
    })
  } catch (error: any) {
    // Detailed error logging
    console.error('[Webinars API] Error Details:', {
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

