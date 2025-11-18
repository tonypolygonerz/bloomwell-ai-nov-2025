#!/usr/bin/env node

/**
 * Test verify-code endpoint with manually created verification codes
 * This bypasses the email sending requirement
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

async function createTestCode(email, code = null) {
  const testCode = code || Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 10 * 60 * 1000);
  
  return await prisma.verificationCode.create({
    data: { email, code: testCode, expires }
  });
}

async function testVerifyCodeEndpoint() {
  console.log('🧪 Testing verify-code endpoint\n');
  
  const testEmail = `verify-test-${Date.now()}@example.com`;
  const testCode = '123456';
  
  try {
    // Create a valid verification code
    const verification = await createTestCode(testEmail, testCode);
    console.log(`✅ Created test code: ${testCode} for ${testEmail}`);
    
    // Test 1: Valid code verification (without registration)
    console.log('\n📋 Test 1: Valid code verification (isRegistration: false)');
    try {
      const response = await fetch(`${BASE_URL}/api/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          code: testCode,
          isRegistration: false
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log('✅ Valid code verification: PASSED');
        console.log(`   Response: ${JSON.stringify(data)}`);
      } else {
        console.log('❌ Valid code verification: FAILED');
        console.log(`   Status: ${response.status}`);
        console.log(`   Response: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      console.log('❌ Valid code verification: ERROR');
      console.log(`   ${error.message}`);
    }
    
    // Test 2: Invalid code
    console.log('\n📋 Test 2: Invalid code');
    try {
      const response = await fetch(`${BASE_URL}/api/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          code: '999999',
          isRegistration: false
        })
      });
      
      const data = await response.json();
      
      if (!response.ok && data.error && data.error.includes('Invalid')) {
        console.log('✅ Invalid code rejection: PASSED');
        console.log(`   Error message: ${data.error}`);
      } else {
        console.log('❌ Invalid code rejection: FAILED');
        console.log(`   Status: ${response.status}`);
        console.log(`   Response: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      console.log('❌ Invalid code test: ERROR');
      console.log(`   ${error.message}`);
    }
    
    // Test 3: Expired code
    console.log('\n📋 Test 3: Expired code');
    const expiredCode = await prisma.verificationCode.create({
      data: {
        email: testEmail,
        code: '888888',
        expires: new Date(Date.now() - 1000), // Expired
        used: false
      }
    });
    
    try {
      const response = await fetch(`${BASE_URL}/api/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          code: '888888',
          isRegistration: false
        })
      });
      
      const data = await response.json();
      
      if (!response.ok && data.error && data.error.includes('Invalid')) {
        console.log('✅ Expired code rejection: PASSED');
        console.log(`   Error message: ${data.error}`);
      } else {
        console.log('❌ Expired code rejection: FAILED');
        console.log(`   Status: ${response.status}`);
        console.log(`   Response: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      console.log('❌ Expired code test: ERROR');
      console.log(`   ${error.message}`);
    }
    
    // Test 4: Used code
    console.log('\n📋 Test 4: Used code');
    const usedCode = await createTestCode(testEmail, '777777');
    await prisma.verificationCode.update({
      where: { id: usedCode.id },
      data: { used: true }
    });
    
    try {
      const response = await fetch(`${BASE_URL}/api/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          code: '777777',
          isRegistration: false
        })
      });
      
      const data = await response.json();
      
      if (!response.ok && data.error && data.error.includes('Invalid')) {
        console.log('✅ Used code rejection: PASSED');
        console.log(`   Error message: ${data.error}`);
      } else {
        console.log('❌ Used code rejection: FAILED');
        console.log(`   Status: ${response.status}`);
        console.log(`   Response: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      console.log('❌ Used code test: ERROR');
      console.log(`   ${error.message}`);
    }
    
    // Test 5: Too many attempts
    console.log('\n📋 Test 5: Too many attempts');
    const attemptsCode = await createTestCode(testEmail, '666666');
    await prisma.verificationCode.update({
      where: { id: attemptsCode.id },
      data: { attempts: 5 }
    });
    
    try {
      const response = await fetch(`${BASE_URL}/api/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          code: '666666',
          isRegistration: false
        })
      });
      
      const data = await response.json();
      
      if (!response.ok && response.status === 429 && data.error && data.error.includes('attempts')) {
        console.log('✅ Max attempts rejection: PASSED');
        console.log(`   Error message: ${data.error}`);
      } else {
        console.log('❌ Max attempts rejection: FAILED');
        console.log(`   Status: ${response.status}`);
        console.log(`   Response: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      console.log('❌ Max attempts test: ERROR');
      console.log(`   ${error.message}`);
    }
    
    // Clean up
    await prisma.verificationCode.deleteMany({
      where: { email: testEmail }
    });
    
    console.log('\n✅ Test cleanup completed');
    
  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testVerifyCodeEndpoint().catch(console.error);

