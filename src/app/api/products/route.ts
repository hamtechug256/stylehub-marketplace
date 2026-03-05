import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('id')
    const sellerId = searchParams.get('sellerId')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'newest'
    const limit = parseInt(searchParams.get('limit') || '50')

    // Get single product
    if (productId) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              storeName: true,
              avatar: true
            }
          }
        }
      })
      
      if (product) {
        // Increment views
        await prisma.product.update({
          where: { id: productId },
          data: { views: { increment: 1 } }
        })
      }
      
      return NextResponse.json(product)
    }

    // Build query
    let where: any = { status: 'active' }
    
    if (sellerId) {
      where.sellerId = sellerId
    }
    
    if (category && category !== 'all') {
      where.category = category
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Build orderBy
    let orderBy: any = { createdAt: 'desc' }
    if (sort === 'price-low') orderBy = { price: 'asc' }
    if (sort === 'price-high') orderBy = { price: 'desc' }
    if (sort === 'popular') orderBy = { views: 'desc' }

    const products = await prisma.product.findMany({
      where,
      orderBy,
      take: limit,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            storeName: true,
            avatar: true
          }
        }
      }
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Get products error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      sellerId, name, description, price, comparePrice,
      images, category, subCategory, brand, condition, stock
    } = body

    const product = await prisma.product.create({
      data: {
        sellerId,
        name,
        description,
        price: parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        images: JSON.stringify(images || []),
        category,
        subCategory,
        brand,
        condition: condition || 'new',
        stock: parseInt(stock) || 1
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            storeName: true
          }
        }
      }
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Create product error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (updates.price) updates.price = parseFloat(updates.price)
    if (updates.comparePrice) updates.comparePrice = parseFloat(updates.comparePrice)
    if (updates.stock) updates.stock = parseInt(updates.stock)
    if (updates.images) updates.images = JSON.stringify(updates.images)

    const product = await prisma.product.update({
      where: { id },
      data: updates
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Update product error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    await prisma.product.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete product error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
