import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@bloomwell/auth'
import { getUserSubscription } from '@bloomwell/stripe'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.userId ?? session.user.id
  if (!userId) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
  }

  try {
    const subscription = await getUserSubscription(userId)
    return NextResponse.json({
      status: subscription.status,
      tier: subscription.tier,
      priceId: subscription.priceId,
      currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() || null,
      isTrialActive: subscription.isTrialActive,
    })
  } catch (error) {
    console.error('Error fetching subscription status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}








