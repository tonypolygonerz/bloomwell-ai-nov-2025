import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@bloomwell/auth'
import prisma from '@bloomwell/db'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const role = (session as never).role as string
  if (role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const total = await prisma.grant.count()

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)

    const active = await prisma.grant.count({
      where: {
        OR: [{ closeDate: null }, { closeDate: { gte: tomorrow } }],
      },
    })

    const expired = await prisma.grant.count({
      where: {
        closeDate: { lt: tomorrow },
      },
    })

    return NextResponse.json({ total, active, expired })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats', details: String(error) }, { status: 500 })
  }
}

