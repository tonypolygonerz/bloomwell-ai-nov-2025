import { NextRequest, NextResponse } from 'next/server'
import { searchProPublicaOrg, searchProPublicaByName } from '@/lib/propublica'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const ein = searchParams.get('ein')
  const query = searchParams.get('query') || searchParams.get('q')

  if (ein) {
    const org = await searchProPublicaOrg(ein)
    if (org) {
      return NextResponse.json({ 
        organization: {
          ...org,
          ein: org.strein || String(org.ein),
        }
      })
    }
    return NextResponse.json({ organization: null })
  }

  if (query) {
    if (query.length < 3) {
      return NextResponse.json({ organizations: [] })
    }
    const orgs = await searchProPublicaByName(query)
    return NextResponse.json({ 
      organizations: orgs.map(org => ({
        name: org.name,
        ein: org.strein || String(org.ein),
        city: org.city,
        state: org.state,
        mission: org.ntee_type || org.classification || '',
      }))
    })
  }

  return NextResponse.json({ error: 'Missing ein or query parameter' }, { status: 400 })
}
