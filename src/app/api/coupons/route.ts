import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const userId = searchParams.get('userId')

    // Validate a coupon code
    if (code && userId) {
      const coupon = await prisma.coupon.findUnique({
        where: { code }
      })

      if (!coupon) {
        return NextResponse.json({ error: 'Invalid coupon code' }, { status: 404 })
      }

      if (!coupon.isActive) {
        return NextResponse.json({ error: 'This coupon is no longer active' }, { status: 400 })
      }

      const now = new Date()
      if (new Date(coupon.startDate) > now || new Date(coupon.endDate) < now) {
        return NextResponse.json({ error: 'This coupon has expired' }, { status: 400 })
      }

      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return NextResponse.json({ error: 'This coupon has reached its usage limit' }, { status: 400 })
      }

      // Check if user already used this coupon
      const userCoupon = await prisma.userCoupon.findUnique({
        where: { userId_couponId: { userId, couponId: coupon.id } }
      })

      if (userCoupon?.isUsed) {
        return NextResponse.json({ error: 'You have already used this coupon' }, { status: 400 })
      }

      return NextResponse.json(coupon)
    }

    // Get all active coupons (for display)
    const coupons = await prisma.coupon.findMany({
      where: {
        isActive: true,
        endDate: { gte: new Date() }
      }
    })

    return NextResponse.json(coupons)
  } catch (error) {
    console.error('Get coupons error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      code, type, value, minPurchase, maxDiscount,
      usageLimit, startDate, endDate, description
    } = body

    const existing = await prisma.coupon.findUnique({ where: { code } })
    if (existing) {
      return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 })
    }

    const coupon = await prisma.coupon.create({
      data: {
        code,
        type,
        value: parseFloat(value),
        minPurchase: minPurchase ? parseFloat(minPurchase) : null,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        usageLimit,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        description
      }
    })

    return NextResponse.json(coupon)
  } catch (error) {
    console.error('Create coupon error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, couponId, orderId } = body

    // Claim/use a coupon
    const existing = await prisma.userCoupon.findUnique({
      where: { userId_couponId: { userId, couponId } }
    })

    if (existing) {
      // Mark as used
      const userCoupon = await prisma.userCoupon.update({
        where: { id: existing.id },
        data: { isUsed: true, usedAt: new Date(), orderId }
      })
      
      await prisma.coupon.update({
        where: { id: couponId },
        data: { usedCount: { increment: 1 } }
      })
      
      return NextResponse.json(userCoupon)
    }

    // Create new user coupon
    const userCoupon = await prisma.userCoupon.create({
      data: { userId, couponId, isUsed: true, usedAt: new Date(), orderId }
    })

    await prisma.coupon.update({
      where: { id: couponId },
      data: { usedCount: { increment: 1 } }
    })

    return NextResponse.json(userCoupon)
  } catch (error) {
    console.error('Use coupon error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
