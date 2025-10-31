import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@bloomwell/auth'
import { syncGrants } from '@/lib/grantsSync'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const role = (session as never).role as string
  if (role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const result = await syncGrants()
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Sync failed', details: String(error) }, { status: 500 })
  }
}

