import { NextRequest, NextResponse } from 'next/server';
import prisma from '@bloomwell/db';
import { hash } from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, code, password, firstName, lastName, isRegistration = false } = await request.json();
    
    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code required' }, { status: 400 });
    }

    // Find verification code
    const verification = await prisma.verificationCode.findFirst({
      where: {
        email,
        code,
        used: false,
        expires: { gt: new Date() }
      }
    });

    if (!verification) {
      // Increment attempts for rate limiting
      await prisma.verificationCode.updateMany({
        where: { email, code },
        data: { attempts: { increment: 1 } }
      });
      
      return NextResponse.json({ 
        error: 'Invalid or expired verification code' 
      }, { status: 400 });
    }

    // Check attempts limit (prevent brute force)
    if (verification.attempts >= 5) {
      await prisma.verificationCode.update({
        where: { id: verification.id },
        data: { used: true }
      });
      
      return NextResponse.json({ 
        error: 'Too many attempts. Please request a new code.' 
      }, { status: 429 });
    }

    // Mark code as used only if we're completing registration
    // Otherwise, keep it valid for the registration completion step
    if (isRegistration) {
      await prisma.verificationCode.update({
        where: { id: verification.id },
        data: { used: true }
      });
    }

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (isRegistration && password && firstName && lastName) {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return NextResponse.json({ 
          error: 'An account with this email already exists' 
        }, { status: 400 });
      }

      // Create new user (registration flow)
      const hashedPassword = await hash(password, 12);
      const isAdmin = email === 'teleportdoor@gmail.com';
      
      user = await prisma.user.create({
        data: {
          email,
          hashedPassword,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          name: `${firstName.trim()} ${lastName.trim()}`, // For backward compatibility
          emailVerified: new Date(),
          isAdmin
        }
      });
    } else if (!isRegistration) {
      // Just verifying email for existing user
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        // Update existing user as verified
        await prisma.user.update({
          where: { email },
          data: { emailVerified: new Date() }
        });
        user = existingUser;
      } else {
        // Email verified but no user yet - this is fine for registration flow
        // The user will be created in the next step
      }
    } else {
      return NextResponse.json({ 
        error: 'Missing registration data' 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Email verified successfully',
      userId: user?.id 
    });

  } catch (error) {
    console.error('Verify code error:', error);
    return NextResponse.json({ 
      error: 'Verification failed. Please try again.' 
    }, { status: 500 });
  }
}

