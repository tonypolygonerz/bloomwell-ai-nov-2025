import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@bloomwell/auth'
import { generateChatResponse } from '@bloomwell/ai'
import prisma from '@bloomwell/db'

const DAILY_TOKEN_LIMIT = 10000

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

    // Check token usage (simplified - in production, track actual tokens)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Calculate approximate tokens (rough estimate: 4 chars per token)
    const estimatedTokens = message.length / 4

    // Note: In production, implement proper token tracking in database
    // For now, we'll proceed with the request

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

    // Save chat to database if chatId provided
    if (chatId) {
      await prisma.chat.update({
        where: { id: chatId },
        data: {
          messages: [...messages, response.message] as never,
          tokenUsed: { increment: Math.floor(estimatedTokens * 2) },
        },
      })
    }

    return NextResponse.json({
      response: response.message.content,
      tokensRemaining: DAILY_TOKEN_LIMIT - estimatedTokens * 2, // Rough estimate
      grantRecommendations: response.grantRecommendations,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
