import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET: Get comparison list
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get user's comparison list
    const comparison = await db.productComparison.findFirst({
      where: { userId }
    })

    if (!comparison) {
      return NextResponse.json({ productIds: [], products: [] })
    }

    const productIds: string[] = JSON.parse(comparison.productIds || '[]')

    // Fetch product details
    const products = await Promise.all(
      productIds.map(async (id) => {
        const product = await db.product.findUnique({
          where: { id },
          select: {
            id: true,
            name: true,
            price: true,
            comparePrice: true,
            images: true,
            category: true,
            subCategory: true,
            brand: true,
            description: true,
            specifications: true,
            rating: true,
            reviewCount: true,
            soldCount: true,
            stock: true,
            condition: true
          }
        })
        return product
      })
    )

    // Filter out null products
    const validProducts = products.filter((p): p is NonNullable<typeof p> => p !== null)

    return NextResponse.json({
      productIds,
      products: validProducts
    })
  } catch (error) {
    console.error('Get comparison error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST: Add product to comparison
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

    // Get or create comparison list
    let comparison = await db.productComparison.findFirst({
      where: { userId }
    })

    const maxProducts = 4 // Maximum products to compare

    if (!comparison) {
      // Create new comparison list
      comparison = await db.productComparison.create({
        data: {
          userId,
          productIds: JSON.stringify([productId])
        }
      })
    } else {
      // Update existing list
      let productIds: string[] = JSON.parse(comparison.productIds || '[]')

      // Check if product already in list
      if (productIds.includes(productId)) {
        return NextResponse.json({ 
          error: 'Product already in comparison list',
          productIds 
        }, { status: 400 })
      }

      // Check if list is full
      if (productIds.length >= maxProducts) {
        return NextResponse.json({ 
          error: `Maximum ${maxProducts} products can be compared`,
          productIds 
        }, { status: 400 })
      }

      // Add product
      productIds.push(productId)

      comparison = await db.productComparison.update({
        where: { id: comparison.id },
        data: { productIds: JSON.stringify(productIds) }
      })
    }

    return NextResponse.json({
      success: true,
      productIds: JSON.parse(comparison.productIds || '[]')
    }, { status: 201 })
  } catch (error) {
    console.error('Add to comparison error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE: Remove from comparison
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const productId = searchParams.get('productId')
    const clearAll = searchParams.get('clearAll')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Clear all products
    if (clearAll === 'true') {
      await db.productComparison.deleteMany({
        where: { userId }
      })
      return NextResponse.json({ success: true, message: 'Comparison list cleared' })
    }

    // Remove specific product
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    const comparison = await db.productComparison.findFirst({
      where: { userId }
    })

    if (!comparison) {
      return NextResponse.json({ error: 'No comparison list found' }, { status: 404 })
    }

    let productIds: string[] = JSON.parse(comparison.productIds || '[]')
    productIds = productIds.filter(id => id !== productId)

    if (productIds.length === 0) {
      // Delete the comparison list if empty
      await db.productComparison.delete({
        where: { id: comparison.id }
      })
    } else {
      await db.productComparison.update({
        where: { id: comparison.id },
        data: { productIds: JSON.stringify(productIds) }
      })
    }

    return NextResponse.json({
      success: true,
      productIds
    })
  } catch (error) {
    console.error('Remove from comparison error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
