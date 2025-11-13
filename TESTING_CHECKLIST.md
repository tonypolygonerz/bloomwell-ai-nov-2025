# Stripe Revenue System Testing Checklist

This comprehensive checklist validates all functionality of the subscription revenue system. Use this document to systematically test each component.

## Pre-Testing Setup

- [ ] All environment variables are configured (see [Environment Setup Guide](./ENVIRONMENT_SETUP.md))
- [ ] Stripe webhook endpoint is configured and receiving events
- [ ] Database is accessible and schema is synced
- [ ] Development server is running (`npm run dev`)
- [ ] Test user account is created and logged in

## Test Card Numbers

Use these Stripe test cards for checkout:

- **Success**: `4242 4242 4242 4242`
- **Declined**: `4000 0000 0000 0002`
- **Insufficient Funds**: `4000 0000 0000 9995`

Use any future expiry date, any 3-digit CVC, and any ZIP code.

---

## Phase 1: Pricing Tiers Testing

Test all 4 pricing tiers (Starter Monthly, Starter Annual, Enterprise Monthly, Enterprise Annual).

### Test 1.1: Starter Monthly Tier

- [ ] Navigate to `http://localhost:3000/pricing`
- [ ] Locate "Starter" tier with "Monthly" badge
- [ ] Verify price displays as "$24.99/month"
- [ ] Verify features list shows:
  - [ ] 300 documents/month
  - [ ] 10 documents/day
  - [ ] 3,000 tokens/day
  - [ ] AI Chatbot Support
- [ ] Click "Get Started" button
- [ ] Verify redirect to Stripe Checkout page
- [ ] Verify checkout shows correct price ($24.99/month)
- [ ] Complete checkout with test card `4242 4242 4242 4242`
- [ ] Verify redirect to `/subscribe/success`
- [ ] Verify success page displays "Subscription Successful!"
- [ ] Navigate to `/upgrade`
- [ ] Verify subscription status shows "Active" or "Trialing"
- [ ] Verify tier displays as "starter"
- [ ] Verify current period end date is displayed

**Expected Result**: Checkout completes successfully, subscription is created in Stripe, and database is updated with subscription details.

### Test 1.2: Starter Annual Tier

- [ ] Navigate to `/pricing`
- [ ] Locate "Starter" tier with "Annual" badge (highlighted border)
- [ ] Verify price displays as "$251.88/year"
- [ ] Verify equivalent monthly price shows "$20.99/month (save 16%)"
- [ ] Click "Get Started" button
- [ ] Verify checkout shows correct price ($251.88/year)
- [ ] Complete checkout with test card
- [ ] Verify redirect to success page
- [ ] Verify subscription status shows correct tier and billing cycle

**Expected Result**: Annual subscription is created with correct pricing and billing cycle.

### Test 1.3: Enterprise Monthly Tier

- [ ] Navigate to `/pricing`
- [ ] Locate "Enterprise" tier with "Monthly" badge
- [ ] Verify price displays as "$79.99/month"
- [ ] Verify features list shows:
  - [ ] 600 documents/month
  - [ ] 30 documents/day
  - [ ] 10,000 tokens/day
  - [ ] Priority Email Support
- [ ] Click "Get Started" button
- [ ] Complete checkout
- [ ] Verify subscription is created with Enterprise tier

**Expected Result**: Enterprise monthly subscription is created with correct features.

### Test 1.4: Enterprise Annual Tier

- [ ] Navigate to `/pricing`
- [ ] Locate "Enterprise" tier with "Annual" badge
- [ ] Verify price displays as "$767.88/year"
- [ ] Verify equivalent monthly price shows "$63.99/month (save 20%)"
- [ ] Click "Get Started" button
- [ ] Complete checkout
- [ ] Verify subscription is created with Enterprise tier and annual billing

**Expected Result**: Enterprise annual subscription is created with correct pricing and features.

---

## Phase 2: Checkout Flow Testing

### Test 2.1: Authenticated User Checkout

- [ ] Log in to the application
- [ ] Navigate to `/pricing`
- [ ] Click any "Get Started" button
- [ ] Verify redirect to Stripe Checkout (not login page)
- [ ] Complete checkout
- [ ] Verify success redirect

**Expected Result**: Authenticated users can complete checkout without being redirected to login.

### Test 2.2: Unauthenticated User Checkout

- [ ] Log out of the application
- [ ] Navigate to `/pricing`
- [ ] Click "Get Started" button
- [ ] Verify redirect to `/login` (or appropriate auth page)
- [ ] Log in
- [ ] Verify redirect back to checkout flow

**Expected Result**: Unauthenticated users are redirected to login before checkout.

### Test 2.3: Checkout Cancellation

- [ ] Start checkout process
- [ ] On Stripe Checkout page, click "Cancel" or close the window
- [ ] Verify redirect to `/subscribe/cancel`
- [ ] Verify cancel page displays "Checkout Cancelled" message
- [ ] Verify "View Pricing Plans" button works
- [ ] Verify no subscription was created in Stripe

**Expected Result**: Cancellation is handled gracefully, no charges are made, and user can return to pricing.

### Test 2.4: Checkout Completion

- [ ] Complete a checkout session
- [ ] Verify redirect to `/subscribe/success`
- [ ] Verify success page shows:
  - [ ] Success message
  - [ ] "Go to Dashboard" button
  - [ ] "Manage Subscription" button
- [ ] Click "Go to Dashboard" - verify redirect to `/app`
- [ ] Click "Manage Subscription" - verify redirect to `/upgrade`

**Expected Result**: Success page displays correctly with working navigation buttons.

### Test 2.5: Stripe Customer Creation

- [ ] Create a new test user account
- [ ] Complete checkout for the first time
- [ ] Check Stripe Dashboard > Customers
- [ ] Verify new customer is created with correct email
- [ ] Complete checkout again with same user
- [ ] Verify same customer is reused (not duplicated)

**Expected Result**: Stripe customer is created on first checkout and reused for subsequent checkouts.

### Test 2.6: Trial Period Application

- [ ] Create checkout for new user (no existing trial)
- [ ] Verify checkout includes 14-day trial period
- [ ] Complete checkout
- [ ] Verify subscription status is "trialing"
- [ ] Verify trial end date is approximately 14 days in the future
- [ ] Create checkout for user with active trial
- [ ] Verify trial period is not duplicated

**Expected Result**: 14-day trial is applied correctly for new users, and existing trials are not duplicated.

---

## Phase 3: Subscription Status Display Testing

### Test 3.1: Active Subscription Display

- [ ] Complete checkout to create active subscription
- [ ] Navigate to `/upgrade`
- [ ] Verify "Current Subscription" card displays:
  - [ ] Status: "Active" (green text)
  - [ ] Tier: "starter" or "enterprise" (capitalized)
  - [ ] Period End: Date in future
- [ ] Verify "Usage Statistics" card displays:
  - [ ] Documents (Today): X / limit with progress bar
  - [ ] Documents (This Month): X / limit with progress bar
  - [ ] Tokens (Today): X / limit with progress bar
- [ ] Verify progress bars render correctly (not empty or overflowing)
- [ ] Verify "Manage Subscription" section shows:
  - [ ] "Manage Billing & Payment Methods" button (if active)
  - [ ] "Back to Dashboard" button

**Expected Result**: All subscription information displays correctly with accurate usage statistics.

### Test 3.2: Trialing Subscription Display

- [ ] Complete checkout to create trial subscription
- [ ] Navigate to `/upgrade`
- [ ] Verify status shows "Trialing" (blue text)
- [ ] Verify trial days remaining displays (e.g., "14 days remaining in trial")
- [ ] Verify trial countdown is accurate
- [ ] Verify usage statistics show correct limits for selected tier

**Expected Result**: Trial status is clearly displayed with accurate countdown.

### Test 3.3: No Subscription Display

- [ ] Log in as user without subscription
- [ ] Navigate to `/upgrade`
- [ ] Verify status shows "No Subscription"
- [ ] Verify "View Pricing Plans" button is displayed
- [ ] Verify usage statistics show 0 / 0 limits
- [ ] Verify "Manage Billing" button is not displayed

**Expected Result**: Users without subscriptions see appropriate messaging and call-to-action.

### Test 3.4: Canceled Subscription Display

- [ ] Cancel a subscription (via Stripe Dashboard or portal)
- [ ] Navigate to `/upgrade`
- [ ] Verify status shows "Canceled"
- [ ] Verify "View Pricing Plans" button is displayed
- [ ] Verify usage statistics are not accessible

**Expected Result**: Canceled subscriptions are clearly marked and users are prompted to resubscribe.

---

## Phase 4: Feature Gating Testing

### Test 4.1: Token Limit Enforcement

**Prerequisites**: User with active subscription (Starter tier: 3,000 tokens/day, Enterprise: 10,000 tokens/day)

- [ ] Make a chat request via `/api/chat`
- [ ] Verify request succeeds and tokens are tracked
- [ ] Continue making requests until approaching daily limit
- [ ] Check response for `tokensRemaining` field
- [ ] Make request that would exceed limit
- [ ] Verify API returns 429 status code
- [ ] Verify error response includes:
  - [ ] `error`: "Daily token limit exceeded"
  - [ ] `tokensRemaining`: 0
  - [ ] `tokensUsedToday`: limit value
  - [ ] `dailyLimit`: limit value

**Expected Result**: Token limits are enforced correctly, and users receive clear error messages when limits are exceeded.

### Test 4.2: Token Usage Tracking

- [ ] Check current token usage via `/upgrade` page
- [ ] Make a chat request
- [ ] Refresh `/upgrade` page
- [ ] Verify token usage increased
- [ ] Verify tokens remaining decreased
- [ ] Verify progress bar updated

**Expected Result**: Token usage is tracked accurately and displayed in real-time.

### Test 4.3: Document Limit Enforcement

**Note**: This test requires a document upload API endpoint. If not implemented, skip this test.

- [ ] Upload a document
- [ ] Verify upload succeeds and document count increments
- [ ] Continue uploading until daily limit reached
- [ ] Attempt to upload another document
- [ ] Verify upload is blocked with appropriate error message
- [ ] Verify monthly limit is also checked

**Expected Result**: Document limits are enforced at both daily and monthly levels.

### Test 4.4: Subscription Access Check

- [ ] Test with user without subscription:
  - [ ] Attempt to access protected feature
  - [ ] Verify access is denied
  - [ ] Verify appropriate error message is shown
- [ ] Test with user with active subscription:
  - [ ] Verify access is granted
  - [ ] Verify features work correctly
- [ ] Test with user with trialing subscription:
  - [ ] Verify access is granted
  - [ ] Verify trial period is respected
- [ ] Test with user with canceled subscription:
  - [ ] Verify access is denied
  - [ ] Verify prompt to resubscribe is shown

**Expected Result**: Access control works correctly for all subscription states.

---

## Phase 5: Webhook Handling Testing

### Test 5.1: Checkout Session Completed Webhook

- [ ] Complete a checkout session
- [ ] Check Stripe Dashboard > Webhooks > Your endpoint > Recent events
- [ ] Verify `checkout.session.completed` event was received
- [ ] Check server logs for webhook processing
- [ ] Query database to verify:
  - [ ] `stripeCustomerId` is set
  - [ ] `stripeSubscriptionId` is set
  - [ ] `subscriptionStatus` is "active" or "trialing"
  - [ ] `currentPriceId` matches selected price

**Expected Result**: Webhook is received and database is updated correctly.

### Test 5.2: Subscription Updated Webhook

- [ ] Update subscription in Stripe Dashboard (e.g., change plan)
- [ ] Wait for webhook to process
- [ ] Check Stripe Dashboard > Webhooks for `customer.subscription.updated` event
- [ ] Verify database is updated with new subscription details
- [ ] Navigate to `/upgrade` and verify changes are reflected

**Expected Result**: Subscription updates in Stripe are synced to database.

### Test 5.3: Subscription Deleted Webhook

- [ ] Cancel subscription in Stripe Dashboard
- [ ] Wait for webhook to process
- [ ] Check for `customer.subscription.deleted` event
- [ ] Verify database is updated:
  - [ ] `stripeSubscriptionId` is set to null
  - [ ] `subscriptionStatus` is "canceled"
  - [ ] `currentPriceId` is set to null
- [ ] Navigate to `/upgrade` and verify status shows "Canceled"

**Expected Result**: Subscription cancellation is properly synced to database.

### Test 5.4: Invoice Payment Succeeded Webhook

- [ ] Wait for billing cycle or manually trigger invoice in Stripe Dashboard
- [ ] Check for `invoice.payment_succeeded` event
- [ ] Verify database is updated:
  - [ ] `documentsUsedMonth` is reset to 0
- [ ] Verify daily usage counters are NOT reset (only monthly)

**Expected Result**: Monthly usage counters reset on successful payment, daily counters remain unchanged.

### Test 5.5: Webhook Signature Verification

- [ ] Send a webhook request with invalid signature
- [ ] Verify API returns 400 error with "Invalid signature" message
- [ ] Send a webhook request with missing signature header
- [ ] Verify API returns 400 error with "Missing signature or webhook secret" message
- [ ] Send a valid webhook request
- [ ] Verify API returns 200 with `{ received: true }`

**Expected Result**: Webhook signature verification works correctly, rejecting invalid requests.

---

## Phase 6: Usage Tracking Testing

### Test 6.1: Daily Usage Reset

**Prerequisites**: User with usage from previous day

- [ ] Check `lastUsageReset` timestamp in database (or via API)
- [ ] Wait until midnight (or manually set system time)
- [ ] Make a new request (or trigger daily reset logic)
- [ ] Verify `documentsUsedToday` is reset to 0
- [ ] Verify `tokensUsedToday` is reset to 0
- [ ] Verify `lastUsageReset` is updated to current time
- [ ] Verify monthly usage is NOT reset

**Expected Result**: Daily usage counters reset at midnight, monthly counters remain unchanged.

### Test 6.2: Monthly Usage Reset

- [ ] Check current `documentsUsedMonth` value
- [ ] Trigger `invoice.payment_succeeded` webhook (or wait for billing cycle)
- [ ] Verify `documentsUsedMonth` is reset to 0
- [ ] Verify daily usage is NOT reset

**Expected Result**: Monthly usage resets on successful invoice payment.

### Test 6.3: Usage Increment

- [ ] Make a chat request
- [ ] Verify `tokensUsedToday` increments by estimated token amount
- [ ] Upload a document (if applicable)
- [ ] Verify `documentsUsedToday` and `documentsUsedMonth` increment by 1
- [ ] Check `/upgrade` page - verify usage statistics update

**Expected Result**: Usage counters increment correctly for all tracked metrics.

---

## Phase 7: Billing Portal Testing

### Test 7.1: Portal Access

- [ ] Navigate to `/upgrade` with active subscription
- [ ] Click "Manage Billing & Payment Methods" button
- [ ] Verify redirect to Stripe Customer Portal
- [ ] Verify portal session is created successfully
- [ ] Verify portal loads with subscription information

**Expected Result**: Billing portal opens correctly with current subscription details.

### Test 7.2: Subscription Cancellation via Portal

- [ ] Access billing portal
- [ ] Cancel subscription in portal
- [ ] Return to application
- [ ] Navigate to `/upgrade`
- [ ] Verify subscription status shows "Canceled"
- [ ] Verify "View Pricing Plans" button is displayed
- [ ] Verify webhook was received and processed

**Expected Result**: Cancellation via portal is reflected in application immediately.

### Test 7.3: Payment Method Update

- [ ] Access billing portal
- [ ] Update payment method
- [ ] Verify changes are saved
- [ ] Return to application
- [ ] Verify no errors occurred

**Expected Result**: Payment method updates work correctly without breaking subscription.

---

## Phase 8: Edge Cases & Error Handling

### Test 8.1: Invalid Price ID

- [ ] Send POST request to `/api/subscribe/checkout` with invalid price ID
- [ ] Verify API returns 400 error
- [ ] Verify error message indicates "Invalid price ID"

**Expected Result**: Invalid price IDs are rejected with appropriate error message.

### Test 8.2: Missing Stripe Keys

- [ ] Temporarily remove `STRIPE_SECRET_KEY` from environment
- [ ] Attempt to create checkout session
- [ ] Verify error is handled gracefully
- [ ] Restore environment variable

**Expected Result**: Missing keys are detected and handled without crashing the application.

### Test 8.3: Missing User Session

- [ ] Send checkout request without authentication
- [ ] Verify API returns 401 error
- [ ] Verify error message indicates "Unauthorized"

**Expected Result**: Unauthenticated requests are rejected with 401 status.

### Test 8.4: Subscription Status API Errors

- [ ] Access `/api/subscribe/status` without authentication
- [ ] Verify 401 error is returned
- [ ] Access with invalid session
- [ ] Verify appropriate error handling

**Expected Result**: Status API handles authentication errors correctly.

### Test 8.5: Data Consistency

- [ ] Complete checkout
- [ ] Verify database and Stripe are in sync:
  - [ ] Customer ID matches
  - [ ] Subscription ID matches
  - [ ] Price ID matches
  - [ ] Status matches
- [ ] Update subscription in Stripe Dashboard
- [ ] Verify database updates after webhook

**Expected Result**: Database and Stripe stay in sync across all operations.

---

## Test Completion Checklist

After completing all tests:

- [ ] All tests pass or are appropriately documented as known issues
- [ ] Test results are documented in [Verification Report](./VERIFICATION_REPORT.md)
- [ ] Any bugs or issues are logged
- [ ] Environment variables are secured (not committed)
- [ ] Production environment is configured separately
- [ ] Webhook endpoints are configured for production

---

## Troubleshooting Common Issues

### Checkout Not Redirecting

- Check `NEXTAUTH_URL` is set correctly
- Verify Stripe keys are valid
- Check browser console for errors

### Webhooks Not Processing

- Verify webhook secret is correct
- Check Stripe Dashboard > Webhooks for recent events
- Review server logs for processing errors
- Ensure webhook endpoint URL is accessible

### Subscription Status Not Updating

- Verify webhook events are being received
- Check database for subscription records
- Verify webhook handlers are processing correctly
- Check for errors in server logs

### Usage Counters Not Resetting

- Verify `lastUsageReset` timestamp logic
- Check that daily reset runs at midnight
- Verify invoice payment webhook resets monthly usage
- Check database for correct reset timestamps

---

## Next Steps

After completing testing:

1. Review [Verification Report](./VERIFICATION_REPORT.md) template
2. Document all test results
3. Address any issues found
4. Proceed to production deployment with confidence
