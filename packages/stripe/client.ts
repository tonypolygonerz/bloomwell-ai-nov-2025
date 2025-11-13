import Stripe from 'stripe'
import { STRIPE_SECRET_KEY } from './env'

// Initialize Stripe client
export const stripe = new Stripe(STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
})

// Get Stripe customer by ID
export async function getCustomer(customerId: string): Promise<Stripe.Customer | null> {
  try {
    const customer = await stripe.customers.retrieve(customerId)
    // Handle deleted customers
    if (customer.deleted) {
      return null
    }
    return customer
  } catch (error) {
    console.error('Error fetching Stripe customer:', error)
    return null
  }
}

// Get Stripe subscription by ID
export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription | null> {
  try {
    return await stripe.subscriptions.retrieve(subscriptionId)
  } catch (error) {
    console.error('Error fetching Stripe subscription:', error)
    return null
  }
}

// Get subscription by customer ID
export async function getCustomerSubscription(
  customerId: string,
): Promise<Stripe.Subscription | null> {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      limit: 1,
    })
    return subscriptions.data[0] || null
  } catch (error) {
    console.error('Error fetching customer subscription:', error)
    return null
  }
}

// Create Stripe customer
export async function createCustomer(
  email: string,
  name?: string,
): Promise<Stripe.Customer | null> {
  try {
    return await stripe.customers.create({
      email,
      ...(name ? { name } : {}),
    })
  } catch (error) {
    console.error('Error creating Stripe customer:', error)
    return null
  }
}
