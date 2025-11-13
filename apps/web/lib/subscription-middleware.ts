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

// Helper: Get user document usage after reset
async function getUserDocumentUsage(userId: string): Promise<{
  documentsUsedToday: number
  documentsUsedMonth: number
} | null> {
  await resetDailyUsageIfNeeded(userId)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      documentsUsedToday: true,
      documentsUsedMonth: true,
    },
  })
  if (!user) {
    return null
  }
  return {
    documentsUsedToday: user.documentsUsedToday || 0,
    documentsUsedMonth: user.documentsUsedMonth || 0,
  }
}

// Helper: Check document limits
function checkDocumentLimits(
  documentsUsedToday: number,
  documentsUsedMonth: number,
  dailyLimit: number,
  monthlyLimit: number,
): { allowed: boolean; reason?: string } {
  if (documentsUsedToday >= dailyLimit) {
    return {
      allowed: false,
      reason: 'Daily document limit reached',
    }
  }
  if (documentsUsedMonth >= monthlyLimit) {
    return {
      allowed: false,
      reason: 'Monthly document limit reached',
    }
  }
  return { allowed: true }
}

// Helper: Get document limits from subscription
function getDocumentLimits(subscription: any): { dailyLimit: number; monthlyLimit: number } {
  return {
    dailyLimit: subscription.features?.documents_daily || 0,
    monthlyLimit: subscription.features?.documents_monthly || 0,
  }
}

// Helper: Create error response for document limit check
function createDocumentLimitError(
  reason: string,
  dailyLimit: number = 0,
  monthlyLimit: number = 0,
): {
  allowed: false
  reason: string
  documentsUsedToday: number
  documentsUsedMonth: number
  dailyLimit: number
  monthlyLimit: number
} {
  return {
    allowed: false,
    reason,
    documentsUsedToday: 0,
    documentsUsedMonth: 0,
    dailyLimit,
    monthlyLimit,
  }
}

// Helper: Validate user exists for document check
async function validateUserForDocumentCheck(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  })
  return !!user
}

// Helper: Process document limit check with usage
async function processDocumentLimitCheck(
  userId: string,
  dailyLimit: number,
  monthlyLimit: number,
): Promise<{
  allowed: boolean
  reason?: string
  documentsUsedToday: number
  documentsUsedMonth: number
  dailyLimit: number
  monthlyLimit: number
}> {
  const usage = await getUserDocumentUsage(userId)
  if (!usage) {
    return createDocumentLimitError('User not found', dailyLimit, monthlyLimit)
  }

  const limitCheck = checkDocumentLimits(
    usage.documentsUsedToday,
    usage.documentsUsedMonth,
    dailyLimit,
    monthlyLimit,
  )

  if (!limitCheck.allowed) {
    return {
      ...limitCheck,
      documentsUsedToday: usage.documentsUsedToday,
      documentsUsedMonth: usage.documentsUsedMonth,
      dailyLimit,
      monthlyLimit,
    }
  }

  return {
    allowed: true,
    documentsUsedToday: usage.documentsUsedToday,
    documentsUsedMonth: usage.documentsUsedMonth,
    dailyLimit,
    monthlyLimit,
  }
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
  const accessCheck = await checkSubscriptionAccess(userId)
  if (!accessCheck.hasAccess) {
    return {
      ...createDocumentLimitError(accessCheck.reason || 'No access'),
    }
  }

  if (!(await validateUserForDocumentCheck(userId))) {
    return createDocumentLimitError('User not found')
  }

  const { dailyLimit, monthlyLimit } = getDocumentLimits(subscription)
  return processDocumentLimitCheck(userId, dailyLimit, monthlyLimit)
}

// Helper: Get user token usage after reset
async function getUserTokenUsage(userId: string): Promise<number | null> {
  await resetDailyUsageIfNeeded(userId)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      tokensUsedToday: true,
    },
  })
  if (!user) {
    return null
  }
  return user.tokensUsedToday || 0
}

// Helper: Check token limits
function checkTokenLimits(
  tokensUsedToday: number,
  requestedTokens: number,
  dailyLimit: number,
): { allowed: boolean; reason?: string; tokensRemaining: number } {
  const tokensRemaining = dailyLimit - tokensUsedToday
  if (tokensUsedToday + requestedTokens > dailyLimit) {
    return {
      allowed: false,
      reason: 'Daily token limit exceeded',
      tokensRemaining,
    }
  }
  return {
    allowed: true,
    tokensRemaining: tokensRemaining - requestedTokens,
  }
}

// Helper: Get token limit from subscription
function getTokenLimit(subscription: any): number {
  return subscription.features?.tokens_daily || 0
}

// Helper: Create error response for token limit check
function createTokenLimitError(
  reason: string,
  dailyLimit: number = 0,
): {
  allowed: false
  reason: string
  tokensUsedToday: number
  dailyLimit: number
  tokensRemaining: number
} {
  return {
    allowed: false,
    reason,
    tokensUsedToday: 0,
    dailyLimit,
    tokensRemaining: 0,
  }
}

// Helper: Process token limit check with usage
async function processTokenLimitCheck(
  userId: string,
  requestedTokens: number,
  dailyLimit: number,
): Promise<{
  allowed: boolean
  reason?: string
  tokensUsedToday: number
  dailyLimit: number
  tokensRemaining: number
}> {
  const tokensUsedToday = await getUserTokenUsage(userId)
  if (tokensUsedToday === null) {
    return createTokenLimitError('User not found', dailyLimit)
  }

  const limitCheck = checkTokenLimits(tokensUsedToday, requestedTokens, dailyLimit)
  if (!limitCheck.allowed) {
    return {
      ...limitCheck,
      tokensUsedToday,
      dailyLimit,
    }
  }

  return {
    allowed: true,
    tokensUsedToday,
    dailyLimit,
    tokensRemaining: limitCheck.tokensRemaining,
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
  const accessCheck = await checkSubscriptionAccess(userId)
  if (!accessCheck.hasAccess) {
    return {
      ...createTokenLimitError(accessCheck.reason || 'No access'),
    }
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  })

  if (!user) {
    return createTokenLimitError('User not found')
  }

  const dailyLimit = getTokenLimit(subscription)
  return processTokenLimitCheck(userId, requestedTokens, dailyLimit)
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
