import { OllamaCloudClient } from './providers/ollama'
import { BraveSearchClient } from './providers/webSearch'
import { getGrantRecommendations, GrantRecommendation } from './grantMatcher'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface ChatOptions {
  enableWebSearch?: boolean
  model?: string
  userId?: string
  organizationId?: string
  context?: string
}

export interface ChatResponse {
  message: ChatMessage
  grantRecommendations?: GrantRecommendation[]
}

export async function generateChatResponse(
  messages: ChatMessage[],
  options: ChatOptions = {},
): Promise<ChatResponse> {
  const apiKey = process.env.OLLAMA_CLOUD_API_KEY
  if (!apiKey) {
    return {
      message: {
        role: 'assistant',
        content: 'AI service is not configured. Please contact support.',
      },
    }
  }

  const ollamaClient = new OllamaCloudClient(apiKey)
  const model = options.model ?? 'deepseek-chat'

  // Detect funding-related keywords
  const fundingKeywords = ['grant', 'funding', 'money', 'budget', 'financial', 'donate']
  const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')
  const isFundingRelated =
    lastUserMessage &&
    fundingKeywords.some((keyword) => lastUserMessage.content.toLowerCase().includes(keyword))

  // Fetch grant recommendations if funding context detected and organizationId provided
  let grantRecommendations: GrantRecommendation[] | undefined
  if (isFundingRelated && options.organizationId) {
    try {
      const context = options.context || lastUserMessage?.content || ''
      grantRecommendations = await getGrantRecommendations(
        options.organizationId,
        context,
        'planning',
      )
    } catch (error) {
      // Log error but don't fail the chat
      console.error('Error fetching grant recommendations:', error)
      grantRecommendations = []
    }
  }

  let systemContext = messages
  const systemMessages: ChatMessage[] = []

  // Add grant recommendations to system prompt if available
  if (grantRecommendations && grantRecommendations.length > 0) {
    const grantsText = grantRecommendations
      .map(
        (rec, idx) => `${idx + 1}. **${rec.grant.title}** (${rec.grant.agency || 'Unknown Agency'})
   - Match Score: ${rec.matchScore}/100
   - Deadline: ${rec.grant.closeDate ? new Date(rec.grant.closeDate).toLocaleDateString() : 'No deadline'}
   - Reasoning: ${rec.reasoning}
   - Synopsis: ${rec.grant.synopsis || 'No description available'}`,
      )
      .join('\n\n')

    systemMessages.push({
      role: 'system',
      content: `You are a helpful AI assistant and funding advisor for nonprofits. Based on the user's funding needs, here are relevant grant opportunities to recommend:\n\n${grantsText}\n\nWhen responding, naturally reference these grants and explain why they are good matches. Include the grant titles, agencies, deadlines, and key reasons for each recommendation.`,
    })
  }

  // Add web search results if enabled
  if (options.enableWebSearch && process.env.BRAVE_API_KEY) {
    if (lastUserMessage) {
      const searchClient = new BraveSearchClient(process.env.BRAVE_API_KEY)
      const webResults = await searchClient.search(lastUserMessage.content)

      if (webResults) {
        systemMessages.push({
          role: 'system',
          content: `Here is recent web information that may be relevant:\n\n${webResults}\n\nUse this information to provide accurate, up-to-date answers.`,
        })
      }
    }
  }

  if (systemMessages.length > 0) {
    systemContext = [...systemMessages, ...messages]
  }

  try {
    const response = await ollamaClient.chat({
      model,
      messages: systemContext.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    })

    return {
      message: {
        role: 'assistant',
        content: response,
      },
      ...(grantRecommendations ? { grantRecommendations } : {}),
    }
  } catch (error) {
    return {
      message: {
        role: 'assistant',
        content: 'I encountered an error processing your request. Please try again.',
      },
      ...(grantRecommendations ? { grantRecommendations } : {}),
    }
  }
}

