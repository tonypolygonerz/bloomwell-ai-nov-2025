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

  // Calculate completion percentage based on all onboarding fields
  const completionSteps = [
    {
      field: 'organizationType',
      name: 'Basic Details',
      percentage: 10,
      completed: !!organization?.organizationType,
      route: '/onboarding/step2',
    },
    {
      field: 'mission',
      name: 'Mission Statement',
      percentage: 30,
      completed: !!organization?.mission,
      route: '/onboarding/step2',
    },
    {
      field: 'budget',
      name: 'Budget',
      percentage: 15,
      completed: !!organization?.budget,
      route: '/onboarding/step3',
    },
    {
      field: 'staffSize',
      name: 'Staff Size',
      percentage: 15,
      completed: !!organization?.staffSize,
      route: '/onboarding/step3',
    },
    {
      field: 'focusAreas',
      name: 'Focus Areas',
      percentage: 10,
      completed: !!organization?.focusAreas,
      route: '/onboarding/step2',
    },
    {
      field: 'revenueBracket',
      name: 'Revenue Bracket',
      percentage: 10,
      completed: !!organization?.revenueBracket,
      route: '/onboarding/step3',
    },
    {
      field: 'serviceGeo',
      name: 'Service Geography',
      percentage: 5,
      completed: !!organization?.serviceGeo,
      route: '/onboarding/step2',
    },
    {
      field: 'fiscalYear',
      name: 'Fiscal Year',
      percentage: 5,
      completed: !!organization?.fiscalYear,
      route: '/onboarding/step3',
    },
  ]

  const completionPercentage = completionSteps.reduce(
    (total, step) => total + (step.completed ? step.percentage : 0),
    0,
  )

  return NextResponse.json({
    isComplete,
    isBasicComplete,
    isFullComplete,
    organization,
    completionPercentage,
    completionSteps,
  })
}
