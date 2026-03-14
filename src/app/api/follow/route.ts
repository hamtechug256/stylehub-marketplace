import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type') // 'followers' or 'following'

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    if (type === 'followers') {
      const followers = await prisma.follow.findMany({
        where: { followingId: userId },
        include: {
          follower: { select: { id: true, name: true, avatar: true, storeName: true, role: true } }
        },
        orderBy: { createdAt: 'desc' }
      })
      return NextResponse.json(followers)
    }

    if (type === 'following') {
      const following = await prisma.follow.findMany({
        where: { followerId: userId },
        include: {
          following: { select: { id: true, name: true, avatar: true, storeName: true, role: true } }
        },
        orderBy: { createdAt: 'desc' }
      })
      return NextResponse.json(following)
    }

    // Get counts
    const followersCount = await prisma.follow.count({ where: { followingId: userId } })
    const followingCount = await prisma.follow.count({ where: { followerId: userId } })

    return NextResponse.json({ followersCount, followingCount })
  } catch (error) {
    console.error('Get follows error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { followerId, followingId } = body

    if (followerId === followingId) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 })
    }

    const existing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: { followerId, followingId }
      }
    })

    if (existing) {
      // Unfollow
      await prisma.follow.delete({
        where: { id: existing.id }
      })
      return NextResponse.json({ following: false })
    }

    // Follow
    await prisma.follow.create({
      data: { followerId, followingId }
    })

    // Create notification
    await prisma.notification.create({
      data: {
        userId: followingId,
        type: 'follow',
        title: 'New Follower',
        message: 'Someone started following your store',
        link: '/seller'
      }
    })

    return NextResponse.json({ following: true })
  } catch (error) {
    console.error('Follow error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const followerId = searchParams.get('followerId')
    const followingId = searchParams.get('followingId')

    if (!followerId || !followingId) {
      return NextResponse.json({ error: 'Both IDs required' }, { status: 400 })
    }

    await prisma.follow.delete({
      where: {
        followerId_followingId: { followerId, followingId }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unfollow error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
