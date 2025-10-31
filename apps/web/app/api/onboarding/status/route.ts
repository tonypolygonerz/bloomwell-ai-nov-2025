import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@bloomwell/auth'
import prisma from '@bloomwell/db'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = (session as never).userId as string
  if (!userId) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
  }

  const organization = await prisma.organization.findUnique({
    where: { userId },
  })

  // Consider onboarding complete if organization exists with:
  // - Mission (Step 2: What You Do - critical for grant matching)
  // - At least one capacity field (budget, revenue, or staff size from Step 3)
  const hasMission = !!organization?.mission
  const hasCapacityInfo =
    !!organization?.budget ||
    !!organization?.revenueBracket ||
    !!organization?.staffSize

  const isComplete = hasMission && hasCapacityInfo

  return NextResponse.json({ isComplete, organization })
}

