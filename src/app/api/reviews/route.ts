import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const userId = searchParams.get('userId')

    if (productId) {
      const reviews = await prisma.review.findMany({
        where: { productId },
        include: {
          user: { select: { id: true, name: true, avatar: true } }
        },
        orderBy: { createdAt: 'desc' }
      })
      return NextResponse.json(reviews)
    }

    if (userId) {
      const reviews = await prisma.review.findMany({
        where: { userId },
        include: { product: { select: { id: true, name: true, images: true } } },
        orderBy: { createdAt: 'desc' }
      })
      return NextResponse.json(reviews)
    }

    return NextResponse.json([])
  } catch (error) {
    console.error('Get reviews error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, userId, orderId, rating, title, comment, images } = body

    const existing = await prisma.review.findFirst({
      where: { productId, userId }
    })
    if (existing) {
      return NextResponse.json({ error: 'You have already reviewed this product' }, { status: 400 })
    }

    const review = await prisma.review.create({
      data: {
        productId,
        userId,
        orderId,
        rating,
        title,
        comment,
        images: JSON.stringify(images || []),
        isVerified: !!orderId
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } }
      }
    })

    const allReviews = await prisma.review.findMany({
      where: { productId },
      select: { rating: true }
    })
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
    
    await prisma.product.update({
      where: { id: productId },
      data: { rating: avgRating, reviewCount: allReviews.length }
    })

    return NextResponse.json(review)
  } catch (error) {
    console.error('Create review error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, helpful } = body

    const review = await prisma.review.update({
      where: { id },
      data: { helpful: { increment: helpful || 1 } }
    })

    return NextResponse.json(review)
  } catch (error) {
    console.error('Update review error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
