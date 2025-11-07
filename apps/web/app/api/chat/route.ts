import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@bloomwell/auth'
import { generateChatResponse } from '@bloomwell/ai'
import prisma from '@bloomwell/db'
import { checkTokenLimit } from '@/lib/subscription-middleware'
import { trackTokenUsage, getUsageStats } from '@/lib/usage-tracker'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.userId ?? session.user.id
  if (!userId) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { message, history = [], chatId, enableWebSearch = false } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Fetch organization for grant recommendations
    const organization = await prisma.organization.findUnique({
      where: { userId },
    })

    // Calculate approximate tokens for the request (rough estimate: 4 chars per token)
    const estimatedRequestTokens = Math.ceil(message.length / 4)

    // Check token limits before processing
    const tokenCheck = await checkTokenLimit(userId, estimatedRequestTokens)
    if (!tokenCheck.allowed) {
      return NextResponse.json(
        {
          error: tokenCheck.reason || 'Token limit exceeded',
          tokensRemaining: tokenCheck.tokensRemaining,
          tokensUsedToday: tokenCheck.tokensUsedToday,
          dailyLimit: tokenCheck.dailyLimit,
        },
        { status: 429 },
      )
    }

    const messages = [...history, { role: 'user' as const, content: message }]

    // Extract context from current message and recent conversation history
    const recentHistory = history.slice(-5) // Last 5 messages for context
    const context = [
      ...recentHistory.map((m: { role: string; content: string }) => m.content),
      message,
    ].join('\n')

    const response = await generateChatResponse(messages, {
      enableWebSearch,
      userId,
      ...(organization?.id ? { organizationId: organization.id } : {}),
      context,
    })

    // Calculate actual tokens used (request + response estimate)
    // Response tokens are typically longer, estimate 2x for response
    const estimatedResponseTokens = Math.ceil(response.message.content.length / 4)
    const totalTokensUsed = estimatedRequestTokens + estimatedResponseTokens

    // Track token usage
    await trackTokenUsage(userId, totalTokensUsed)

    // Save chat to database if chatId provided
    if (chatId) {
      await prisma.chat.update({
        where: { id: chatId },
        data: {
          messages: [...messages, response.message] as never,
          tokenUsed: { increment: totalTokensUsed },
        },
      })
    }

    // Get updated usage stats
    const usageStats = await getUsageStats(userId)

    return NextResponse.json({
      response: response.message.content,
      tokensRemaining: usageStats.tokensRemainingToday,
      tokensUsedToday: usageStats.tokensUsedToday,
      dailyLimit: usageStats.tokensDailyLimit,
      grantRecommendations: response.grantRecommendations,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
