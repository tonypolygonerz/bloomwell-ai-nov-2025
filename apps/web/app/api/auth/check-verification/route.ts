import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@bloomwell/auth';
import prisma from '@bloomwell/db';
import { sendVerificationEmail } from '@bloomwell/email';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { emailVerified: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ verified: true });
    }

    // Send verification code for unverified existing user
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.verificationCode.create({
      data: { 
        email: session.user.email, 
        code, 
        expires 
      }
    });

    await sendVerificationEmail(session.user.email, code);

    return NextResponse.json({ 
      verified: false, 
      message: 'Verification code sent to your email' 
    });

  } catch (error) {
    console.error('Check verification error:', error);
    return NextResponse.json({ 
      error: 'Failed to check verification status' 
    }, { status: 500 });
  }
}

