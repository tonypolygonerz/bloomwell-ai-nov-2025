import prisma from '@bloomwell/db'
import { parseStringPromise } from 'xml2js'

interface GrantOpportunity {
  OpportunityID: string[]
  OpportunityTitle: string[]
  OpportunityNumber: string[]
  AgencyName: string[]
  PostDate: string[]
  CloseDate: string[]
  Synopsis: string[]
  EligibilityDescription?: string[]
  CategoryExplanation?: string[]
}

interface GrantsXML {
  Grants: {
    GrantOpportunity: GrantOpportunity[]
  }
}

const GRANTS_GOV_BASE_URL = 'https://www.grants.gov/web/grants/xml-extract.html'

const NONPROFIT_KEYWORDS = [
  'nonprofit',
  'non-profit',
  '501(c)',
  'charitable',
  'community',
  'public benefit',
  'education',
  'health',
  'social services',
  'housing',
  'arts',
  'environment',
]

function isNonprofitRelevant(grant: GrantOpportunity): boolean {
  const title = (grant.OpportunityTitle?.[0] ?? '').toLowerCase()
  const synopsis = (grant.Synopsis?.[0] ?? '').toLowerCase()
  const eligibility = (grant.EligibilityDescription?.[0] ?? '').toLowerCase()
  const combined = `${title} ${synopsis} ${eligibility}`

  return NONPROFIT_KEYWORDS.some((keyword) => combined.includes(keyword.toLowerCase()))
}

function parseDate(dateStr: string | undefined): Date | null {
  if (!dateStr) return null
  const parsed = new Date(dateStr)
  return isNaN(parsed.getTime()) ? null : parsed
}

function isExpired(closeDate: Date | null): boolean {
  if (!closeDate) return false
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return closeDate < tomorrow
}

export async function syncGrants(): Promise<{ kept: number; rejected: number; errors: string[] }> {
  const errors: string[] = []
  let kept = 0
  let rejected = 0

  try {
    // In production, this would fetch from grants.gov API
    // For now, we'll use a placeholder URL or file
    const apiKey = process.env.GRANTS_GOV_API_KEY
    const grantsUrl = apiKey
      ? `https://www.grants.gov/web/grants/xml-extract.html?api_key=${apiKey}`
      : GRANTS_GOV_BASE_URL

    const response = await fetch(grantsUrl, {
      headers: {
        Accept: 'application/xml',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch grants: ${response.statusText}`)
    }

    const xmlData = await response.text()
    const parsed = (await parseStringPromise(xmlData)) as GrantsXML

    const grants = parsed.Grants?.GrantOpportunity ?? []

    // Process 100 at a time
    const batchSize = 100
    for (let i = 0; i < grants.length; i += batchSize) {
      const batch = grants.slice(i, i + batchSize)

      for (const grant of batch) {
        try {
          const externalId = grant.OpportunityID?.[0] || grant.OpportunityNumber?.[0]
          if (!externalId) {
            rejected++
            continue
          }

          const closeDate = parseDate(grant.CloseDate?.[0])
          if (isExpired(closeDate)) {
            // Remove expired grant
            await prisma.grant.deleteMany({
              where: { externalId },
            })
            rejected++
            continue
          }

          if (!isNonprofitRelevant(grant)) {
            rejected++
            continue
          }

          const postedDate = parseDate(grant.PostDate?.[0])

          // Upsert grant
          await prisma.grant.upsert({
            where: { externalId },
            update: {
              title: grant.OpportunityTitle?.[0] ?? '',
              synopsis: grant.Synopsis?.[0],
              agency: grant.AgencyName?.[0],
              postedDate,
              closeDate,
              eligibility: grant.EligibilityDescription?.[0],
              tags: [], // Could extract tags from CategoryExplanation
            },
            create: {
              externalId,
              title: grant.OpportunityTitle?.[0] ?? '',
              synopsis: grant.Synopsis?.[0],
              agency: grant.AgencyName?.[0],
              postedDate,
              closeDate,
              eligibility: grant.EligibilityDescription?.[0],
              tags: [],
            },
          })

          kept++
        } catch (error) {
          errors.push(`Error processing grant: ${error}`)
          rejected++
        }
      }
    }
  } catch (error) {
    errors.push(`Sync failed: ${error}`)
  }

  return { kept, rejected, errors }
}

// Allow running as a script
if (require.main === module) {
  syncGrants()
    .then((result) => {
      console.log('Sync complete:', result)
      process.exit(0)
    })
    .catch((error) => {
      console.error('Sync failed:', error)
      process.exit(1)
    })
}
