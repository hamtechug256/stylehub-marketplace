import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET: Get user's price alerts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const alertId = searchParams.get('id')

    // Get single alert
    if (alertId) {
      const alert = await db.priceAlert.findUnique({
        where: { id: alertId }
      })
      return NextResponse.json(alert)
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get all price alerts for user
    const alerts = await db.priceAlert.findMany({
      where: { 
        userId,
        isActive: true 
      },
      orderBy: { createdAt: 'desc' }
    })

    // Fetch product details for each alert
    const alertsWithProducts = await Promise.all(
      alerts.map(async (alert) => {
        const product = await db.product.findUnique({
          where: { id: alert.productId },
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
            category: true
          }
        })
        return {
          ...alert,
          product,
          currentPrice: product?.price,
          priceDropped: product ? product.price <= alert.targetPrice : false
        }
      })
    )

    return NextResponse.json(alertsWithProducts)
  } catch (error) {
    console.error('Get price alerts error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST: Create price alert
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, productId, targetPrice } = body

    if (!userId || !productId || !targetPrice) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if product exists
    const product = await db.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check if alert already exists
    const existingAlert = await db.priceAlert.findFirst({
      where: { userId, productId }
    })

    if (existingAlert) {
      // Update existing alert
      const updatedAlert = await db.priceAlert.update({
        where: { id: existingAlert.id },
        data: {
          targetPrice: parseFloat(targetPrice),
          isNotified: false,
          notifiedAt: null,
          isActive: true
        }
      })
      return NextResponse.json(updatedAlert)
    }

    // Create new alert
    const alert = await db.priceAlert.create({
      data: {
        userId,
        productId,
        targetPrice: parseFloat(targetPrice),
        isNotified: false,
        isActive: true
      }
    })

    return NextResponse.json(alert, { status: 201 })
  } catch (error) {
    console.error('Create price alert error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE: Remove price alert
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const userId = searchParams.get('userId')
    const productId = searchParams.get('productId')

    if (!id && !userId) {
      return NextResponse.json({ error: 'Alert ID or User ID is required' }, { status: 400 })
    }

    // Delete by ID
    if (id) {
      await db.priceAlert.delete({
        where: { id }
      })
      return NextResponse.json({ success: true, message: 'Price alert deleted' })
    }

    // Delete by userId + productId
    if (userId && productId) {
      await db.priceAlert.deleteMany({
        where: { userId, productId }
      })
      return NextResponse.json({ success: true, message: 'Price alert deleted' })
    }

    // Delete all alerts for user
    if (userId) {
      await db.priceAlert.deleteMany({
        where: { userId }
      })
      return NextResponse.json({ success: true, message: 'All price alerts deleted' })
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  } catch (error) {
    console.error('Delete price alert error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
