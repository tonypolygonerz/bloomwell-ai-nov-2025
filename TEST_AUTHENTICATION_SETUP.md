# Test Authentication Setup Guide

The automated test suite requires an authenticated user session. Here are the options:

## Option 1: Manual Login (Recommended for First Run)

1. **Start the test script:**
   ```bash
   node test-skip-fix-verification.js
   ```

2. **When the browser window opens:**
   - The script will detect if you're not authenticated
   - You'll have 30 seconds to manually log in
   - Log in with your test account in the browser window
   - The tests will continue automatically

3. **If you miss the window:**
   - The script will exit with an error
   - Simply run it again and log in when prompted

## Option 2: Use Existing Browser Session

If you're already logged in to the app in Chrome:

1. **Close all Chrome windows**

2. **Start Chrome with remote debugging:**
   ```bash
   /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-test-profile
   ```

3. **Log in to your app in that Chrome instance**

4. **Modify the test script** to connect to existing browser:
   ```javascript
   // In test-skip-fix-verification.js, change:
   const browser = await puppeteer.launch({ ... });
   
   // To:
   const browser = await puppeteer.connect({
     browserURL: 'http://localhost:9222'
   });
   ```

## Option 3: Programmatic Login (Advanced)

Add a login function to the test script:

```javascript
async function loginUser(page, email, password) {
  await page.goto('http://localhost:3000/login');
  await page.type('input[type="email"]', email);
  await page.type('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle2' });
}
```

Then call it before running tests:
```javascript
await loginUser(page, 'test@example.com', 'password123');
```

## Current Test Status

The test script is working correctly but needs authentication. The 401 errors indicate:
- ✅ Test script structure is correct
- ✅ Button selectors are working
- ✅ Navigation logic is working
- ❌ API calls need valid session cookies

## Quick Fix for Testing

For immediate testing, you can:

1. **Run the test script**
2. **When browser opens, manually log in**
3. **Tests will continue automatically**

The authentication check gives you 30 seconds to log in manually.

## Verification

After logging in, you should see:
- ✅ Authentication verified
- API calls returning 200 instead of 401
- Tests proceeding successfully

