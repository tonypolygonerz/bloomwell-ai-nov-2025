import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@bloomwell/auth'
import { searchProPublicaOrg, searchProPublicaByName } from '@/lib/propublica'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const ein = searchParams.get('ein')
  const query = searchParams.get('query')

  if (ein) {
    const org = await searchProPublicaOrg(ein)
    return NextResponse.json(org ? { organization: org } : { organization: null })
  }

  if (query) {
    const orgs = await searchProPublicaByName(query)
    return NextResponse.json({ organizations: orgs })
  }

  return NextResponse.json({ error: 'Missing ein or query parameter' }, { status: 400 })
}
