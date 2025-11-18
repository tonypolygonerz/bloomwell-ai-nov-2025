import { PrismaAdapter } from '@next-auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import AzureADProvider from 'next-auth/providers/azure-ad'
import CredentialsProvider from 'next-auth/providers/credentials'
import type { NextAuthOptions } from 'next-auth'
import prisma from '@bloomwell/db'
import { compare } from 'bcryptjs'
import { getUserSubscription } from '@bloomwell/stripe'
import { isAdminEmail } from './lib/constants'
import './types'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  // Allow linking OAuth accounts to existing email/password accounts
  // This is safe because we enforce email verification for all auth methods
  allowDangerousEmailAccountLinking: true,
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
          throw new Error('Missing credentials')
        }
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })
        if (!user || !user.hashedPassword) {
          throw new Error('Invalid credentials')
        }
        const isValid = await compare(credentials.password, user.hashedPassword)
        if (!isValid) {
          throw new Error('Invalid credentials')
        }
        
        // Check email verification (block existing unverified users)
        if (!user.emailVerified) {
          throw new Error('Please verify your email before signing in. Check your inbox for a verification code.')
        }
        
        return {
          id: user.id,
          email: user.email ?? null,
          name: user.name ?? null,
          image: user.image ?? null,
          firstName: user.firstName ?? null,
          lastName: user.lastName ?? null,
          isAdmin: user.isAdmin,
        }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  events: {
    async linkAccount({ user, account, profile }) {
      console.log('🔗 Account Linked Successfully:', {
        userId: user.id,
        userEmail: user.email,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        timestamp: new Date().toISOString(),
      })

      // Optionally update user profile image from OAuth if not already set
      if (profile?.picture && user.image !== profile.picture) {
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: { image: profile.picture },
          })
          console.log('✅ Updated user image from OAuth profile')
        } catch (error) {
          console.error('❌ Failed to update user image:', error)
        }
      }
    },
    async signIn({ user, account, profile, isNewUser }) {
      if (account?.provider !== 'credentials' && !isNewUser) {
        console.log('🔐 OAuth sign-in for existing user:', {
          email: user.email,
          provider: account.provider,
          timestamp: new Date().toISOString(),
        })
      }
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // For OAuth providers, check email verification and admin status
      if (account?.provider !== 'credentials') {
        console.log('🔍 OAuth Sign-in Debug:', {
          provider: account.provider,
          email: user.email,
          allowDangerousEmailAccountLinking: true,
        })

        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
          include: { accounts: true },
        })

        if (dbUser) {
          console.log('✅ Existing user found:', {
            userId: dbUser.id,
            email: dbUser.email,
            existingAccounts: dbUser.accounts.length,
            isAdmin: dbUser.isAdmin,
          })

          // Check if Account record already exists for this provider
          const linkedAccount = dbUser.accounts.find(
            (acc) =>
              acc.provider === account.provider &&
              acc.providerAccountId === account.providerAccountId
          )

          if (!linkedAccount) {
            console.log(
              `🔗 Linking ${account.provider} account to existing user:`,
              user.email
            )

            // Manually create Account record as fallback
            // (PrismaAdapter with JWT sessions may not auto-create it)
            try {
              await prisma.account.create({
                data: {
                  userId: dbUser.id,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  refresh_token: account.refresh_token,
                  access_token: account.access_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                  session_state: account.session_state,
                },
              })
              console.log('✅ Manual Account creation successful')
            } catch (error: any) {
              console.error('❌ Manual Account creation failed:', error)

              // Handle P2002 unique constraint violation gracefully
              // Account may have been created between check and creation
              if (error.code === 'P2002') {
                console.log(
                  'ℹ️ Account already exists - this is expected, continuing with sign-in'
                )
                // Continue with sign-in - account exists
              } else {
                // Block sign-in for unexpected errors
                console.error(
                  '❌ Blocking sign-in due to Account creation failure:',
                  error
                )
                return false
              }
            }
          } else {
            console.log('✅ Account already linked for this provider')
          }

          // Update admin status for OAuth users
          const isAdmin = isAdminEmail(user.email)
          if (dbUser.isAdmin !== isAdmin) {
            await prisma.user.update({
              where: { id: dbUser.id },
              data: { isAdmin },
            })
            console.log('✅ Admin status updated:', { email: user.email, isAdmin })
          }

          // Verify and ensure admin status for teleportdoor@gmail.com
          if (user.email === 'teleportdoor@gmail.com' && !dbUser.isAdmin) {
            await prisma.user.update({
              where: { id: dbUser.id },
              data: {
                isAdmin: true,
                // Optionally update profile image from OAuth
                image: profile?.picture || dbUser.image,
              },
            })
            console.log('✅ Admin status confirmed for:', user.email)
          }

          // Block unverified OAuth users (existing users without email verification)
          if (!dbUser.emailVerified) {
            console.log('❌ Blocking unverified OAuth user:', user.email)
            return false // This will redirect to sign-in page with error
          }
        } else {
          // New OAuth user - auto-verify and set admin status
          const isAdmin = isAdminEmail(user.email)
          const nameParts = user.name?.split(' ') || []
          await prisma.user.create({
            data: {
              email: user.email!,
              name: user.name,
              firstName: nameParts[0] || null,
              lastName: nameParts.slice(1).join(' ') || null,
              image: user.image,
              emailVerified: new Date(), // Auto-verify OAuth users
              isAdmin,
            },
          })
          console.log('✅ New OAuth user created:', {
            email: user.email,
            isAdmin,
          })
        }
      }

      return true
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.userId = user.id
        token.isAdmin = user.isAdmin
        token.firstName = user.firstName
        token.lastName = user.lastName

        // Temporary JWT debug logging for verification
        if (user.email === 'teleportdoor@gmail.com') {
          console.log('🔑 JWT Token Debug:', {
            userEmail: user.email,
            tokenIsAdmin: token.isAdmin,
            userIsAdmin: user.isAdmin,
          })
        }

        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            role: true,
            trialStartedAt: true,
            trialEndsAt: true,
            subscriptionStatus: true,
            currentPriceId: true,
            isAdmin: true,
            firstName: true,
            lastName: true,
          },
        })
        if (dbUser) {
          token.role = dbUser.role as 'USER' | 'ADMIN'
          token.isAdmin = dbUser.isAdmin
          token.firstName = dbUser.firstName
          token.lastName = dbUser.lastName
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

      // Refresh admin status from database on each token refresh
      if (token.email && !token.isAdmin) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { isAdmin: true, firstName: true, lastName: true }
        })
        if (dbUser) {
          token.isAdmin = dbUser.isAdmin
          token.firstName = dbUser.firstName
          token.lastName = dbUser.lastName
        }
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
        session.user.isAdmin = token.isAdmin ?? false
        session.user.firstName = token.firstName ?? null
        session.user.lastName = token.lastName ?? null
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
    error: '/auth/error',
  },
}
