import { getServerSession } from 'next-auth'
import { authOptions } from '@bloomwell/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    return NextResponse.json({
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      timestamp: new Date().toISOString(),
      sessionExpires: session?.expires
    })
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 })
  }
}

