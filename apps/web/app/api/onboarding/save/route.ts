import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@bloomwell/auth'
import prisma from '@bloomwell/db'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { hash } from 'bcryptjs'

const OrganizationSchema = z.object({
  organizationType: z.string().optional(),
  ein: z.string().optional(),
  legalName: z.string().optional(),
  mission: z.string().optional(),
  budget: z.string().optional(),
  staffSize: z.string().optional(),
  focusAreas: z.union([z.string(), z.array(z.string())]).optional(), // Can be string or array
  revenueBracket: z.string().optional(),
  recentGrantActivity: z.string().optional(),
  serviceGeo: z.string().optional(),
  state: z.string().optional(),
  fiscalYear: z.string().optional(),
  isVerified: z.boolean().optional(),
  password: z.string().min(8).optional(),
  email: z.string().email().optional(), // For onboarding users without password
  
  // Step 2 additional fields
  yearsOperating: z.string().optional(),
  stateOfIncorporation: z.string().optional(),
  currentLegalStatus: z.string().optional(),
  taxExemptStatusDate: z.string().optional(),
  
  // Step 3 additional fields
  missionStatement: z.string().optional(),
  programDescriptions: z.union([z.string(), z.array(z.any())]).optional(), // Can be string or array
  geographicServiceArea: z.string().optional(),
  annualBudget: z.string().optional(),
  revenueSourcesGov: z.number().int().min(0).max(100).optional(),
  revenueSourcesPrivate: z.number().int().min(0).max(100).optional(),
  revenueSourcesDonations: z.number().int().min(0).max(100).optional(),
  revenueSourcesOther: z.number().int().min(0).max(100).optional(),
  boardSize: z.number().int().min(0).optional(),
  volunteerCount: z.string().optional(),
  previousGrantExperience: z.string().optional(),
  fundingGoals: z.union([z.string(), z.array(z.string())]).optional(), // Can be string or array
  
  // Step 4 fields
  documents: z.any().optional(), // JSON field for documents
  boardRoster: z.any().optional(), // JSON field for board roster
})

export async function POST(request: NextRequest) {
  // Step 1: Verify database connection
  if (!process.env.DATABASE_URL) {
    console.error('[Onboarding Save] DATABASE_URL environment variable is not set')
    return NextResponse.json(
      { error: 'Database configuration error', message: 'DATABASE_URL is not configured' },
      { status: 503 },
    )
  }

  // Test database connection
  try {
    await prisma.$connect()
    console.log('[Onboarding Save] Database connection verified')
  } catch (dbError: any) {
    console.error('[Onboarding Save] Database connection failed:', {
      message: dbError?.message,
      code: dbError?.code,
      name: dbError?.name,
      stack: dbError?.stack,
    })
    return NextResponse.json(
      {
        error: 'Database connection failed',
        message: 'Unable to connect to database. Please try again later.',
        ...(process.env.NODE_ENV === 'development' && { details: dbError?.message }),
      },
      { status: 503 },
    )
  }

  const session = await getServerSession(authOptions)
  let userId: string | null = null

  // Parse body once
  let body: any
  try {
    body = await request.json()
  } catch (parseError) {
    console.error('[Onboarding Save] Failed to parse request body:', parseError)
    return NextResponse.json(
      { error: 'Invalid request body', message: 'Request body must be valid JSON' },
      { status: 400 },
    )
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[Onboarding Save] Request body:', JSON.stringify(body, null, 2))
  }

  let data: z.infer<typeof OrganizationSchema>
  try {
    data = OrganizationSchema.parse(body)
  } catch (validationError) {
    if (validationError instanceof z.ZodError) {
      console.error('[Onboarding Save] Zod validation error:', validationError.issues)
      return NextResponse.json(
        { error: 'Invalid input', details: validationError.issues },
        { status: 400 },
      )
    }
    throw validationError
  }

  // Extract state and map to serviceGeo
  const { state, focusAreas, fundingGoals, programDescriptions, ...otherData } = data
  const parsedData = {
    ...otherData,
    serviceGeo: state || data.serviceGeo, // Use state if provided
    // Convert focusAreas to JSON if it's an array or string
    focusAreas: focusAreas
      ? Array.isArray(focusAreas)
        ? focusAreas
        : typeof focusAreas === 'string'
        ? focusAreas.split(',').map((s) => s.trim()).filter(Boolean)
        : focusAreas
      : undefined,
    // Convert fundingGoals to JSON if it's an array or string
    fundingGoals: fundingGoals
      ? Array.isArray(fundingGoals)
        ? fundingGoals
        : typeof fundingGoals === 'string'
        ? fundingGoals.split(',').map((s) => s.trim()).filter(Boolean)
        : fundingGoals
      : undefined,
    // Convert programDescriptions to JSON if it's an array or string
    programDescriptions: programDescriptions
      ? Array.isArray(programDescriptions)
        ? programDescriptions
        : typeof programDescriptions === 'string'
        ? (() => {
            try {
              // Try to parse as JSON first (in case it's a JSON string)
              return JSON.parse(programDescriptions)
            } catch {
              // If not valid JSON, return as string (backward compatibility)
              return programDescriptions
            }
          })()
        : programDescriptions
      : undefined,
  }

  if (session) {
    userId = session.userId ?? session.user.id ?? null
  }

  // If no userId from session, try to get email from session or request body
  let emailToUse: string | null = null
  if (!userId) {
    // First try to get email from session if session exists
    if (session?.user?.email) {
      emailToUse = session.user.email
    }
    // Otherwise, allow email in request body for onboarding users
    else if (data.email) {
      emailToUse = data.email
    }
  }

  // If we have an email but no userId, look up user by email (for onboarding)
  if (!userId && emailToUse) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: emailToUse },
        select: { id: true },
      })

      // Allow if user exists (during onboarding, even if they have a password)
      if (user) {
        userId = user.id
      } else {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
    } catch (dbError: any) {
      console.error('[Onboarding Save] Database error looking up user:', {
        email: emailToUse,
        error: dbError?.message,
        code: dbError?.code,
        meta: dbError?.meta,
      })
      return NextResponse.json(
        {
          error: 'Database error',
          message: 'Failed to look up user. Please try again.',
          ...(process.env.NODE_ENV === 'development' && { details: dbError?.message }),
        },
        { status: 503 },
      )
    }
  }

  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized - No session or email provided' },
      { status: 401 },
    )
  }

  try {
    // Update password if provided
    if (parsedData.password) {
      try {
        const hashedPassword = await hash(parsedData.password, 12)
        await prisma.user.update({
          where: { id: userId },
          data: { hashedPassword },
        })
        console.log('[Onboarding Save] Password updated for user:', userId)
      } catch (dbError: any) {
        console.error('[Onboarding Save] Error updating password:', {
          userId,
          error: dbError?.message,
          code: dbError?.code,
          meta: dbError?.meta,
        })
        // Continue with organization save even if password update fails
      }
    }

    console.log('[Onboarding Save] Upserting organization:', {
      userId,
      fields: Object.keys(parsedData),
      parsedData: process.env.NODE_ENV === 'development' ? parsedData : undefined,
    })

    const organization = await prisma.organization.upsert({
      where: { userId },
      update: {
        ...(parsedData.organizationType !== undefined && {
          organizationType: parsedData.organizationType,
        }),
        ...(parsedData.ein !== undefined && { ein: parsedData.ein ?? null }),
        ...(parsedData.legalName !== undefined && { legalName: parsedData.legalName ?? null }),
        ...(parsedData.mission !== undefined && { mission: parsedData.mission ?? null }),
        ...(parsedData.budget !== undefined && { budget: parsedData.budget ?? null }),
        ...(parsedData.staffSize !== undefined && { staffSize: parsedData.staffSize ?? null }),
        ...(parsedData.focusAreas !== undefined && { focusAreas: parsedData.focusAreas ? (Array.isArray(parsedData.focusAreas) ? parsedData.focusAreas : [parsedData.focusAreas]) : Prisma.JsonNull }),
        ...(parsedData.revenueBracket !== undefined && {
          revenueBracket: parsedData.revenueBracket ?? null,
        }),
        ...(parsedData.serviceGeo !== undefined && { serviceGeo: parsedData.serviceGeo ?? null }),
        ...(parsedData.fiscalYear !== undefined && { fiscalYear: parsedData.fiscalYear ?? null }),
        ...(parsedData.isVerified !== undefined && { isVerified: parsedData.isVerified }),
        // Step 2 fields
        ...(parsedData.yearsOperating !== undefined && {
          yearsOperating: parsedData.yearsOperating ?? null,
        }),
        ...(parsedData.stateOfIncorporation !== undefined && {
          stateOfIncorporation: parsedData.stateOfIncorporation ?? null,
        }),
        ...(parsedData.currentLegalStatus !== undefined && {
          currentLegalStatus: parsedData.currentLegalStatus ?? null,
        }),
        ...(parsedData.taxExemptStatusDate !== undefined && {
          taxExemptStatusDate: parsedData.taxExemptStatusDate ?? null,
        }),
        // Step 3 fields
        ...(parsedData.missionStatement !== undefined && {
          missionStatement: parsedData.missionStatement ?? null,
        }),
        ...(parsedData.programDescriptions !== undefined && {
          programDescriptions: parsedData.programDescriptions ?? null,
        }),
        ...(parsedData.geographicServiceArea !== undefined && {
          geographicServiceArea: parsedData.geographicServiceArea ?? null,
        }),
        ...(parsedData.annualBudget !== undefined && {
          annualBudget: parsedData.annualBudget ?? null,
        }),
        ...(parsedData.revenueSourcesGov !== undefined && {
          revenueSourcesGov: parsedData.revenueSourcesGov ?? null,
        }),
        ...(parsedData.revenueSourcesPrivate !== undefined && {
          revenueSourcesPrivate: parsedData.revenueSourcesPrivate ?? null,
        }),
        ...(parsedData.revenueSourcesDonations !== undefined && {
          revenueSourcesDonations: parsedData.revenueSourcesDonations ?? null,
        }),
        ...(parsedData.revenueSourcesOther !== undefined && {
          revenueSourcesOther: parsedData.revenueSourcesOther ?? null,
        }),
        ...(parsedData.boardSize !== undefined && {
          boardSize: parsedData.boardSize ?? null,
        }),
        ...(parsedData.volunteerCount !== undefined && {
          volunteerCount: parsedData.volunteerCount ?? null,
        }),
        ...(parsedData.previousGrantExperience !== undefined && {
          previousGrantExperience: parsedData.previousGrantExperience ?? null,
        }),
        ...(parsedData.fundingGoals !== undefined && {
          fundingGoals: parsedData.fundingGoals ? (Array.isArray(parsedData.fundingGoals) ? parsedData.fundingGoals : [parsedData.fundingGoals]) : Prisma.JsonNull,
        }),
        // Step 4 fields
        ...(parsedData.documents !== undefined && {
          documents: parsedData.documents ?? null,
        }),
        ...(parsedData.boardRoster !== undefined && {
          boardRoster: parsedData.boardRoster ?? null,
        }),
      },
      create: {
        userId,
        organizationType: parsedData.organizationType ?? null,
        ein: parsedData.ein ?? null,
        legalName: parsedData.legalName ?? null,
        mission: parsedData.mission ?? null,
        budget: parsedData.budget ?? null,
        staffSize: parsedData.staffSize ?? null,
        focusAreas: parsedData.focusAreas ? (Array.isArray(parsedData.focusAreas) ? parsedData.focusAreas : [parsedData.focusAreas]) : Prisma.JsonNull,
        revenueBracket: parsedData.revenueBracket ?? null,
        serviceGeo: parsedData.serviceGeo ?? null,
        fiscalYear: parsedData.fiscalYear ?? null,
        isVerified: parsedData.isVerified ?? false,
        // Step 2 fields
        yearsOperating: parsedData.yearsOperating ?? null,
        stateOfIncorporation: parsedData.stateOfIncorporation ?? null,
        currentLegalStatus: parsedData.currentLegalStatus ?? null,
        taxExemptStatusDate: parsedData.taxExemptStatusDate ?? null,
        // Step 3 fields
        missionStatement: parsedData.missionStatement ?? null,
        programDescriptions: parsedData.programDescriptions ?? null,
        geographicServiceArea: parsedData.geographicServiceArea ?? null,
        annualBudget: parsedData.annualBudget ?? null,
        revenueSourcesGov: parsedData.revenueSourcesGov ?? null,
        revenueSourcesPrivate: parsedData.revenueSourcesPrivate ?? null,
        revenueSourcesDonations: parsedData.revenueSourcesDonations ?? null,
        revenueSourcesOther: parsedData.revenueSourcesOther ?? null,
        boardSize: parsedData.boardSize ?? null,
        volunteerCount: parsedData.volunteerCount ?? null,
        previousGrantExperience: parsedData.previousGrantExperience ?? null,
        fundingGoals: parsedData.fundingGoals ? (Array.isArray(parsedData.fundingGoals) ? parsedData.fundingGoals : [parsedData.fundingGoals]) : Prisma.JsonNull,
        // Step 4 fields
        documents: parsedData.documents ?? null,
        boardRoster: parsedData.boardRoster ?? null,
      },
    })

    console.log('[Onboarding Save] Upsert successful:', {
      organizationId: organization.id,
      userId,
      organizationType: organization.organizationType,
    })

    // Return success with saved organization data for verification
    return NextResponse.json({
      success: true,
      organization: {
        id: organization.id,
        organizationType: organization.organizationType,
        isBasicComplete: !!organization.organizationType,
      },
    })
  } catch (error) {
    // Enhanced error logging with Prisma-specific error detection
    console.error('[Onboarding Save] Error occurred:', error)

    // Check for Prisma errors
    const prismaError = error as any
    if (prismaError?.code) {
      console.error('[Onboarding Save] Prisma error details:', {
        code: prismaError.code,
        message: prismaError.message,
        meta: prismaError.meta,
        clientVersion: prismaError.clientVersion,
        stack: prismaError.stack,
      })

      // Handle specific Prisma error codes
      switch (prismaError.code) {
        case 'P2002':
          // Unique constraint violation
          return NextResponse.json(
            {
              error: 'Duplicate entry',
              message: 'This organization already exists for this user.',
              ...(process.env.NODE_ENV === 'development' && {
                details: prismaError.meta,
              }),
            },
            { status: 409 },
          )
        case 'P2025':
          // Record not found
          return NextResponse.json(
            {
              error: 'Record not found',
              message: 'The requested record could not be found.',
              ...(process.env.NODE_ENV === 'development' && {
                details: prismaError.meta,
              }),
            },
            { status: 404 },
          )
        case 'P2003':
          // Foreign key constraint violation
          return NextResponse.json(
            {
              error: 'Invalid reference',
              message: 'Referenced record does not exist.',
              ...(process.env.NODE_ENV === 'development' && {
                details: prismaError.meta,
              }),
            },
            { status: 400 },
          )
        case 'P1001':
        case 'P1002':
        case 'P1008':
          // Database connection/timeout errors
          return NextResponse.json(
            {
              error: 'Database connection error',
              message: 'Unable to connect to database. Please try again later.',
              ...(process.env.NODE_ENV === 'development' && {
                details: prismaError.message,
              }),
            },
            { status: 503 },
          )
        default:
          // Other Prisma errors
          return NextResponse.json(
            {
              error: 'Database error',
              message: 'An error occurred while saving your data.',
              ...(process.env.NODE_ENV === 'development' && {
                details: prismaError.message,
                code: prismaError.code,
              }),
            },
            { status: 500 },
          )
      }
    }

    // Handle Zod validation errors (shouldn't reach here, but just in case)
    if (error instanceof z.ZodError) {
      console.error('[Onboarding Save] Zod validation error:', error.issues)
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 })
    }

    // Handle generic errors
    if (error instanceof Error) {
      console.error('[Onboarding Save] Generic error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      })
    }

    // Return generic 500 error for unknown errors
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'An unexpected error occurred. Please try again.',
        ...(process.env.NODE_ENV === 'development' && {
          details: error instanceof Error ? error.message : String(error),
        }),
      },
      { status: 500 },
    )
  }
}
