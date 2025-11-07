# Environment Setup Guide - Stripe Revenue System

This guide walks you through setting up all environment variables and Stripe configuration needed to run the revenue system.

## Prerequisites

- Stripe account (sign up at https://stripe.com)
- Access to your Stripe Dashboard
- Local development environment running
- Database connection string

## Step 1: Get Stripe API Keys

1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** > **API keys**
3. Make sure you're in **Test mode** (toggle in the top right)
4. Copy the following keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_` - click "Reveal test key" to see it)

⚠️ **Important**: Never commit your secret keys to version control. Always use environment variables.

## Step 2: Create Webhook Endpoint

Webhooks allow Stripe to notify your application about subscription events in real-time.

### For Local Development

You'll need to expose your local server to the internet. Use one of these options:

#### Option A: Stripe CLI (Recommended)

1. Install Stripe CLI:
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Linux/Windows - see https://stripe.com/docs/stripe-cli
   ```

2. Login to Stripe:
   ```bash
   stripe login
   ```

3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

4. Copy the webhook signing secret (starts with `whsec_`) from the terminal output

#### Option B: ngrok

1. Install ngrok: https://ngrok.com/download
2. Start your local server:
   ```bash
   npm run dev
   ```

3. In another terminal, expose your local server:
   ```bash
   ngrok http 3000
   ```

4. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

5. Go to Stripe Dashboard > **Developers** > **Webhooks** > **Add endpoint**
6. Enter endpoint URL: `https://your-ngrok-url.ngrok.io/api/webhooks/stripe`
7. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
8. Click **Add endpoint**
9. Copy the **Signing secret** (starts with `whsec_`)

### For Production

1. Go to Stripe Dashboard > **Developers** > **Webhooks**
2. Click **Add endpoint**
3. Enter your production URL: `https://your-domain.com/api/webhooks/stripe`
4. Select the same events listed above
5. Click **Add endpoint**
6. Copy the **Signing secret**

## Step 3: Configure Environment Variables

1. Create `.env.local` file in the `apps/web` directory (if it doesn't exist)

2. Add the following environment variables to `.env.local`:

   ```bash
   # Stripe Keys (from Step 1)
   STRIPE_SECRET_KEY=sk_test_51AbC123...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51XyZ789...
   
   # Stripe Webhook Secret (from Step 2)
   STRIPE_WEBHOOK_SECRET=whsec_abc123...
   
   # Database (your existing connection string)
   DATABASE_URL=postgresql://user:password@localhost:5432/dbname
   
   # NextAuth (your existing values)
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-existing-secret
   ```

   **Note**: If you don't have a `.env.local` file, create one in the `apps/web` directory with the above template.

3. Restart your development server:
   ```bash
   npm run dev
   ```

## Step 4: Verify Configuration

1. Check that your server starts without errors
2. Navigate to `/pricing` - the page should load
3. Try clicking a "Get Started" button - you should be redirected to Stripe Checkout
4. Check server logs for any Stripe-related errors

## Stripe Test Cards

Use these test cards in Stripe Checkout for testing:

| Card Number | Description |
|------------|-------------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 0002` | Card declined |
| `4000 0000 0000 9995` | Insufficient funds |

**Use any future expiry date, any 3-digit CVC, and any ZIP code.**

## Troubleshooting

### "Missing signature or webhook secret" Error

- Make sure `STRIPE_WEBHOOK_SECRET` is set in your `.env.local`
- Verify the webhook secret is correct (starts with `whsec_`)
- If using Stripe CLI, make sure you're using the secret from `stripe listen` output

### "Invalid signature" Error

- Ensure you're using the correct webhook secret for your environment (test vs production)
- If using Stripe CLI, restart the `stripe listen` command and update your secret
- Verify the webhook endpoint URL matches exactly

### Checkout Not Redirecting

- Check that `NEXTAUTH_URL` is set correctly
- Verify `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` are valid
- Check browser console and server logs for errors

### Subscription Status Not Updating

- Verify webhook endpoint is receiving events (check Stripe Dashboard > Webhooks > Your endpoint > Recent events)
- Check server logs for webhook processing errors
- Ensure database connection is working

## Security Best Practices

1. **Never commit `.env.local` to version control**
2. **Use different keys for test and production**
3. **Rotate keys if they're ever exposed**
4. **Use environment-specific secrets in production** (Vercel, Railway, etc.)
5. **Monitor webhook events in Stripe Dashboard for suspicious activity**

## Next Steps

Once environment variables are configured, proceed to the [Testing Checklist](./TESTING_CHECKLIST.md) to validate the revenue system.

