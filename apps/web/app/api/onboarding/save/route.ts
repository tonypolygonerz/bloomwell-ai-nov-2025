import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@bloomwell/auth'
import prisma from '@bloomwell/db'
import { z } from 'zod'

const OrganizationSchema = z.object({
  organizationType: z.string(),
  ein: z.string().optional(),
  legalName: z.string().optional(),
  mission: z.string().optional(),
  budget: z.string().optional(),
  staffSize: z.string().optional(),
  focusAreas: z.string().optional(),
  revenueBracket: z.string().optional(),
  recentGrantActivity: z.string().optional(),
  serviceGeo: z.string().optional(),
  fiscalYear: z.string().optional(),
})

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.userId ?? session.user.id
  if (!userId) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const data = OrganizationSchema.parse(body)

    await prisma.organization.upsert({
      where: { userId },
      update: {
        ein: data.ein ?? null,
        legalName: data.legalName ?? null,
        mission: data.mission ?? null,
        budget: data.budget ?? null,
        staffSize: data.staffSize ?? null,
        focusAreas: data.focusAreas ?? null,
        revenueBracket: data.revenueBracket ?? null,
        serviceGeo: data.serviceGeo ?? null,
        fiscalYear: data.fiscalYear ?? null,
      },
      create: {
        userId,
        ein: data.ein ?? null,
        legalName: data.legalName ?? null,
        mission: data.mission ?? null,
        budget: data.budget ?? null,
        staffSize: data.staffSize ?? null,
        focusAreas: data.focusAreas ?? null,
        revenueBracket: data.revenueBracket ?? null,
        serviceGeo: data.serviceGeo ?? null,
        fiscalYear: data.fiscalYear ?? null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

