import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Generate unique gift card code
function generateGiftCardCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = 'SH-'
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) code += '-'
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// GET: List gift cards (filter by userId)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const code = searchParams.get('code')

    // Check specific gift card by code
    if (code) {
      const giftCard = await db.giftCard.findUnique({
        where: { code }
      })
      return NextResponse.json(giftCard)
    }

    // Get gift cards purchased by user
    if (userId) {
      const giftCards = await db.giftCard.findMany({
        where: { 
          OR: [
            { purchasedBy: userId },
            { usedBy: userId }
          ]
        },
        orderBy: { createdAt: 'desc' }
      })
      return NextResponse.json(giftCards)
    }

    // Get all gift cards (admin)
    const giftCards = await db.giftCard.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(giftCards)
  } catch (error) {
    console.error('Get gift cards error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST: Create/purchase gift card
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, purchasedBy, recipientEmail, recipientName, message, expiresAt } = body

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    // Generate unique code
    let code = generateGiftCardCode()
    let exists = await db.giftCard.findUnique({ where: { code } })
    while (exists) {
      code = generateGiftCardCode()
      exists = await db.giftCard.findUnique({ where: { code } })
    }

    const giftCard = await db.giftCard.create({
      data: {
        code,
        amount: parseFloat(amount),
        purchasedBy: purchasedBy || null,
        recipientEmail: recipientEmail || null,
        recipientName: recipientName || null,
        message: message || null,
        expiresAt: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Default 1 year expiry
        isActive: true,
        isUsed: false
      }
    })

    return NextResponse.json(giftCard, { status: 201 })
  } catch (error) {
    console.error('Create gift card error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// PUT: Redeem gift card
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, userId } = body

    if (!code || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Find gift card
    const giftCard = await db.giftCard.findUnique({ where: { code } })

    if (!giftCard) {
      return NextResponse.json({ error: 'Gift card not found' }, { status: 404 })
    }

    if (!giftCard.isActive) {
      return NextResponse.json({ error: 'Gift card is not active' }, { status: 400 })
    }

    if (giftCard.isUsed) {
      return NextResponse.json({ error: 'Gift card has already been used' }, { status: 400 })
    }

    if (giftCard.expiresAt && new Date() > giftCard.expiresAt) {
      return NextResponse.json({ error: 'Gift card has expired' }, { status: 400 })
    }

    // Redeem gift card - add balance to user
    const [updatedGiftCard] = await Promise.all([
      db.giftCard.update({
        where: { code },
        data: {
          isUsed: true,
          usedBy: userId,
          usedAt: new Date()
        }
      }),
      db.user.update({
        where: { id: userId },
        data: { balance: { increment: giftCard.amount } }
      })
    ])

    return NextResponse.json({
      success: true,
      message: `Gift card redeemed successfully! $${giftCard.amount} added to your balance.`,
      giftCard: updatedGiftCard
    })
  } catch (error) {
    console.error('Redeem gift card error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
