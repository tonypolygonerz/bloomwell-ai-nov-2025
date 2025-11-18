import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: 'USER' | 'ADMIN'
      firstName?: string | null
      lastName?: string | null
      isAdmin?: boolean
      trialEndsAt?: string | null
      trialStartedAt?: string | null
    }
    userId?: string | undefined
    role?: 'USER' | 'ADMIN' | undefined
    trialStartedAt?: string | undefined
    trialEndsAt?: string | undefined
    subscriptionStatus?: string | null
    subscriptionTier?: 'starter' | 'enterprise' | null
    subscriptionPriceId?: string | null
  }

  interface User {
    id: string
    email?: string | null
    name?: string | null
    image?: string | null
    role?: 'USER' | 'ADMIN'
    firstName?: string | null
    lastName?: string | null
    isAdmin?: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId?: string | undefined
    role?: 'USER' | 'ADMIN' | undefined
    firstName?: string | null
    lastName?: string | null
    isAdmin?: boolean
    trialStartedAt?: string | undefined
    trialEndsAt?: string | undefined
    subscriptionStatus?: string | null
    subscriptionTier?: 'starter' | 'enterprise' | null
    subscriptionPriceId?: string | null
  }
}
