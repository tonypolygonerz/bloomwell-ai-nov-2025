import { PrismaAdapter } from '@next-auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import AzureADProvider from 'next-auth/providers/azure-ad'
import CredentialsProvider from 'next-auth/providers/credentials'
import type { NextAuthOptions } from 'next-auth'
import prisma from '@bloomwell/db'
import { compare } from 'bcryptjs'
import { getUserSubscription } from '@bloomwell/stripe'
import './types'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
    ...(process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET
      ? [
          AzureADProvider({
            clientId: process.env.MICROSOFT_CLIENT_ID,
            clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
            ...(process.env.MICROSOFT_TENANT_ID
              ? { tenantId: process.env.MICROSOFT_TENANT_ID as string }
              : {}),
          }),
        ]
      : []),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })
        if (!user || !user.hashedPassword) {
          return null
        }
        const isValid = await compare(credentials.password, user.hashedPassword)
        if (!isValid) {
          return null
        }
        return {
          id: user.id,
          email: user.email ?? null,
          name: user.name ?? null,
          image: user.image ?? null,
        }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.userId = user.id
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            role: true,
            trialStartedAt: true,
            trialEndsAt: true,
            subscriptionStatus: true,
            currentPriceId: true,
          },
        })
        if (dbUser) {
          token.role = dbUser.role as 'USER' | 'ADMIN'
          token.trialStartedAt = dbUser.trialStartedAt?.toISOString()
          token.trialEndsAt = dbUser.trialEndsAt?.toISOString()
          token.subscriptionStatus = dbUser.subscriptionStatus
          token.subscriptionPriceId = dbUser.currentPriceId

          // Get subscription tier from price ID
          if (dbUser.currentPriceId) {
            const subscription = await getUserSubscription(user.id)
            token.subscriptionTier = subscription.tier
          }
        }
        if (!dbUser?.trialStartedAt) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              trialStartedAt: new Date(),
              trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            },
          })
          token.trialStartedAt = new Date().toISOString()
          token.trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
        }
      }

      // Update subscription info on each token refresh (but not on every request to avoid overhead)
      // Only refresh if token doesn't have subscription info or if explicitly triggered
      if (token.userId && (!token.subscriptionStatus || trigger === 'update')) {
        const subscription = await getUserSubscription(token.userId)
        token.subscriptionStatus = subscription.status
        token.subscriptionTier = subscription.tier
        token.subscriptionPriceId = subscription.priceId
      }

      if (trigger === 'update' && session) {
        if ('role' in session) token.role = session.role as 'USER' | 'ADMIN'
        if ('trialEndsAt' in session) token.trialEndsAt = session.trialEndsAt as string
        if ('subscriptionStatus' in session)
          token.subscriptionStatus = session.subscriptionStatus as string | null
        if ('subscriptionTier' in session)
          token.subscriptionTier = session.subscriptionTier as 'starter' | 'enterprise' | null
        if ('subscriptionPriceId' in session)
          token.subscriptionPriceId = session.subscriptionPriceId as string | null
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.name = session.user.name ?? ''
        session.user.id = token.userId ?? session.user.id
        if (token.role) {
          session.user.role = token.role
        }
        session.user.trialEndsAt = token.trialEndsAt ?? null
        session.user.trialStartedAt = token.trialStartedAt ?? null
        session.userId = token.userId
        session.role = token.role
        session.trialStartedAt = token.trialStartedAt
        session.trialEndsAt = token.trialEndsAt
        session.subscriptionStatus = token.subscriptionStatus ?? null
        session.subscriptionTier = token.subscriptionTier ?? null
        session.subscriptionPriceId = token.subscriptionPriceId ?? null
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
}
