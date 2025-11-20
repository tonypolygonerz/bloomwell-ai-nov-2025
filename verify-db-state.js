#!/usr/bin/env node

/**
 * Database State Verification Script
 * Verifies VerificationCode and User table states
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyDatabaseState() {
  console.log('🔍 Verifying Database State\n');
  console.log('='.repeat(60));

  try {
    // Check VerificationCode table structure
    console.log('\n📋 VerificationCode Table:');
    const sampleCode = await prisma.verificationCode.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    if (sampleCode) {
      console.log('✅ Table exists and contains data');
      console.log(`   Sample record:`);
      console.log(`   - ID: ${sampleCode.id}`);
      console.log(`   - Email: ${sampleCode.email}`);
      console.log(`   - Code: ${sampleCode.code}`);
      console.log(`   - Used: ${sampleCode.used}`);
      console.log(`   - Attempts: ${sampleCode.attempts}`);
      console.log(`   - Expires: ${sampleCode.expires}`);
      console.log(`   - Created: ${sampleCode.createdAt}`);
    } else {
      console.log('⚠️  Table exists but is empty');
    }

    // Count codes by status
    const totalCodes = await prisma.verificationCode.count();
    const usedCodes = await prisma.verificationCode.count({ where: { used: true } });
    const unusedCodes = await prisma.verificationCode.count({ where: { used: false } });
    const expiredCodes = await prisma.verificationCode.count({
      where: { expires: { lt: new Date() } }
    });

    console.log(`\n📊 Statistics:`);
    console.log(`   Total codes: ${totalCodes}`);
    console.log(`   Used codes: ${usedCodes}`);
    console.log(`   Unused codes: ${unusedCodes}`);
    console.log(`   Expired codes: ${expiredCodes}`);

    // Check User table for email verification
    console.log('\n📋 User Table (Email Verification):');
    const totalUsers = await prisma.user.count();
    const verifiedUsers = await prisma.user.count({
      where: { emailVerified: { not: null } }
    });
    const unverifiedUsers = await prisma.user.count({
      where: { emailVerified: null }
    });
    const adminUsers = await prisma.user.count({ where: { isAdmin: true } });

    console.log(`\n📊 Statistics:`);
    console.log(`   Total users: ${totalUsers}`);
    console.log(`   Verified users: ${verifiedUsers}`);
    console.log(`   Unverified users: ${unverifiedUsers}`);
    console.log(`   Admin users: ${adminUsers}`);

    // Check for users with firstName/lastName
    const usersWithNames = await prisma.user.count({
      where: {
        AND: [
          { firstName: { not: null } },
          { lastName: { not: null } }
        ]
      }
    });
    console.log(`   Users with firstName/lastName: ${usersWithNames}`);

    // Sample verified user
    const sampleUser = await prisma.user.findFirst({
      where: { emailVerified: { not: null } },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        isAdmin: true,
        emailVerified: true
      }
    });

    if (sampleUser) {
      console.log(`\n   Sample verified user:`);
      console.log(`   - Email: ${sampleUser.email}`);
      console.log(`   - Name: ${sampleUser.firstName} ${sampleUser.lastName}`);
      console.log(`   - Admin: ${sampleUser.isAdmin}`);
      console.log(`   - Verified: ${sampleUser.emailVerified}`);
    }

    // Check for admin user
    const adminUser = await prisma.user.findFirst({
      where: { isAdmin: true },
      select: { email: true, isAdmin: true }
    });

    if (adminUser) {
      console.log(`\n   Admin user found: ${adminUser.email}`);
    } else {
      console.log(`\n   ⚠️  No admin users found`);
    }

    console.log('\n✅ Database state verification completed');

  } catch (error) {
    console.error('❌ Error verifying database state:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDatabaseState().catch(console.error);








