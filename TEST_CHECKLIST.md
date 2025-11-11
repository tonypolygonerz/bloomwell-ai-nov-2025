# Onboarding Skip Fix - Test Checklist

Quick reference checklist for manual testing.

## Pre-Test Setup

- [ ] Development server running on `http://localhost:3000`
- [ ] Browser DevTools open (Network, Console, Application tabs)
- [ ] Test user account ready (or create new one)
- [ ] Browser cache cleared
- [ ] SessionStorage cleared

## Critical Tests (Must Pass)

### Test 1: Basic Skip Flow ⭐ PRIMARY FIX
- [ ] Navigate to `/onboarding/step2`
- [ ] Use default organization type (don't change)
- [ ] Don't enter any organization details
- [ ] Click "Skip" button
- [ ] **VERIFY:** Save API returns 200 OK (Network tab)
- [ ] **VERIFY:** Status API called with `?t=` timestamp (cache-busting)
- [ ] **VERIFY:** Navigation to `/app` succeeds
- [ ] **CRITICAL:** User stays on `/app` (no redirect back to step2)
- [ ] Wait 5 seconds, verify still on `/app`
- [ ] **Result:** ✅ PASS / ❌ FAIL

### Test 2: Skip with Organization Type
- [ ] Navigate to `/onboarding/step2`
- [ ] Select different organization type
- [ ] Click "Skip"
- [ ] **VERIFY:** Navigation to `/app` succeeds
- [ ] **VERIFY:** No redirect loop
- [ ] **Result:** ✅ PASS / ❌ FAIL

### Test 4: OnboardingGate Retry Logic
- [ ] Navigate to `/onboarding/step2`
- [ ] Click "Skip"
- [ ] Monitor Network tab for status API calls
- [ ] **VERIFY:** Status API URL includes `?t=` query param
- [ ] **VERIFY:** Request headers include `Cache-Control: no-cache`
- [ ] **VERIFY:** If first check fails, retry occurs after delay
- [ ] **Result:** ✅ PASS / ❌ FAIL

### Test 8: Redirect Loop Prevention
- [ ] Navigate to `/onboarding/step2`
- [ ] Click "Skip"
- [ ] Count redirects to `/onboarding/step2`
- [ ] **VERIFY:** Maximum 2 redirect attempts
- [ ] **VERIFY:** After 2 attempts, user allowed to stay on `/app`
- [ ] **Result:** ✅ PASS / ❌ FAIL

### Test 9: SessionStorage Flags
- [ ] Navigate to `/onboarding/step2`
- [ ] Clear sessionStorage
- [ ] Click "Skip"
- [ ] **VERIFY:** `fromOnboarding: 'true'` is set
- [ ] **VERIFY:** `lastRedirectTime` timestamp is set
- [ ] Navigate to `/app`
- [ ] **VERIFY:** Flags cleared after successful check
- [ ] **Result:** ✅ PASS / ❌ FAIL

## Additional Tests

### Test 11: Direct Navigation
- [ ] Create new user (or ensure no onboarding data)
- [ ] Directly navigate to `http://localhost:3000/app`
- [ ] **VERIFY:** Redirected to `/onboarding/step2` (if incomplete)
- [ ] **VERIFY:** No infinite redirect loop
- [ ] **Result:** ✅ PASS / ❌ FAIL

### Test 13: Multiple Browser Tabs
- [ ] Open `/onboarding/step2` in Tab 1
- [ ] Open `/onboarding/step2` in Tab 2
- [ ] Click "Skip" in Tab 1
- [ ] Refresh Tab 2
- [ ] **VERIFY:** Tab 2 redirects appropriately (not stuck in loop)
- [ ] **Result:** ✅ PASS / ❌ FAIL

### Browser Console Verification
- [ ] Navigate to `/onboarding/step2`
- [ ] Open Console tab
- [ ] Run `browser-verification-script.js`
- [ ] **VERIFY:** All checks pass
- [ ] **Result:** ✅ PASS / ❌ FAIL

## Database Verification

- [ ] After skip, query database for organization record
- [ ] **VERIFY:** Organization record exists
- [ ] **VERIFY:** `organizationType` field is set
- [ ] **VERIFY:** `isBasicComplete` would be true
- [ ] **Result:** ✅ PASS / ❌ FAIL

## Success Criteria Summary

All critical tests must pass:

1. ✅ Skip button navigates to `/app` successfully
2. ✅ No redirect loop occurs (user stays on `/app`)
3. ✅ Save API returns 200 OK with correct data
4. ✅ Database contains organization record with `organizationType`
5. ✅ Status API verification works with retry logic
6. ✅ Error handling displays user-friendly messages
7. ✅ Redirect loop prevention works (max 2 attempts)
8. ✅ SessionStorage flags are managed correctly
9. ✅ Cache-busting prevents stale data

## Notes

- Document any failures with screenshots
- Check browser console for errors
- Monitor Network tab for all API calls
- Verify database state after critical tests

---

**Status:** ⬜ Not Started / 🟡 In Progress / ✅ Complete / ❌ Failed

