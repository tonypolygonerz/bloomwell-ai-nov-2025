import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@bloomwell/stripe'
import prisma from '@bloomwell/db'
import Stripe from 'stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentSucceeded(invoice)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id
  const subscriptionId =
    typeof session.subscription === 'string' ? session.subscription : session.subscription?.id

  if (!customerId || !subscriptionId) {
    console.error('Missing customer or subscription ID in checkout session')
    return
  }

  // Get subscription from Stripe to get price ID
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const priceId =
    typeof subscription.items.data[0]?.price.id === 'string'
      ? subscription.items.data[0].price.id
      : null

  if (!priceId) {
    console.error('Could not determine price ID from subscription')
    return
  }

  const userId = session.metadata?.userId

  // Update user subscription
  if (userId) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        subscriptionStatus: subscription.status,
        currentPriceId: priceId,
      },
    })
  } else {
    // Fallback: find user by customer ID
    const user = await prisma.user.findFirst({
      where: { stripeCustomerId: customerId },
    })

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          stripeSubscriptionId: subscriptionId,
          subscriptionStatus: subscription.status,
          currentPriceId: priceId,
        },
      })
    }
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id

  if (!customerId) {
    console.error('Missing customer ID in subscription update')
    return
  }

  const priceId =
    typeof subscription.items.data[0]?.price.id === 'string'
      ? subscription.items.data[0].price.id
      : null

  if (!priceId) {
    console.error('Could not determine price ID from subscription')
    return
  }

  // Find user by customer ID
  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  })

  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        stripeSubscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
        currentPriceId: priceId,
      },
    })
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id

  if (!customerId) {
    console.error('Missing customer ID in subscription deletion')
    return
  }

  // Find user by customer ID
  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  })

  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        stripeSubscriptionId: null,
        subscriptionStatus: 'canceled',
        currentPriceId: null,
      },
    })
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id
  const subscriptionId =
    typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id

  if (!customerId || !subscriptionId) {
    return
  }

  // Find user by customer ID
  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  })

  if (user) {
    // Reset monthly usage on successful payment (new billing cycle)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        documentsUsedMonth: 0,
      },
    })
  }
}
