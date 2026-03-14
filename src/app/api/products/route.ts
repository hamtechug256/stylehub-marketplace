import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const slug = searchParams.get('slug')
    const featured = searchParams.get('featured')
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (id) {
      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          seller: {
            select: { id: true, name: true, storeName: true, avatar: true, isVerified: true }
          },
          flashSale: true,
          priceHistory: { orderBy: { recordedAt: 'desc' }, take: 30 }
        }
      })
      if (product) {
        await prisma.product.update({
          where: { id },
          data: { views: { increment: 1 } }
        })
      }
      return NextResponse.json(product)
    }

    if (slug) {
      const product = await prisma.product.findUnique({
        where: { slug },
        include: {
          seller: { select: { id: true, name: true, storeName: true, avatar: true, isVerified: true } },
          flashSale: true
        }
      })
      if (product) {
        await prisma.product.update({
          where: { slug },
          data: { views: { increment: 1 } }
        })
      }
      return NextResponse.json(product)
    }

    const where: any = { status: 'active' }
    if (category && category !== 'all') {
      where.category = category
    }
    if (featured === 'true') {
      where.featured = true
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        seller: { select: { id: true, name: true, storeName: true, avatar: true } },
        flashSale: true
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
      sellerId, name, slug, sku, description, shortDesc,
      price, comparePrice, costPrice, images, videos,
      category, subCategory, brand, tags,
      condition, material, color, size, gender,
      stock, lowStockThreshold, freeShipping, shippingPrice, shippingDays
    } = body

    const product = await prisma.product.create({
      data: {
        sellerId,
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        sku,
        description,
        shortDesc,
        price: parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        costPrice: costPrice ? parseFloat(costPrice) : null,
        images: JSON.stringify(images || []),
        videos: videos ? JSON.stringify(videos) : null,
        category,
        subCategory,
        brand,
        tags: tags ? JSON.stringify(tags) : null,
        condition: condition || 'new',
        material,
        color,
        size,
        gender,
        stock: parseInt(stock) || 1,
        lowStockThreshold: parseInt(lowStockThreshold) || 5,
        freeShipping: freeShipping || false,
        shippingPrice: shippingPrice ? parseFloat(shippingPrice) : null,
        shippingDays: shippingDays ? parseInt(shippingDays) : null
      },
      include: {
        seller: { select: { id: true, name: true, storeName: true } }
      }
    })

    // Record initial price history
    await prisma.priceHistory.create({
      data: {
        productId: product.id,
        price: parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : null
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

    // Convert numeric fields
    if (updates.price) updates.price = parseFloat(updates.price)
    if (updates.comparePrice) updates.comparePrice = parseFloat(updates.comparePrice)
    if (updates.stock) updates.stock = parseInt(updates.stock)
    if (updates.images) updates.images = JSON.stringify(updates.images)
    if (updates.tags) updates.tags = JSON.stringify(updates.tags)

    const oldProduct = await prisma.product.findUnique({ where: { id } })
    
    const product = await prisma.product.update({
      where: { id },
      data: updates
    })

    // Record price change in history
    if (updates.price && oldProduct && oldProduct.price !== updates.price) {
      await prisma.priceHistory.create({
        data: {
          productId: id,
          price: updates.price,
          comparePrice: updates.comparePrice || null
        }
      })

      // Check price alerts
      const alerts = await prisma.priceAlert.findMany({
        where: { productId: id, isNotified: false, targetPrice: { gte: updates.price } }
      })

      for (const alert of alerts) {
        await prisma.notification.create({
          data: {
            userId: alert.userId,
            type: 'price_drop',
            title: 'Price Drop Alert! 📉',
            message: `${product.name} is now $${updates.price.toFixed(2)} (was $${oldProduct.price.toFixed(2)})`,
            link: `/product/${product.slug || product.id}`,
            data: JSON.stringify({ productId: id, oldPrice: oldProduct.price, newPrice: updates.price })
          }
        })
        await prisma.priceAlert.update({
          where: { id: alert.id },
          data: { isNotified: true }
        })
      }
    }

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
