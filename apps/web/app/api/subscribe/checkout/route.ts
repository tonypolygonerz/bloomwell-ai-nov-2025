import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@bloomwell/auth'
import { stripe, createCustomer } from '@bloomwell/stripe'
import { isValidPriceId } from '@bloomwell/stripe'
import prisma from '@bloomwell/db'

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
    const { priceId } = body

    if (!priceId || typeof priceId !== 'string') {
      return NextResponse.json({ error: 'Price ID is required' }, { status: 400 })
    }

    if (!isValidPriceId(priceId)) {
      return NextResponse.json({ error: 'Invalid price ID' }, { status: 400 })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        name: true,
        stripeCustomerId: true,
        trialEndsAt: true,
      },
    })

    if (!user || !user.email) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create or get Stripe customer
    let customerId = user.stripeCustomerId

    if (!customerId) {
      const customer = await createCustomer(user.email, user.name || undefined)
      if (!customer) {
        return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 })
      }
      customerId = customer.id

      // Save customer ID to database
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      })
    }

    // Check if user is in trial period
    const isTrialActive = user.trialEndsAt ? new Date(user.trialEndsAt) > new Date() : false

    // Create checkout session
    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000'
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/subscribe/cancel`,
      subscription_data: {
        // If user is in trial, don't set trial_period_days (Stripe will handle it)
        // Otherwise, start with 14-day trial
        ...(isTrialActive ? {} : { trial_period_days: 14 }),
      },
      metadata: {
        userId: userId,
        priceId: priceId,
      },
    })

    return NextResponse.json({
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 },
    )
  }
}






