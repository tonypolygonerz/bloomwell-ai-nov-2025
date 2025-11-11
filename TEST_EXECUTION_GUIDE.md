# Test Execution Guide: Onboarding Skip Fix Verification

This guide provides step-by-step instructions for executing the comprehensive test suite to verify the onboarding skip redirect loop fix.

## Prerequisites

1. **Development Server Running**
   ```bash
   cd "/Users/newberlin/Development/Bloomwell AI/Bloomwell AI Nov 2025"
   npm run dev
   ```
   Server should be accessible at `http://localhost:3000`

2. **Dependencies Installed**
   ```bash
   npm install
   ```

3. **Puppeteer Available** (for automated tests)
   ```bash
   npm install puppeteer --save-dev
   ```

4. **Browser with DevTools** (for manual testing)

## Test Execution Methods

### Method 1: Automated Test Suite (Recommended)

Run the comprehensive automated test suite:

```bash
node test-skip-fix-verification.js
```

**What it tests:**
- ✅ Test 1: Basic Skip Flow from Step 2
- ✅ Test 2: Skip with Organization Type Selected
- ✅ Test 4: OnboardingGate Retry Logic
- ✅ Test 8: Redirect Loop Prevention
- ✅ Test 9: SessionStorage Flag Management
- ✅ Test 11: Direct Navigation to /app
- ✅ Test 13: Multiple Browser Tab Edge Case
- ✅ Browser Console Verification Script

**Output:**
- Test results printed to console
- Screenshots saved to `test-results-skip-fix/` directory
- Pass/fail summary at the end

### Method 2: Manual Browser Testing

#### Step 1: Basic Skip Flow Test

1. Open browser and navigate to `http://localhost:3000`
2. Log in with a test account (or create new account)
3. Navigate to `http://localhost:3000/onboarding/step2`
4. **Do NOT** select organization type (use default)
5. **Do NOT** enter any organization details
6. Open DevTools (F12) → Network tab
7. Click "Skip" button
8. **Observe:**
   - Network tab shows `POST /api/onboarding/save` → Status 200 ✅
   - Network tab shows `GET /api/onboarding/status?t=...` → Status 200 ✅
   - Page navigates to `/app`
   - **CRITICAL:** User stays on `/app` (no redirect back to step2)
9. Wait 5 seconds and verify still on `/app`

**Success Criteria:**
- ✅ Save API returns 200
- ✅ Navigation to `/app` succeeds
- ✅ No redirect loop (user stays on `/app`)

#### Step 2: Browser Console Verification

1. Navigate to `http://localhost:3000/onboarding/step2`
2. Open DevTools Console (F12 → Console tab)
3. Copy and paste the contents of `browser-verification-script.js`
4. Press Enter to execute
5. Review the verification results

**Expected Output:**
```
🔄 Testing Skip Fix...
✅ Save API Success: true
✅ isBasicComplete After Save: true
✅ OrganizationType Saved: true
🎉 ALL CHECKS PASSED!
```

#### Step 3: SessionStorage Verification

1. Navigate to `http://localhost:3000/onboarding/step2`
2. Open DevTools → Application tab → Session Storage
3. Clear sessionStorage (right-click → Clear)
4. Click "Skip" button
5. **Check SessionStorage:**
   - `fromOnboarding` should be set to `"true"`
   - `lastRedirectTime` should be set to a timestamp
6. Navigate to `/app`
7. **Check SessionStorage again:**
   - Flags should be cleared after successful check

#### Step 4: Network Tab Verification

1. Navigate to `http://localhost:3000/onboarding/step2`
2. Open DevTools → Network tab
3. Clear network log
4. Click "Skip" button
5. **Verify API calls:**
   - `POST /api/onboarding/save` → 200 OK
   - `GET /api/onboarding/status?t=<timestamp>` → 200 OK
   - Status API URL includes `?t=` query param (cache-busting)
   - Request headers include `Cache-Control: no-cache`

#### Step 5: Redirect Loop Prevention Test

1. Navigate to `http://localhost:3000/onboarding/step2`
2. Open DevTools → Network tab
3. Click "Skip" button
4. **Monitor redirects:**
   - Count how many times you see `/onboarding/step2` in the URL
   - Maximum should be 2 redirects (loop prevention)
5. After 2 redirects, user should be allowed to stay on `/app`

### Method 3: Database Verification

After running skip, verify the database state:

```bash
# Option 1: Using Prisma Studio
npx prisma studio

# Option 2: Direct SQL query (if using SQL database)
# Query the Organization table for the test user
```

**Expected Database State:**
- Organization record exists for the user
- `organizationType` field is set (not null)
- `isBasicComplete` would be `true` (has organizationType)

## Success Metrics

The fix is working correctly if:

1. ✅ **Immediate Success**: Skip navigates to `/app` in <2 seconds
2. ✅ **Persistence**: Page refresh on `/app` doesn't redirect back
3. ✅ **Database State**: `isBasicComplete: true` after skip
4. ✅ **No Console Errors**: Clean browser console throughout process
5. ✅ **Session Integrity**: User remains authenticated on `/app`
6. ✅ **No Redirect Loop**: User stays on `/app` after skip

## Red Flags to Watch For

### Database-Related Issues

If `isBasicComplete` is still `false` after skip:
```javascript
// Check in browser console:
fetch('/api/onboarding/status?t=' + Date.now())
  .then(r => r.json())
  .then(d => console.log('DB State:', d.isBasicComplete));
```

### NextAuth Integration Issues

Verify session remains valid:
```javascript
// Check session in console:
fetch('/api/auth/session')
  .then(r => r.json())
  .then(s => console.log('Session:', s));
```

### Cache Issues

If status API returns stale data:
- Verify URL includes `?t=<timestamp>` query param
- Verify `Cache-Control: no-cache` header is present
- Try hard refresh (Ctrl+Shift+R / Cmd+Shift+R)

## Troubleshooting

### Issue: Skip button doesn't navigate

**Check:**
1. Browser console for JavaScript errors
2. Network tab for failed API calls
3. Verify user is authenticated

### Issue: Redirect loop still occurs

**Check:**
1. SessionStorage flags (`fromOnboarding`, `lastRedirectTime`)
2. OnboardingGate redirect attempt counter (max 2)
3. Database state (is `organizationType` actually saved?)

### Issue: Save API returns 500 error

**Check:**
1. Server logs for database errors
2. Prisma connection status
3. Database schema matches expected structure

## Test Report Template

After executing tests, document results:

```markdown
# Test Report: Onboarding Skip Fix

**Date:** [Date]
**Tester:** [Name]
**Environment:** localhost:3000

## Test Results

- [ ] Test 1: Basic Skip Flow - ✅ PASS / ❌ FAIL
- [ ] Test 2: Skip with Organization Type - ✅ PASS / ❌ FAIL
- [ ] Test 4: OnboardingGate Retry Logic - ✅ PASS / ❌ FAIL
- [ ] Test 8: Redirect Loop Prevention - ✅ PASS / ❌ FAIL
- [ ] Test 9: SessionStorage Flags - ✅ PASS / ❌ FAIL
- [ ] Test 11: Direct Navigation - ✅ PASS / ❌ FAIL
- [ ] Test 13: Multiple Tabs - ✅ PASS / ❌ FAIL

## Issues Found

[List any issues discovered]

## Overall Status

✅ PASS - All tests passed
⚠️  WARNINGS - Some tests have warnings
❌ FAIL - Critical tests failed
```

## Next Steps

After successful test execution:

1. ✅ Document test results
2. ✅ Verify database state is correct
3. ✅ Test on different browsers (Chrome, Firefox, Safari)
4. ✅ Test on mobile devices (if applicable)
5. ✅ Verify production deployment behavior matches

## Emergency Workaround

If the fix doesn't work completely, temporary workaround:

1. Add query param bypass: `/app?skipOnboarding=true`
2. Modify OnboardingGate to respect this param temporarily
3. Allows user testing to continue while debugging root cause

---

**Note:** This is a mission-critical fix for user acquisition. All tests must pass before considering the fix complete.

