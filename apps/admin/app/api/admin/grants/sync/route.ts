import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@bloomwell/auth'
import { syncGrants } from '@/lib/grantsSync'

// eslint-disable-next-line @typescript-eslint/naming-convention
export async function POST(): Promise<NextResponse> {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const result = await syncGrants()
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Sync failed', details: String(error) }, { status: 500 })
  }
}
