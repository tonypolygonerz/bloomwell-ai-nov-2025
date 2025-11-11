// Browser Console Verification Script
// Copy and paste this into the browser console after navigating to /onboarding/step2

async function verifySkipFix() {
  console.log('🔄 Testing Skip Fix...');
  console.log('='.repeat(70));
  
  const results = {
    initialStatus: null,
    saveResult: null,
    finalStatus: null,
    currentPage: null,
    sessionStorage: {},
    errors: []
  };
  
  try {
    // 1. Check initial state
    console.log('\n1️⃣ Checking initial onboarding status...');
    const initialResponse = await fetch('/api/onboarding/status?t=' + Date.now(), {
      cache: 'no-store'
    });
    
    if (!initialResponse.ok) {
      throw new Error(`Status API returned ${initialResponse.status}`);
    }
    
    results.initialStatus = await initialResponse.json();
    console.log('   Initial isBasicComplete:', results.initialStatus.isBasicComplete);
    console.log('   Initial organizationType:', results.initialStatus.organization?.organizationType);
    
    // 2. Trigger save (simulate skip)
    console.log('\n2️⃣ Simulating skip save operation...');
    const saveResponse = await fetch('/api/onboarding/save', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        organizationType: 'US Registered 501(c)(3) Nonprofit'
      })
    });
    
    if (!saveResponse.ok) {
      const errorText = await saveResponse.text();
      throw new Error(`Save API returned ${saveResponse.status}: ${errorText}`);
    }
    
    results.saveResult = await saveResponse.json();
    console.log('   Save success:', results.saveResult.success);
    console.log('   Saved organizationType:', results.saveResult.organization?.organizationType);
    
    // 3. Wait for propagation
    console.log('\n3️⃣ Waiting for database propagation...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 4. Check final state
    console.log('\n4️⃣ Checking final onboarding status...');
    const finalResponse = await fetch('/api/onboarding/status?t=' + Date.now(), {
      cache: 'no-store'
    });
    
    if (!finalResponse.ok) {
      throw new Error(`Status API returned ${finalResponse.status}`);
    }
    
    results.finalStatus = await finalResponse.json();
    console.log('   Final isBasicComplete:', results.finalStatus.isBasicComplete);
    console.log('   Final organizationType:', results.finalStatus.organization?.organizationType);
    
    // 5. Verify no redirect loop
    console.log('\n5️⃣ Checking current page and sessionStorage...');
    results.currentPage = window.location.pathname;
    results.sessionStorage = {
      fromOnboarding: sessionStorage.getItem('fromOnboarding'),
      lastRedirectTime: sessionStorage.getItem('lastRedirectTime')
    };
    
    console.log('   Current page:', results.currentPage);
    console.log('   SessionStorage:', results.sessionStorage);
    
    // 6. Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 VERIFICATION SUMMARY');
    console.log('='.repeat(70));
    
    const checks = {
      'Save API Success': results.saveResult?.success === true,
      'isBasicComplete After Save': results.finalStatus?.isBasicComplete === true,
      'OrganizationType Saved': !!results.finalStatus?.organization?.organizationType,
      'No Errors': results.errors.length === 0
    };
    
    Object.entries(checks).forEach(([check, passed]) => {
      console.log(`${passed ? '✅' : '❌'} ${check}: ${passed}`);
    });
    
    if (Object.values(checks).every(v => v === true)) {
      console.log('\n🎉 ALL CHECKS PASSED! Skip fix is working correctly.');
      return { success: true, results };
    } else {
      console.log('\n⚠️  SOME CHECKS FAILED. Review the results above.');
      return { success: false, results };
    }
    
  } catch (error) {
    console.error('\n❌ VERIFICATION ERROR:', error);
    results.errors.push(error.message);
    return { success: false, results, error: error.message };
  }
}

// Run the verification
verifySkipFix().then(result => {
  console.log('\n📋 Full Results:', result);
  return result;
});

