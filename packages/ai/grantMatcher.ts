import { OllamaCloudClient } from './providers/ollama'
import prisma, { Prisma } from '@bloomwell/db'

export interface GrantRecommendation {
  grantId: string
  matchScore: number // 0-100
  reasoning: string
  grant: {
    id: string
    title: string
    agency: string | null
    closeDate: Date | null
    synopsis: string | null
  }
}

interface LLMRecommendationResponse {
  recommendations: Array<{
    grantId: string
    matchScore: number
    reasoning: string
  }>
}

export async function getGrantRecommendations(
  organizationId: string,
  context?: string,
  urgency: 'immediate' | 'planning' | 'long-term' = 'planning',
): Promise<GrantRecommendation[]> {
  // Fetch organization data
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
  })

  if (!organization) {
    throw new Error(`Organization with id ${organizationId} not found`)
  }

  // Calculate date thresholds based on urgency
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let grantWhereClause: Prisma.GrantWhereInput

  if (urgency === 'immediate') {
    const thirtyDaysFromNow = new Date(today)
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    grantWhereClause = {
      AND: [
        { closeDate: { gte: today } },
        { closeDate: { lte: thirtyDaysFromNow } },
      ],
    }
  } else if (urgency === 'planning') {
    const ninetyDaysFromNow = new Date(today)
    ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90)
    grantWhereClause = {
      AND: [
        { closeDate: { gte: today } },
        { closeDate: { lte: ninetyDaysFromNow } },
      ],
    }
  } else {
    // long-term: All active grants
    grantWhereClause = {
      OR: [{ closeDate: null }, { closeDate: { gte: today } }],
    }
  }

  // Query grants with SQL filtering - limit to 100-200 for LLM processing
  const grants = await prisma.grant.findMany({
    where: grantWhereClause,
    take: 200, // Limit to 200 grants max
    orderBy: { closeDate: 'asc' }, // Prioritize soon-to-close grants
  })

  if (grants.length === 0) {
    return []
  }

  // Build organization profile string
  const organizationProfile = [
    organization.legalName && `Legal Name: ${organization.legalName}`,
    organization.mission && `Mission: ${organization.mission}`,
    organization.focusAreas && `Focus Areas: ${organization.focusAreas}`,
    organization.budget && `Budget: ${organization.budget}`,
    organization.staffSize && `Staff Size: ${organization.staffSize}`,
    organization.revenueBracket && `Revenue Bracket: ${organization.revenueBracket}`,
    organization.serviceGeo && `Service Geography: ${organization.serviceGeo}`,
    organization.fiscalYear && `Fiscal Year: ${organization.fiscalYear}`,
  ]
    .filter(Boolean)
    .join('\n')

  // Format grants data for LLM
  const grantsData = grants.map((grant) => ({
    id: grant.id,
    title: grant.title,
    agency: grant.agency || 'Unknown',
    closeDate: grant.closeDate?.toISOString() || 'No deadline',
    synopsis: grant.synopsis || 'No description available',
    eligibility: grant.eligibility || 'No eligibility requirements specified',
    tags: grant.tags.length > 0 ? grant.tags.join(', ') : 'No tags',
  }))

  // Construct prompt for LLM
  const prompt = `You are an expert grant matching advisor for nonprofits. Analyze the following organization profile and available grants to identify the top 5 best matching opportunities.

ORGANIZATION PROFILE:
${organizationProfile}
${context ? `\nAdditional Context: ${context}` : ''}

AVAILABLE GRANTS (${grants.length} total):
${JSON.stringify(grantsData, null, 2)}

INSTRUCTIONS:
1. Analyze each grant against the organization's profile, mission, focus areas, and context
2. Consider alignment with mission, eligibility requirements, geographic fit, and organizational capacity
3. Select the TOP 5 grants that best match this organization
4. For each match, provide:
   - grantId: The grant's ID from the data above
   - matchScore: A score from 0-100 indicating how well the grant matches (higher is better)
   - reasoning: 2-3 sentences explaining why this grant is a good match

Return your response as valid JSON in this exact format:
{
  "recommendations": [
    {
      "grantId": "grant_id_here",
      "matchScore": 85,
      "reasoning": "This grant aligns well because..."
    },
    ...
  ]
}

IMPORTANT: Return ONLY valid JSON, no additional text or markdown formatting.`

  // Initialize Ollama client
  const apiKey = process.env.OLLAMA_CLOUD_API_KEY
  if (!apiKey) {
    throw new Error('OLLAMA_CLOUD_API_KEY environment variable is not set')
  }

  const ollamaClient = new OllamaCloudClient({ apiKey })
  const model = 'deepseek-chat'

  try {
    // Call Ollama API
    const response = await ollamaClient.chat({
      model,
      messages: [
        {
          role: 'system',
          content:
            'You are a grant matching expert. Always respond with valid JSON only, no markdown or additional formatting.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    // Parse JSON response - handle potential markdown code blocks
    let jsonString = response.trim()
    
    // Remove markdown code blocks if present
    if (jsonString.startsWith('```')) {
      jsonString = jsonString.replace(/^```(?:json)?\n?/g, '').replace(/\n?```$/g, '')
    }

    const parsedResponse = JSON.parse(jsonString) as LLMRecommendationResponse

    // Validate and map recommendations back to full grant objects
    const recommendations: GrantRecommendation[] = []
    const grantMap = new Map(grants.map((g) => [g.id, g]))

    // Process up to 5 recommendations
    const topRecommendations = parsedResponse.recommendations?.slice(0, 5) || []

    for (const rec of topRecommendations) {
      const grant = grantMap.get(rec.grantId)
      if (grant) {
        // Validate and clamp match score
        const matchScore = Math.max(0, Math.min(100, rec.matchScore || 0))

        recommendations.push({
          grantId: rec.grantId,
          matchScore,
          reasoning: rec.reasoning || 'No reasoning provided',
          grant: {
            id: grant.id,
            title: grant.title,
            agency: grant.agency,
            closeDate: grant.closeDate,
            synopsis: grant.synopsis,
          },
        })
      }
    }

    // Sort by match score (highest first)
    recommendations.sort((a, b) => b.matchScore - a.matchScore)

    return recommendations
  } catch (error) {
    // Graceful degradation: if LLM fails, return empty array or throw
    console.error('Error in grant matching:', error)
    throw new Error(
      `Failed to generate grant recommendations: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }
}

