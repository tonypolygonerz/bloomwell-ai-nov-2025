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
    const { name, color } = body

    // Verify project belongs to user
    const existingProject = await prisma.project.findFirst({
      where: { id, userId },
    })

    if (!existingProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Build update data
    const updateData: {
      name?: string
      color?: string | null
    } = {}

    if (name !== undefined) {
      updateData.name = name
    }
    if (color !== undefined) {
      updateData.color = color || null
    }

    const project = await prisma.project.update({
      where: { id },
      data: updateData,
      include: {
        chats: {
          select: {
            id: true,
            title: true,
            updatedAt: true,
          },
          orderBy: {
            updatedAt: 'desc',
          },
        },
      },
    })

    return NextResponse.json({ project })
  } catch (error) {
    console.error('Error updating project:', error)
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

    // Verify project belongs to user
    const existingProject = await prisma.project.findFirst({
      where: { id, userId },
      include: {
        chats: true,
      },
    })

    if (!existingProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Unfile all chats in this project (set projectId to null)
    if (existingProject.chats.length > 0) {
      await prisma.chat.updateMany({
        where: { projectId: id },
        data: { projectId: null },
      })
    }

    // Delete the project
    await prisma.project.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

