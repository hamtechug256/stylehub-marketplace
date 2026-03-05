import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Generate unique referral code
function generateReferralCode(name: string): string {
  const prefix = name.substring(0, 3).toUpperCase()
  const suffix = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `${prefix}-${suffix}`
}

// GET: Get referral info for user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const referralCode = searchParams.get('code')

    // Get referral by code
    if (referralCode) {
      const referral = await db.referral.findUnique({
        where: { referralCode }
      })
      return NextResponse.json(referral)
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get user's referral code and stats
    const referrals = await db.referral.findMany({
      where: { referrerId: userId },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate stats
    const totalReferrals = referrals.length
    const completedReferrals = referrals.filter(r => r.status === 'completed').length
    const totalRewards = referrals
      .filter(r => r.isRewarded)
      .reduce((sum, r) => sum + r.rewardAmount, 0)

    return NextResponse.json({
      referrals,
      stats: {
        totalReferrals,
        completedReferrals,
        totalRewards
      }
    })
  } catch (error) {
    console.error('Get referrals error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST: Create referral code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { referrerId, rewardAmount } = body

    if (!referrerId) {
      return NextResponse.json({ error: 'Referrer ID is required' }, { status: 400 })
    }

    // Check if user already has a referral code
    const existingReferral = await db.referral.findFirst({
      where: { referrerId }
    })

    if (existingReferral) {
      return NextResponse.json({ 
        error: 'User already has a referral code',
        referral: existingReferral 
      }, { status: 400 })
    }

    // Get user name for code generation
    const user = await db.user.findUnique({ where: { id: referrerId } })
    const userName = user?.name || 'USR'

    // Generate unique code
    let referralCode = generateReferralCode(userName)
    let exists = await db.referral.findUnique({ where: { referralCode } })
    while (exists) {
      referralCode = generateReferralCode(userName)
      exists = await db.referral.findUnique({ where: { referralCode } })
    }

    const referral = await db.referral.create({
      data: {
        referrerId,
        referralCode,
        rewardAmount: rewardAmount || 10,
        status: 'pending'
      }
    })

    return NextResponse.json(referral, { status: 201 })
  } catch (error) {
    console.error('Create referral error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// PUT: Mark referral as completed
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { referralCode, referredId, action } = body

    if (!referralCode) {
      return NextResponse.json({ error: 'Referral code is required' }, { status: 400 })
    }

    const referral = await db.referral.findUnique({
      where: { referralCode }
    })

    if (!referral) {
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 })
    }

    // Link referred user
    if (action === 'link' && referredId) {
      const updatedReferral = await db.referral.update({
        where: { referralCode },
        data: { referredId }
      })
      return NextResponse.json(updatedReferral)
    }

    // Complete referral and reward
    if (action === 'complete') {
      const [updatedReferral] = await Promise.all([
        db.referral.update({
          where: { referralCode },
          data: {
            status: 'completed',
            isRewarded: true,
            rewardedAt: new Date()
          }
        }),
        // Add reward to referrer's balance
        db.user.update({
          where: { id: referral.referrerId },
          data: { balance: { increment: referral.rewardAmount } }
        })
      ])

      return NextResponse.json({
        success: true,
        message: `Referral completed! $${referral.rewardAmount} reward added to referrer's balance.`,
        referral: updatedReferral
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Update referral error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
