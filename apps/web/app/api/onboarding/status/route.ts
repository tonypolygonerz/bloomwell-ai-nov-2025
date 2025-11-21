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

  // Calculate completion percentage based on 4-step onboarding system
  // Step 2: 25% total (100 points)
  // Step 3: 50% total (200 points)
  // Step 4: 25% total (100 points)
  // Total: 400 points = 100%

  let totalPoints = 400
  let earnedPoints = 0

  // Step 2 fields (25% = 100 points, ~17 points per field)
  const step2Fields = [
    { field: 'organizationType', points: 17 },
    { field: 'legalName', points: 17 },
    { field: 'ein', points: 17 },
    { field: 'yearsOperating', points: 17 },
    { field: 'stateOfIncorporation', points: 17 },
    { field: 'currentLegalStatus', points: 15 }, // Slightly less to total 100
  ]

  step2Fields.forEach(({ field, points }) => {
    const value = organization?.[field as keyof typeof organization]
    if (value !== null && value !== undefined && value !== '') {
      earnedPoints += points
    }
  })

  // Step 3 required fields (50% = 200 points, ~33 points per required field)
  const step3RequiredFields = [
    { field: 'missionStatement', points: 33 },
    { field: 'geographicServiceArea', points: 33 },
    { field: 'annualBudget', points: 33 },
    { field: 'fiscalYear', points: 33 },
    { field: 'staffSize', points: 33 },
    { field: 'previousGrantExperience', points: 35 }, // Slightly more to total 200
  ]

  step3RequiredFields.forEach(({ field, points }) => {
    const value = organization?.[field as keyof typeof organization]
    if (value !== null && value !== undefined && value !== '') {
      earnedPoints += points
    }
  })

  // Step 3 optional fields (bonus points, already counted in required)
  const step3OptionalFields = [
    { field: 'focusAreas', points: 7 },
    { field: 'programDescriptions', points: 7 },
    { field: 'boardSize', points: 7 },
    { field: 'volunteerCount', points: 7 },
    { field: 'fundingGoals', points: 7 },
  ]

  step3OptionalFields.forEach(({ field, points }) => {
    const value = organization?.[field as keyof typeof organization]
    if (value !== null && value !== undefined && value !== '') {
      // Check if it's an array/JSON and has content
      if (Array.isArray(value) && value.length > 0) {
        earnedPoints += points
      } else if (typeof value === 'string' && value.trim() !== '') {
        earnedPoints += points
      } else if (typeof value === 'number' && value > 0) {
        earnedPoints += points
      }
    }
  })

  // Step 4 fields (25% = 100 points)
  // Documents: 50 points (determination501c3 required = 30, others = 20)
  // Board Roster: 50 points
  if (organization?.documents) {
    const documents = organization.documents as any
    if (documents?.determination501c3) {
      earnedPoints += 30
    }
    if (documents?.articlesIncorporation || documents?.bylaws || documents?.form990s?.length > 0) {
      earnedPoints += 10
    }
    if (documents?.pastGrantApplications?.length > 0) {
      earnedPoints += 10
    }
  }

  if (organization?.boardRoster) {
    const boardRoster = organization.boardRoster as any[]
    if (Array.isArray(boardRoster) && boardRoster.length > 0) {
      // Award points based on number of complete board members
      const completeMembers = boardRoster.filter(
        (member) => member.name || member.title || member.background,
      )
      if (completeMembers.length >= 3) {
        earnedPoints += 50
      } else if (completeMembers.length >= 1) {
        earnedPoints += 25
      }
    }
  }

  const completionPercentage = Math.round((earnedPoints / totalPoints) * 100)

  // Completion flags
  // Basic complete = Step 2 complete (all required fields)
  const step2Complete =
    !!organization?.organizationType &&
    !!organization?.yearsOperating &&
    !!organization?.stateOfIncorporation &&
    !!organization?.currentLegalStatus

  // Full complete = All steps complete (90%+ completion)
  const isFullComplete = completionPercentage >= 90
  const isBasicComplete = step2Complete
  const isComplete = completionPercentage >= 100

  // Completion steps breakdown
  const completionSteps = {
    step2: step2Complete,
    step3: isFullComplete || completionPercentage >= 50,
    step4: completionPercentage >= 75,
  }

  return NextResponse.json({
    isComplete,
    isBasicComplete,
    isFullComplete,
    organization,
    completionPercentage,
    completionSteps,
  })
}
