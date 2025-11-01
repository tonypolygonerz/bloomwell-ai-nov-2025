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
}

interface GrantsXML {
  Grants: {
    GrantOpportunity: GrantOpportunity[]
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
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

export interface SyncResult {
  kept: number
  rejected: number
  errors: string[]
  timestamp: Date
}

// eslint-disable-next-line max-lines-per-function, complexity
export async function syncGrants(): Promise<SyncResult> {
  const errors: string[] = []
  let kept = 0
  let rejected = 0

  try {
    const apiKey = process.env.GRANTS_GOV_API_KEY
    const grantsUrl = apiKey
      ? `https://www.grants.gov/web/grants/xml-extract.html?api_key=${apiKey}`
      : 'https://www.grants.gov/web/grants/xml-extract.html'

    const response = await fetch(grantsUrl, {
      headers: { Accept: 'application/xml' },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch grants: ${response.statusText}`)
    }

    const xmlData = await response.text()
    const parsed = (await parseStringPromise(xmlData)) as GrantsXML
    const grants = parsed.Grants?.GrantOpportunity ?? []

    const batchSize = 100
    for (let i = 0; i < grants.length; i += batchSize) {
      const batch = grants.slice(i, i + batchSize)

      for (const grant of batch) {
        try {
          const externalId = grant.OpportunityID?.[0] || grant.OpportunityNumber?.[0]
          // eslint-disable-next-line max-depth
          if (!externalId) {
            rejected++
            continue
          }

          const closeDate = parseDate(grant.CloseDate?.[0])
          // eslint-disable-next-line max-depth
          if (isExpired(closeDate)) {
            await prisma.grant.deleteMany({ where: { externalId } })
            rejected++
            continue
          }

          // eslint-disable-next-line max-depth
          if (!isNonprofitRelevant(grant)) {
            rejected++
            continue
          }

          const postedDate = parseDate(grant.PostDate?.[0])

          await prisma.grant.upsert({
            where: { externalId },
            update: {
              title: grant.OpportunityTitle?.[0] ?? '',
              synopsis: grant.Synopsis?.[0] ?? null,
              agency: grant.AgencyName?.[0] ?? null,
              postedDate,
              closeDate,
              eligibility: grant.EligibilityDescription?.[0] ?? null,
            },
            create: {
              externalId,
              title: grant.OpportunityTitle?.[0] ?? '',
              synopsis: grant.Synopsis?.[0] ?? null,
              agency: grant.AgencyName?.[0] ?? null,
              postedDate,
              closeDate,
              eligibility: grant.EligibilityDescription?.[0] ?? null,
              tags: [],
            },
          })

          kept++
        } catch (error) {
          errors.push(`Error processing grant ${grant.OpportunityID?.[0]}: ${error}`)
          rejected++
        }
      }
    }
  } catch (error) {
    errors.push(`Sync failed: ${error}`)
  }

  return { kept, rejected, errors, timestamp: new Date() }
}
