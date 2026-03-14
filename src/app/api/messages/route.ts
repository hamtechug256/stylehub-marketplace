import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const otherUserId = searchParams.get('with')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    if (otherUserId) {
      // Get conversation between two users
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: userId, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: userId }
          ]
        },
        include: {
          sender: { select: { id: true, name: true, avatar: true } },
          receiver: { select: { id: true, name: true, avatar: true } }
        },
        orderBy: { createdAt: 'asc' }
      })
      return NextResponse.json(messages)
    }

    // Get all conversations (grouped by other user)
    const sentMessages = await prisma.message.findMany({
      where: { senderId: userId },
      include: {
        receiver: { select: { id: true, name: true, avatar: true, storeName: true, role: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    const receivedMessages = await prisma.message.findMany({
      where: { receiverId: userId },
      include: {
        sender: { select: { id: true, name: true, avatar: true, storeName: true, role: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Group by conversation partner
    const conversations = new Map()
    
    for (const msg of [...sentMessages, ...receivedMessages]) {
      const partner = msg.senderId === userId ? msg.receiver : msg.sender
      if (!conversations.has(partner.id)) {
        conversations.set(partner.id, {
          partner,
          lastMessage: msg,
          unread: receivedMessages.filter(m => m.senderId === partner.id && !m.isRead).length
        })
      }
    }

    return NextResponse.json(Array.from(conversations.values()))
  } catch (error) {
    console.error('Get messages error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { senderId, receiverId, productId, subject, message, attachments } = body

    const msg = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        productId,
        subject,
        message,
        attachments: JSON.stringify(attachments || [])
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } }
      }
    })

    // Create notification for receiver
    await prisma.notification.create({
      data: {
        userId: receiverId,
        type: 'message',
        title: 'New Message',
        message: `You have a new message from ${msg.sender.name}`,
        link: '/messages'
      }
    })

    return NextResponse.json(msg)
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { messageIds, userId } = body

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        id: { in: messageIds },
        receiverId: userId
      },
      data: { isRead: true, readAt: new Date() }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Mark read error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
