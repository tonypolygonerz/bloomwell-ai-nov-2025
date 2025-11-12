import prisma from '@bloomwell/db'
import { getUserSubscription, hasSubscriptionAccess } from '@bloomwell/stripe'

// Check if user has subscription access (active subscription or trial)
export async function checkSubscriptionAccess(userId: string): Promise<{
  hasAccess: boolean
  reason?: string
}> {
  const hasAccess = await hasSubscriptionAccess(userId)
  if (!hasAccess) {
    return {
      hasAccess: false,
      reason: 'No active subscription or trial',
    }
  }
  return { hasAccess: true }
}

// Check document upload limits
export async function checkDocumentLimit(userId: string): Promise<{
  allowed: boolean
  reason?: string
  documentsUsedToday: number
  documentsUsedMonth: number
  dailyLimit: number
  monthlyLimit: number
}> {
  const subscription = await getUserSubscription(userId)
  
  // Check if user has access
  const accessCheck = await checkSubscriptionAccess(userId)
  if (!accessCheck.hasAccess) {
    return {
      allowed: false,
      ...(accessCheck.reason ? { reason: accessCheck.reason } : {}),
      documentsUsedToday: 0,
      documentsUsedMonth: 0,
      dailyLimit: 0,
      monthlyLimit: 0,
    }
  }

  // Get user's current usage
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      documentsUsedToday: true,
      documentsUsedMonth: true,
    },
  })

  if (!user) {
    return {
      allowed: false,
      reason: 'User not found',
      documentsUsedToday: 0,
      documentsUsedMonth: 0,
      dailyLimit: 0,
      monthlyLimit: 0,
    }
  }

  // Reset daily usage if needed
  await resetDailyUsageIfNeeded(userId)

  // Get limits from subscription features
  const dailyLimit = subscription.features?.documents_daily || 0
  const monthlyLimit = subscription.features?.documents_monthly || 0

  // Re-fetch user after potential reset
  const updatedUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      documentsUsedToday: true,
      documentsUsedMonth: true,
    },
  })

  const documentsUsedToday = updatedUser?.documentsUsedToday || 0
  const documentsUsedMonth = updatedUser?.documentsUsedMonth || 0

  // Check limits
  if (documentsUsedToday >= dailyLimit) {
    return {
      allowed: false,
      reason: 'Daily document limit reached',
      documentsUsedToday,
      documentsUsedMonth,
      dailyLimit,
      monthlyLimit,
    }
  }

  if (documentsUsedMonth >= monthlyLimit) {
    return {
      allowed: false,
      reason: 'Monthly document limit reached',
      documentsUsedToday,
      documentsUsedMonth,
      dailyLimit,
      monthlyLimit,
    }
  }

  return {
    allowed: true,
    documentsUsedToday,
    documentsUsedMonth,
    dailyLimit,
    monthlyLimit,
  }
}

// Check token usage limits
export async function checkTokenLimit(
  userId: string,
  requestedTokens: number,
): Promise<{
  allowed: boolean
  reason?: string
  tokensUsedToday: number
  dailyLimit: number
  tokensRemaining: number
}> {
  const subscription = await getUserSubscription(userId)
  
  // Check if user has access
  const accessCheck = await checkSubscriptionAccess(userId)
  if (!accessCheck.hasAccess) {
    return {
      allowed: false,
      ...(accessCheck.reason ? { reason: accessCheck.reason } : {}),
      tokensUsedToday: 0,
      dailyLimit: 0,
      tokensRemaining: 0,
    }
  }

  // Get user's current usage
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      tokensUsedToday: true,
    },
  })

  if (!user) {
    return {
      allowed: false,
      reason: 'User not found',
      tokensUsedToday: 0,
      dailyLimit: 0,
      tokensRemaining: 0,
    }
  }

  // Reset daily usage if needed
  await resetDailyUsageIfNeeded(userId)

  // Get limits from subscription features
  const dailyLimit = subscription.features?.tokens_daily || 0

  // Re-fetch user after potential reset
  const updatedUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      tokensUsedToday: true,
    },
  })

  const tokensUsedToday = updatedUser?.tokensUsedToday || 0
  const tokensRemaining = dailyLimit - tokensUsedToday

  // Check if request would exceed limit
  if (tokensUsedToday + requestedTokens > dailyLimit) {
    return {
      allowed: false,
      reason: 'Daily token limit exceeded',
      tokensUsedToday,
      dailyLimit,
      tokensRemaining,
    }
  }

  return {
    allowed: true,
    tokensUsedToday,
    dailyLimit,
    tokensRemaining: tokensRemaining - requestedTokens,
  }
}

// Increment usage counters
export async function incrementUsage(
  userId: string,
  type: 'document' | 'token',
  amount: number = 1,
): Promise<void> {
  if (type === 'document') {
    await prisma.user.update({
      where: { id: userId },
      data: {
        documentsUsedToday: { increment: amount },
        documentsUsedMonth: { increment: amount },
      },
    })
  } else if (type === 'token') {
    await prisma.user.update({
      where: { id: userId },
      data: {
        tokensUsedToday: { increment: amount },
      },
    })
  }
}

// Reset daily usage if needed (helper function)
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
    await prisma.user.update({
      where: { id: userId },
      data: {
        documentsUsedToday: 0,
        tokensUsedToday: 0,
        lastUsageReset: now,
      },
    })
  }
}








