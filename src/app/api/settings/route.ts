import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    let settings = await prisma.platformSettings.findFirst()
    
    if (!settings) {
      settings = await prisma.platformSettings.create({
        data: {
          platformName: 'StyleHub',
          platformDesc: 'Your Fashion Marketplace',
          commissionRate: 0.10
        }
      })
    }
    
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Get settings error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { commissionRate, platformName, platformDesc } = body
    
    let settings = await prisma.platformSettings.findFirst()
    
    if (!settings) {
      settings = await prisma.platformSettings.create({
        data: {
          platformName: platformName || 'StyleHub',
          platformDesc,
          commissionRate: commissionRate || 0.10
        }
      })
    } else {
      settings = await prisma.platformSettings.update({
        where: { id: settings.id },
        data: {
          ...(platformName && { platformName }),
          ...(platformDesc !== undefined && { platformDesc }),
          ...(commissionRate !== undefined && { commissionRate })
        }
      })
    }
    
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Update settings error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
