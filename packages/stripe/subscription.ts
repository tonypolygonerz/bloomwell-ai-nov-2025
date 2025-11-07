import prisma from '@bloomwell/db'
import {
  getTierFromPriceId,
  SUBSCRIPTION_FEATURES,
  type SubscriptionTier,
  type SubscriptionFeatures,
  type SubscriptionStatus,
} from './config'
import { getSubscription } from './client'

export interface UserSubscription {
  status: SubscriptionStatus
  tier: SubscriptionTier | null
  priceId: string | null
  features: SubscriptionFeatures | null
  currentPeriodEnd: Date | null
  cancelAtPeriodEnd: boolean
  isTrialActive: boolean
}

// Get user's subscription from database and Stripe
export async function getUserSubscription(userId: string): Promise<UserSubscription> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      stripeCustomerId: true,
      stripeSubscriptionId: true,
      subscriptionStatus: true,
      currentPriceId: true,
      trialEndsAt: true,
    },
  })

  if (!user) {
    return {
      status: null,
      tier: null,
      priceId: null,
      features: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      isTrialActive: false,
    }
  }

  // Check if user is in trial period
  const isTrialActive = user.trialEndsAt ? new Date(user.trialEndsAt) > new Date() : false

  // If no Stripe subscription, return trial status
  if (!user.stripeSubscriptionId || !user.stripeCustomerId) {
    const tier = user.currentPriceId ? getTierFromPriceId(user.currentPriceId) : null
    return {
      status: isTrialActive ? 'trialing' : null,
      tier,
      priceId: user.currentPriceId,
      features: tier ? SUBSCRIPTION_FEATURES[tier] : null,
      currentPeriodEnd: user.trialEndsAt,
      cancelAtPeriodEnd: false,
      isTrialActive,
    }
  }

  // Fetch subscription from Stripe
  const stripeSubscription = await getSubscription(user.stripeSubscriptionId)

  if (!stripeSubscription) {
    // Subscription not found in Stripe, return database state
    const tier = user.currentPriceId ? getTierFromPriceId(user.currentPriceId) : null
    return {
      status: (user.subscriptionStatus as SubscriptionStatus) || null,
      tier,
      priceId: user.currentPriceId,
      features: tier ? SUBSCRIPTION_FEATURES[tier] : null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      isTrialActive,
    }
  }

  // Get current price ID from subscription
  const priceId =
    typeof stripeSubscription.items.data[0]?.price.id === 'string'
      ? stripeSubscription.items.data[0].price.id
      : user.currentPriceId

  const tier = priceId ? getTierFromPriceId(priceId) : null
  const status = stripeSubscription.status as SubscriptionStatus

  return {
    status,
    tier,
    priceId,
    features: tier ? SUBSCRIPTION_FEATURES[tier] : null,
    currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
    cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
    isTrialActive: status === 'trialing' || isTrialActive,
  }
}

// Check if user has active trial
export function isTrialActive(user: {
  trialEndsAt: Date | null
  subscriptionStatus: string | null
}): boolean {
  if (!user.trialEndsAt) {
    return false
  }
  // Trial is active if trial hasn't ended and no active subscription
  return new Date(user.trialEndsAt) > new Date() && user.subscriptionStatus !== 'active'
}

// Check if user has access (active subscription or trial)
export async function hasSubscriptionAccess(userId: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId)
  return (
    subscription.status === 'active' ||
    subscription.status === 'trialing' ||
    subscription.isTrialActive
  )
}

