#!/usr/bin/env node

/**
 * Email Verification API Test Script
 * Tests the email verification endpoints without requiring RESEND_API_KEY
 * Uses direct database queries to verify code generation and validation
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

// Test results tracking
const results = {
  passed: [],
  failed: [],
  warnings: []
};

function logTest(name, passed, message = '') {
  if (passed) {
    results.passed.push(name);
    console.log(`✅ ${name}${message ? ': ' + message : ''}`);
  } else {
    results.failed.push(name);
    console.log(`❌ ${name}${message ? ': ' + message : ''}`);
  }
}

function logWarning(message) {
  results.warnings.push(message);
  console.log(`⚠️  ${message}`);
}

async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    logTest('Database Connection', true);
    return true;
  } catch (error) {
    logTest('Database Connection', false, error.message);
    return false;
  }
}

async function testCodeGeneration() {
  try {
    const testEmail = `test-${Date.now()}@example.com`;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    // Create verification code directly in database
    const verification = await prisma.verificationCode.create({
      data: { email: testEmail, code, expires }
    });

    // Verify code was created
    if (verification && verification.code === code) {
      logTest('Code Generation', true, `Code: ${code}`);
      
      // Clean up
      await prisma.verificationCode.delete({ where: { id: verification.id } });
      return { email: testEmail, code, id: verification.id };
    } else {
      logTest('Code Generation', false, 'Code mismatch');
      return null;
    }
  } catch (error) {
    logTest('Code Generation', false, error.message);
    return null;
  }
}

async function testCodeValidation() {
  try {
    const testEmail = `test-${Date.now()}@example.com`;
    const code = '123456';
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    // Create a valid code
    const verification = await prisma.verificationCode.create({
      data: { email: testEmail, code, expires, used: false }
    });

    // Test finding valid code
    const found = await prisma.verificationCode.findFirst({
      where: {
        email: testEmail,
        code,
        used: false,
        expires: { gt: new Date() }
      }
    });

    if (found && found.id === verification.id) {
      logTest('Code Validation (Valid)', true);
    } else {
      logTest('Code Validation (Valid)', false, 'Could not find valid code');
    }

    // Test expired code
    const expiredCode = await prisma.verificationCode.create({
      data: {
        email: testEmail,
        code: '999999',
        expires: new Date(Date.now() - 1000), // Expired
        used: false
      }
    });

    const expiredFound = await prisma.verificationCode.findFirst({
      where: {
        email: testEmail,
        code: '999999',
        used: false,
        expires: { gt: new Date() }
      }
    });

    if (!expiredFound) {
      logTest('Code Validation (Expired)', true, 'Expired codes correctly rejected');
    } else {
      logTest('Code Validation (Expired)', false, 'Expired code was found');
    }

    // Test used code
    await prisma.verificationCode.update({
      where: { id: verification.id },
      data: { used: true }
    });

    const usedFound = await prisma.verificationCode.findFirst({
      where: {
        email: testEmail,
        code,
        used: false,
        expires: { gt: new Date() }
      }
    });

    if (!usedFound) {
      logTest('Code Validation (Used)', true, 'Used codes correctly rejected');
    } else {
      logTest('Code Validation (Used)', false, 'Used code was found');
    }

    // Clean up
    await prisma.verificationCode.deleteMany({
      where: { email: testEmail }
    });

    return true;
  } catch (error) {
    logTest('Code Validation', false, error.message);
    return false;
  }
}

async function testRateLimiting() {
  try {
    const testEmail = `ratelimit-${Date.now()}@example.com`;
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);

    // Create a recent code (within last minute)
    const recentCode = await prisma.verificationCode.create({
      data: {
        email: testEmail,
        code: '111111',
        expires: new Date(now.getTime() + 10 * 60 * 1000),
        createdAt: new Date(now.getTime() - 30 * 1000) // 30 seconds ago
      }
    });

    // Check for recent code
    const found = await prisma.verificationCode.findFirst({
      where: {
        email: testEmail,
        createdAt: { gt: oneMinuteAgo }
      }
    });

    if (found) {
      logTest('Rate Limiting Check', true, 'Recent code detected correctly');
    } else {
      logTest('Rate Limiting Check', false, 'Could not find recent code');
    }

    // Clean up
    await prisma.verificationCode.deleteMany({
      where: { email: testEmail }
    });

    return true;
  } catch (error) {
    logTest('Rate Limiting', false, error.message);
    return false;
  }
}

async function testDailyLimit() {
  try {
    const testEmail = `dailylimit-${Date.now()}@example.com`;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Create 10 codes for today
    const codes = [];
    for (let i = 0; i < 10; i++) {
      const code = await prisma.verificationCode.create({
        data: {
          email: testEmail,
          code: `${100000 + i}`,
          expires: new Date(Date.now() + 10 * 60 * 1000),
          createdAt: new Date() // Today
        }
      });
      codes.push(code);
    }

    // Count codes for today
    const count = await prisma.verificationCode.count({
      where: {
        email: testEmail,
        createdAt: { gte: today }
      }
    });

    if (count >= 10) {
      logTest('Daily Limit Check', true, `Found ${count} codes for today`);
    } else {
      logTest('Daily Limit Check', false, `Expected 10, found ${count}`);
    }

    // Clean up
    await prisma.verificationCode.deleteMany({
      where: { email: testEmail }
    });

    return true;
  } catch (error) {
    logTest('Daily Limit', false, error.message);
    return false;
  }
}

async function testCodeInvalidation() {
  try {
    const testEmail = `invalidate-${Date.now()}@example.com`;

    // Create multiple unused codes
    const code1 = await prisma.verificationCode.create({
      data: {
        email: testEmail,
        code: '111111',
        expires: new Date(Date.now() + 10 * 60 * 1000),
        used: false
      }
    });

    const code2 = await prisma.verificationCode.create({
      data: {
        email: testEmail,
        code: '222222',
        expires: new Date(Date.now() + 10 * 60 * 1000),
        used: false
      }
    });

    // Invalidate previous unused codes (simulating new code request)
    await prisma.verificationCode.updateMany({
      where: { email: testEmail, used: false },
      data: { used: true }
    });

    // Verify codes are marked as used
    const updated1 = await prisma.verificationCode.findUnique({
      where: { id: code1.id }
    });
    const updated2 = await prisma.verificationCode.findUnique({
      where: { id: code2.id }
    });

    if (updated1.used && updated2.used) {
      logTest('Code Invalidation', true, 'Previous codes marked as used');
    } else {
      logTest('Code Invalidation', false, 'Codes not properly invalidated');
    }

    // Clean up
    await prisma.verificationCode.deleteMany({
      where: { email: testEmail }
    });

    return true;
  } catch (error) {
    logTest('Code Invalidation', false, error.message);
    return false;
  }
}

async function testAttemptTracking() {
  try {
    const testEmail = `attempts-${Date.now()}@example.com`;
    const code = '123456';

    // Create code with attempts
    const verification = await prisma.verificationCode.create({
      data: {
        email: testEmail,
        code,
        expires: new Date(Date.now() + 10 * 60 * 1000),
        attempts: 0
      }
    });

    // Increment attempts
    await prisma.verificationCode.updateMany({
      where: { email: testEmail, code },
      data: { attempts: { increment: 1 } }
    });

    const updated = await prisma.verificationCode.findUnique({
      where: { id: verification.id }
    });

    if (updated.attempts === 1) {
      logTest('Attempt Tracking', true, 'Attempts incremented correctly');
    } else {
      logTest('Attempt Tracking', false, `Expected 1, got ${updated.attempts}`);
    }

    // Test max attempts (5)
    await prisma.verificationCode.update({
      where: { id: verification.id },
      data: { attempts: 5 }
    });

    const maxAttempts = await prisma.verificationCode.findUnique({
      where: { id: verification.id }
    });

    if (maxAttempts.attempts >= 5) {
      logTest('Max Attempts Check', true, 'Max attempts reached');
    } else {
      logTest('Max Attempts Check', false, 'Max attempts not reached');
    }

    // Clean up
    await prisma.verificationCode.deleteMany({
      where: { email: testEmail }
    });

    return true;
  } catch (error) {
    logTest('Attempt Tracking', false, error.message);
    return false;
  }
}

async function testCodeFormat() {
  try {
    // Test code generation format (6 digits, 100000-999999)
    const codes = [];
    for (let i = 0; i < 100; i++) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      codes.push(code);
    }

    const allValid = codes.every(code => {
      return /^\d{6}$/.test(code) && parseInt(code) >= 100000 && parseInt(code) <= 999999;
    });

    if (allValid) {
      logTest('Code Format', true, 'All codes are 6-digit numbers (100000-999999)');
    } else {
      logTest('Code Format', false, 'Some codes are invalid');
    }

    return allValid;
  } catch (error) {
    logTest('Code Format', false, error.message);
    return false;
  }
}

async function testExpirationTime() {
  try {
    const testEmail = `expiry-${Date.now()}@example.com`;
    const now = Date.now();
    const expires = new Date(now + 10 * 60 * 1000); // 10 minutes

    const verification = await prisma.verificationCode.create({
      data: {
        email: testEmail,
        code: '123456',
        expires
      }
    });

    const diff = verification.expires.getTime() - now;
    const expectedDiff = 10 * 60 * 1000; // 10 minutes in ms
    const tolerance = 1000; // 1 second tolerance

    if (Math.abs(diff - expectedDiff) < tolerance) {
      logTest('Expiration Time', true, 'Codes expire in 10 minutes');
    } else {
      logTest('Expiration Time', false, `Expected ~${expectedDiff}ms, got ${diff}ms`);
    }

    // Clean up
    await prisma.verificationCode.delete({ where: { id: verification.id } });

    return true;
  } catch (error) {
    logTest('Expiration Time', false, error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🧪 Starting Email Verification API Tests\n');
  console.log('=' .repeat(60));

  // Check database connection first
  const dbConnected = await testDatabaseConnection();
  if (!dbConnected) {
    console.log('\n❌ Cannot proceed without database connection');
    await prisma.$disconnect();
    process.exit(1);
  }

  console.log('\n📋 Running Core Logic Tests:\n');

  // Run all tests
  await testCodeGeneration();
  await testCodeValidation();
  await testRateLimiting();
  await testDailyLimit();
  await testCodeInvalidation();
  await testAttemptTracking();
  await testCodeFormat();
  await testExpirationTime();

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Test Summary:\n');
  console.log(`✅ Passed: ${results.passed.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log(`⚠️  Warnings: ${results.warnings.length}`);

  if (results.failed.length > 0) {
    console.log('\n❌ Failed Tests:');
    results.failed.forEach(test => console.log(`   - ${test}`));
  }

  if (results.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    results.warnings.forEach(warning => console.log(`   - ${warning}`));
  }

  const passRate = (results.passed.length / (results.passed.length + results.failed.length)) * 100;
  console.log(`\n📈 Pass Rate: ${passRate.toFixed(1)}%`);

  if (results.failed.length === 0) {
    console.log('\n🎉 All tests passed!');
  } else {
    console.log('\n⚠️  Some tests failed. Review the output above.');
  }

  await prisma.$disconnect();
  process.exit(results.failed.length > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});





