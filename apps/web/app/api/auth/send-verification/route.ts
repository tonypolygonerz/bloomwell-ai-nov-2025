import { NextRequest, NextResponse } from 'next/server';
import prisma from '@bloomwell/db';
import { sendVerificationEmail } from '@bloomwell/email';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Rate limiting: Check recent codes for this email
    const recentCode = await prisma.verificationCode.findFirst({
      where: {
        email,
        createdAt: { gt: new Date(Date.now() - 60 * 1000) } // Within last minute
      }
    });

    if (recentCode) {
      return NextResponse.json({ 
        error: 'Please wait 1 minute before requesting another code' 
      }, { status: 429 });
    }

    // Check for too many attempts today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = await prisma.verificationCode.count({
      where: {
        email,
        createdAt: { gte: today }
      }
    });

    if (todayCount >= 10) {
      return NextResponse.json({ 
        error: 'Too many verification attempts today. Please try again tomorrow.' 
      }, { status: 429 });
    }

    // Invalidate previous unused codes
    await prisma.verificationCode.updateMany({
      where: { email, used: false },
      data: { used: true }
    });

    // Create new verification code
    await prisma.verificationCode.create({
      data: { email, code, expires }
    });

    // Send email (or log to console in development)
    try {
      if (process.env.RESEND_API_KEY) {
        await sendVerificationEmail(email, code);
      } else {
        // Development mode: Log code to console
        console.log('\n========================================');
        console.log('📧 VERIFICATION CODE (DEV MODE)');
        console.log('========================================');
        console.log(`Email: ${email}`);
        console.log(`Code: ${code}`);
        console.log(`Expires: ${expires.toLocaleString()}`);
        console.log('========================================\n');
      }
    } catch (emailError) {
      console.error('Email sending failed, but code was saved:', emailError);
      // Continue even if email fails - code is saved in DB
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your email'
    });

  } catch (error) {
    console.error('Send verification error:', error);
    return NextResponse.json({ 
      error: 'Failed to send verification code. Please try again.' 
    }, { status: 500 });
  }
}

