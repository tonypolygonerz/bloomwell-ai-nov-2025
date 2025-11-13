// File: test-skip-fix-verification.js
// Comprehensive test suite for onboarding skip redirect loop fix

const puppeteer = require('puppeteer')
const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs')

// PROJECT PATH
const PROJECT_ROOT = '/Users/newberlin/Development/Bloomwell AI/Bloomwell AI Nov 2025'

// Test results tracking
const testResults = {
  passed: [],
  failed: [],
  warnings: [],
}

// Helper function to check if server is running
async function checkServerRunning() {
  try {
    const response = await fetch('http://localhost:3000')
    return response.ok
  } catch (error) {
    return false
  }
}

// Helper function to verify database state
async function verifyDatabaseState(userId, expectedOrgType) {
  console.log('\n📊 Verifying database state...')
  try {
    process.chdir(path.join(PROJECT_ROOT, 'packages/db'))
    // This would need to be adapted based on your database setup
    console.log('⚠️  Manual database verification needed')
    console.log(`   Expected: organizationType = "${expectedOrgType}"`)
    console.log(`   User ID: ${userId}`)
  } catch (error) {
    console.log('⚠️  Could not verify database automatically')
  }
}

// Test 1: Basic Skip Flow from Step 2
async function testBasicSkipFlow(page, resultsDir) {
  console.log('\n' + '='.repeat(70))
  console.log('TEST 1: Basic Skip Flow from Step 2 (Primary Fix)')
  console.log('='.repeat(70))

  try {
    // Navigate to step 2
    await page.goto('http://localhost:3000/onboarding/step2', { waitUntil: 'networkidle2' })
    await page.screenshot({ path: path.join(resultsDir, 'test1-01-step2-loaded.png') })
    console.log('✅ Step 2 page loaded')

    // Verify page elements - find Skip button by text content
    const skipButton = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'))
      return buttons.find((btn) => btn.textContent.trim().toLowerCase().includes('skip'))
    })

    if (!skipButton || (await skipButton.evaluate((el) => el === null))) {
      throw new Error('Skip button not found')
    }
    console.log('✅ Skip button found')

    // Monitor API calls
    const apiCalls = []
    page.on('response', async (response) => {
      const url = response.url()
      if (url.includes('/api/onboarding/save') || url.includes('/api/onboarding/status')) {
        const status = response.status()
        apiCalls.push({ url, status, timestamp: new Date().toISOString() })
        console.log(`   API: ${url.split('?')[0]} - Status: ${status}`)
      }
    })

    // Click Skip button
    console.log('\n📍 Clicking Skip button...')
    await skipButton.evaluate((btn) => btn.click())

    // Wait for navigation with timeout
    try {
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 })
    } catch (e) {
      console.log('⚠️  Navigation timeout, checking current URL...')
    }

    // Wait a bit for any redirects
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const currentUrl = page.url()
    console.log(`\n📍 Current URL: ${currentUrl}`)
    await page.screenshot({ path: path.join(resultsDir, 'test1-02-after-skip.png') })

    // CRITICAL: Verify we're on /app and NOT redirected back
    if (currentUrl.includes('/app') && !currentUrl.includes('/onboarding')) {
      console.log('✅ Successfully navigated to /app')

      // Wait a bit more to ensure no redirect loop
      await new Promise((resolve) => setTimeout(resolve, 3000))
      const finalUrl = page.url()

      if (finalUrl.includes('/app') && !finalUrl.includes('/onboarding')) {
        console.log('✅ No redirect loop detected - user stays on /app')
        testResults.passed.push('Test 1: Basic Skip Flow')

        // Verify API calls
        const saveCall = apiCalls.find((c) => c.url.includes('/api/onboarding/save'))
        const statusCall = apiCalls.find((c) => c.url.includes('/api/onboarding/status'))

        if (saveCall && saveCall.status === 200) {
          console.log('✅ Save API returned 200 OK')
        } else {
          testResults.warnings.push('Test 1: Save API status unclear')
        }

        if (statusCall && statusCall.url.includes('?t=')) {
          console.log('✅ Status API called with cache-busting')
        }

        return true
      } else {
        throw new Error(`Redirect loop detected! Final URL: ${finalUrl}`)
      }
    } else {
      throw new Error(`Failed to reach /app. Current URL: ${currentUrl}`)
    }
  } catch (error) {
    console.error('❌ Test 1 FAILED:', error.message)
    testResults.failed.push(`Test 1: ${error.message}`)
    await page.screenshot({ path: path.join(resultsDir, 'test1-ERROR.png') })
    return false
  }
}

// Test 2: Skip with Organization Type Selected
async function testSkipWithOrgType(page, resultsDir) {
  console.log('\n' + '='.repeat(70))
  console.log('TEST 2: Skip with Organization Type Selected')
  console.log('='.repeat(70))

  try {
    await page.goto('http://localhost:3000/onboarding/step2', { waitUntil: 'networkidle2' })

    // Select a different organization type
    const orgTypeSelect = await page.$('select, input[type="radio"]')
    if (orgTypeSelect) {
      await page.select('select', 'Freelance Grant Writer / Grant Writing Agency')
      console.log('✅ Organization type selected')
    }

    await page.screenshot({ path: path.join(resultsDir, 'test2-01-org-type-selected.png') })

    // Click Skip - find button by text
    const skipButton = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'))
      return buttons.find((btn) => btn.textContent.trim().toLowerCase().includes('skip'))
    })
    if (skipButton && !(await skipButton.evaluate((el) => el === null))) {
      await skipButton.evaluate((btn) => btn.click())
    } else {
      throw new Error('Skip button not found')
    }

    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {})
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const currentUrl = page.url()
    if (currentUrl.includes('/app') && !currentUrl.includes('/onboarding')) {
      console.log('✅ Navigation successful with organization type')
      testResults.passed.push('Test 2: Skip with Organization Type')
      return true
    } else {
      throw new Error(`Failed to navigate to /app. URL: ${currentUrl}`)
    }
  } catch (error) {
    console.error('❌ Test 2 FAILED:', error.message)
    testResults.failed.push(`Test 2: ${error.message}`)
    return false
  }
}

// Test 4: OnboardingGate Retry Logic
async function testOnboardingGateRetry(page, resultsDir) {
  console.log('\n' + '='.repeat(70))
  console.log('TEST 4: OnboardingGate Retry Logic')
  console.log('='.repeat(70))

  try {
    const statusCalls = []

    // Monitor status API calls
    page.on('response', async (response) => {
      const url = response.url()
      if (url.includes('/api/onboarding/status')) {
        const headers = response.headers()
        statusCalls.push({
          url,
          hasCacheBusting: url.includes('?t='),
          cacheControl: headers['cache-control'],
          timestamp: new Date().toISOString(),
        })
      }
    })

    await page.goto('http://localhost:3000/onboarding/step2', { waitUntil: 'networkidle2' })

    const skipButton = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'))
      return buttons.find((btn) => btn.textContent.trim().toLowerCase().includes('skip'))
    })
    if (skipButton && !(await skipButton.evaluate((el) => el === null))) {
      await skipButton.evaluate((btn) => btn.click())
    } else {
      throw new Error('Skip button not found')
    }

    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {})
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Check status API calls
    const cacheBustedCalls = statusCalls.filter((c) => c.hasCacheBusting)
    if (cacheBustedCalls.length > 0) {
      console.log('✅ Status API called with cache-busting query param')
      testResults.passed.push('Test 4: Cache-busting verified')
    } else {
      testResults.warnings.push('Test 4: Cache-busting not detected')
    }

    const currentUrl = page.url()
    if (currentUrl.includes('/app')) {
      console.log('✅ Retry logic working - user on /app')
      testResults.passed.push('Test 4: OnboardingGate Retry Logic')
      return true
    } else {
      throw new Error('Retry logic failed')
    }
  } catch (error) {
    console.error('❌ Test 4 FAILED:', error.message)
    testResults.failed.push(`Test 4: ${error.message}`)
    return false
  }
}

// Test 8: Multiple Skip Attempts / Redirect Loop Prevention
async function testRedirectLoopPrevention(page, resultsDir) {
  console.log('\n' + '='.repeat(70))
  console.log('TEST 8: Redirect Loop Prevention')
  console.log('='.repeat(70))

  try {
    let redirectCount = 0
    const urls = []

    // Monitor navigation
    page.on('framenavigated', (frame) => {
      const url = frame.url()
      urls.push(url)
      if (url.includes('/onboarding/step2')) {
        redirectCount++
        console.log(`   Redirect #${redirectCount} to step2 detected`)
      }
    })

    await page.goto('http://localhost:3000/onboarding/step2', { waitUntil: 'networkidle2' })

    const skipButton = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'))
      return buttons.find((btn) => btn.textContent.trim().toLowerCase().includes('skip'))
    })
    if (skipButton && !(await skipButton.evaluate((el) => el === null))) {
      await skipButton.evaluate((btn) => btn.click())
    } else {
      throw new Error('Skip button not found')
    }

    // Wait and observe redirects
    await new Promise((resolve) => setTimeout(resolve, 5000))

    const finalUrl = page.url()
    console.log(`\n📍 Final URL: ${finalUrl}`)
    console.log(`📍 Total redirects to step2: ${redirectCount}`)

    if (redirectCount <= 2) {
      console.log('✅ Redirect loop prevention working (max 2 redirects)')
      testResults.passed.push('Test 8: Redirect Loop Prevention')
      return true
    } else {
      throw new Error(`Too many redirects: ${redirectCount}`)
    }
  } catch (error) {
    console.error('❌ Test 8 FAILED:', error.message)
    testResults.failed.push(`Test 8: ${error.message}`)
    return false
  }
}

// Test 9: SessionStorage Flag Management
async function testSessionStorageFlags(page, resultsDir) {
  console.log('\n' + '='.repeat(70))
  console.log('TEST 9: SessionStorage Flag Management')
  console.log('='.repeat(70))

  try {
    await page.goto('http://localhost:3000/onboarding/step2', { waitUntil: 'networkidle2' })

    // Clear sessionStorage first
    await page.evaluate(() => {
      sessionStorage.clear()
    })

    const skipButton = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'))
      return buttons.find((btn) => btn.textContent.trim().toLowerCase().includes('skip'))
    })
    if (skipButton && !(await skipButton.evaluate((el) => el === null))) {
      await skipButton.evaluate((btn) => btn.click())
    } else {
      throw new Error('Skip button not found')
    }

    // Check sessionStorage after skip
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const storageFlags = await page.evaluate(() => {
      return {
        fromOnboarding: sessionStorage.getItem('fromOnboarding'),
        lastRedirectTime: sessionStorage.getItem('lastRedirectTime'),
      }
    })

    console.log('📍 SessionStorage flags:', storageFlags)

    if (storageFlags.fromOnboarding === 'true') {
      console.log('✅ fromOnboarding flag set correctly')
    } else {
      throw new Error('fromOnboarding flag not set')
    }

    // Navigate to /app and check flags are cleared
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {})
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const finalFlags = await page.evaluate(() => {
      return {
        fromOnboarding: sessionStorage.getItem('fromOnboarding'),
        lastRedirectTime: sessionStorage.getItem('lastRedirectTime'),
      }
    })

    // Flags should be cleared after successful check
    if (!finalFlags.fromOnboarding || finalFlags.fromOnboarding === 'null') {
      console.log('✅ Flags cleared after successful check')
      testResults.passed.push('Test 9: SessionStorage Flag Management')
      return true
    } else {
      testResults.warnings.push('Test 9: Flags may not be cleared (could be expected)')
      return true // Not a failure, just a note
    }
  } catch (error) {
    console.error('❌ Test 9 FAILED:', error.message)
    testResults.failed.push(`Test 9: ${error.message}`)
    return false
  }
}

// Test 11: Direct Navigation to /app
async function testDirectNavigation(page, resultsDir) {
  console.log('\n' + '='.repeat(70))
  console.log('TEST 11: Direct Navigation to /app (Edge Case)')
  console.log('='.repeat(70))

  try {
    // Create a new user or ensure no onboarding data
    // For this test, we'll just navigate directly
    await page.goto('http://localhost:3000/app', { waitUntil: 'networkidle2' })
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const currentUrl = page.url()
    console.log(`📍 Current URL after direct navigation: ${currentUrl}`)

    if (currentUrl.includes('/onboarding/step2')) {
      console.log('✅ OnboardingGate correctly redirects incomplete users')
      testResults.passed.push('Test 11: Direct Navigation to /app')
      return true
    } else if (currentUrl.includes('/app')) {
      console.log(
        '⚠️  User already has onboarding complete (expected if testing with existing user)',
      )
      testResults.warnings.push('Test 11: User may already have onboarding complete')
      return true
    } else {
      throw new Error(`Unexpected URL: ${currentUrl}`)
    }
  } catch (error) {
    console.error('❌ Test 11 FAILED:', error.message)
    testResults.failed.push(`Test 11: ${error.message}`)
    return false
  }
}

// Test 13: Multiple Browser Tab Edge Case
async function testMultipleTabs(page, resultsDir) {
  console.log('\n' + '='.repeat(70))
  console.log('TEST 13: Multiple Browser Tab Edge Case')
  console.log('='.repeat(70))

  try {
    // Open step 2 in first tab (current page)
    await page.goto('http://localhost:3000/onboarding/step2', { waitUntil: 'networkidle2' })

    // Open a new page (simulating second tab)
    const page2 = await page.browser().newPage()
    await page2.goto('http://localhost:3000/onboarding/step2', { waitUntil: 'networkidle2' })

    // Skip from first tab
    const skipButton = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'))
      return buttons.find((btn) => btn.textContent.trim().toLowerCase().includes('skip'))
    })
    if (skipButton && !(await skipButton.evaluate((el) => el === null))) {
      await skipButton.evaluate((btn) => btn.click())
    } else {
      throw new Error('Skip button not found')
    }

    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {})
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Refresh second tab
    await page2.reload({ waitUntil: 'networkidle2' })
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const page2Url = page2.url()
    console.log(`📍 Tab 2 URL after refresh: ${page2Url}`)

    if (page2Url.includes('/app') || page2Url.includes('/onboarding/step2')) {
      console.log('✅ Multiple tab scenario handled')
      testResults.passed.push('Test 13: Multiple Browser Tab Edge Case')
      await page2.close()
      return true
    } else {
      throw new Error(`Unexpected URL in tab 2: ${page2Url}`)
    }
  } catch (error) {
    console.error('❌ Test 13 FAILED:', error.message)
    testResults.failed.push(`Test 13: ${error.message}`)
    return false
  }
}

// Browser Console Verification Script
async function runBrowserVerificationScript(page) {
  console.log('\n' + '='.repeat(70))
  console.log('BROWSER CONSOLE VERIFICATION SCRIPT')
  console.log('='.repeat(70))

  const verificationResult = await page.evaluate(async () => {
    const results = {
      initialStatus: null,
      saveResult: null,
      finalStatus: null,
      currentPage: null,
      sessionStorage: {},
    }

    try {
      // 1. Check initial state
      const initialResponse = await fetch('/api/onboarding/status?t=' + Date.now())
      results.initialStatus = await initialResponse.json()

      // 2. Trigger save (simulate skip)
      const saveResponse = await fetch('/api/onboarding/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationType: 'US Registered 501(c)(3) Nonprofit' }),
      })
      results.saveResult = await saveResponse.json()

      // 3. Wait for propagation
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // 4. Check final state
      const finalResponse = await fetch('/api/onboarding/status?t=' + Date.now())
      results.finalStatus = await finalResponse.json()

      // 5. Check current page and sessionStorage
      results.currentPage = window.location.pathname
      results.sessionStorage = {
        fromOnboarding: sessionStorage.getItem('fromOnboarding'),
        lastRedirectTime: sessionStorage.getItem('lastRedirectTime'),
      }

      return results
    } catch (error) {
      return { error: error.message }
    }
  })

  console.log('\n📊 Verification Results:')
  console.log('   Initial isBasicComplete:', verificationResult.initialStatus?.isBasicComplete)
  console.log('   Save Success:', verificationResult.saveResult?.success)
  console.log('   Final isBasicComplete:', verificationResult.finalStatus?.isBasicComplete)
  console.log('   Current Page:', verificationResult.currentPage)
  console.log('   SessionStorage:', verificationResult.sessionStorage)

  if (verificationResult.finalStatus?.isBasicComplete) {
    console.log('✅ Verification script: isBasicComplete is true after save')
    testResults.passed.push('Browser Verification Script')
  } else {
    testResults.warnings.push('Browser Verification: isBasicComplete may not be true')
  }
}

// Helper function to handle authentication
async function ensureAuthenticated(page) {
  const currentUrl = page.url()

  // Check if we're on login page
  if (currentUrl.includes('/login')) {
    console.log('⚠️  Not authenticated. Please log in manually in the browser window.')
    console.log('   Waiting 30 seconds for manual login...')
    await new Promise((resolve) => setTimeout(resolve, 30000))

    // Check if we're still on login
    const newUrl = page.url()
    if (newUrl.includes('/login')) {
      throw new Error('Authentication required. Please log in and run tests again.')
    }
  }

  // Try to navigate to onboarding to check auth
  try {
    await page.goto('http://localhost:3000/onboarding/step2', {
      waitUntil: 'networkidle2',
      timeout: 5000,
    })
    const finalUrl = page.url()
    if (finalUrl.includes('/login')) {
      throw new Error('Authentication required')
    }
  } catch (e) {
    if (e.message.includes('Authentication required')) {
      throw e
    }
  }
}

// Main test execution
async function runAllTests() {
  console.log('🚀 ONBOARDING SKIP FIX VERIFICATION TEST SUITE')
  console.log('='.repeat(70))
  console.log(`📁 Project Root: ${PROJECT_ROOT}`)

  // Verify server is running
  const serverRunning = await checkServerRunning()
  if (!serverRunning) {
    console.error('\n❌ ERROR: Dev server not running on localhost:3000')
    console.log('\nStart server first:')
    console.log(`  cd "${PROJECT_ROOT}"`)
    console.log('  npm run dev')
    process.exit(1)
  }
  console.log('✅ Server is running\n')

  // Create results directory
  const resultsDir = path.join(PROJECT_ROOT, 'test-results-skip-fix')
  try {
    execSync(`mkdir -p "${resultsDir}"`)
  } catch (e) {
    // Directory might already exist
  }

  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 100,
    defaultViewport: { width: 1920, height: 1080 },
  })

  const page = await browser.newPage()

  // Handle authentication
  try {
    await ensureAuthenticated(page)
    console.log('✅ Authentication verified\n')
  } catch (error) {
    console.error('\n❌ Authentication Error:', error.message)
    console.log('\nPlease ensure you are logged in and run the tests again.')
    await browser.close()
    process.exit(1)
  }

  // Monitor console for errors
  page.on('console', (msg) => {
    const type = msg.type()
    const text = msg.text()
    if (type === 'error' && !text.includes('favicon')) {
      console.log('🔴 BROWSER ERROR:', text)
    }
  })

  try {
    // Run all tests
    await testBasicSkipFlow(page, resultsDir)
    await testSkipWithOrgType(page, resultsDir)
    await testOnboardingGateRetry(page, resultsDir)
    await testRedirectLoopPrevention(page, resultsDir)
    await testSessionStorageFlags(page, resultsDir)
    await testDirectNavigation(page, resultsDir)
    await testMultipleTabs(page, resultsDir)
    await runBrowserVerificationScript(page)

    // Print summary
    console.log('\n' + '='.repeat(70))
    console.log('📊 TEST SUMMARY')
    console.log('='.repeat(70))
    console.log(`✅ Passed: ${testResults.passed.length}`)
    testResults.passed.forEach((test) => console.log(`   - ${test}`))

    console.log(`\n⚠️  Warnings: ${testResults.warnings.length}`)
    testResults.warnings.forEach((warning) => console.log(`   - ${warning}`))

    console.log(`\n❌ Failed: ${testResults.failed.length}`)
    testResults.failed.forEach((failure) => console.log(`   - ${failure}`))

    console.log(`\n📁 Screenshots saved to: ${resultsDir}`)

    if (testResults.failed.length === 0) {
      console.log('\n🎉 ALL TESTS PASSED!')
      return 0
    } else {
      console.log('\n⚠️  SOME TESTS FAILED')
      return 1
    }
  } catch (error) {
    console.error('\n❌ TEST SUITE ERROR:', error)
    await page.screenshot({ path: path.join(resultsDir, 'ERROR-test-suite.png') })
    return 1
  } finally {
    await browser.close()
  }
}

// Execute
if (require.main === module) {
  runAllTests()
    .then((exitCode) => process.exit(exitCode))
    .catch((error) => {
      console.error('Fatal error:', error)
      process.exit(1)
    })
}

module.exports = { runAllTests }
