import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@bloomwell/auth'
import prisma from '@bloomwell/db'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.userId ?? session.user.id
  if (!userId) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
  }

  const organization = await prisma.organization.findUnique({
    where: { userId },
  })

  // Basic completion: organizationType exists (Step 1 done)
  const isBasicComplete = !!organization?.organizationType

  // Full completion: mission + at least one capacity field (for grant matching)
  const hasMission = !!organization?.mission
  const hasCapacityInfo =
    !!organization?.budget || !!organization?.revenueBracket || !!organization?.staffSize
  const isFullComplete = hasMission && hasCapacityInfo

  // Backward compatibility: isComplete = isFullComplete
  const isComplete = isFullComplete

  return NextResponse.json({ 
    isComplete, 
    isBasicComplete, 
    isFullComplete, 
    organization 
  })
}
