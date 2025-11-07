// Stripe Price IDs for all subscription tiers
export const STRIPE_PRICES = {
  // Starter Tier (Basic Features)
  starter_monthly: 'price_1SAas1GpZiQKTBAtcgtB71u4', // $24.99/month
  starter_annual: 'price_1SAatSGpZiQKTBAtmOVcBQZG', // $251.88/year (16% savings)

  // Enterprise Tier (Advanced Features)
  enterprise_monthly: 'price_1SPmEHGpZiQKTBAtTJwZbf4N', // $79.99/month
  enterprise_annual: 'price_1SPm2bGpZiQKTBAtL2m5p2KQ', // $767.88/year (20% savings)
} as const

// Subscription tier type
export type SubscriptionTier = 'starter' | 'enterprise'
export type BillingCycle = 'monthly' | 'annual'

// Subscription features for each tier
export const SUBSCRIPTION_FEATURES = {
  starter: {
    documents_monthly: 300,
    documents_daily: 10,
    tokens_daily: 3000,
    support_level: 'ai_chatbot',
    tier_name: 'Starter',
  },
  enterprise: {
    documents_monthly: 600,
    documents_daily: 30,
    tokens_daily: 10000,
    support_level: 'priority_email',
    tier_name: 'Enterprise',
  },
} as const

// Subscription status types
export type SubscriptionStatus = 'active' | 'canceled' | 'trialing' | 'past_due' | 'incomplete' | null

// Feature limits type
export type SubscriptionFeatures = typeof SUBSCRIPTION_FEATURES[SubscriptionTier]

// Helper function to get all price IDs
export function getAllPriceIds(): string[] {
  return Object.values(STRIPE_PRICES)
}

// Helper function to check if a price ID is valid
export function isValidPriceId(priceId: string): boolean {
  return getAllPriceIds().includes(priceId)
}

// Helper function to get tier from price ID
export function getTierFromPriceId(priceId: string): SubscriptionTier | null {
  if (priceId === STRIPE_PRICES.starter_monthly || priceId === STRIPE_PRICES.starter_annual) {
    return 'starter'
  }
  if (priceId === STRIPE_PRICES.enterprise_monthly || priceId === STRIPE_PRICES.enterprise_annual) {
    return 'enterprise'
  }
  return null
}

// Helper function to get billing cycle from price ID
export function getBillingCycleFromPriceId(priceId: string): BillingCycle | null {
  if (
    priceId === STRIPE_PRICES.starter_monthly ||
    priceId === STRIPE_PRICES.enterprise_monthly
  ) {
    return 'monthly'
  }
  if (
    priceId === STRIPE_PRICES.starter_annual ||
    priceId === STRIPE_PRICES.enterprise_annual
  ) {
    return 'annual'
  }
  return null
}






