import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@bloomwell/auth'
import prisma from '@bloomwell/db'
import { z } from 'zod'
import { hash } from 'bcryptjs'

const OrganizationSchema = z.object({
  organizationType: z.string().optional(),
  ein: z.string().optional(),
  legalName: z.string().optional(),
  mission: z.string().optional(),
  budget: z.string().optional(),
  staffSize: z.string().optional(),
  focusAreas: z.string().optional(),
  revenueBracket: z.string().optional(),
  recentGrantActivity: z.string().optional(),
  serviceGeo: z.string().optional(),
  state: z.string().optional(),
  fiscalYear: z.string().optional(),
  isVerified: z.boolean().optional(),
  password: z.string().min(8).optional(),
  email: z.string().email().optional(), // For onboarding users without password
})

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  let userId: string | null = null

  // Parse body once
  const body = await request.json()

  if (process.env.NODE_ENV === 'development') {
    console.log('[Onboarding Save] Request body:', JSON.stringify(body, null, 2))
  }

  const data = OrganizationSchema.parse(body)

  // Extract state and map to serviceGeo
  const { state, ...otherData } = data
  const parsedData = {
    ...otherData,
    serviceGeo: state || data.serviceGeo // Use state if provided
  }

  if (session) {
    userId = session.userId ?? session.user.id ?? null
  }

  // If no session but email provided, look up user by email (only for onboarding users without password)
  if (!userId && data.email) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true, hashedPassword: true },
    })
    
    // Only allow if user exists and doesn't have a password yet (in onboarding)
    if (user && !user.hashedPassword) {
      userId = user.id
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {

    // Update password if provided
    if (parsedData.password) {
      const hashedPassword = await hash(parsedData.password, 12)
      await prisma.user.update({
        where: { id: userId },
        data: { hashedPassword },
      })
    }

    console.log('[Onboarding Save] Upserting organization:', { 
      userId, 
      fields: Object.keys(parsedData)
    })

    const organization = await prisma.organization.upsert({
      where: { userId },
      update: {
        ...(parsedData.organizationType !== undefined && { organizationType: parsedData.organizationType }),
        ...(parsedData.ein !== undefined && { ein: parsedData.ein ?? null }),
        ...(parsedData.legalName !== undefined && { legalName: parsedData.legalName ?? null }),
        ...(parsedData.mission !== undefined && { mission: parsedData.mission ?? null }),
        ...(parsedData.budget !== undefined && { budget: parsedData.budget ?? null }),
        ...(parsedData.staffSize !== undefined && { staffSize: parsedData.staffSize ?? null }),
        ...(parsedData.focusAreas !== undefined && { focusAreas: parsedData.focusAreas ?? null }),
        ...(parsedData.revenueBracket !== undefined && { revenueBracket: parsedData.revenueBracket ?? null }),
        ...(parsedData.serviceGeo !== undefined && { serviceGeo: parsedData.serviceGeo ?? null }),
        ...(parsedData.fiscalYear !== undefined && { fiscalYear: parsedData.fiscalYear ?? null }),
        ...(parsedData.isVerified !== undefined && { isVerified: parsedData.isVerified }),
      },
      create: {
        userId,
        organizationType: parsedData.organizationType ?? null,
        ein: parsedData.ein ?? null,
        legalName: parsedData.legalName ?? null,
        mission: parsedData.mission ?? null,
        budget: parsedData.budget ?? null,
        staffSize: parsedData.staffSize ?? null,
        focusAreas: parsedData.focusAreas ?? null,
        revenueBracket: parsedData.revenueBracket ?? null,
        serviceGeo: parsedData.serviceGeo ?? null,
        fiscalYear: parsedData.fiscalYear ?? null,
        isVerified: parsedData.isVerified ?? false,
      },
    })

    console.log('[Onboarding Save] Upsert successful:', organization.id)

    console.log('[Onboarding Save] Success:', { 
      userId, 
      organizationId: organization.id,
      fieldsUpdated: Object.keys(parsedData)
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Onboarding Save] Error occurred:', error)
    
    if (error instanceof z.ZodError) {
      console.error('[Onboarding Save] Zod validation error:', error.issues)
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 })
    }
    
    // Log Prisma/database errors with full details
    if (error instanceof Error) {
      console.error('[Onboarding Save] Error details:', { 
        message: error.message, 
        stack: error.stack,
        name: error.name
      })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
