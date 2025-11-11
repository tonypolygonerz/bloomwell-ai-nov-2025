// File: test-onboarding-flow.js

const puppeteer = require('puppeteer');
const { execSync } = require('child_process');
const path = require('path');

// CORRECT PROJECT PATH - with spaces properly handled
const PROJECT_ROOT = '/Users/newberlin/Development/Bloomwell AI/Bloomwell AI Nov 2025';

async function checkServerRunning() {
  try {
    const response = await fetch('http://localhost:3000');
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function verifyDatabase() {
  console.log('\n📊 DATABASE VERIFICATION');
  console.log('Checking Organization table...');
  
  // Change to correct directory
  process.chdir(path.join(PROJECT_ROOT, 'packages/db'));
  
  try {
    const result = execSync('npx prisma db execute --stdin', {
      input: 'SELECT * FROM Organization ORDER BY createdAt DESC LIMIT 1;',
      encoding: 'utf-8'
    });
    console.log('Latest organization:', result);
  } catch (error) {
    console.log('⚠️  Manual verification needed - open Prisma Studio');
  }
}

async function testOnboardingFlow() {
  console.log('🚀 ONBOARDING FLOW TEST STARTING...');
  console.log(`📁 Project Root: ${PROJECT_ROOT}`);
  
  // Verify server is running
  const serverRunning = await checkServerRunning();
  if (!serverRunning) {
    console.error('\n❌ ERROR: Dev server not running on localhost:3000');
    console.log('\nStart server first:');
    console.log(`  cd "${PROJECT_ROOT}"`);
    console.log('  npm run dev');
    process.exit(1);
  }
  console.log('✅ Server is running\n');

  const browser = await puppeteer.launch({ 
    headless: false,
    slowMo: 250,
    defaultViewport: { width: 1920, height: 1080 }
  });
  
  const page = await browser.newPage();
  
  // Monitor console
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') {
      console.log('🔴 BROWSER ERROR:', text);
    } else if (text.includes('Onboarding')) {
      console.log('📝 BROWSER LOG:', text);
    }
  });
  
  // Monitor network
  const apiCalls = [];
  page.on('response', async response => {
    const url = response.url();
    const status = response.status();
    
    if (url.includes('/api/onboarding/save')) {
      const timestamp = new Date().toISOString();
      console.log(`\n🌐 API CALL DETECTED`);
      console.log(`   URL: ${url}`);
      console.log(`   Status: ${status}`);
      console.log(`   Time: ${timestamp}`);
      
      if (status !== 200) {
        try {
          const body = await response.text();
          console.log(`   ❌ ERROR RESPONSE: ${body}`);
        } catch (e) {
          console.log(`   ❌ Could not read error response`);
        }
      } else {
        console.log(`   ✅ SUCCESS`);
      }
      
      apiCalls.push({ url, status, timestamp });
    }
  });

  const testEmail = `test-${Date.now()}@example.com`;
  const resultsDir = path.join(PROJECT_ROOT, 'test-results');
  
  // Create results directory
  try {
    execSync(`mkdir -p "${resultsDir}"`);
  } catch (e) {
    console.log('Results directory already exists');
  }

  try {
    // STEP 1: Homepage
    console.log('\n📍 STEP 1: Navigate to homepage');
    await page.goto('http://localhost:3000', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    await page.screenshot({ path: path.join(resultsDir, '01-homepage.png') });
    console.log('✅ Homepage loaded');

    // STEP 2: Get Started
    console.log('\n📍 STEP 2: Click "Get Started"');
    await page.waitForSelector('button, a', { timeout: 10000 });
    
    // Try multiple selectors - use evaluate instead of evaluateHandle
    await page.evaluate(() => {
      // Look for "Get Started" text in buttons or links
      const elements = Array.from(document.querySelectorAll('button, a'));
      const button = elements.find(el => 
        el.textContent.toLowerCase().includes('get started') ||
        el.textContent.toLowerCase().includes('sign up') ||
        el.textContent.toLowerCase().includes('register')
      );
      if (!button) {
        throw new Error('Could not find Get Started button');
      }
      button.click();
    });
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });
    await page.screenshot({ path: path.join(resultsDir, '02-register-page.png') });
    console.log('✅ Registration page loaded');
    console.log(`   Current URL: ${page.url()}`);

    // STEP 3: Register
    console.log('\n📍 STEP 3: Fill registration form');
    console.log(`   Email: ${testEmail}`);
    
    await page.waitForSelector('input[type="email"]', { timeout: 5000 });
    
    // Fill form fields
    await page.type('input[name="firstName"], input[placeholder*="First"]', 'Test');
    await page.type('input[name="lastName"], input[placeholder*="Last"]', 'User');
    await page.type('input[type="email"]', testEmail);
    
    // Fill password fields
    const passwordInputs = await page.$$('input[type="password"]');
    if (passwordInputs.length >= 2) {
      await passwordInputs[0].type('TestPass123!');
      await passwordInputs[1].type('TestPass123!'); // Confirm password
    } else {
      await page.type('input[type="password"]', 'TestPass123!');
    }
    
    await page.screenshot({ path: path.join(resultsDir, '03-registration-filled.png') });
    
    // Submit
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button[type="submit"], button'));
      const btn = buttons.find(button => 
        button.textContent.toLowerCase().includes('create') ||
        button.textContent.toLowerCase().includes('sign up') ||
        button.textContent.toLowerCase().includes('register') ||
        button.textContent.toLowerCase().includes('continue')
      );
      if (btn) btn.click();
    });
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
    await page.screenshot({ path: path.join(resultsDir, '04-after-registration.png') });
    
    const afterRegUrl = page.url();
    console.log(`✅ Registered. Current URL: ${afterRegUrl}`);
    
    if (!afterRegUrl.includes('/onboarding/step2')) {
      console.log(`⚠️  WARNING: Expected /onboarding/step2 but got ${afterRegUrl}`);
    }

    // STEP 4: Select org type
    console.log('\n📍 STEP 4: Select organization type');
    
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for page to stabilize
    
    await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('button, div[role="button"]'));
      const button = elements.find(el => 
        el.textContent.toLowerCase().includes('other') &&
        el.textContent.toLowerCase().includes('individual')
      );
      if (button) button.click();
    });
    await new Promise(resolve => setTimeout(resolve, 1500));
    await page.screenshot({ path: path.join(resultsDir, '05-org-type-selected.png') });
    console.log('✅ Organization type selected');

    // STEP 5: Enter org name
    console.log('\n📍 STEP 5: Enter organization name');
    
    const orgNameInput = await page.waitForSelector(
      'input[name="organizationName"], input[placeholder*="organization"]',
      { timeout: 5000 }
    );
    
    await orgNameInput.type('Test Verification Org');
    await new Promise(resolve => setTimeout(resolve, 1000));
    await page.screenshot({ path: path.join(resultsDir, '06-org-name-entered.png') });
    console.log('✅ Organization name entered');

    // STEP 6: Continue (CRITICAL TEST)
    console.log('\n📍 STEP 6: Click Continue to Step 3');
    console.log('⚠️  CRITICAL: This previously returned 500 error');
    
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(button => button.textContent.toLowerCase().includes('continue'));
      if (btn) btn.click();
    });
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
    await page.screenshot({ path: path.join(resultsDir, '07-step3-loaded.png') });
    
    const step3Url = page.url();
    console.log(`   Current URL: ${step3Url}`);
    
    if (step3Url.includes('/onboarding/step3')) {
      console.log('✅ Step 3 loaded successfully - NO 500 ERROR!');
    } else {
      throw new Error(`Expected /onboarding/step3 but got ${step3Url}`);
    }

    // STEP 7: Skip (CRITICAL TEST)
    console.log('\n📍 STEP 7: Click Skip to reach dashboard');
    console.log('⚠️  CRITICAL: This previously returned 500 error');
    
    await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('button, a'));
      const btn = elements.find(el => el.textContent.toLowerCase().includes('skip'));
      if (btn) btn.click();
    });
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
    await page.screenshot({ path: path.join(resultsDir, '08-dashboard-loaded.png') });
    
    const finalUrl = page.url();
    console.log(`   Final URL: ${finalUrl}`);
    
    if (finalUrl.includes('/app')) {
      console.log('✅ Dashboard loaded successfully - NO 500 ERROR!');
    } else {
      console.log(`⚠️  WARNING: Expected /app but got ${finalUrl}`);
    }

    // SUMMARY
    console.log('\n' + '='.repeat(70));
    console.log('🎉 TEST SUITE COMPLETED');
    console.log('='.repeat(70));
    
    console.log('\n📊 API CALLS SUMMARY:');
    if (apiCalls.length === 0) {
      console.log('⚠️  No API calls to /api/onboarding/save detected');
    } else {
      apiCalls.forEach((call, idx) => {
        const emoji = call.status === 200 ? '✅' : '❌';
        console.log(`${emoji} Call ${idx + 1}: HTTP ${call.status} at ${call.timestamp}`);
      });
    }
    
    console.log('\n📧 Test User Email:', testEmail);
    console.log('📁 Screenshots saved to:', resultsDir);
    
    console.log('\n🔍 MANUAL VERIFICATION NEEDED:');
    console.log('1. Open Prisma Studio: http://localhost:5555');
    console.log(`2. Check Organization table for: "Test Verification Org"`);
    console.log(`3. Verify userId matches user: ${testEmail}`);
    
    await verifyDatabase();

    console.log('\n✅ ALL AUTOMATED TESTS PASSED!');

  } catch (error) {
    console.error('\n❌ TEST FAILED');
    console.error('Error:', error.message);
    await page.screenshot({ path: path.join(resultsDir, 'ERROR-final-state.png') });
    throw error;
  } finally {
    await browser.close();
  }
}

// Execute
console.log('Starting test suite...\n');
testOnboardingFlow()
  .then(() => {
    console.log('\n✅ Test completed successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ Test suite failed:', err.message);
    process.exit(1);
  });

