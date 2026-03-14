import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET: Get recently viewed products for user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get recently viewed products
    const recentlyViewed = await db.recentlyViewed.findMany({
      where: { userId },
      orderBy: { viewedAt: 'desc' },
      take: limit
    })

    // Fetch product details for each
    const productsWithDetails = await Promise.all(
      recentlyViewed.map(async (item) => {
        const product = await db.product.findUnique({
          where: { id: item.productId },
          select: {
            id: true,
            name: true,
            price: true,
            comparePrice: true,
            images: true,
            category: true,
            subCategory: true,
            brand: true,
            rating: true,
            reviewCount: true,
            status: true
          }
        })
        return {
          ...item,
          product,
          viewedAt: item.viewedAt
        }
      })
    )

    // Filter out any null products (deleted products)
    const validProducts = productsWithDetails.filter(item => item.product !== null)

    return NextResponse.json(validProducts)
  } catch (error) {
    console.error('Get recently viewed error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST: Add to recently viewed
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, productId } = body

    if (!userId || !productId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if product exists
    const product = await db.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Use upsert to create or update
    const recentlyViewed = await db.recentlyViewed.upsert({
      where: {
        userId_productId: { userId, productId }
      },
      update: {
        viewedAt: new Date()
      },
      create: {
        userId,
        productId,
        viewedAt: new Date()
      }
    })

    return NextResponse.json(recentlyViewed, { status: 201 })
  } catch (error) {
    console.error('Add to recently viewed error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE: Clear history
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const productId = searchParams.get('productId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Delete specific product from history
    if (productId) {
      await db.recentlyViewed.delete({
        where: {
          userId_productId: { userId, productId }
        }
      })
      return NextResponse.json({ success: true, message: 'Product removed from history' })
    }

    // Clear all history
    await db.recentlyViewed.deleteMany({
      where: { userId }
    })

    return NextResponse.json({ success: true, message: 'History cleared' })
  } catch (error) {
    console.error('Clear recently viewed error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
