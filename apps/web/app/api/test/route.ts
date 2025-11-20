import { NextResponse } from 'next/server'
import prisma from '@bloomwell/db'

export async function GET() {
  try {
    // Test database connection with simple count query
    const count = await prisma.webinar.count()
    
    return NextResponse.json({ 
      message: 'Database working',
      count,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    // Detailed error logging
    console.error('[Test API] Database connection error:', {
      message: error?.message || String(error),
      code: error?.code,
      name: error?.name,
      stack: error?.stack,
    })

    const errorMessage = process.env.NODE_ENV === 'development' 
      ? `Database connection failed: ${error?.message || String(error)}`
      : 'Database connection failed'

    return NextResponse.json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? {
        code: error?.code,
        name: error?.name,
      } : undefined,
    }, { status: 500 })
  }
}

