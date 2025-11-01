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

  const ollamaClient = new OllamaCloudClient({ apiKey })

  // Dynamically select the largest DeepSeek model unless explicitly specified
  let model = options.model
  if (!model) {
    try {
      model = await ollamaClient.getLargestDeepSeekModel()
    } catch (error) {
      console.error('Failed to get largest DeepSeek model, using fallback:', error)
      model = 'deepseek-chat'
    }
  }

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
    console.error('Ollama API Error:', error)
    const errorMessage = formatChatError(error)
    return {
      message: {
        role: 'assistant',
        content: errorMessage,
      },
      ...(grantRecommendations ? { grantRecommendations } : {}),
    }
  }
}

// Enhanced error formatting function
function formatChatError(error: any): string {
  if (!error) {
    return 'An unknown error occurred. Please try again.'
  }

  const errorMsg = error.message || String(error)

  // Network connectivity errors
  if (errorMsg.includes('Network connection failed') || errorMsg.includes('DNS resolution')) {
    return `🌐 **Connection Error**

Unable to reach the AI service. This could be due to:
- Internet connectivity issues
- DNS resolution problems
- Firewall blocking the connection

Please check your internet connection and try again. If the issue persists, contact support.`
  }

  // Timeout errors
  if (errorMsg.includes('timeout') || errorMsg.includes('timed out')) {
    return `⏱️ **Timeout Error**

The AI service took too long to respond. This may be due to:
- High server load
- Complex request processing
- Network latency

Please try again in a moment. If the problem continues, try simplifying your question.`
  }

  // Authentication errors
  if (
    errorMsg.includes('401') ||
    errorMsg.includes('403') ||
    errorMsg.includes('Authentication failed')
  ) {
    return `🔐 **Authentication Error**

Your API credentials appear to be invalid or expired.

Please verify your Ollama Cloud API key configuration. If you're an administrator, check the OLLAMA_CLOUD_API_KEY environment variable.`
  }

  // Rate limiting
  if (errorMsg.includes('429') || errorMsg.includes('Rate limit')) {
    return `🚦 **Rate Limit Exceeded**

You've made too many requests in a short period.

Please wait a moment before trying again. If you're experiencing this frequently, consider upgrading your API plan.`
  }

  // Service errors
  if (errorMsg.includes('500') || errorMsg.includes('503') || errorMsg.includes('service error')) {
    return `⚠️ **Service Unavailable**

The AI service is temporarily unavailable. This is usually brief.

Please try again in a few moments. If the issue persists, the service may be undergoing maintenance.`
  }

  // Endpoint not found
  if (errorMsg.includes('404') || errorMsg.includes('Endpoint not found')) {
    return `🔍 **Service Configuration Error**

The AI service endpoint could not be found. This may indicate an API version mismatch.

Please contact support with this error message: ${errorMsg.substring(0, 200)}`
  }

  // Generic error with details
  return `🤖 **AI Service Error**

${errorMsg.substring(0, 300)}

If this error persists, please contact support for assistance.`
}
