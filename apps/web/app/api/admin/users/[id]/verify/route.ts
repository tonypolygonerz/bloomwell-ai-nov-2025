import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAPI } from '@bloomwell/auth/lib/admin-check';
import prisma from '@bloomwell/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check admin authentication
  const { isAdmin } = await checkAdminAPI();

  if (!isAdmin) {
    return NextResponse.json(
      { error: 'Forbidden - Admin access required' },
      { status: 403 }
    );
  }

  const userId = params.id;

  try {
    // Find the user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        emailVerified: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { message: 'User is already verified', user },
        { status: 200 }
      );
    }

    // Manually verify the user's email
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        emailVerified: new Date(),
      },
    });

    return NextResponse.json(
      {
        message: 'User email verified successfully',
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error verifying user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
