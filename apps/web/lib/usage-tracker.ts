import prisma from '@bloomwell/db'
import { getUserSubscription } from '@bloomwell/stripe'

// Track document upload
export async function trackDocumentUpload(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      documentsUsedToday: { increment: 1 },
      documentsUsedMonth: { increment: 1 },
    },
  })
}

// Track token usage
export async function trackTokenUsage(userId: string, tokens: number): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      tokensUsedToday: { increment: tokens },
    },
  })
}

// Reset daily usage counters
export async function resetDailyUsage(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      documentsUsedToday: 0,
      tokensUsedToday: 0,
      lastUsageReset: new Date(),
    },
  })
}

// Reset monthly usage counter
export async function resetMonthlyUsage(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      documentsUsedMonth: 0,
    },
  })
}

// Get usage statistics for a user
export interface UsageStats {
  documentsUsedToday: number
  documentsUsedMonth: number
  tokensUsedToday: number
  documentsDailyLimit: number
  documentsMonthlyLimit: number
  tokensDailyLimit: number
  documentsRemainingToday: number
  documentsRemainingMonth: number
  tokensRemainingToday: number
  lastUsageReset: Date | null
}

export async function getUsageStats(userId: string): Promise<UsageStats> {
  // Ensure daily usage is reset if needed
  await resetDailyUsageIfNeeded(userId)

  // Get user usage
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      documentsUsedToday: true,
      documentsUsedMonth: true,
      tokensUsedToday: true,
      lastUsageReset: true,
    },
  })

  if (!user) {
    throw new Error('User not found')
  }

  // Get subscription to determine limits
  const subscription = await getUserSubscription(userId)
  const features = subscription.features

  const documentsDailyLimit = features?.documents_daily || 0
  const documentsMonthlyLimit = features?.documents_monthly || 0
  const tokensDailyLimit = features?.tokens_daily || 0

  return {
    documentsUsedToday: user.documentsUsedToday,
    documentsUsedMonth: user.documentsUsedMonth,
    tokensUsedToday: user.tokensUsedToday,
    documentsDailyLimit,
    documentsMonthlyLimit,
    tokensDailyLimit,
    documentsRemainingToday: Math.max(0, documentsDailyLimit - user.documentsUsedToday),
    documentsRemainingMonth: Math.max(0, documentsMonthlyLimit - user.documentsUsedMonth),
    tokensRemainingToday: Math.max(0, tokensDailyLimit - user.tokensUsedToday),
    lastUsageReset: user.lastUsageReset,
  }
}

// Helper function to reset daily usage if needed
async function resetDailyUsageIfNeeded(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      lastUsageReset: true,
    },
  })

  if (!user) {
    return
  }

  const now = new Date()
  const lastReset = user.lastUsageReset || new Date(0)

  // Reset if it's a new day
  const lastResetDate = new Date(lastReset)
  lastResetDate.setHours(0, 0, 0, 0)
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)

  if (lastResetDate.getTime() < today.getTime()) {
    await resetDailyUsage(userId)
  }
}




