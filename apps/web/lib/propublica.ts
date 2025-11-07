interface ProPublicaOrg {
  ein: string | number
  strein?: string
  name: string
  city: string
  state: string
  ntee_code: string
  ntee_type: string
  subsection: string
  classification: string
}

interface ProPublicaResponse {
  organizations: ProPublicaOrg[]
}

export async function searchProPublicaOrg(ein: string): Promise<ProPublicaOrg | null> {
  // ProPublica API is public and doesn't require an API key
  // API key check removed to allow public access
  try {
    const response = await fetch(
      `https://projects.propublica.org/nonprofits/api/v2/organizations/${ein}.json`,
      {
        headers: {
          'User-Agent': 'Bloomwell-AI/1.0',
        },
      },
    )

    if (!response.ok) {
      return null
    }

    const data = (await response.json()) as { organization: ProPublicaOrg }
    return data.organization ?? null
  } catch {
    return null
  }
}

export async function searchProPublicaByName(query: string): Promise<ProPublicaOrg[]> {
  // ProPublica API is public and doesn't require an API key
  // API key check removed to allow public access
  try {
    const response = await fetch(
      `https://projects.propublica.org/nonprofits/api/v2/search.json?q=${encodeURIComponent(query)}`,
      {
        headers: {
          'User-Agent': 'Bloomwell-AI/1.0',
        },
      },
    )

    if (!response.ok) {
      return []
    }

    const data = (await response.json()) as ProPublicaResponse
    return data.organizations ?? []
  } catch {
    return []
  }
}
