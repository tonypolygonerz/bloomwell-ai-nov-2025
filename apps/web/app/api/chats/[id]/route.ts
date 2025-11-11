import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@bloomwell/auth'
import prisma from '@bloomwell/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.userId ?? session.user.id
  if (!userId) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
  }

  try {
    const { id } = params
    const body = await request.json()
    const { title, projectId, isPinned } = body

    // Verify chat belongs to user
    const existingChat = await prisma.chat.findFirst({
      where: { id, userId },
    })

    if (!existingChat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
    }

    // Build update data
    const updateData: {
      title?: string
      projectId?: string | null
      isPinned?: boolean
    } = {}

    if (title !== undefined) {
      updateData.title = title
    }
    if (projectId !== undefined) {
      updateData.projectId = projectId || null
    }
    if (isPinned !== undefined) {
      updateData.isPinned = isPinned
    }

    const chat = await prisma.chat.update({
      where: { id },
      data: updateData,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    })

    return NextResponse.json({ chat })
  } catch (error) {
    console.error('Error updating chat:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.userId ?? session.user.id
  if (!userId) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
  }

  try {
    const { id } = params

    // Verify chat belongs to user
    const existingChat = await prisma.chat.findFirst({
      where: { id, userId },
    })

    if (!existingChat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
    }

    await prisma.chat.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting chat:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

