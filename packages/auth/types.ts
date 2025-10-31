import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: 'USER' | 'ADMIN'
      trialEndsAt?: string | null
      trialStartedAt?: string | null
    }
    userId?: string | undefined
    role?: 'USER' | 'ADMIN' | undefined
    trialStartedAt?: string | undefined
    trialEndsAt?: string | undefined
  }

  interface User {
    id: string
    email?: string | null
    name?: string | null
    image?: string | null
    role?: 'USER' | 'ADMIN'
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId?: string | undefined
    role?: 'USER' | 'ADMIN' | undefined
    trialStartedAt?: string | undefined
    trialEndsAt?: string | undefined
  }
}

