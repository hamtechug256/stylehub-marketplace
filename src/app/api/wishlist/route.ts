import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const wishlist = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            seller: { select: { id: true, name: true, storeName: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(wishlist)
  } catch (error) {
    console.error('Get wishlist error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, productId } = body

    const existing = await prisma.wishlist.findUnique({
      where: { userId_productId: { userId, productId } }
    })

    if (existing) {
      return NextResponse.json({ error: 'Already in wishlist' }, { status: 400 })
    }

    const item = await prisma.wishlist.create({
      data: { userId, productId },
      include: { product: true }
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error('Add to wishlist error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const productId = searchParams.get('productId')

    if (!userId || !productId) {
      return NextResponse.json({ error: 'User ID and Product ID required' }, { status: 400 })
    }

    await prisma.wishlist.delete({
      where: { userId_productId: { userId, productId } }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Remove from wishlist error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
