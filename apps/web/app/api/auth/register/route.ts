import { NextRequest, NextResponse } from 'next/server'
import prisma from '@bloomwell/db'
import { hash } from 'bcryptjs'
import { z } from 'zod'

// Verify imports are working
try {
  if (!prisma) {
    throw new Error('Prisma client not initialized')
  }
  if (typeof hash !== 'function') {
    throw new Error('bcryptjs hash function not available')
  }
  if (!z) {
    throw new Error('Zod not available')
  }
  console.log('[Registration] Module initialized successfully')
} catch (importError) {
  console.error('[Registration] Module initialization error:', importError)
}

const RegisterSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
})

export async function POST(request: NextRequest) {
  // Early logging to confirm route handler is being called
  console.log('[Registration] POST handler called at:', new Date().toISOString())
  
  try {
    // Log request details in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('[Registration] Request received:', {
        method: request.method,
        url: request.url,
        headers: Object.fromEntries(request.headers.entries()),
      })
    }

    let body: any
    try {
      body = await request.json()
    } catch (jsonError) {
      console.error('[Registration] Failed to parse JSON body:', jsonError)
      return NextResponse.json(
        { error: 'Invalid request body', message: 'Request body must be valid JSON' },
        { status: 400 }
      )
    }
    
    // Log request body in development mode (without password for security)
    if (process.env.NODE_ENV === 'development') {
      console.log('[Registration] Request body:', {
        name: body.name,
        email: body.email,
        password: body.password ? '[REDACTED]' : undefined,
      })
    }
    
    let name: string, email: string, password: string
    try {
      const parsed = RegisterSchema.parse(body)
      name = parsed.name
      email = parsed.email
      password = parsed.password
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        console.error('[Registration] Zod validation error:', validationError.issues)
        return NextResponse.json(
          { error: 'Invalid input', details: validationError.issues },
          { status: 400 }
        )
      }
      throw validationError
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 })
    }

    // Parse firstName and lastName from name
    const nameParts = name.trim().split(' ')
    const firstName = nameParts[0] || null
    const lastName = nameParts.slice(1).join(' ') || null

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Check if admin email
    const isAdmin = email === 'teleportdoor@gmail.com'

    console.log('[Registration] Creating user with email:', email)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
        firstName,
        lastName,
        emailVerified: new Date(), // Auto-verify for now (bypassing email verification)
        isAdmin,
      },
    })

    console.log('[Registration] User created successfully, creating organization...')

    // Create empty organization for new user
    await prisma.organization.create({
      data: {
        userId: user.id,
        name: name, // Use user's name as default organization name
      },
    })

    console.log('[Registration] Organization created successfully')
    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    // Enhanced error logging with Prisma-specific error detection
    console.error('[Registration] Error occurred at:', new Date().toISOString())
    console.error('[Registration] Error type:', error instanceof Error ? error.constructor.name : typeof error)
    console.error('[Registration] Error occurred:', error)

    // Note: Zod validation errors are handled earlier in the try block
    // This catch block handles other errors

    // Check for Prisma errors
    const prismaError = error as any
    if (prismaError?.code) {
      console.error('[Registration] Prisma error details:', {
        code: prismaError.code,
        message: prismaError.message,
        meta: prismaError.meta,
        clientVersion: prismaError.clientVersion,
        stack: prismaError.stack,
      })

      // Handle specific Prisma error codes
      switch (prismaError.code) {
        case 'P2002':
          // Unique constraint violation (duplicate email)
          return NextResponse.json(
            {
              error: 'User already exists',
              message: 'An account with this email already exists.',
              ...(process.env.NODE_ENV === 'development' && {
                details: prismaError.meta,
              }),
            },
            { status: 409 }
          )
        case 'P2025':
          // Record not found (shouldn't happen in registration, but handle it)
          return NextResponse.json(
            {
              error: 'Record not found',
              message: 'The requested record could not be found.',
              ...(process.env.NODE_ENV === 'development' && {
                details: prismaError.meta,
              }),
            },
            { status: 404 }
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
            { status: 400 }
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
            { status: 503 }
          )
        default:
          // Other Prisma errors
          return NextResponse.json(
            {
              error: 'Database error',
              message: 'An error occurred while creating your account.',
              ...(process.env.NODE_ENV === 'development' && {
                details: prismaError.message,
                code: prismaError.code,
              }),
            },
            { status: 500 }
          )
      }
    }

    // Handle generic errors
    if (error instanceof Error) {
      console.error('[Registration] Generic error details:', {
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
      { status: 500 }
    )
  }
}
